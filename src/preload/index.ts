import { contextBridge, ipcRenderer } from 'electron';

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('api', {
  analyzeStock: (symbol: string) => ipcRenderer.invoke('query-stock', symbol),
  addDocument: (content: string) => ipcRenderer.invoke('add-document', content),
  askQuestion: (question: string) => ipcRenderer.invoke('ask-question', question),
});
