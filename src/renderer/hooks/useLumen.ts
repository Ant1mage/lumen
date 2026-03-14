import { useEffect, useState, useCallback } from "react";

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
  llmGpuLayers: number;
  embeddingGpuLayers: number;
  contextSize: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * Lumen Core 状态管理 Hook
 * 提供引擎状态、聊天功能、模型管理等能力
 */
export function useLumen() {
  const [state, setState] = useState<LumenCoreState>({ status: "idle" });
  const [isReady, setIsReady] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [modelSelection, setModelSelection] = useState<ModelSelection | null>(
    null,
  );

  // 订阅状态变化
  useEffect(() => {
    // @ts-ignore - window.api 在 preload 中定义
    const unsubscribe = window.api.onLumenStateChange(
      (newState: LumenCoreState) => {
        setState(newState);
        setIsReady(newState.status === "ready");
      },
    );

    // 初始状态检查
    // @ts-ignore
    window.api.getLumenState().then((initialState: LumenCoreState) => {
      setState(initialState);
      setIsReady(initialState.status === "ready");
    });

    return unsubscribe;
  }, []);

  // 加载模型信息
  const loadModelInfo = useCallback(async () => {
    try {
      // @ts-ignore
      const models = await window.api.getAvailableModels();
      setAvailableModels(models || []);

      // @ts-ignore
      const selection = await window.api.getCurrentModelSelection();
      setModelSelection(selection);
    } catch (error) {
      console.warn("获取模型信息失败", error);
    }
  }, []);

  // 加载聊天记录
  const loadHistory = useCallback(async () => {
    try {
      // @ts-ignore
      const records = await window.api.getChatHistory();
      setHistory(
        records.map((item: any) => ({
          role: item.role === "assistant" ? "assistant" : "user",
          content: item.content,
          timestamp: new Date(item.timestamp),
        })),
      );
    } catch (error) {
      console.warn("获取会话历史失败", error);
    }
  }, []);

  // 发送消息（流式）
  const sendMessage = useCallback(
    async (
      message: string,
      onToken: (token: string) => void,
    ): Promise<string> => {
      if (!isReady) {
        throw new Error("模型正在加载中，请稍候...");
      }

      try {
        // @ts-ignore
        const result = await window.api.askQuestionStream(message, onToken);
        // 发送成功后刷新历史记录
        await loadHistory();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [isReady, loadHistory],
  );

  // 清空历史
  const clearHistory = useCallback(async () => {
    try {
      // @ts-ignore
      await window.api.clearChatHistory();
      setHistory([]);
    } catch (error) {
      console.warn("清除会话历史失败", error);
    }
  }, []);

  // 切换模型
  const switchModel = useCallback(
    async (options: {
      llmModelFile?: string;
      embeddingModelFile?: string;
      llmGpuLayers?: number | null;
      embeddingGpuLayers?: number | null;
      contextSize?: number | null;
    }) => {
      try {
        // @ts-ignore
        await window.api.setModels(options);
        // 刷新模型信息
        await loadModelInfo();
        return true;
      } catch (error) {
        console.error("切换模型失败", error);
        return false;
      }
    },
    [loadModelInfo],
  );

  // 添加文档到知识库
  const addDocument = useCallback(
    async (content: string, metadata?: Record<string, any>) => {
      try {
        // @ts-ignore
        return await window.api.addDocument(content, metadata);
      } catch (error) {
        console.error("添加文档失败", error);
        return null;
      }
    },
    [],
  );

  return {
    // 状态
    state,
    isReady,
    isInitializing: state.status === "initializing",
    isError: state.status === "error",
    error: state.error,
    progress: state.progress,

    // 数据
    history,
    availableModels,
    modelSelection,

    // 操作
    loadModelInfo,
    loadHistory,
    sendMessage,
    clearHistory,
    switchModel,
    addDocument,
  };
}

export default useLumen;
