import { RunnableLambda, RunnableSequence } from '@langchain/core/runnables';
import { LLMMessage, LLMRole } from '@shared/types';
import LLMPrompt from '../tools/llm-prompt';
import LLMPath from '../tools/llm-path';
import { logger } from '../tools/logger';
import { CloudLLMProvider, CloudLLMModel } from './ai/cloud/cloud-llm-config';

export interface ChatInput {
  question: string;
  chatHistory: LLMMessage[];
}

export interface RouterDecision {
  needPrivateData: boolean;
  needTranslator: boolean;
  isSimpleQuery: boolean;
  reason: string;
}

export interface ChainState {
  question: string;
  chatHistory: LLMMessage[];
  routerDecision: RouterDecision;
  ragContexts: string[];
  ragContextText: string;
  desensitizedPrompt?: string;
  systemPrompt: string;
  userContent: string;
  messages: LLMMessage[];
  response: string;
}

export class LumenChain {
  private chain: RunnableSequence<ChatInput, ChainState>;
  private ragSearch: (query: string, topK: number) => Promise<string[]>;
  private routerEngine: any = null;
  private translatorEngine: any = null;
  private cloudEngine: any = null;
  private isTranslatorEnabled: boolean;
  private onToken: (token: string) => void;

  constructor(ragSearch: (query: string, topK: number) => Promise<string[]>, isTranslatorEnabled: boolean, onToken: (token: string) => void) {
    this.ragSearch = ragSearch;
    this.isTranslatorEnabled = isTranslatorEnabled;
    this.onToken = onToken;

    this.chain = this.buildChain();
  }

  private async initRouterEngine() {
    if (!this.routerEngine) {
      const { ChatLlamaCpp } = await import('@langchain/community/chat_models/llama_cpp');
      this.routerEngine = await ChatLlamaCpp.initialize({
        modelPath: LLMPath.getRouterLLM(),
        temperature: 0,
        gpuLayers: -1,
        contextSize: 512,
        useMmap: true,
      });
      logger.info('Router Engine 懒加载完成', 'CHAIN');
    }
    return this.routerEngine;
  }

  private async initTranslatorEngine() {
    if (!this.translatorEngine) {
      const { ChatLlamaCpp } = await import('@langchain/community/chat_models/llama_cpp');
      this.translatorEngine = await ChatLlamaCpp.initialize({
        modelPath: LLMPath.getTranslatorLLM(),
        temperature: 0.2,
        contextSize: 1024,
        gpuLayers: -1,
        useMmap: true,
      });
      logger.info('Translator Engine 懒加载完成', 'CHAIN');
    }
    return this.translatorEngine;
  }

  private async initCloudEngine() {
    if (!this.cloudEngine) {
      const { default: CloudLLMEngine } = await import('./ai/cloud/cloud-llm-engine');
      this.cloudEngine = new CloudLLMEngine();
      await this.cloudEngine.initialize(CloudLLMProvider.Qwen, CloudLLMModel.Qwen3_5Flash);
      logger.info('Cloud Engine 懒加载完成', 'CHAIN');
    }
    return this.cloudEngine;
  }

  private async router(userInput: string): Promise<RouterDecision> {
    const messages = [
      { role: LLMRole.System, content: LLMPrompt.router },
      { role: LLMRole.User, content: userInput },
    ];

    let content: string;

    try {
      const engine = await this.initRouterEngine();
      const response = await engine.invoke(messages);
      content = response.content.toString();
    } catch (localError) {
      logger.warn(`本地 Router 失败, 错误信息: ${localError}`, 'CHAIN');
      throw localError;
    }

    try {
      const jsonMatch = content.match(/\{[^}]+\}/);
      if (!jsonMatch) {
        throw new Error('未找到 JSON');
      }
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        needPrivateData: parsed.needPrivateData === '是',
        needTranslator: parsed.needTranslator === '是',
        isSimpleQuery: parsed.isSimpleQuery === '是',
        reason: parsed.reason || '',
      };
    } catch {
      logger.warn(`Router 解析失败，使用默认决策: ${content}`);
      return {
        needPrivateData: false,
        needTranslator: false,
        isSimpleQuery: true,
        reason: '解析失败，默认走简单查询',
      };
    }
  }

  private async translate(userInput: string, context: string): Promise<string> {
    const engine = await this.initTranslatorEngine();
    const prompt = LLMPrompt.translator.replace('{{userInput}}', userInput).replace('{{context}}', context);
    const response = await engine.invoke([{ role: 'user', content: prompt }]);
    return response.content.toString();
  }

  private async streamChat(messages: LLMMessage[]): Promise<string> {
    const engine = await this.initCloudEngine();
    let fullResponse = '';
    await engine.streamChat(messages, (token: string) => {
      fullResponse += token;
      this.onToken(token);
    });
    return fullResponse;
  }

  private buildChain(): RunnableSequence<ChatInput, ChainState> {
    return RunnableSequence.from([
      RunnableLambda.from(async (input: ChatInput): Promise<ChainState> => {
        const routerDecision = await this.router(input.question);
        logger.info(
          `Router 决策: needPrivateData=${routerDecision.needPrivateData}, needTranslator=${routerDecision.needTranslator}, isSimpleQuery=${routerDecision.isSimpleQuery}`,
          'CHAIN',
        );
        return {
          question: input.question,
          chatHistory: input.chatHistory,
          routerDecision,
          ragContexts: [],
          ragContextText: '',
          systemPrompt: '',
          userContent: '',
          messages: [],
          response: '',
        };
      }),

      RunnableLambda.from(async (state: ChainState): Promise<ChainState> => {
        let ragContexts: string[] = [];
        if (!state.routerDecision.isSimpleQuery) {
          ragContexts = await this.ragSearch(state.question, 3);
        }
        const ragContextText = ragContexts.join('\n\n');
        return { ...state, ragContexts, ragContextText };
      }),

      RunnableLambda.from(async (state: ChainState): Promise<ChainState> => {
        const needDesensitize = state.routerDecision.needTranslator && this.isTranslatorEnabled;
        let desensitizedPrompt: string | undefined;

        if (needDesensitize) {
          desensitizedPrompt = await this.translate(state.question, state.ragContextText);
          logger.info(`脱敏后的 prompt: ${desensitizedPrompt}`, 'CHAIN');
        }
        return { ...state, desensitizedPrompt };
      }),

      RunnableLambda.from((state: ChainState): ChainState => {
        const systemPrompt = LLMPrompt.buildSystemPrompt(state.ragContexts.length > 0);
        const userContent = state.desensitizedPrompt
          ? LLMPrompt.formatRAGPrompt(state.desensitizedPrompt, state.ragContextText)
          : LLMPrompt.formatRAGPrompt(state.question, state.ragContextText);

        logger.info(`完整对话输出: ${userContent}`, 'CHAIN');

        const messages: LLMMessage[] = [
          ...state.chatHistory,
          { role: LLMRole.System, content: systemPrompt },
          { role: LLMRole.User, content: userContent },
        ];

        return { ...state, systemPrompt, userContent, messages };
      }),

      RunnableLambda.from(async (state: ChainState): Promise<ChainState> => {
        const response = await this.streamChat(state.messages);
        return { ...state, response };
      }),
    ]);
  }

  async invoke(input: ChatInput): Promise<ChainState> {
    return this.chain.invoke(input);
  }
}
