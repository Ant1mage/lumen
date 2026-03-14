// --- 1. 系统与配置模块 ---
export interface StoreConfigAPI {
    getTheme: () => Promise<'system' | 'light' | 'dark'>;
    setTheme: (theme: 'system' | 'light' | 'dark') => Promise<boolean>;
    getLanguage: () => Promise<'zh-CN' | 'en-US'>;
    setLanguage: (language: 'zh-CN' | 'en-US') => Promise<void>;
    getUserSettings: () => Promise<any>;
  }
  
  // --- 2. LumenCore 状态监听模块 ---
  export interface LumenCoreState {
    status: 'idle' | 'initializing' | 'ready' | 'error' | 'disposing';
    error?: string;
    progress?: string;
  }

  // 重新导出共享的 LLM 类型
  export type { LLMMessage, LLMRole } from '../shared/types';

  export interface LumenCoreAPI {
    onStateChange: (listener: (state: LumenCoreState) => void) => () => void;
    sendMessage: (content: string) => Promise<{ success: boolean; error?: string }>;
    onToken: (listener: (token: string) => void) => () => void;
    reinitialize: () => Promise<{ success: boolean; error?: string }>;
  }

  // --- 3. 界面与交互状态模块 ---
  export interface ViewAPI {
    getSidebarChoose: () => Promise<string>;
    setSidebarChoose: (key: string) => Promise<void>;
  }
  
  // --- 4. 基础通信模块 (可选，用于通用场景) ---
  export interface CoreAPI {
    send: (channel: string, data?: any) => void;
    receive: (channel: string, func: (...args: any[]) => void) => void;
  }
  
  // --- 全局声明 ---
  declare global {
    interface Window {
      // 挂载到各自的命名空间下
      store_config: StoreConfigAPI;
      lumen_core: LumenCoreAPI;
      view: ViewAPI;
      core: CoreAPI;
    }
  }