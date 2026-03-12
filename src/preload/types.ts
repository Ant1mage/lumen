export interface ElectronAPI {
  analyzeStock: (symbol: string) => Promise<string>;
  addDocument: (content: string) => Promise<any>;
  askQuestion: (question: string) => Promise<string>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}

export {};
