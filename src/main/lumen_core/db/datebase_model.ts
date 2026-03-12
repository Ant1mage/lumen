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