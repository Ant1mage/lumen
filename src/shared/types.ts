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
