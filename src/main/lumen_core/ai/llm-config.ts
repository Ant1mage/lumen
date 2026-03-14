export interface LLMModelConfig {
  modelPath?: string;
  contextSize?: number;
  temperature?: number; // 生成多样性 (0.0-1.0)
  topP?: number; // 核采样参数 (0.0-1.0)
  gpuLayers?: number | null; // Number of layers to offload to GPU (Metal/CUDA). Set 0 to force CPU, null for auto.
}

// 重新导出共享类型，保持向后兼容
export type { LLMRole, LLMMessage } from "../../../shared/types";