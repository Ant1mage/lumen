import LLMEngine from "../ai/llm_engine";
import DatabaseEngine from "../db/database_engine";
import { logger } from "../tools/logger";

export interface RAGDocument {
  id?: number;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

class RagEngine {
  private documents: Map<number, RAGDocument> = new Map();

  /**
   * 低于此相似度的文档将被过滤，避免返回无关结果
   */
  private static readonly MIN_SIMILARITY = 0.3;

  constructor(
    private db: DatabaseEngine,
    private embeddingEngine: LLMEngine,
  ) {}

  async initialize(): Promise<void> {
    const docs = this.db.getAllDocuments(1000);
    for (const doc of docs) {
      this.documents.set(doc.id!, {
        id: doc.id,
        content: doc.content,
        embedding: doc.embedding ? JSON.parse(doc.embedding) : [],
        metadata: doc.metadata ? JSON.parse(doc.metadata) : undefined,
      });
    }
    logger.info(`RagEngine: 已加载 ${this.documents.size} 条本地索引`);
  }

  // 只负责存：生成向量并存库
  async addDocument(content: string, metadata?: Record<string, any>) {
    const embedding = await this.embeddingEngine.embed(content);
    const id = this.db.insertDocument({
      content,
      embedding: JSON.stringify(embedding),
      metadata: metadata ? JSON.stringify(metadata) : undefined,
      created_at: new Date().toISOString(),
    });
    const newDoc = { id, content, embedding, metadata };
    this.documents.set(id, newDoc);
    return newDoc;
  }

  // 只负责查：输入问题，返回相似文档片段
  async search(query: string, limit: number = 5) {
    const queryEmbedding = await this.embeddingEngine.embed(query);

    const results = Array.from(this.documents.values())
      .map((doc) => {
        if (!doc.embedding || doc.embedding.length === 0) return null;
        if (doc.embedding.length !== queryEmbedding.length) return null;

        const score = this.cosineSimilarity(queryEmbedding, doc.embedding);
        return { doc, score };
      })
      .filter((res): res is { doc: RAGDocument; score: number } => !!res)
      .filter((res) => res.score >= RagEngine.MIN_SIMILARITY)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

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
