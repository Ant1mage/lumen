export interface LLMModelConfig {
  modelPath?: string;
  contextSize?: number;
  temperature?: number;
  topP?: number;
  gpuLayers?: number; // Number of layers to offload to GPU (Metal/CUDA). Set 0 to force CPU.
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