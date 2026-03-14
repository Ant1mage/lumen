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
 * Chat 消息接口（带 UI 元数据）
 * 用于渲染层展示完整的聊天消息
 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
  isStreaming?: boolean;
}
