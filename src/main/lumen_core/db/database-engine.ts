import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";
import { DocumentData, StockData } from "@main/lumen_core/db/database-model";
import { logger } from "@main/tools/logger";

class DatabaseEngine {
  private db: Database.Database | null = null;

  async initialize(): Promise<void> {
    const dbPath = path.join(app.getPath("userData"), "lumen.db");
    this.db = new Database(dbPath);

    // 启用 WAL 模式提升写性能，并开启外键支持
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");

    // 创建表
    this.createTables();
  }

  private createTables(): void {
    if (!this.db) return;

    // 股票数据表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS stocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        change REAL NOT NULL,
        volume INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 文档表（用于 RAG）
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        embedding TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 聊天记录表（用于持久化对话历史）
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建索引
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON stocks(symbol);
      CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at);
      CREATE INDEX IF NOT EXISTS idx_chat_history_time ON chat_history(timestamp);
    `);
  }

  // 聊天记录持久化
  insertChatMessage(role: string, content: string): number {
    if (!this.db) throw new Error("数据库未初始化");

    const stmt = this.db.prepare(`
      INSERT INTO chat_history (role, content)
      VALUES (?, ?)
    `);

    const result = stmt.run(role, content);
    return result.lastInsertRowid as number;
  }

  getChatHistory(
    limit: number = 100,
  ): { role: string; content: string; timestamp: string }[] {
    if (!this.db) throw new Error("数据库未初始化");

    const stmt = this.db.prepare(`
      SELECT role, content, timestamp FROM chat_history
      ORDER BY timestamp ASC
      LIMIT ?
    `);

    return stmt.all(limit) as {
      role: string;
      content: string;
      timestamp: string;
    }[];
  }

  clearChatHistory(): void {
    if (!this.db) throw new Error("数据库未初始化");

    this.db.prepare(`DELETE FROM chat_history`).run();
  }

  // 股票相关操作
  insertStock(stock: StockData): number {
    if (!this.db) throw new Error("数据库未初始化");

    const stmt = this.db.prepare(`
      INSERT INTO stocks (symbol, name, price, change, volume)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      stock.symbol,
      stock.name,
      stock.price,
      stock.change,
      stock.volume,
    );

    return result.lastInsertRowid as number;
  }

  getStockBySymbol(symbol: string): StockData[] {
    if (!this.db) throw new Error("数据库未初始化");

    const stmt = this.db.prepare(`
      SELECT * FROM stocks WHERE symbol = ? ORDER BY timestamp DESC LIMIT 100
    `);

    return stmt.all(symbol) as StockData[];
  }

  // 文档相关操作
  insertDocument(doc: DocumentData): number {
    if (!this.db) throw new Error("数据库未初始化");

    const stmt = this.db.prepare(`
      INSERT INTO documents (content, embedding, metadata)
      VALUES (?, ?, ?)
    `);

    const metadataValue =
      typeof doc.metadata === "string"
        ? doc.metadata
        : doc.metadata
          ? JSON.stringify(doc.metadata)
          : null;

    const result = stmt.run(doc.content, doc.embedding || null, metadataValue);

    return result.lastInsertRowid as number;
  }

  /**
   * 在事务中运行多个数据库操作，确保要么全部成功要么全部回滚。
   */
  runInTransaction<T>(fn: () => T): T {
    if (!this.db) throw new Error("数据库未初始化");
    const transaction = this.db.transaction(fn);
    return transaction();
  }

  /**
   * 批量插入文档，利用事务保证一致性和性能。
   */
  insertDocuments(docs: DocumentData[]): number[] {
    return this.runInTransaction(() => {
      const ids: number[] = [];
      for (const doc of docs) {
        ids.push(this.insertDocument(doc));
      }
      return ids;
    });
  }

  searchDocuments(query: string, limit: number = 10): DocumentData[] {
    if (!this.db) throw new Error("数据库未初始化");

    const stmt = this.db.prepare(`
      SELECT * FROM documents 
      WHERE content LIKE ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `);

    return stmt.all(`%${query}%`, limit) as DocumentData[];
  }

  getAllDocuments(limit: number = 100): DocumentData[] {
    if (!this.db) throw new Error("数据库未初始化");

    const stmt = this.db.prepare(`
      SELECT * FROM documents ORDER BY created_at DESC LIMIT ?
    `);

    return stmt.all(limit) as DocumentData[];
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  getDatabase(): Database.Database | null {
    return this.db;
  }
}

export default DatabaseEngine;
