import { ChatLlamaCpp } from "@langchain/community/chat_models/llama_cpp";
import { LlamaCppEmbeddings } from "@langchain/community/embeddings/llama_cpp";
import {
  LLMRole,
  LLMMessage,
  LumenCoreStatus,
  LumenCoreState,
} from "@shared/types";
import LumenPrompt from "./lumen-prompt";
import { logger } from "@main/tools/logger";
import PromptTool from "@main/lumen_core/tools/prompt-tool";
import { systemMonitor } from "@main/lumen_core/tools/system-monitor";
import CloudLLMEngine from "./ai/cloud-llm/cloud-llm-engine";
import {
  CloudLLMModel,
  CloudLLMProvider,
} from "./ai/cloud-llm/cloud-llm-config";
import LLMPath from "./ai/llm/llm-path";
import DatabaseEngine from "./db/database-engine";
import RagEngine from "./rag/rag-engine";

interface RouterDecision {
  needPrivateData: boolean;
  needTranslator: boolean;
  isSimpleQuery: boolean;
  reason: string;
}

class LumenCore {
  private dbEngine: DatabaseEngine | null = null;
  private ragEngine: RagEngine | null = null;
  private vectorEngine: LlamaCppEmbeddings | null = null;
  private routerEngine: ChatLlamaCpp | null = null;
  private translatorEngine: ChatLlamaCpp | null = null;
  private cloudEngine: CloudLLMEngine | null = null;

  private isTranslatorEnable: boolean = false;
  private chatHistory: LLMMessage[] = [];
  private status: LumenCoreStatus = LumenCoreStatus.Idle;
  private statusListeners: Set<(state: LumenCoreState) => void> = new Set();
  private initError?: string;

  getState(): LumenCoreState {
    return {
      status: this.status,
      error: this.initError,
    };
  }

  onStateChange(listener: (state: LumenCoreState) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(
    status: LumenCoreStatus,
    progress?: string,
    error?: string,
  ) {
    this.status = status;
    this.initError = error;
    const state: LumenCoreState = { status, progress, error };
    this.statusListeners.forEach((listener) => {
      try {
        listener(state);
      } catch (e) {
        logger.error("状态监听器执行失败", e);
      }
    });
  }

  async initEngine() {
    if (this.status === LumenCoreStatus.Initializing) {
      logger.warn("Lumen Engine: 初始化正在进行中，请勿重复调用", "SYSTEM");
      return;
    }

    this.setStatus(LumenCoreStatus.Initializing, "正在启动...");

    try {
      logger.pruneOldLogs(7);
      logger.info("Lumen Engine: 正在初始化核心组件...", "SYSTEM");

      const systemInfo = await systemMonitor.getSystemInfo();
      const embeddingParams =
        await systemMonitor.getRecommendedEmbeddingParams();

      logger.info(
        `根据机型 (${systemInfo.machineType}) 自动配置参数：Embedding GPU Layers=${embeddingParams.gpuLayers}, Context=${embeddingParams.contextSize}`,
        "SYSTEM",
      );

      this.dbEngine = new DatabaseEngine();
      await this.dbEngine.initialize();
      await this.loadChatHistory();

      this.vectorEngine = new LlamaCppEmbeddings({
        modelPath: LLMPath.getVecLLM(),
        gpuLayers: -1,
      });

      this.routerEngine = new ChatLlamaCpp({
        modelPath: LLMPath.getTranslatorLLM(),
        temperature: 0,
        contextSize: 512,
        gpuLayers: -1,
      });

      this.translatorEngine = new ChatLlamaCpp({
        modelPath: LLMPath.getTranslatorLLM(),
        temperature: 0.2,
        contextSize: 1024,
        gpuLayers: -1,
      });

      this.cloudEngine = new CloudLLMEngine();
      await this.cloudEngine.initialize(
        CloudLLMProvider.Qwen,
        CloudLLMModel.Qwen3_5Flash,
      );

      this.ragEngine = new RagEngine();
      await this.ragEngine.initialize(this.dbEngine, this.vectorEngine);

      this.setStatus(LumenCoreStatus.Ready, "系统已就绪");
      logger.info("Lumen Engine: Pipeline 架构初始化完成", "SYSTEM");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.setStatus(LumenCoreStatus.Error, undefined, errorMsg);
      logger.error("Lumen Engine: 初始化失败", error);
      throw error;
    }
  }

  private async router(userInput: string): Promise<RouterDecision> {
    if (!this.routerEngine) {
      throw new Error("Router Engine 未初始化");
    }

    const messages = [
      { role: "system", content: LumenPrompt.router },
      { role: "user", content: userInput },
    ];

    const response = await this.routerEngine.invoke(messages);
    const content = response.content.toString();

    try {
      const cleanContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const parsed = JSON.parse(cleanContent);
      return {
        needPrivateData: parsed.needPrivateData === "是",
        needTranslator: parsed.needTranslator === "是",
        isSimpleQuery: parsed.isSimpleQuery === "是",
        reason: parsed.reason || "",
      };
    } catch {
      logger.warn(`Router 解析失败，使用默认决策: ${content}`);
      return {
        needPrivateData: false,
        needTranslator: false,
        isSimpleQuery: true,
        reason: "解析失败，默认走简单查询",
      };
    }
  }

  private async translate(userInput: string, context: string): Promise<string> {
    if (!this.translatorEngine) {
      throw new Error("Translator Engine 未初始化");
    }

    const prompt = LumenPrompt.translator
      .replace("{{userInput}}", userInput)
      .replace("{{context}}", context);

    const response = await this.translatorEngine.invoke([
      { role: "user", content: prompt },
    ]);
    return response.content.toString();
  }

  async chat(question: string, onToken: (token: string) => void) {
    if (!this.ragEngine || !this.cloudEngine) {
      throw new Error("Lumen Engine 尚未初始化完成");
    }

    const startTime = Date.now();
    logger.chat(LLMRole.User, question);

    try {
      const routerDecision = await this.router(question);
      logger.info(
        `Router 决策: needPrivateData=${routerDecision.needPrivateData}, needTranslator=${routerDecision.needTranslator}, isSimpleQuery=${routerDecision.isSimpleQuery}`,
        "ROUTER",
      );

      let finalPrompt: string;
      let contexts: string[] = [];

      if (routerDecision.isSimpleQuery) {
        const systemPrompt = PromptTool.buildSystemPrompt(false);
        finalPrompt = `${systemPrompt}\n\n用户问题: ${question}`;
      } else {
        contexts = await this.ragEngine.search(question, 3);
        const contextText = contexts.length > 0 ? contexts.join("\n\n") : "";

        if (routerDecision.needTranslator && this.isTranslatorEnable) {
          finalPrompt = await this.translate(question, contextText);
        } else {
          const systemPrompt = PromptTool.buildSystemPrompt(true);
          finalPrompt = contextText
            ? `${systemPrompt}\n\n参考资料:\n${contextText}\n\n用户问题: ${question}`
            : `${systemPrompt}\n\n用户问题: ${question}`;
        }
      }

      const messages: LLMMessage[] = [
        ...this.chatHistory,
        { role: LLMRole.User, content: finalPrompt },
      ];

      let fullResponse = "";

      await this.cloudEngine.streamChat(messages, (token: string) => {
        fullResponse += token;
        onToken(token);
      });

      logger.chat(LLMRole.Assistant, fullResponse);
      await this.persistChatMessage(LLMRole.Assistant, fullResponse);
      logger.perf("Total Response Time", Date.now() - startTime);

      this.chatHistory.push({ role: LLMRole.User, content: question });
      this.chatHistory.push({
        role: LLMRole.Assistant,
        content: fullResponse,
      });
      if (this.chatHistory.length > 10) this.chatHistory.splice(0, 2);

      return fullResponse;
    } catch (error) {
      const errorMsg = `\n[Lumen Error]: 处理请求时出错 - ${error}`;
      logger.error("Chat Flow Error", error);
      onToken(errorMsg);
      return errorMsg;
    }
  }

  async addDocument(content: string, metadata?: Record<string, any>) {
    if (!this.ragEngine) throw new Error("RAG 引擎未就绪");
    logger.info(`正在添加新文档: ${content.substring(0, 20)}...`, "RAG");
    return await this.ragEngine.addDocument(content, metadata);
  }

  async loadChatHistory(limit: number = 100) {
    if (!this.dbEngine) return;
    try {
      const records = this.dbEngine.getChatHistory(limit);
      this.chatHistory = records.map((r) => ({
        role: r.role as LLMRole,
        content: r.content,
      }));
      logger.info(
        `会话历史已恢复（最近 ${this.chatHistory.length} 条）`,
        "CORE",
      );
    } catch (error) {
      logger.error("加载会话历史失败", error);
    }
  }

  async getChatHistory(limit: number = 100) {
    if (!this.dbEngine) return this.chatHistory;
    try {
      return this.dbEngine.getChatHistory(limit);
    } catch (error) {
      logger.error("读取会话历史失败", error);
      return this.chatHistory;
    }
  }

  async clearHistory() {
    this.chatHistory = [];
    if (!this.dbEngine) return;

    try {
      this.dbEngine.clearChatHistory();
      logger.info("会话历史已清空（含持久化数据）", "CORE");
    } catch (error) {
      logger.error("清空会话历史失败", error);
    }
  }

  private async persistChatMessage(role: LLMRole, content: string) {
    if (!this.dbEngine) return;
    try {
      this.dbEngine.insertChatMessage(role, content);
    } catch (error) {
      logger.error("写入会话历史失败", error);
    }
  }

  clearSession() {
    this.chatHistory = [];
    logger.info("会话历史已清空", "CORE");
  }

  setTranslatorEnable(enable: boolean) {
    this.isTranslatorEnable = enable;
    logger.info(`Translator Engine: ${enable ? "启用" : "禁用"}`, "CONFIG");
  }

  isTranslatorEnabled(): boolean {
    return this.isTranslatorEnable;
  }

  async dispose() {
    this.setStatus(LumenCoreStatus.Disposing, "正在释放资源...");
    try {
      this.vectorEngine = null;
      this.routerEngine = null;
      this.translatorEngine = null;
      this.cloudEngine = null;
      this.ragEngine = null;
      this.chatHistory = [];
      await this.dbEngine?.close();
      this.setStatus(LumenCoreStatus.Idle);
      logger.info("Lumen Engine: 资源已释放", "SYSTEM");
    } catch (error) {
      this.setStatus(LumenCoreStatus.Error, undefined, String(error));
      throw error;
    }
  }
}

export default LumenCore;
