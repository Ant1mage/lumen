import { LLMMessage, LLMRole } from "@shared/types";

class LLMPrompt {
  static router = `你是一个意图识别助手。用户会输入一段话，你需要判断：

1. 是否需要检索私有数据（知识库）？回答：是/否
2. 是否包含敏感财务信息需要脱敏？回答：是/否
3. 是否是简单的百科/行情查询（不需要私有数据）？回答：是/否

请严格按照以下JSON格式回答，不要添加任何解释：
{"needPrivateData":"是/否","needTranslator":"是/否","isSimpleQuery":"是/否","reason":"简要原因"}`;

  static translator = `你是一个prompt优化助手。请将用户原话与背景信息融合，生成一个脱敏后的高质量prompt。

用户原话：{{userInput}}

背景信息：
{{context}}

要求：
1. 保留用户核心意图
2. 将具体人名、地点等敏感信息泛化
3. 背景信息作为事实补充
4. 直接输出优化后的prompt，不要解释`;

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

export default LLMPrompt;
