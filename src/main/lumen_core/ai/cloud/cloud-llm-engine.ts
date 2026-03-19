import { ChatOpenAI } from "@langchain/openai";
import { LLMMessage, LLMRole } from "@shared/types";
import { logger } from "@main/tools/logger";
import {
  CloudLLMModel as CloudLLMModel,
  CloudLLMProvider as CloudLLMProvider,
  CloudLLMProviderConfig,
} from "./cloud-llm-config";

export class CloudLLMEngine {
  private llm: ChatOpenAI | null = null;
  private provider: CloudLLMProvider | null = null;
  private model: CloudLLMModel | null = null;
  private config: CloudLLMProviderConfig | null = null;

  async initialize(
    provider: CloudLLMProvider,
    model: CloudLLMModel,
  ): Promise<void> {
    this.provider = provider;
    this.config = CloudLLMProvider.getConfig(provider);
    this.model = model;
    logger.info(
      `初始化 CloudLLMEngine: active=${this.provider}, model=${this.model}`,
      'CloudLLMEngine',
    );

    this.llm = new ChatOpenAI({
      model: this.model as string,
      configuration: {
        baseURL: this.config.baseURL,
        apiKey: this.config.apiKey,
      },
      maxRetries: 3,
      temperature: 0.1,
      maxTokens: 1024,
    });
  }

  async chat(messages: LLMMessage[]): Promise<string> {
    if (!this.llm) {
      throw new Error("CloudLLMEngine 未初始化");
    }
    const lcMessages = messages.map(msgToLangChain);
    const response = await this.llm.invoke(lcMessages);
    return response.content.toString();
  }

  async streamChat(
    messages: LLMMessage[],
    onToken: (token: string) => void,
  ): Promise<string> {
    if (!this.llm) {
      throw new Error("CloudLLMEngine 未初始化");
    }
    const lcMessages = messages.map(msgToLangChain);
    let fullResponse = "";
    const stream = await this.llm.stream(lcMessages);
    for await (const chunk of stream) {
      const text = chunk.content.toString();
      fullResponse += text;
      onToken(text);
    }
    return fullResponse;
  }

  async dispose(): Promise<void> {
    this.llm = null;
    logger.info("CloudLLMEngine 已释放");
  }

  async switchProvider(
    provider: CloudLLMProvider,
    model: CloudLLMModel,
    config?: CloudLLMProviderConfig,
  ): Promise<void> {
    this.provider = provider;
    this.model = model;

    if (config) {
      this.config = config;
    } else {
      this.config = CloudLLMProvider.getConfig(provider);
    }

    logger.info(`切换 CloudLLMProvider: provider=${provider}, model=${model}`);

    this.llm = new ChatOpenAI({
      model: this.model as string,
      apiKey: this.config.apiKey || "",
      configuration: { baseURL: this.config.baseURL || "" },
    });
  }

  getCurrentProvider(): CloudLLMProvider | null {
    return this.provider;
  }

  getCurrentModel(): CloudLLMModel | null {
    return this.model;
  }
}

function msgToLangChain(msg: LLMMessage): { role: string; content: string } {
  switch (msg.role) {
    case LLMRole.System:
      return { role: "system", content: msg.content };
    case LLMRole.User:
      return { role: "user", content: msg.content };
    case LLMRole.Assistant:
      return { role: "assistant", content: msg.content };
    default:
      return { role: "user", content: msg.content };
  }
}

export default CloudLLMEngine;
