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
