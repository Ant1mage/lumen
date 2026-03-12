import * as path from "path";
import type {
  LlamaChatSession,
  LlamaContext,
  LlamaModel,
  LlamaEmbeddingContext,
  Token,
} from "node-llama-cpp" with { "resolution-mode": "import" };
import * as fs from "fs";
import { LLMModelConfig } from "./llm_config";
import { logger } from "../tools/logger";

class LLMEngine {
  private model: LlamaModel | null = null;
  private context: LlamaContext | null = null;
  private session: LlamaChatSession | null = null;
  private embeddingContext: LlamaEmbeddingContext | null = null;
  private isInitialized: boolean = false;

  async initialize(config?: LLMModelConfig): Promise<void> {
    if (this.isInitialized) return;

    try {
      logger.info("正在初始化 Llama 服务...");

      // node-llama-cpp is ESM-only; ensure Webpack doesn't try to bundle/require it
      const { getLlama, LlamaChatSession } = await eval(
        'import("node-llama-cpp")',
      );

      const llama = await getLlama();

      const modelPath = config?.modelPath || "";
      const desiredGpuLayers = config?.gpuLayers ?? 0;

      if (!fs.existsSync(modelPath)) {
        throw new Error(`模型文件不存在：${modelPath}`);
      }

      logger.info(`加载模型：${modelPath} (GPU Layers: ${desiredGpuLayers})`);

      // 1. 加载模型
      this.model = await llama.loadModel({
        modelPath,
        gpuLayers: desiredGpuLayers,
      });

      // 2. 初始化推理上下文
      this.context = await this.model!.createContext({
        sequences: 1,
        contextSize: config?.contextSize || 4096,
      });

      // 3. 初始化会话
      this.session = new LlamaChatSession({
        contextSequence: this.context.getSequence(),
      });

      // 4. 初始化向量上下文 (通用能力)
      this.embeddingContext = await this.model!.createEmbeddingContext();

      this.isInitialized = true;
      logger.info(`Llama 实例初始化完成: ${path.basename(modelPath)}`);
    } catch (error) {
      logger.error("Llama 服务初始化失败:", error);
      throw error;
    }
  }

  /**
   * 全量响应 - 按照你的要求命名为 promptChat
   */
  async promptChat(
    prompt: string,
    options?: {
      maxTokens?: number;
      temperature?: number;
      topP?: number;
    },
  ): Promise<string> {
    if (!this.isInitialized || !this.session) {
      throw new Error("Llama 服务未初始化");
    }

    return await this.session.prompt(prompt, {
      maxTokens: options?.maxTokens || 512,
      temperature: options?.temperature || 0.7,
      topP: options?.topP || 0.9,
    });
  }

  /**
   * 流式响应 - 按照你的要求命名为 streamChat
   */
  async streamChat(
    prompt: string,
    onToken: (token: string) => void,
    options?: {
      maxTokens?: number;
      temperature?: number;
      topP?: number;
    },
  ): Promise<string> {
    if (!this.isInitialized || !this.session) {
      throw new Error("Llama 服务未初始化");
    }

    let fullResponse = "";

    await this.session.prompt(prompt, {
      maxTokens: options?.maxTokens || 4096,
      temperature: options?.temperature || 0.7,
      topP: options?.topP || 0.9,
      onToken: (tokens) => {
        // 解码并传出 token
        const tokenText = this.model!.detokenize(tokens);
        fullResponse += tokenText;
        onToken(tokenText);
      },
    });

    return fullResponse;
  }

  /**
   * 向量化
   */
  async embed(text: string): Promise<number[]> {
    if (!this.isInitialized || !this.embeddingContext) {
      throw new Error("Llama 服务未初始化或不支持向量化");
    }

    const embedding = await this.embeddingContext.getEmbeddingFor(text);
    return Array.from(embedding.vector);
  }

  /**
   * 直接访问模型 tokenizer 进行 token 计数。
   */
  countTokens(text: string): number {
    if (!this.isInitialized || !this.model) {
      throw new Error("Llama 服务未初始化");
    }
    return this.model.tokenize(text).length;
  }

  /**
   * 通过模型 tokenizer 将文本拆成 token 列表。
   */
  tokenize(text: string): Token[] {
    if (!this.isInitialized || !this.model) {
      throw new Error("Llama 服务未初始化");
    }
    return this.model.tokenize(text);
  }

  /**
   * 通过模型 detokenize 将 token 列表还原为文本。
   */
  detokenize(tokens: readonly Token[]): string {
    if (!this.isInitialized || !this.model) {
      throw new Error("Llama 服务未初始化");
    }
    return this.model.detokenize(tokens);
  }

  async dispose(): Promise<void> {
    // 释放所有 llama-cpp 资源（按照生命周期依赖顺序）
    try {
      await this.session?.dispose();
    } catch (error) {
      logger.error("释放 Llama 会话失败", error);
    }

    try {
      await this.embeddingContext?.dispose();
    } catch (error) {
      logger.error("释放 Embedding 上下文失败", error);
    }

    try {
      await this.context?.dispose();
    } catch (error) {
      logger.error("释放推理上下文失败", error);
    }

    try {
      await this.model?.dispose();
    } catch (error) {
      logger.error("释放模型失败", error);
    }

    this.session = null;
    this.embeddingContext = null;
    this.context = null;
    this.model = null;
    this.isInitialized = false;
  }
}

export default LLMEngine;
