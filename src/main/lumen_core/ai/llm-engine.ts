import * as path from "path";
import type {
  LlamaChatSession,
  LlamaContext,
  LlamaModel,
  LlamaEmbeddingContext,
  Token,
} from "node-llama-cpp" with { "resolution-mode": "import" };
import * as fs from "fs";
import { LLMModelConfig } from "@main/lumen_core/ai/llm-config";
import { logger } from "@main/tools/logger";

class LLMEngine {
  private _model: LlamaModel | null = null;
  private _context: LlamaContext | null = null;
  private _session: LlamaChatSession | null = null;
  private _embeddingContext: LlamaEmbeddingContext | null = null;
  private _isInitialized: boolean = false;
  private _config: LLMModelConfig = {}; // 保存当前配置

  async initialize(config?: LLMModelConfig): Promise<void> {
    if (this._isInitialized) return;

    try {
      logger.info("正在初始化 Llama 服务...");

      // node-llama-cpp is ESM-only; ensure Webpack doesn't try to bundle/require it
      const { getLlama, LlamaChatSession } = await eval(
        'import("node-llama-cpp")',
      );

      const llama = await getLlama();

      const modelPath = config?.modelPath || "";
      const desiredGpuLayers = config?.gpuLayers ?? 0;

      // 保存配置供后续使用
      this._config = config || {};

      if (!fs.existsSync(modelPath)) {
        throw new Error(`模型文件不存在：${modelPath}`);
      }

      logger.info(`加载模型：${modelPath} (GPU Layers: ${desiredGpuLayers})`);

      // 1. 加载模型
      // 注意：某些 GGUF 模型的 vocab 可能缺少 newline token，node-llama-cpp 会自动处理
      this._model = await llama.loadModel({
        modelPath,
        gpuLayers: desiredGpuLayers,
      });

      // 2. 初始化推理上下文
      this._context = await this._model!.createContext({
        sequences: 1,
        contextSize: config?.contextSize || 4096,
      });

      // 3. 初始化会话
      this._session = new LlamaChatSession({
        contextSequence: this._context.getSequence(),
      });

      // 4. 初始化向量上下文 (通用能力)
      this._embeddingContext = await this._model!.createEmbeddingContext();

      this._isInitialized = true;
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
    if (!this._isInitialized || !this._session) {
      throw new Error("Llama 服务未初始化");
    }

    return await this._session.prompt(prompt, {
      maxTokens: options?.maxTokens || 512,
      temperature: options?.temperature ?? this._config.temperature ?? 0.7,
      topP: options?.topP ?? this._config.topP ?? 0.9,
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
    if (!this._isInitialized || !this._session) {
      throw new Error("Llama 服务未初始化");
    }

    let fullResponse = "";

    await this._session.prompt(prompt, {
      maxTokens: options?.maxTokens || 4096,
      temperature: options?.temperature ?? this._config.temperature ?? 0.7,
      topP: options?.topP ?? this._config.topP ?? 0.9,
      onToken: (tokens) => {
        // 解码并传出 token
        const tokenText = this._model!.detokenize(tokens);
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
    if (!this._isInitialized || !this._embeddingContext) {
      throw new Error("Llama 服务未初始化或不支持向量化");
    }

    const embedding = await this._embeddingContext.getEmbeddingFor(text);
    return Array.from(embedding.vector);
  }

  /**
   * 直接访问模型 tokenizer 进行 token 计数。
   */
  countTokens(text: string): number {
    if (!this._isInitialized || !this._model) {
      throw new Error("Llama 服务未初始化");
    }
    return this._model.tokenize(text).length;
  }

  /**
   * 通过模型 tokenizer 将文本拆成 token 列表。
   */
  tokenize(text: string): Token[] {
    if (!this._isInitialized || !this._model) {
      throw new Error("Llama 服务未初始化");
    }
    return this._model.tokenize(text);
  }

  /**
   * 通过模型 detokenize 将 token 列表还原为文本。
   */
  detokenize(tokens: readonly Token[]): string {
    if (!this._isInitialized || !this._model) {
      throw new Error("Llama 服务未初始化");
    }
    return this._model.detokenize(tokens);
  }

  async dispose(): Promise<void> {
    // 释放所有 llama-cpp 资源（按照生命周期依赖顺序）
    try {
      await this._session?.dispose();
    } catch (error) {
      logger.error("释放 Llama 会话失败", error);
    }

    try {
      await this._embeddingContext?.dispose();
    } catch (error) {
      logger.error("释放 Embedding 上下文失败", error);
    }

    try {
      await this._context?.dispose();
    } catch (error) {
      logger.error("释放推理上下文失败", error);
    }

    try {
      await this._model?.dispose();
    } catch (error) {
      logger.error("释放模型失败", error);
    }

    this._session = null;
    this._embeddingContext = null;
    this._context = null;
    this._model = null;
    this._isInitialized = false;
  }
}

export default LLMEngine;
