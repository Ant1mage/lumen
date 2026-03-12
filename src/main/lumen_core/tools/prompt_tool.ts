import { LLMRole, LLMMessage } from "../ai/llm_config";

/**
 * Prompt 工具类：负责构建和格式化系统提示
 */
class PromptTool {
  /**
   * 格式化对话历史
   */
  static formatHistory(messages: LLMMessage[]): string {
    return messages
      .map((msg) => {
        switch (msg.role) {
          case LLMRole.System:
            return `System: ${msg.content}`;
          case LLMRole.User:
            return `User: ${msg.content}`;
          case LLMRole.Assistant:
            return `Assistant: ${msg.content}`;
          default:
            return msg.content;
        }
      })
      .join("\n\n");
  }

  /**
   * 构建基础 System Prompt
   * @param hasContext - 是否有参考资料
   */
  static buildSystemPrompt(hasContext: boolean): string {
    if (hasContext) {
      return "你是 Lumen，一个聪明、严谨且富有洞察力的 AI 助手。请根据提供的参考资料回答用户的问题。";
    } else {
      return "你是 Lumen，一个聪明、严谨且富有洞察力的 AI 助手。请根据你自己的知识回答用户的问题。";
    }
  }

  /**
   * 格式化最终 Prompt
   * @param messages - 对话历史消息列表
   * @param contextText - RAG 检索到的参考资料
   * @returns 格式化后的完整 Prompt
   */
  static formatPrompt(messages: LLMMessage[], contextText: string): string {
    const formattedHistory = this.formatHistory(messages);
    const hasContext = !!contextText && contextText.trim().length > 0;
    const hasHistory = formattedHistory.trim().length > 0;
    const systemPrompt = this.buildSystemPrompt(hasContext);

    // 情况 1: 无参考资料，有历史记录
    if (!hasContext && hasHistory) {
      return `${systemPrompt}\n\n${formattedHistory}\n\nAssistant:`;
    }

    // 情况 2: 无参考资料，无历史记录（全新对话）
    if (!hasContext && !hasHistory) {
      return `${systemPrompt}\n\nAssistant:`;
    }

    // 情况 3: 有参考资料，有历史记录
    if (hasContext && hasHistory) {
      return `${systemPrompt}\n\n参考资料:\n${contextText}\n\n${formattedHistory}\n\nAssistant:`;
    }

    // 情况 4: 有参考资料，无历史记录
    return `${systemPrompt}\n\n参考资料:\n${contextText}\n\nAssistant:`;
  }
}

export default PromptTool;