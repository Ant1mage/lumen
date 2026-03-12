import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

export interface StockData {
  id?: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  timestamp: Date;
}

export interface DocumentData {
  id?: number;
  content: string;
  embedding?: string;
  metadata?: string;
  created_at: Date;
}

class DatabaseService {
  private db: Database.Database | null = null;

  async initialize(): Promise<void> {
    const dbPath = path.join(app.getPath('userData'), 'lumen.db');
    this.db = new Database(dbPath);
    
    // 启用外键支持
    this.db.pragma('journal_mode = WAL');
    
    // 创建表
    this.createTables();
    
    console.log(`数据库初始化完成：${dbPath}`);
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

    // 创建索引
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON stocks(symbol);
      CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at);
    `);
  }

  // 股票相关操作
  insertStock(stock: StockData): number {
    if (!this.db) throw new Error('数据库未初始化');
    
    const stmt = this.db.prepare(`
      INSERT INTO stocks (symbol, name, price, change, volume)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      stock.symbol,
      stock.name,
      stock.price,
      stock.change,
      stock.volume
    );
    
    return result.lastInsertRowid as number;
  }

  getStockBySymbol(symbol: string): StockData[] {
    if (!this.db) throw new Error('数据库未初始化');
    
    const stmt = this.db.prepare(`
      SELECT * FROM stocks WHERE symbol = ? ORDER BY timestamp DESC LIMIT 100
    `);
    
    return stmt.all(symbol) as StockData[];
  }

  // 文档相关操作
  insertDocument(doc: DocumentData): number {
    if (!this.db) throw new Error('数据库未初始化');
    
    const stmt = this.db.prepare(`
      INSERT INTO documents (content, embedding, metadata)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(
      doc.content,
      doc.embedding || null,
      doc.metadata ? JSON.stringify(doc.metadata) : null
    );
    
    return result.lastInsertRowid as number;
  }

  searchDocuments(query: string, limit: number = 10): DocumentData[] {
    if (!this.db) throw new Error('数据库未初始化');
    
    const stmt = this.db.prepare(`
      SELECT * FROM documents 
      WHERE content LIKE ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    
    return stmt.all(`%${query}%`, limit) as DocumentData[];
  }

  getAllDocuments(limit: number = 100): DocumentData[] {
    if (!this.db) throw new Error('数据库未初始化');
    
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

export default DatabaseService;
