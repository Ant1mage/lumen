import DatabaseEngine from "@main/lumen_core/db/database-engine";
import { logger } from "@main/tools/logger";
import { Embeddings } from "@langchain/core/embeddings";

export interface RAGDocument {
  id?: number;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export interface RagEngineOptions {
  minScore: number;
  maxDocs: number;
  cacheStrategy: "none" | "fifo" | "lru";
  cacheTTL: number;
}

class RagEngine {
  private _db: DatabaseEngine | null = null;
  private _embeddingEngine: Embeddings | null = null;
  private _options: RagEngineOptions = {
    minScore: 0.3,
    maxDocs: 1000,
    cacheStrategy: "lru",
    cacheTTL: 1000 * 60 * 60 * 24,
  };

  private _documents: Map<number, RAGDocument> = new Map();
  private _cacheOrder: number[] = [];
  private _cacheTimestamps: Map<number, number> = new Map();

  async initialize(
    db: DatabaseEngine,
    embeddingEngine: Embeddings,
    options: RagEngineOptions | null = null,
  ): Promise<void> {
    this._db = db;
    this._embeddingEngine = embeddingEngine;
    if (options) {
      this._options = options;
    }
    const docs = db.getAllDocuments(this._options.maxDocs);
    const now = Date.now();

    this._documents.clear();
    this._cacheOrder = [];
    this._cacheTimestamps.clear();

    for (const doc of docs) {
      if (!doc.id) continue;
      this._documents.set(doc.id, {
        id: doc.id,
        content: doc.content,
        embedding: doc.embedding ? JSON.parse(doc.embedding) : [],
        metadata: doc.metadata ? JSON.parse(doc.metadata) : undefined,
      });
      this._cacheOrder.push(doc.id);
      this._cacheTimestamps.set(doc.id, now);
    }

    this.evictExpired();
    this.evictIfNeeded();

    logger.info(
      `RagEngine: 已加载 ${this._documents.size} 条本地索引（限制: ${this._options.maxDocs}）`,
    );
  }

  private evictExpired() {
    const cutoff = Date.now() - this._options.cacheTTL;
    for (const [id, ts] of this._cacheTimestamps.entries()) {
      if (ts < cutoff) {
        this._documents.delete(id);
        this._cacheTimestamps.delete(id);
        this._cacheOrder = this._cacheOrder.filter((x) => x !== id);
      }
    }
  }

  private recordAccess(id: number) {
    this._cacheTimestamps.set(id, Date.now());
    this._cacheOrder = this._cacheOrder.filter((x) => x !== id);
    this._cacheOrder.push(id);
  }

  private evictIfNeeded() {
    if (this._options.cacheStrategy === "none") return;

    while (this._documents.size > this._options.maxDocs) {
      let evictId: number | undefined;

      if (this._options.cacheStrategy === "fifo") {
        evictId = this._cacheOrder.shift();
      } else if (this._options.cacheStrategy === "lru") {
        evictId = this._cacheOrder.shift();
      }

      if (evictId === undefined) break;
      this._documents.delete(evictId);
      this._cacheTimestamps.delete(evictId);
    }
  }

  async addDocument(content: string, metadata?: Record<string, any>) {
    if (!this._embeddingEngine || !this._db) return null;
    const embedding = await this._embeddingEngine.embedQuery(content);
    const id = this._db.insertDocument({
      content,
      embedding: JSON.stringify(embedding),
      metadata: metadata ? JSON.stringify(metadata) : undefined,
      created_at: new Date().toISOString(),
    });

    const newDoc: RAGDocument = { id, content, embedding, metadata };
    if (this._documents.size >= this._options.maxDocs) {
      let evictId: number | undefined;
      if (
        this._options.cacheStrategy === "fifo" ||
        this._options.cacheStrategy === "lru"
      ) {
        evictId = this._cacheOrder.shift();
      }
      if (evictId !== undefined) {
        this._documents.delete(evictId);
        this._cacheTimestamps.delete(evictId);
      }
    }

    this._documents.set(id, newDoc);
    this._cacheOrder.push(id);
    this._cacheTimestamps.set(id, Date.now());

    return newDoc;
  }

  getCacheStats(): { size: number; maxSize: number; strategy: string } {
    return {
      size: this._documents.size,
      maxSize: this._options.maxDocs,
      strategy: this._options.cacheStrategy,
    };
  }

  async search(query: string, limit: number = 5) {
    try {
      if (!this._embeddingEngine) {
        logger.error("Embedding engine not initialized", "RagEngine");
        throw new Error("Embedding engine not initialized");
      }
      this.evictExpired();

      const queryEmbedding = await this._embeddingEngine.embedQuery(query);
      const effectiveLimit = Math.min(limit, this._options.maxDocs);

      const results = Array.from(this._documents.values())
        .map((doc) => {
          if (!doc.embedding || doc.embedding.length === 0) return null;
          if (doc.embedding.length !== queryEmbedding.length) return null;

          const score = this.cosineSimilarity(queryEmbedding, doc.embedding);
          return { doc, score };
        })
        .filter((res): res is { doc: RAGDocument; score: number } => !!res)
        .filter((res) => res.score >= this._options.minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, effectiveLimit);

      for (const { doc } of results) {
        if (doc.id) this.recordAccess(doc.id);
      }

      return results.map((r) => r.doc.content);
    } catch (error) {
      logger.error(`RagEngine: 搜索失败：${error}`, "RagEngine");
      return [];
    }
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
