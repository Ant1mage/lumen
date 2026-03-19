import * as path from "path";
import type {
  LlamaChatSession,
  LlamaContext,
  LlamaModel,
  LlamaEmbeddingContext,
  Token,
} from "node-llama-cpp" with { "resolution-mode": "import" };
import * as fs from "fs";
import { LLMModelConfig } from "@main/lumen_core/ai/llm/llm-config";
import { logger } from "@main/tools/logger";
import { ChatLlamaCpp } from "@langchain/community/chat_models/llama_cpp";

class LLMEngine {
  private llm: ChatLlamaCpp | null = null;

  async initialize(config: LLMModelConfig): Promise<void> {

    try {
      // // node-llama-cpp is ESM-only; ensure Webpack doesn't try to bundle/require it
      // const { getLlama, LlamaChatSession } = await eval(
      //   'import("node-llama-cpp")',
      // );

      if (!fs.existsSync(config.modelPath)) {
        throw new Error(`模型文件不存在：${config.modelPath}`);
      }

      logger.info(
        `加载模型：${config.modelPath} (GPU Layers: ${config.gpuLayers})`,
      );
      this.llm = new ChatLlamaCpp({
        modelPath: config.modelPath,
        contextSize: config.contextSize || 512,
        temperature: config.temperature,
        gpuLayers: config.gpuLayers,
        topP: config.topP,
      });

      logger.info(`Llama 实例初始化完成: ${path.basename(config.modelPath)}`);
    } catch (error) {
      logger.error("Llama 服务初始化失败:", error);
      throw error;
    }
  }




  async dispose(): Promise<void> {
    // 释放所有 llama-cpp 资源（按照生命周期依赖顺序）
    try {
      if ((this.llm as any)._model) {
        // node-llama-cpp 的模型实例有 dispose 方法
        await (this.llm as any)._model.dispose();
      }
    } catch (error) {
      logger.error("释放 LLM 模型失败", error);
    }

    this.llm = null;
  }
}

export default LLMEngine;
