import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import type { LumenCoreState } from "../main/lumen_core/lumen_core";

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld("api", {
  addDocument: (content: string) => ipcRenderer.invoke("add-document", content),
  askQuestion: (question: string) =>
    ipcRenderer.invoke("ask-question", question),
  askQuestionStream: async (
    question: string,
    onToken: (token: string) => void,
  ) => {
    const sessionId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const listener = (_event: IpcRendererEvent, token: string) => {
      onToken(token);
    };

    ipcRenderer.on(`chat-token-${sessionId}`, listener);

    try {
      const result = await ipcRenderer.invoke(
        "ask-question-stream",
        question,
        sessionId,
      );
      return result as string;
    } finally {
      ipcRenderer.removeListener(`chat-token-${sessionId}`, listener);
    }
  },
  getChatHistory: () => ipcRenderer.invoke("get-chat-history"),
  clearChatHistory: () => ipcRenderer.invoke("clear-chat-history"),
  getAvailableModels: () => ipcRenderer.invoke("get-available-models"),
  getCurrentModelSelection: () =>
    ipcRenderer.invoke("get-current-model-selection"),
  setModels: (options: {
    llmModelFile?: string;
    embeddingModelFile?: string;
    llmGpuLayers?: number | null;
    embeddingGpuLayers?: number | null;
    contextSize?: number | null;
  }) => ipcRenderer.invoke("set-models", options),
  isReady: () => ipcRenderer.invoke("is-ready"),
  getLumenState: () => ipcRenderer.invoke("get-lumen-state"),
  onLumenStateChange: (callback: (state: LumenCoreState) => void) => {
    const listener = (_event: IpcRendererEvent, state: LumenCoreState) => {
      callback(state);
    };
    ipcRenderer.on("lumen-state-change", listener);
    return () => ipcRenderer.removeListener("lumen-state-change", listener);
  },
});
