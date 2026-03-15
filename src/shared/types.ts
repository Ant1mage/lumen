/**
 * LLM 相关类型定义
 * 用于主进程和渲染进程之间的类型共享
 */

/**
 * LLM 角色类型
 */
export enum LLMRole {
  User = "user",
  Assistant = "assistant",
  System = "system",
}

/**
 * LLM 消息接口
 * 用于对话系统中的消息传递
 */
export interface LLMMessage {
  role: LLMRole;
  content: string;
}

/**
 * LumenCore 状态枚举
 */
export enum LumenCoreStatus {
  Idle = "idle",
  Initializing = "initializing",
  Ready = "ready",
  Error = "error",
  Disposing = "disposing",
}

/**
 * LumenCore 状态接口
 * 用于主进程和渲染进程之间的状态同步
 */
export interface LumenCoreState {
  status: LumenCoreStatus;
  error?: string;
  progress?: string;
}

/**
 * 日志级别枚举
 * 用于统一日志的严重程度分类
 */
export enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

/**
 * 日志来源枚举
 * 标识日志来自哪个进程或模块
 */
export enum LogSource {
  Main = 'Main',
  Renderer = 'Renderer',
  Preload = 'Preload',
}

/**
 * 日志负载接口
 * 用于在进程间传输日志信息
 */
export interface LogPayload {
  /** 日志级别 */
  level: LogLevel;
  /** 日志消息内容 */
  message: string;
  /** 日志来源（进程/模块） */
  source: LogSource;
  /** 上下文标签（可选） */
  context?: string;
  /** 时间戳（ISO 格式） */
  timestamp: string;
  /** 附加数据（可选） */
  data?: any;
}
