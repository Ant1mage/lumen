export enum CloudLLMProvider {
  Qwen = "qwen",
  OpenAI = "openai",
  default = "qwen",
}

export interface CloudLLMProviderConfig {
  apiKey: string;
  baseURL: string;
}

export enum CloudLLMModel {
  Qwen3Max = "qwen3-max",
  Qwen3_5Plus = "qwen3.5-plus",
  Qwen3_5Flash = "qwen3.5-flash",
  Gpt4o = "gpt-4o",
  Gpt5 = "gpt-5",
  Gpt5_5 = "gpt-5.5",
  Gpt5_4 = "gpt-5.4",
}

// 用同名的 namespace 扩展枚举的功能
export namespace CloudLLMProvider {
  export function getConfig(
    provider: CloudLLMProvider,
  ): CloudLLMProviderConfig {
    switch (provider) {
      case CloudLLMProvider.Qwen:
        return {
          apiKey: process.env.QWEN_API_KEY || "",
          baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        };
      case CloudLLMProvider.OpenAI:
        return {
          apiKey: process.env.OPENAI_API_KEY || "",
          baseURL: "https://api.openai.com/v1",
        };
      default:
        return getConfig(CloudLLMProvider.Qwen);
    }
  }
}
