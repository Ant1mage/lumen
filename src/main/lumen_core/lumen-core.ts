import { LLMRole, LLMMessage, LumenCoreStatus, LumenCoreState } from '@shared/types';
import { logger } from '@main/tools/logger';
import LLMPath from '../tools/llm-path';
import DatabaseEngine from './db/database-engine';
import RagEngine from './rag/rag-engine';
import { Embeddings } from '@langchain/core/embeddings';
import { LumenChain } from './lumen-chain';

class LumenCore {
  private dbEngine: DatabaseEngine | null = null;
  private ragEngine: RagEngine | null = null;
  private vectorEngine: Embeddings | null = null;

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

  private setStatus(status: LumenCoreStatus, progress?: string, error?: string) {
    this.status = status;
    this.initError = error;
    const state: LumenCoreState = { status, progress, error };
    this.statusListeners.forEach((listener) => {
      try {
        listener(state);
      } catch (e) {
        logger.error('状态监听器执行失败', e);
      }
    });
  }

  async initEngine() {
    if (this.status === LumenCoreStatus.Initializing) {
      logger.warn('Lumen Engine: 初始化正在进行中，请勿重复调用', 'LumenCore');
      return;
    }

    this.setStatus(LumenCoreStatus.Initializing, '正在启动...');

    try {
      logger.pruneOldLogs(7);
      logger.info('Lumen Engine: 正在初始化核心组件...', 'LumenCore');

      this.dbEngine = new DatabaseEngine();
      await this.dbEngine.initialize();
      logger.info('DB Engine 初始化完成', 'LumenCore');
      await this.loadChatHistory();

      const { LlamaCppEmbeddings } = await import('@langchain/community/embeddings/llama_cpp');
      this.vectorEngine = await LlamaCppEmbeddings.initialize({
        modelPath: LLMPath.getVecLLM(),
        gpuLayers: -1,
        useMmap: true,
      });
      logger.info('Vector Engine 初始化完成', 'LumenCore');

      this.ragEngine = new RagEngine();
      await this.ragEngine.initialize(this.dbEngine, this.vectorEngine);
      logger.info('RAG Engine 初始化完成', 'LumenCore');

      this.setStatus(LumenCoreStatus.Ready, '系统已就绪');
      logger.info('Lumen Engine: Pipeline 架构初始化完成', 'LumenCore');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.setStatus(LumenCoreStatus.Error, undefined, errorMsg);
      logger.error('Lumen Engine: 初始化失败', error);
      throw error;
    }
  }

  async chat(question: string, onToken: (token: string) => void) {
    if (!this.ragEngine) {
      throw new Error('Lumen Engine 尚未初始化完成');
    }

    const startTime = Date.now();
    const ragEngine = this.ragEngine;
    logger.chat(LLMRole.User, question);

    try {
      const chain = new LumenChain((query, topK) => ragEngine.search(query, topK), this.isTranslatorEnable, onToken);

      const result = await chain.invoke({
        question,
        chatHistory: this.chatHistory,
      });

      logger.chat(LLMRole.Assistant, result.response);
      await this.persistChatMessage(LLMRole.Assistant, result.response);
      logger.perf('Total Response Time', Date.now() - startTime);

      this.chatHistory.push({ role: LLMRole.User, content: question });
      this.chatHistory.push({ role: LLMRole.Assistant, content: result.response });
      if (this.chatHistory.length > 10) {
        this.chatHistory.splice(0, 2);
      }

      return result.response;
    } catch (error) {
      const errorMsg = `\n[Lumen Error]: 处理请求时出错 - ${error}`;
      logger.error('Chat Flow Error', error);
      onToken(errorMsg);
      return errorMsg;
    }
  }

  async addDocument(content: string, metadata?: Record<string, any>) {
    if (!this.ragEngine) throw new Error('RAG 引擎未就绪');
    logger.info(`正在添加新文档: ${content.substring(0, 20)}...`, 'RAG');
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
      logger.info(`会话历史已恢复（最近 ${this.chatHistory.length} 条）`, 'LumenCore');
    } catch (error) {
      logger.error('加载会话历史失败', error);
    }
  }

  async getChatHistory(limit: number = 100) {
    if (!this.dbEngine) return this.chatHistory;
    try {
      return this.dbEngine.getChatHistory(limit);
    } catch (error) {
      logger.error('读取会话历史失败', error);
      return this.chatHistory;
    }
  }

  async clearHistory() {
    this.chatHistory = [];
    if (!this.dbEngine) return;

    try {
      this.dbEngine.clearChatHistory();
      logger.info('会话历史已清空（含持久化数据）', 'CORE');
    } catch (error) {
      logger.error('清空会话历史失败', error);
    }
  }

  private async persistChatMessage(role: LLMRole, content: string) {
    if (!this.dbEngine) return;
    try {
      this.dbEngine.insertChatMessage(role, content);
    } catch (error) {
      logger.error('写入会话历史失败', error);
    }
  }

  clearSession() {
    this.chatHistory = [];
    logger.info('会话历史已清空', 'CORE');
  }

  setTranslatorEnable(enable: boolean) {
    this.isTranslatorEnable = enable;
    logger.info(`Translator Engine: ${enable ? '启用' : '禁用'}`, 'CONFIG');
  }

  isTranslatorEnabled(): boolean {
    return this.isTranslatorEnable;
  }

  async dispose() {
    this.setStatus(LumenCoreStatus.Disposing, '正在释放资源...');
    try {
      this.vectorEngine = null;
      this.ragEngine = null;
      this.chatHistory = [];
      await this.dbEngine?.close();
      this.setStatus(LumenCoreStatus.Idle);
      logger.info('Lumen Engine: 资源已释放', 'LumenCore');
    } catch (error) {
      this.setStatus(LumenCoreStatus.Error, undefined, String(error));
      throw error;
    }
  }
}

export default LumenCore;
