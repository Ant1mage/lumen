import path from "path";
import LLMEngine from "./ai/llm_engine";
import RagEngine from "./rag/rag_engine";
import LLMPath from "./ai/llm_path";
import DatabaseEngine from "./db/database_engine";
// 引入封装好的日志服务和类型
import { LLMRole, LLMMessage } from "./ai/llm_config";
import { logger } from "./tools/logger";

class LumenCore {
  private database!: DatabaseEngine;
  private embedding!: LLMEngine; // 专门负责向量化的 BGE-M3
  private llm!: LLMEngine; // 专门负责生成的 Qwen
  private rag!: RagEngine;

  // 当前选中的模型配置
  private currentLLMModel: string = LLMPath.getDefaultLLM();
  private currentEmbeddingModel: string = LLMPath.getDefaultEmbedding();
  private currentLLMGpuLayers = 32;
  private currentEmbeddingGpuLayers = 0;
  private currentContextSize = 4096;

  // 使用规范化的 LLMMessage 类型管理对话历史
  private chatHistory: LLMMessage[] = [];

  /**
   * 最大 Prompt Token 数（基于模型 tokenizer 计算），超过则截断最旧的对话历史和参考资料。
   * 这个值需要小于模型 contextSize（如 4096），预留一些空间给系统提示。
   */
  private static readonly MAX_PROMPT_TOKENS = 3000;

  /**
   * 初始化 Lumen 核心引擎
   */
  async initEngine() {
    try {
      // 启动时自动清理 7 天前的旧日志
      logger.pruneOldLogs(7);
      logger.info("Lumen Engine: 正在初始化核心组件...", "SYSTEM");

      // 1. 初始化本地数据库
      this.database = new DatabaseEngine();
      await this.database.initialize();

      // 加载历史会话记录（持久化到本地数据库）
      await this.loadChatHistory();

      // 2. 初始化 Embedding 实例
      this.embedding = new LLMEngine();
      await this.embedding.initialize({
        modelPath: LLMPath.getDefaultEmbedding(),
        gpuLayers: 0,
      });

      // 3. 初始化 LLM 推理实例
      this.llm = new LLMEngine();
      await this.llm.initialize({
        modelPath: this.currentLLMModel,
        contextSize: this.currentContextSize,
        gpuLayers: this.currentLLMGpuLayers,
      });

      // 4. 初始化 RAG 引擎（支持可配置的相似度与缓存策略）
      this.rag = new RagEngine(this.database, this.embedding, {
        minScore: 0.3,
        maxDocs: 500,
        cacheStrategy: "lru",
        cacheTTL: 1000 * 60 * 60 * 24, // 1 天
      });
      await this.rag.initialize();

      logger.info("Lumen Engine: 系统已就绪", "SYSTEM");
    } catch (error) {
      logger.error("Lumen Engine: 初始化失败", error);
    }
  }

  /**
   * 内部方法：格式化 Prompt 模板
   */
  private formatLLMMessages(
    messages: LLMMessage[],
    contextText: string,
  ): string {
    const formattedHistory = messages
      .map((msg) => {
        switch (msg.role) {
          case LLMRole.System:
            return `System: ${msg.content}`;
          case LLMRole.User:
            return `User: ${msg.content}`;
          case LLMRole.Assistant:
            return `Assistant: ${msg.content}`;
          default:
            return msg.content;
        }
      })
      .join("\n\n");

    return `System: 你是 Lumen，一个聪明、严谨且富有洞察力的 AI 助手。请根据提供的参考资料回答用户的问题。

参考资料:
${contextText}

${formattedHistory}

Assistant:`;
  }

  private truncatePrompt(
    messages: LLMMessage[],
    contextText: string,
  ): { messages: LLMMessage[]; contextText: string } {
    if (!this.llm) {
      // 如果还没初始化 LLM，就退回到不截断的逻辑（应当不会发生）
      return { messages, contextText };
    }

    const maxTokens = LumenCore.MAX_PROMPT_TOKENS;
    let truncatedMessages = [...messages];
    let truncatedContext = contextText;

    const render = () =>
      this.formatLLMMessages(truncatedMessages, truncatedContext);

    const countPromptTokens = (): number => this.llm.countTokens(render());

    // 1. 优先截断历史对话（从最旧条目开始）
    while (countPromptTokens() > maxTokens && truncatedMessages.length > 0) {
      truncatedMessages.shift();
    }

    // 2. 如果仍然超过，则从参考资料前端截断，保留末尾更靠近答案的内容
    while (countPromptTokens() > maxTokens && truncatedContext.length > 0) {
      const tokens = this.llm.tokenize(truncatedContext);
      const removeCount = Math.max(1, Math.ceil(tokens.length * 0.1));
      truncatedContext = this.llm.detokenize(tokens.slice(removeCount));

      // 3. 若仍然超过，则直接截断为最后 maxTokens 个 token
      if (countPromptTokens() > maxTokens) {
        const finalTokens = this.llm.tokenize(render()).slice(-maxTokens);
        return { messages: [], contextText: this.llm.detokenize(finalTokens) };
      }
    }

    return { messages: truncatedMessages, contextText: truncatedContext };
  }

  /**
   * 核心对话方法 (Lumen Chat)
   */
  async chat(question: string, onToken: (token: string) => void) {
    if (!this.rag || !this.llm) {
      throw new Error("Lumen Engine 尚未初始化完成");
    }

    const startTime = Date.now();
    logger.chat(LLMRole.User, question);

    try {
      // 持久化用户输入，避免丢失会话记录
      this.chatHistory.push({ role: LLMRole.User, content: question });
      await this.persistChatMessage(LLMRole.User, question);

      // 1. 检索 (Retrieval)
      const searchStart = Date.now();
      const contexts = await this.rag.search(question, 3);
      logger.perf("RAG Search", Date.now() - searchStart);

      const contextText =
        contexts.length > 0 ? contexts.join("\n\n") : "未找到相关参考资料。";

      // 2. 构造消息队列
      const messages: LLMMessage[] = [...this.chatHistory];

      // 3. 组装最终 Prompt，并确保不会超过最大长度导致模型 OOM
      const { messages: safeMessages, contextText: safeContext } =
        this.truncatePrompt(messages, contextText);
      const finalPrompt = this.formatLLMMessages(safeMessages, safeContext);

      // 4. 生成响应 (Generation)
      let fullResponse = "";
      await this.llm.streamChat(finalPrompt, (token) => {
        fullResponse += token;
        onToken(token);
      });

      logger.chat(LLMRole.Assistant, fullResponse);
      await this.persistChatMessage(LLMRole.Assistant, fullResponse);
      logger.perf("Total Response Time", Date.now() - startTime);

      // 5. 更新上下文 (保持最近 5 轮，即 10 条记录)
      this.chatHistory.push({ role: LLMRole.Assistant, content: fullResponse });
      if (this.chatHistory.length > 10) this.chatHistory.splice(0, 2);

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
    if (!this.rag) throw new Error("RAG 引擎未就绪");
    logger.info(`正在添加新文档: ${content.substring(0, 20)}...`, "RAG");
    return await this.rag.addDocument(content, metadata);
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
      llm: path.basename(this.currentLLMModel),
      embedding: path.basename(this.currentEmbeddingModel),
      llmGpuLayers: this.currentLLMGpuLayers,
      embeddingGpuLayers: this.currentEmbeddingGpuLayers,
      contextSize: this.currentContextSize,
    };
  }

  async switchModels(options: {
    llmModelFile?: string;
    embeddingModelFile?: string;
    llmGpuLayers?: number;
    embeddingGpuLayers?: number;
    contextSize?: number;
  }) {
    // 保存当前设置
    if (options.llmModelFile) {
      this.currentLLMModel = LLMPath.getPath(options.llmModelFile);
    }
    if (options.embeddingModelFile) {
      this.currentEmbeddingModel = LLMPath.getPath(options.embeddingModelFile);
    }
    if (typeof options.llmGpuLayers === "number") {
      this.currentLLMGpuLayers = options.llmGpuLayers;
    }
    if (typeof options.embeddingGpuLayers === "number") {
      this.currentEmbeddingGpuLayers = options.embeddingGpuLayers;
    }
    if (typeof options.contextSize === "number") {
      this.currentContextSize = options.contextSize;
    }

    // 重新初始化模型（保持数据库与 RAG 引擎）
    logger.info("正在切换模型并重新加载引擎...", "CORE");

    await this.llm?.dispose();
    await this.embedding?.dispose();

    this.embedding = new LLMEngine();
    await this.embedding.initialize({
      modelPath: this.currentEmbeddingModel,
      gpuLayers: this.currentEmbeddingGpuLayers,
    });

    this.llm = new LLMEngine();
    await this.llm.initialize({
      modelPath: this.currentLLMModel,
      gpuLayers: this.currentLLMGpuLayers,
      contextSize: this.currentContextSize,
    });

    // 重新构建 RAG 引擎，确保 embedding 实例已更新
    this.rag = new RagEngine(this.database, this.embedding, {
      minScore: 0.3,
      maxDocs: 500,
      cacheStrategy: "lru",
      cacheTTL: 1000 * 60 * 60 * 24,
    });
    await this.rag.initialize();

    logger.info("模型切换完成", "CORE");
  }

  /**
   * 从数据库加载最近的会话历史（持久化）
   */
  async loadChatHistory(limit: number = 100) {
    if (!this.database) return;
    try {
      const records = this.database.getChatHistory(limit);
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
    if (!this.database) return this.chatHistory;
    try {
      return this.database.getChatHistory(limit);
    } catch (error) {
      logger.error("读取会话历史失败", error);
      return this.chatHistory;
    }
  }

  async clearHistory() {
    this.chatHistory = [];
    if (!this.database) return;

    try {
      this.database.clearChatHistory();
      logger.info("会话历史已清空（含持久化数据）", "CORE");
    } catch (error) {
      logger.error("清空会话历史失败", error);
    }
  }

  private async persistChatMessage(role: LLMRole, content: string) {
    if (!this.database) return;
    try {
      this.database.insertChatMessage(role, content);
    } catch (error) {
      logger.error("写入会话历史失败", error);
    }
  }

  /**
   * 重置会话状态
   */
  clearSession() {
    this.chatHistory = [];
    logger.info("会话历史已清空", "CORE");
  }

  /**
   * 彻底释放资源
   */
  async dispose() {
    await this.llm?.dispose();
    await this.embedding?.dispose();
    this.chatHistory = [];
    await this.database?.close();
    logger.info("Lumen Engine: 资源已释放", "SYSTEM");
  }
}

export default LumenCore;
