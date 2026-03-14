import { contextBridge, ipcRenderer } from 'electron';
import { ElectronAPI } from './types';

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electron', {
  // 这里可以添加主进程和渲染进程之间的通信方法
  send: (channel: string, data?: any) => {
    const validChannels = ['toMain']; // 限制允许的通道
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel: string, func: (...args: any[]) => void) => {
    const validChannels = ['fromMain']; // 限制允许的通道
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => func(...args));
    }
  },
} as ElectronAPI);

console.log('Preload script loaded');
