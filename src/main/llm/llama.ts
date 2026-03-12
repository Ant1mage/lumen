import * as path from 'path';
import type { LlamaChatSession, LlamaContext, LlamaModel } from 'node-llama-cpp';
import * as fs from 'fs';

export interface LlamaConfig {
  modelPath?: string;
  contextSize?: number;
  temperature?: number;
  topP?: number;
}

class LlamaService {
  private model: LlamaModel | null = null;
  private context: LlamaContext | null = null;
  private session: LlamaChatSession | null = null;
  private isInitialized: boolean = false;

  async initialize(config?: LlamaConfig): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('正在初始化 Llama 服务...');

      // node-llama-cpp 是 ESM 包；在 CommonJS(main webpack) 下需要用动态 import()
      const { LlamaChatSession, LlamaContext, LlamaModel } = await import('node-llama-cpp');

      const currentDir = path.dirname(__filename);
      const modelPath = config?.modelPath || path.join(
        currentDir,
        '../../models/Qwen3.5-4B-Q4_K_M.gguf'
      );

      // 检查模型文件是否存在
      if (!fs.existsSync(modelPath)) {
        console.warn(`模型文件不存在：${modelPath}`);
        console.warn('请确保已下载 GGUF 格式的模型文件到 models 目录');
        return;
      }

      this.model = new LlamaModel({
        modelPath,
        contextSize: config?.contextSize || 4096,
      });

      this.context = new LlamaContext({
        model: this.model,
        contextSize: config?.contextSize || 4096,
      });

      this.session = new LlamaChatSession({
        context: this.context,
      });
      await this.session.init();

      this.isInitialized = true;
      console.log('Llama 服务初始化完成');
    } catch (error) {
      console.error('Llama 服务初始化失败:', error);
      throw error;
    }
  }

  async generateResponse(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
  }): Promise<string> {
    if (!this.isInitialized || !this.session) {
      throw new Error('Llama 服务未初始化');
    }

    try {
      const response = await this.session.prompt(prompt, {
        maxTokens: options?.maxTokens || 512,
        temperature: options?.temperature || 0.7,
        topP: options?.topP || 0.9,
      });

      return response;
    } catch (error) {
      console.error('生成响应失败:', error);
      throw error;
    }
  }

  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    if (!this.isInitialized || !this.session) {
      throw new Error('Llama 服务未初始化');
    }

    try {
      // 将消息格式化为 prompt
      const prompt = this.formatChatMessages(messages);
      return await this.generateResponse(prompt);
    } catch (error) {
      console.error('聊天失败:', error);
      throw error;
    }
  }

  private formatChatMessages(messages: Array<{ role: string; content: string }>): string {
    return messages.map(msg => {
      switch (msg.role) {
        case 'system':
          return `System: ${msg.content}`;
        case 'user':
          return `User: ${msg.content}`;
        case 'assistant':
          return `Assistant: ${msg.content}`;
        default:
          return msg.content;
      }
    }).join('\n\n') + '\n\nAssistant:';
  }

  async embed(text: string): Promise<number[]> {
    // 简单的嵌入实现 - 使用词频向量
    // 实际应用中应该使用专门的嵌入模型
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq: Record<string, number> = {};
    
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // 返回简化的向量表示
    return Object.values(wordFreq).slice(0, 100);
  }

  dispose(): void {
    this.session = null;
    this.context = null;
    this.model = null;
    this.isInitialized = false;
  }

  isReady(): boolean {
    return this.isInitialized && this.session !== null;
  }
}

export default LlamaService;
