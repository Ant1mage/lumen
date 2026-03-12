export interface ElectronAPI {
  analyzeStock: (symbol: string) => Promise<string>;
  addDocument: (content: string) => Promise<any>;
  askQuestion: (question: string) => Promise<string>;
  askQuestionStream: (
    question: string,
    onToken: (token: string) => void,
  ) => Promise<string>;
  getChatHistory: () => Promise<
    Array<{ role: string; content: string; timestamp: string }>
  >;
  clearChatHistory: () => Promise<boolean>;
  getAvailableModels: () => Promise<string[]>;
  getCurrentModelSelection: () => Promise<{
    llm: string;
    embedding: string;
    llmGpuLayers: number;
    embeddingGpuLayers: number;
    contextSize: number;
  }>;
  setModels: (options: {
    llmModelFile?: string;
    embeddingModelFile?: string;
    llmGpuLayers?: number;
    embeddingGpuLayers?: number;
    contextSize?: number;
  }) => Promise<boolean>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}

export {};
