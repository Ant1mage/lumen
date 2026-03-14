import LLMEngine from "../ai/llm_engine";
import DatabaseEngine from "../db/database_engine";
import { logger } from "../tools/logger";

export interface RAGDocument {
  id?: number;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export interface RagEngineOptions {
  /** Minimum similarity score to include in results (0-1) */
  minScore?: number;
  /** Maximum number of documents to keep in memory cache */
  maxDocs?: number;
  /** Cache eviction strategy when maxDocs is reached */
  cacheStrategy?: "none" | "fifo" | "lru";
  /** Time-to-live (ms) for cached documents (only used when set) */
  cacheTTL?: number;
}

class RagEngine {
  private documents: Map<number, RAGDocument> = new Map();
  private cacheOrder: number[] = [];
  private cacheTimestamps: Map<number, number> = new Map();

  private minSimilarity: number;
  private maxDocs: number;
  private cacheStrategy: "none" | "fifo" | "lru";
  private cacheTTL?: number;

  constructor(
    private db: DatabaseEngine,
    private embeddingEngine: LLMEngine,
    options: RagEngineOptions = {},
  ) {
    this.minSimilarity = options.minScore ?? 0.3;
    this.maxDocs = options.maxDocs ?? 1000;
    this.cacheStrategy = options.cacheStrategy ?? "fifo";
    this.cacheTTL = options.cacheTTL;
  }

  async initialize(): Promise<void> {
    // 只加载最新的 maxDocs 条记录，防止内存过大
    // 按 ID 降序获取，确保最新的文档优先加载
    const docs = this.db.getAllDocuments(this.maxDocs);
    const now = Date.now();

    // 清空现有缓存，确保与数据库同步
    this.documents.clear();
    this.cacheOrder = [];
    this.cacheTimestamps.clear();

    for (const doc of docs) {
      if (!doc.id) continue;
      this.documents.set(doc.id, {
        id: doc.id,
        content: doc.content,
        embedding: doc.embedding ? JSON.parse(doc.embedding) : [],
        metadata: doc.metadata ? JSON.parse(doc.metadata) : undefined,
      });
      // 保持 ID 升序，确保 LRU/FIFO 正确性
      this.cacheOrder.push(doc.id);
      this.cacheTimestamps.set(doc.id, now);
    }

    this.evictExpired();
    this.evictIfNeeded();

    logger.info(
      `RagEngine: 已加载 ${this.documents.size} 条本地索引（限制: ${this.maxDocs}）`,
    );
  }

  /**
   * 重新加载缓存（用于模型切换后同步）
   */
  async reload(): Promise<void> {
    logger.info("RagEngine: 重新加载缓存...");
    await this.initialize();
  }

  private evictExpired() {
    if (!this.cacheTTL) return;

    const cutoff = Date.now() - this.cacheTTL;
    for (const [id, ts] of this.cacheTimestamps.entries()) {
      if (ts < cutoff) {
        this.documents.delete(id);
        this.cacheTimestamps.delete(id);
        this.cacheOrder = this.cacheOrder.filter((x) => x !== id);
      }
    }
  }

  private recordAccess(id: number) {
    this.cacheTimestamps.set(id, Date.now());

    if (this.cacheStrategy !== "lru") return;
    // Move to back of queue for LRU
    this.cacheOrder = this.cacheOrder.filter((x) => x !== id);
    this.cacheOrder.push(id);
  }

  private evictIfNeeded() {
    if (this.cacheStrategy === "none") return;

    while (this.documents.size > this.maxDocs) {
      // FIFO / LRU: evict the oldest tracked item
      const evictId = this.cacheOrder.shift();
      if (!evictId) break;
      this.documents.delete(evictId);
      this.cacheTimestamps.delete(evictId);
    }
  }

  // 只负责存：生成向量并存库
  async addDocument(
    content: string,
    metadata?: Record<string, any>,
  ): Promise<RAGDocument> {
    const embedding = await this.embeddingEngine.embed(content);
    const id = this.db.insertDocument({
      content,
      embedding: JSON.stringify(embedding),
      metadata: metadata ? JSON.stringify(metadata) : undefined,
      created_at: new Date().toISOString(),
    });

    const newDoc: RAGDocument = { id, content, embedding, metadata };

    // 检查是否需要先清理空间（在添加新文档前）
    if (this.documents.size >= this.maxDocs) {
      this.evictExpired();
      this.evictIfNeeded();
    }

    this.documents.set(id, newDoc);
    this.cacheOrder.push(id);
    this.cacheTimestamps.set(id, Date.now());

    return newDoc;
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { size: number; maxSize: number; strategy: string } {
    return {
      size: this.documents.size,
      maxSize: this.maxDocs,
      strategy: this.cacheStrategy,
    };
  }

  // 只负责查：输入问题，返回相似文档片段
  async search(query: string, limit: number = 5) {
    this.evictExpired();

    const queryEmbedding = await this.embeddingEngine.embed(query);
    const effectiveLimit = Math.min(limit, this.maxDocs);

    const results = Array.from(this.documents.values())
      .map((doc) => {
        if (!doc.embedding || doc.embedding.length === 0) return null;
        if (doc.embedding.length !== queryEmbedding.length) return null;

        const score = this.cosineSimilarity(queryEmbedding, doc.embedding);
        return { doc, score };
      })
      .filter((res): res is { doc: RAGDocument; score: number } => !!res)
      .filter((res) => res.score >= this.minSimilarity)
      .sort((a, b) => b.score - a.score)
      .slice(0, effectiveLimit);

    // 更新访问时间/顺序（LRU）
    for (const { doc } of results) {
      if (doc.id) this.recordAccess(doc.id);
    }

    return results.map((r) => r.doc.content);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return magnitudeA === 0 || magnitudeB === 0
      ? 0
      : dotProduct / (magnitudeA * magnitudeB);
  }
}

export default RagEngine;
