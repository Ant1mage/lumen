import path from "path";
import LLMEngine from "@main/lumen_core/ai/llm-engine";
import RagEngine from "@main/lumen_core/rag/rag-engine";
import LLMPath from "@main/lumen_core/ai/llm-path";
import DatabaseEngine from "@main/lumen_core/db/database-engine";
// 引入规范化的日志服务和类型
import { LLMRole, LLMMessage } from "@shared/types";
import { logger } from "@main/lumen_core/tools/logger";
import PromptTool from "@main/lumen_core/tools/prompt-tool";
import { systemMonitor } from "@main/lumen_core/tools/system-monitor";

export enum LumenCoreStatus {
  Idle = "idle",
  Initializing = "initializing",
  Ready = "ready",
  Error = "error",
  Disposing = "disposing",
}

export interface LumenCoreState {
  status: LumenCoreStatus;
  error?: string;
  progress?: string;
}

class LumenCore {
  private _database!: DatabaseEngine;
  private _embedding!: LLMEngine; // 专门负责向量化的 BGE-M3
  private _llm!: LLMEngine; // 专门负责生成的 Qwen
  private _rag!: RagEngine;

  // 当前选中的模型配置
  private _currentLLMModel: string = LLMPath.getDefaultLLM();
  private _currentEmbeddingModel: string = LLMPath.getDefaultEmbedding();
  private _currentLLMGpuLayers: number | null = null; // null 表示使用自动推荐
  private _currentEmbeddingGpuLayers: number | null = null;
  private _currentContextSize: number | null = null;

  // 使用规范化的 LLMMessage 类型管理对话历史
  private _chatHistory: LLMMessage[] = [];

  // 状态管理
  private _status: LumenCoreStatus = LumenCoreStatus.Idle;
  private _statusListeners: Set<(state: LumenCoreState) => void> = new Set();
  private _initError?: string;

  /**
   * 最大 Prompt Token 数（基于模型 tokenizer 计算），超过则截断最旧的对话历史和参考资料。
   * 这个值需要小于模型 contextSize（如 3000），预留一些空间给系统提示。
   */
  private static readonly MAX_PROMPT_TOKENS = 3000;

  /**
   * 获取当前状态
   */
  getState(): LumenCoreState {
    return {
      status: this._status,
      error: this._initError,
    };
  }

  /**
   * 订阅状态变化
   */
  onStateChange(listener: (state: LumenCoreState) => void): () => void {
    this._statusListeners.add(listener);
    return () => this._statusListeners.delete(listener);
  }

  private setStatus(
    status: LumenCoreStatus,
    progress?: string,
    error?: string,
  ) {
    this._status = status;
    this._initError = error;
    const state: LumenCoreState = { status, progress, error };
    this._statusListeners.forEach((listener) => {
      try {
        listener(state);
      } catch (e) {
        logger.error("状态监听器执行失败", e);
      }
    });
  }

  /**
   * 初始化 Lumen 核心引擎
   */
  async initEngine() {
    if (this._status === LumenCoreStatus.Initializing) {
      logger.warn("Lumen Engine: 初始化正在进行中，请勿重复调用", "SYSTEM");
      return;
    }

    this.setStatus(LumenCoreStatus.Initializing, "正在启动...");

    try {
      // 启动时自动清理 7 天前的旧日志
      logger.pruneOldLogs(7);
      logger.info("Lumen Engine: 正在初始化核心组件...", "SYSTEM");

      // 0. 检测系统信息并获取推荐参数
      const systemInfo = await systemMonitor.getSystemInfo();
      const llmParams = await systemMonitor.getRecommendedLLMParams();
      const embeddingParams =
        await systemMonitor.getRecommendedEmbeddingParams();

      logger.info(
        `根据机型 (${systemInfo.machineType}) 自动配置参数：GPU Layers=${llmParams.gpuLayers}, Context=${llmParams.contextSize}`,
        "SYSTEM",
      );

      // 1. 初始化本地数据库
      this._database = new DatabaseEngine();
      await this._database.initialize();

      // 加载历史会话记录（持久化到本地数据库）
      await this.loadChatHistory();

      // 2. 初始化 Embedding 实例
      this._embedding = new LLMEngine();
      await this._embedding.initialize({
        modelPath: LLMPath.getDefaultEmbedding(),
        gpuLayers: this._currentEmbeddingGpuLayers ?? embeddingParams.gpuLayers,
        contextSize: embeddingParams.contextSize,
      });

      // 3. 初始化 LLM 推理实例
      this._llm = new LLMEngine();
      await this._llm.initialize({
        modelPath: this._currentLLMModel,
        contextSize: this._currentContextSize ?? llmParams.contextSize,
        gpuLayers: this._currentLLMGpuLayers ?? llmParams.gpuLayers,
        temperature: llmParams.temperature,
        topP: llmParams.topP,
      });

      // 4. 初始化 RAG 引擎（支持可配置的相似度与缓存策略）
      this._rag = new RagEngine(this._database, this._embedding, {
        minScore: 0.3,
        maxDocs: 500,
        cacheStrategy: "lru",
        cacheTTL: 1000 * 60 * 60 * 24, // 1 天
      });
      await this._rag.initialize();

      this.setStatus(LumenCoreStatus.Ready, "系统已就绪");
      logger.info("Lumen Engine: 系统已就绪", "SYSTEM");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.setStatus(LumenCoreStatus.Error, undefined, errorMsg);
      logger.error("Lumen Engine: 初始化失败", error);
      throw error;
    }
  }

  /**
   * 内部方法：格式化 Prompt 模板（使用 PromptTool）
   */
  private formatLLMMessages(
    messages: LLMMessage[],
    contextText: string,
  ): string {
    return PromptTool.formatPrompt(messages, contextText);
  }

  private truncatePrompt(
    messages: LLMMessage[],
    contextText: string,
  ): { messages: LLMMessage[]; contextText: string } {
    if (!this._llm) {
      // 如果还没初始化 LLM，就退回到不截断的逻辑（应当不会发生）
      return { messages, contextText };
    }

    const maxTokens = LumenCore.MAX_PROMPT_TOKENS;
    let truncatedMessages = [...messages];
    let truncatedContext = contextText;

    const render = () =>
      this.formatLLMMessages(truncatedMessages, truncatedContext);

    const countPromptTokens = (): number => this._llm.countTokens(render());

    // 提取最后一条消息（当前用户问题），确保不会被截断
    const currentQuestion =
      truncatedMessages.length > 0
        ? truncatedMessages[truncatedMessages.length - 1]
        : null;
    if (currentQuestion) {
      truncatedMessages = truncatedMessages.slice(0, -1);
    }

    // 1. 优先截断历史对话（从最旧条目开始）
    while (countPromptTokens() > maxTokens && truncatedMessages.length > 0) {
      truncatedMessages.shift();
    }

    // 2. 如果仍然超过，则从参考资料前端截断，保留末尾更靠近答案的内容
    while (countPromptTokens() > maxTokens && truncatedContext.length > 0) {
      const tokens = this._llm.tokenize(truncatedContext);
      const removeCount = Math.max(1, Math.ceil(tokens.length * 0.1));
      truncatedContext = this._llm.detokenize(tokens.slice(removeCount));

      // 3. 若仍然超过，则直接截断为最后 maxTokens 个 token
      if (countPromptTokens() > maxTokens) {
        const finalTokens = this._llm.tokenize(render()).slice(-maxTokens);
        return { messages: [], contextText: this._llm.detokenize(finalTokens) };
      }
    }

    // 重新添加当前用户问题到末尾
    if (currentQuestion) {
      truncatedMessages.push(currentQuestion);
    }

    return { messages: truncatedMessages, contextText: truncatedContext };
  }

  /**
   * 核心对话方法 (Lumen Chat)
   */
  async chat(question: string, onToken: (token: string) => void) {
    if (!this._rag || !this._llm) {
      throw new Error("Lumen Engine 尚未初始化完成");
    }

    const startTime = Date.now();
    logger.chat(LLMRole.User, question);

    try {
      // 1. 检索 (Retrieval)
      const searchStart = Date.now();
      const contexts = await this._rag.search(question, 3);
      logger.perf("RAG Search", Date.now() - searchStart);

      // 2. 构造消息队列（包含历史对话 + 当前用户问题）
      const messages: LLMMessage[] = [
        ...this._chatHistory,
        { role: LLMRole.User, content: question },
      ];

      // 3. 组装最终 Prompt，并确保不会超过最大长度导致模型 OOM
      const contextText = contexts.length > 0 ? contexts.join("\n\n") : "";
      const { messages: safeMessages, contextText: safeContext } =
        this.truncatePrompt(messages, contextText);
      const finalPrompt = this.formatLLMMessages(safeMessages, safeContext);

      // 4. 生成响应 (Generation)
      let fullResponse = "";
      await this._llm.streamChat(finalPrompt, (token) => {
        fullResponse += token;
        onToken(token);
      });

      // 5. 响应成功后，持久化用户输入和 AI 回复
      // 注意：messages 已经包含了当前问题，这里只需持久化 AI 回复
      logger.chat(LLMRole.Assistant, fullResponse);
      await this.persistChatMessage(LLMRole.Assistant, fullResponse);
      logger.perf("Total Response Time", Date.now() - startTime);

      // 6. 更新上下文 (保持最近 5 轮，即 10 条记录)
      // 先添加用户消息（它已经在 messages 中，但未添加到 chatHistory）
      this._chatHistory.push({ role: LLMRole.User, content: question });
      this._chatHistory.push({ role: LLMRole.Assistant, content: fullResponse });
      if (this._chatHistory.length > 10) this._chatHistory.splice(0, 2);

      return fullResponse;
    } catch (error) {
      const errorMsg = `\n[Lumen Error]: 处理请求时出错 - ${error}`;
      logger.error("Chat Flow Error", error);
      onToken(errorMsg);
      return errorMsg;
    }
  }

  /**
   * 知识库维护：添加新文档
   */
  async addDocument(content: string, metadata?: Record<string, any>) {
    if (!this._rag) throw new Error("RAG 引擎未就绪");
    logger.info(`正在添加新文档: ${content.substring(0, 20)}...`, "RAG");
    return await this._rag.addDocument(content, metadata);
  }

  /**
   * 列出本地模型文件（可用的 gguf 模型）
   */
  async getAvailableModels() {
    return LLMPath.listModels();
  }

  /**
   * 获取当前选中的模型配置
   */
  getCurrentModelSelection() {
    return {
      llm: path.basename(this._currentLLMModel),
      embedding: path.basename(this._currentEmbeddingModel),
      llmGpuLayers: this._currentLLMGpuLayers ?? -1, // -1 表示自动
      embeddingGpuLayers: this._currentEmbeddingGpuLayers ?? -1,
      contextSize: this._currentContextSize ?? -1,
    };
  }

  async switchModels(options: {
    llmModelFile?: string;
    embeddingModelFile?: string;
    llmGpuLayers?: number | null;
    embeddingGpuLayers?: number | null;
    contextSize?: number | null;
  }) {
    // 保存当前设置
    if (options.llmModelFile) {
      this._currentLLMModel = LLMPath.getPath(options.llmModelFile);
    }
    if (options.embeddingModelFile) {
      this._currentEmbeddingModel = LLMPath.getPath(options.embeddingModelFile);
    }
    if (options.llmGpuLayers !== undefined) {
      this._currentLLMGpuLayers = options.llmGpuLayers;
    }
    if (options.embeddingGpuLayers !== undefined) {
      this._currentEmbeddingGpuLayers = options.embeddingGpuLayers;
    }
    if (options.contextSize !== undefined) {
      this._currentContextSize = options.contextSize;
    }

    // 重新初始化模型（保持数据库与 RAG 引擎）
    logger.info("正在切换模型并重新加载引擎...", "CORE");

    await this._llm?.dispose();
    await this._embedding?.dispose();

    // 如果用户没有指定参数，则使用系统推荐值
    const llmParams = await systemMonitor.getRecommendedLLMParams();
    const embeddingParams = await systemMonitor.getRecommendedEmbeddingParams();

    this._embedding = new LLMEngine();
    await this._embedding.initialize({
      modelPath: this._currentEmbeddingModel,
      gpuLayers: this._currentEmbeddingGpuLayers ?? embeddingParams.gpuLayers,
      contextSize: embeddingParams.contextSize,
    });

    this._llm = new LLMEngine();
    await this._llm.initialize({
      modelPath: this._currentLLMModel,
      gpuLayers: this._currentLLMGpuLayers ?? llmParams.gpuLayers,
      contextSize: this._currentContextSize ?? llmParams.contextSize,
      temperature: llmParams.temperature,
      topP: llmParams.topP,
    });

    // 重新构建 RAG 引擎，确保 embedding 实例已更新
    this._rag = new RagEngine(this._database, this._embedding, {
      minScore: 0.3,
      maxDocs: 500,
      cacheStrategy: "lru",
      cacheTTL: 1000 * 60 * 60 * 24,
    });
    await this._rag.initialize();

    logger.info("模型切换完成", "CORE");
  }

  /**
   * 从数据库加载最近的会话历史（持久化）
   */
  async loadChatHistory(limit: number = 100) {
    if (!this._database) return;
    try {
      const records = this._database.getChatHistory(limit);
      this._chatHistory = records.map((r) => ({
        role: r.role as LLMRole,
        content: r.content,
      }));
      logger.info(
        `会话历史已恢复（最近 ${this._chatHistory.length} 条）`,
        "CORE",
      );
    } catch (error) {
      logger.error("加载会话历史失败", error);
    }
  }

  async getChatHistory(limit: number = 100) {
    if (!this._database) return this._chatHistory;
    try {
      return this._database.getChatHistory(limit);
    } catch (error) {
      logger.error("读取会话历史失败", error);
      return this._chatHistory;
    }
  }

  async clearHistory() {
    this._chatHistory = [];
    if (!this._database) return;

    try {
      this._database.clearChatHistory();
      logger.info("会话历史已清空（含持久化数据）", "CORE");
    } catch (error) {
      logger.error("清空会话历史失败", error);
    }
  }

  private async persistChatMessage(role: LLMRole, content: string) {
    if (!this._database) return;
    try {
      this._database.insertChatMessage(role, content);
    } catch (error) {
      logger.error("写入会话历史失败", error);
    }
  }

  /**
   * 重置会话状态
   */
  clearSession() {
    this._chatHistory = [];
    logger.info("会话历史已清空", "CORE");
  }

  /**
   * 彻底释放资源
   */
  async dispose() {
    this.setStatus(LumenCoreStatus.Disposing, "正在释放资源...");
    try {
      await this._llm?.dispose();
      await this._embedding?.dispose();
      this._chatHistory = [];
      await this._database?.close();
      this.setStatus(LumenCoreStatus.Idle);
      logger.info("Lumen Engine: 资源已释放", "SYSTEM");
    } catch (error) {
      this.setStatus(LumenCoreStatus.Error, undefined, String(error));
      throw error;
    }
  }
}

export default LumenCore;
