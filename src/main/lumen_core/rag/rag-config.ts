export interface RAGDocument {
  id?: number;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export interface RagSearchResult {
  document: RAGDocument;
  score: number;
}
