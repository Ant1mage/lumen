import DatabaseService from '../db/database';
import LlamaService from '../llm/llama';

export interface RAGDocument {
  id?: number;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export interface SearchResult {
  document: RAGDocument;
  score: number;
}

class RagStore {
  private db: DatabaseService;
  private llamaService: LlamaService;
  private documents: Map<number, RAGDocument> = new Map();

  constructor(db: DatabaseService, llamaService: LlamaService) {
    this.db = db;
    this.llamaService = llamaService;
  }

  async initialize(): Promise<void> {
    // 从数据库加载已有文档
    const docs = this.db.getAllDocuments(1000);
    for (const doc of docs) {
      const embedding = doc.embedding ? JSON.parse(doc.embedding) : [];
      this.documents.set(doc.id!, {
        id: doc.id,
        content: doc.content,
        embedding,
        metadata: doc.metadata ? JSON.parse(doc.metadata) : undefined,
      });
    }
    console.log(`RAG Store 初始化完成，加载了 ${this.documents.size} 个文档`);
  }

  async addDocument(content: string, metadata?: Record<string, any>): Promise<RAGDocument | null> {
    try {
      // 生成嵌入向量
      const embedding = await this.llamaService.embed(content);
      
      const doc: RAGDocument = {
        content,
        embedding,
        metadata,
      };

      // 保存到数据库
      const id = this.db.insertDocument({
        content,
        embedding: JSON.stringify(embedding),
        metadata: metadata ? JSON.stringify(metadata) : undefined,
        created_at: new Date(),
      });

      doc.id = id;
      this.documents.set(id, doc);

      return doc;
    } catch (error) {
      console.error('添加文档失败:', error);
      return null;
    }
  }

  async searchSimilar(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      // 生成查询的嵌入向量
      const queryEmbedding = await this.llamaService.embed(query);
      
      const results: SearchResult[] = [];
      
      // 计算余弦相似度
      for (const doc of this.documents.values()) {
        const score = this.cosineSimilarity(queryEmbedding, doc.embedding);
        results.push({
          document: doc,
          score,
        });
      }

      // 按相似度排序
      results.sort((a, b) => b.score - a.score);
      
      return results.slice(0, limit);
    } catch (error) {
      console.error('搜索失败:', error);
      return [];
    }
  }

  async analyzeStock(symbol: string): Promise<string> {
    // 搜索相关的股票分析文档
    const results = await this.searchSimilar(`股票分析 ${symbol}`, 3);
    
    if (results.length === 0) {
      return `未找到关于 ${symbol} 的分析信息。您可以添加相关的股票分析文档。`;
    }

    // 构建上下文
    const context = results
      .map(r => r.document.content)
      .join('\n\n');

    // 使用 LLM 生成分析
    const prompt = `基于以下股票分析信息，简要总结 ${symbol} 的投资价值：

${context}

总结:`;

    try {
      const analysis = await this.llamaService.generateResponse(prompt, {
        maxTokens: 300,
        temperature: 0.5,
      });
      return analysis;
    } catch (error) {
      return `分析失败：${error instanceof Error ? error.message : '未知错误'}`;
    }
  }

  async answerQuestion(question: string): Promise<string> {
    // 搜索相关文档
    const results = await this.searchSimilar(question, 5);
    
    if (results.length === 0) {
      return '抱歉，我没有足够的信息来回答这个问题。';
    }

    // 过滤高相似度的结果
    const relevantDocs = results.filter(r => r.score > 0.3);
    
    if (relevantDocs.length === 0) {
      return '抱歉，我没有找到相关的信息来回答这个问题。';
    }

    // 构建上下文
    const context = relevantDocs
      .map(r => r.document.content)
      .join('\n\n');

    // 使用 LLM 生成答案
    const prompt = `基于以下信息，请回答问题：

问题：${question}

相关信息：
${context}

答案:`;

    try {
      const answer = await this.llamaService.generateResponse(prompt, {
        maxTokens: 400,
        temperature: 0.6,
      });
      return answer;
    } catch (error) {
      return `生成答案失败：${error instanceof Error ? error.message : '未知错误'}`;
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  getDocumentCount(): number {
    return this.documents.size;
  }
}

export default RagStore;
