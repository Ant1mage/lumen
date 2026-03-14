export interface LLMModelConfig {
  modelPath?: string;
  contextSize?: number;
  temperature?: number; // 生成多样性 (0.0-1.0)
  topP?: number; // 核采样参数 (0.0-1.0)
  gpuLayers?: number | null; // Number of layers to offload to GPU (Metal/CUDA). Set 0 to force CPU, null for auto.
}

export enum LLMRole {
  System = "system",
  User = "user",
  Assistant = "assistant",
}

export interface LLMMessage {
  role: LLMRole;
  content: string;
}