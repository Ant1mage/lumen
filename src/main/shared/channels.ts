/**
 * IPC 通道常量定义
 * 
 * 用于集中管理所有主进程与渲染进程之间的通信通道
 * 确保通道名称的唯一性和类型安全
 */

// ==================== 1. 系统与配置模块 ====================
export const STORE_CONFIG_CHANNELS = {
  // 主题相关
  THEME: {
    GET: 'get-theme',
    SET: 'set-theme',
  },
  // 语言相关
  LANGUAGE: {
    GET: 'get-language',
    SET: 'set-language',
  },
  // 用户设置相关
  SETTINGS: {
    GET_USER: 'get-user-settings',
  },
} as const;

// ==================== 2. 视图与交互状态模块 ====================
export const VIEW_CHANNELS = {
  SIDEBAR: {
    GET_CHOOSE: 'get-sidebar-choose',
    SET_CHOOSE: 'set-sidebar-choose',
  },
} as const;

// ==================== 聚合所有通道 ====================
/**
 * 所有 IPC 通道的联合类型
 * 用于类型检查和验证
 */
export type IpcChannel = 
  | typeof STORE_CONFIG_CHANNELS.THEME[keyof typeof STORE_CONFIG_CHANNELS.THEME]
  | typeof STORE_CONFIG_CHANNELS.LANGUAGE[keyof typeof STORE_CONFIG_CHANNELS.LANGUAGE]
  | typeof STORE_CONFIG_CHANNELS.SETTINGS[keyof typeof STORE_CONFIG_CHANNELS.SETTINGS]
  | typeof VIEW_CHANNELS.SIDEBAR[keyof typeof VIEW_CHANNELS.SIDEBAR];

/**
 * 所有通道的集合（用于验证等场景）
 */
export const ALL_CHANNELS: IpcChannel[] = [
  ...Object.values(STORE_CONFIG_CHANNELS.THEME),
  ...Object.values(STORE_CONFIG_CHANNELS.LANGUAGE),
  ...Object.values(STORE_CONFIG_CHANNELS.SETTINGS),
  ...Object.values(VIEW_CHANNELS.SIDEBAR),
] as const;
