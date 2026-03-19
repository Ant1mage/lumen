import { LLMMessage, LLMRole } from '@shared/types';

class LLMPrompt {
  static router = `判断用户输入的意图，只回答JSON。

规则：
- needPrivateData: 需要查知识库吗？
- needTranslator: 包含敏感信息（手机号、身份证、银行卡、地址、人名等）吗？
- isSimpleQuery: 是简单百科查询吗？

示例：
输入："帮我查下张三的考勤记录"
输出：{"needPrivateData":"是","needTranslator":"是","isSimpleQuery":"否","reason":"需要查员工私有数据"}

输入："我的手机号是13812345678"
输出：{"needPrivateData":"否","needTranslator":"是","isSimpleQuery":"否","reason":"包含手机号敏感信息"}

输入："今天天气怎么样"
输出：{"needPrivateData":"否","needTranslator":"否","isSimpleQuery":"是","reason":"简单天气查询"}

输入："什么是机器学习"
输出：{"needPrivateData":"否","needTranslator":"否","isSimpleQuery":"是","reason":"百科知识"}

现在判断：`;

  static translator = `将用户输入脱敏，保留意图。

规则：
- 人名 → 某人/某员工
- 地点 → 某地
- 时间 → 某时
- 金额 → 某金额
- 股票代码 → 某股票

示例：
输入："帮我查下张三在北京的出差记录"
输出："帮我查下某员工在某地的出差记录"

输入："李四上个月工资发了多少"
输出："某员工某月工资发了多少"

输入："茅台600519最近走势如何"
输出："某股票最近走势如何"

现在脱敏：
用户原话：{{userInput}}
背景信息：{{context}}
输出：`;

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
      .join('\n\n');
  }

  /**
   * 构建基础 System Prompt
   * @param hasContext - 是否有参考资料
   */
  static buildSystemPrompt(hasContext: boolean): string {
    if (hasContext) {
      return '你是一个聪明、严谨且富有洞察力的 AI 助手。请根据提供的参考资料回答用户的问题。';
    } else {
      return '你是一个聪明、严谨且富有洞察力的 AI 助手。请根据你自己的知识回答用户的问题。';
    }
  }

  /**
   * 格式化最终 Prompt - 拼接用户问题/脱敏内容和 RAG 上下文
   * @param userInput - 用户问题或脱敏后的内容
   * @param contextText - RAG 检索到的参考资料
   * @returns 格式化后的 user content 字符串
   */
  static formatRAGPrompt(userInput: string, ragContext: string): string {
    if (ragContext && ragContext.trim().length > 0) {
      return `参考资料:\n${ragContext}\n\n${userInput}`;
    }
    return userInput;
  }
}

export default LLMPrompt;
