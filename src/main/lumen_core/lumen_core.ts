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

  // 使用规范化的 LLMMessage 类型管理对话历史
  private chatHistory: LLMMessage[] = [];

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

      // 2. 初始化 Embedding 实例
      this.embedding = new LLMEngine();
      await this.embedding.initialize({
        modelPath: LLMPath.getPath("bge-m3-q8_0.gguf"),
        gpuLayers: 0,
      });

      // 3. 初始化 LLM 推理实例
      this.llm = new LLMEngine();
      await this.llm.initialize({
        modelPath: LLMPath.getPath("Qwen3.5-4B-Q4_K_M.gguf"),
        contextSize: 4096,
        gpuLayers: 32,
      });

      // 4. 初始化 RAG 引擎
      this.rag = new RagEngine(this.database, this.embedding);
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
      // 1. 检索 (Retrieval)
      const searchStart = Date.now();
      const contexts = await this.rag.search(question, 3);
      logger.perf("RAG Search", Date.now() - searchStart);

      const contextText =
        contexts.length > 0 ? contexts.join("\n\n") : "未找到相关参考资料。";

      // 2. 构造消息队列
      const messages: LLMMessage[] = [
        ...this.chatHistory,
        { role: LLMRole.User, content: question },
      ];

      // 3. 组装最终 Prompt
      const finalPrompt = this.formatLLMMessages(messages, contextText);

      // 4. 生成响应 (Generation)
      let fullResponse = "";
      await this.llm.streamChat(finalPrompt, (token) => {
        fullResponse += token;
        onToken(token);
      });

      logger.chat(LLMRole.Assistant, fullResponse);
      logger.perf("Total Response Time", Date.now() - startTime);

      // 5. 更新上下文 (保持最近 5 轮，即 10 条记录)
      this.chatHistory.push({ role: LLMRole.User, content: question });
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
    logger.info("Lumen Engine: 资源已释放", "SYSTEM");
  }
}


export default LumenCore;
