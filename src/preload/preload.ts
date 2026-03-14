import { contextBridge, ipcRenderer } from 'electron';
import {
  STORE_CONFIG_CHANNELS,
  VIEW_CHANNELS,
  LUMEN_CORE_CHANNELS
} from '@shared/channels';

// ==================== 1. 系统与配置模块 ====================
contextBridge.exposeInMainWorld('store_config', {
  getTheme: () => ipcRenderer.invoke(STORE_CONFIG_CHANNELS.THEME.GET),
  setTheme: (theme: 'system' | 'light' | 'dark') => ipcRenderer.invoke(STORE_CONFIG_CHANNELS.THEME.SET, theme),
  getLanguage: () => ipcRenderer.invoke(STORE_CONFIG_CHANNELS.LANGUAGE.GET),
  setLanguage: (lang: 'zh-CN' | 'en-US') => ipcRenderer.invoke(STORE_CONFIG_CHANNELS.LANGUAGE.SET, lang),
  getUserSettings: () => ipcRenderer.invoke(STORE_CONFIG_CHANNELS.SETTINGS.GET_USER),
});

// ==================== 2. LumenCore 状态监听模块 ====================
contextBridge.exposeInMainWorld('lumen_core', {
  onStateChange: (listener: (state: any) => void) => {
    const channel = LUMEN_CORE_CHANNELS.STATE_CHANGE;
    const handler = (_event: any, state: any) => listener(state);
    ipcRenderer.on(channel, handler);
    return () => {
      ipcRenderer.removeListener(channel, handler);
    };
  },
});

// ==================== 3. 视图模块 ====================
contextBridge.exposeInMainWorld('view', {
  getSidebarChoose: () => ipcRenderer.invoke(VIEW_CHANNELS.SIDEBAR.GET_CHOOSE),
  setSidebarChoose: (key: string) => ipcRenderer.invoke(VIEW_CHANNELS.SIDEBAR.SET_CHOOSE, key),
});

// ==================== 3. 核心通信模块 ====================
contextBridge.exposeInMainWorld('core', {
  send: (channel: string, data?: any) => {
    const validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel: string, func: (...args: any[]) => void) => {
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => func(...args));
    }
  },
});