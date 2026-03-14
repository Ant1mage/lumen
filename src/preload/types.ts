export type LumenCoreStatus =
  | "idle"
  | "initializing"
  | "ready"
  | "error"
  | "disposing";

export interface LumenCoreState {
  status: LumenCoreStatus;
  error?: string;
  progress?: string;
}

export interface ModelSelection {
  llm: string;
  embedding: string;
  llmGpuLayers: number; // -1 表示自动
  embeddingGpuLayers: number; // -1 表示自动
  contextSize: number; // -1 表示自动
}

export interface ChatMessage {
  role: string;
  content: string;
  timestamp: string;
}

export interface ElectronAPI {
  /** 添加文档到知识库 */
  addDocument: (
    content: string,
  ) => Promise<{ id: number; content: string } | null>;
  /** 发送问题并获取完整回复（非流式） */
  askQuestion: (question: string) => Promise<string>;
  /** 发送问题并流式接收回复 */
  askQuestionStream: (
    question: string,
    onToken: (token: string) => void,
  ) => Promise<string>;
  /** 获取聊天记录 */
  getChatHistory: () => Promise<ChatMessage[]>;
  /** 清空聊天记录 */
  clearChatHistory: () => Promise<boolean>;
  /** 获取可用的模型列表 */
  getAvailableModels: () => Promise<string[]>;
  /** 获取当前模型配置 */
  getCurrentModelSelection: () => Promise<ModelSelection | null>;
  /** 设置模型配置 */
  setModels: (options: {
    llmModelFile?: string;
    embeddingModelFile?: string;
    llmGpuLayers?: number | null;
    embeddingGpuLayers?: number | null;
    contextSize?: number | null;
  }) => Promise<boolean>;
  /** 检查引擎是否就绪 */
  isReady: () => Promise<boolean>;
  /** 获取当前引擎状态 */
  getLumenState: () => Promise<LumenCoreState>;
  /** 订阅引擎状态变化 */
  onLumenStateChange: (callback: (state: LumenCoreState) => void) => () => void;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}

export {};
