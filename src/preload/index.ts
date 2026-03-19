import { contextBridge, ipcRenderer } from "electron";
import {
  STORE_CONFIG_CHANNELS,
  VIEW_CHANNELS,
  LUMEN_CORE_CHANNELS,
  IPC_LOG_ACTION,
} from "@shared/channels";
import { LogLevel, LogSource } from "@shared/types";

// ==================== 1. 系统与配置模块 ====================
contextBridge.exposeInMainWorld("store_config", {
  getTheme: () => ipcRenderer.invoke(STORE_CONFIG_CHANNELS.THEME.GET),
  setTheme: (theme: "system" | "light" | "dark") =>
    ipcRenderer.invoke(STORE_CONFIG_CHANNELS.THEME.SET, theme),
  getLanguage: () => ipcRenderer.invoke(STORE_CONFIG_CHANNELS.LANGUAGE.GET),
  setLanguage: (lang: "zh-CN" | "en-US") =>
    ipcRenderer.invoke(STORE_CONFIG_CHANNELS.LANGUAGE.SET, lang),
  getUserSettings: () =>
    ipcRenderer.invoke(STORE_CONFIG_CHANNELS.SETTINGS.GET_USER),
});

// ==================== 2. LumenCore 状态监听模块 ====================
contextBridge.exposeInMainWorld("lumen_core", {
  onStateChange: (listener: (state: any) => void) => {
    const channel = LUMEN_CORE_CHANNELS.STATE_CHANGE;
    const handler = (_event: any, state: any) => listener(state);
    ipcRenderer.on(channel, handler);
    return () => {
      ipcRenderer.removeListener(channel, handler);
    };
  },
  sendMessage: (content: string) => {
    return new Promise((resolve) => {
      ipcRenderer
        .invoke(LUMEN_CORE_CHANNELS.SEND_MESSAGE, content)
        .then((result) => resolve(result))
        .catch((error) => resolve({ success: false, error: String(error) }));
    });
  },
  onToken: (listener: (token: string) => void) => {
    const channel = "lumen-core-token";
    const handler = (_event: any, token: string) => listener(token);
    ipcRenderer.on(channel, handler);
    return () => {
      ipcRenderer.removeListener(channel, handler);
    };
  },
  reinitialize: () => ipcRenderer.invoke(LUMEN_CORE_CHANNELS.REINITIALIZE),
});

// ==================== 3. 视图模块 ====================
contextBridge.exposeInMainWorld("view", {
  getSidebarChoose: () => ipcRenderer.invoke(VIEW_CHANNELS.SIDEBAR.GET_CHOOSE),
  setSidebarChoose: (key: string) =>
    ipcRenderer.invoke(VIEW_CHANNELS.SIDEBAR.SET_CHOOSE, key),
});

// ==================== 3. 核心通信模块 ====================
contextBridge.exposeInMainWorld("core", {
  send: (channel: string, data?: any) => {
    const validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel: string, func: (...args: any[]) => void) => {
    const validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => func(...args));
    }
  },
});

// ==================== 5. 跨进程日志模块 ====================
/**
 * 日志接口定义
 */
interface Logger {
  /**
   * 输出 Info 级别日志
   * @param message 日志消息
   * @param context 上下文标签（可选）
   * @param data 附加数据（可选）
   */
  info(message: string, context?: string, data?: any): void;

  /**
   * 输出 Warn 级别日志
   * @param message 日志消息
   * @param context 上下文标签（可选）
   * @param data 附加数据（可选）
   */
  warn(message: string, context?: string, data?: any): void;

  /**
   * 输出 Error 级别日志
   * @param message 日志消息
   * @param context 上下文标签（可选）
   * @param data 附加数据（可选）
   */
  error(message: string, context?: string, data?: any): void;

  /**
   * 输出 Debug 级别日志
   * @param message 日志消息
   * @param context 上下文标签（可选）
   * @param data 附加数据（可选）
   */
  debug(message: string, context?: string, data?: any): void;
}

/**
 * 创建日志发送函数
 * 使用异步 IPC 避免阻塞渲染进程主线程
 */
const createLogFunction = (level: LogLevel): Logger[typeof level] => {
  return (message: string, context?: string, data?: any) => {
    // 异步发送，不阻塞主线程
    setImmediate(() => {
      ipcRenderer.send(IPC_LOG_ACTION, {
        level,
        message,
        source: LogSource.Renderer,
        context: context || "RENDERER",
        timestamp: new Date().toISOString(),
        data,
      });
    });
  };
};

// 暴露 logger 对象到渲染进程
contextBridge.exposeInMainWorld("logger", {
  info: createLogFunction(LogLevel.Info),
  warn: createLogFunction(LogLevel.Warn),
  error: createLogFunction(LogLevel.Error),
  debug: createLogFunction(LogLevel.Debug),
} as Logger);
