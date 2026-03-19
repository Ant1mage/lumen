import fs from "fs";
import path from "path";
import { app } from "electron";

export class LLMPath {
  /**
   * 获取模型存放的绝对根目录
   */
  private static getRootPath(): string {
    // 优先判断是否是打包环境
    if (app.isPackaged) {
      // 打包后：模型位于 Resources/gguf 目录下
      return path.join(process.resourcesPath, "gguf");
    } else {
      // 开发阶段：模型位于 项目根目录/gguf 目录下
      return path.join(process.cwd(), 'gguf');
    }
  }

  /**
   * 根据文件名获取模型的完整绝对路径
   * @param fileName 模型文件名，例如 "Qwen3.5-4B-Q4_K_M.gguf"
   */
  public static getPath(fileName: string): string {
    const root = this.getRootPath();
    const fullPath = path.join(root, fileName);

    // 使用 normalize 自动处理跨系统（Win/Mac）的路径斜杠问题
    return path.normalize(fullPath);
  }

  /**
   * 预设：获取默认的 LLM 模型路径
   */
  public static getTranslatorLLM(): string {
    return this.getPath("Qwen3.5-4B-Q4_K_M.gguf");
  }

  /**
   * 预设：获取默认的 Embedding 模型路径
   */
  public static getVecLLM(): string {
    return this.getPath("bge-m3-q8_0.gguf");
  }

  /**
   * 预设：获取默认的 Router 模型路径
   */
  public static getRouterLLM(): string {
    return this.getPath("qwen2.5-0.5b-instruct-q8_0.gguf");
  }

  /**
   * 列出可用的模型文件（gguf）
   */
  public static listModels(): string[] {
    const root = this.getRootPath();
    try {
      const files = fs.readdirSync(root);
      return files.filter((file) => file.toLowerCase().endsWith(".gguf"));
    } catch {
      return [];
    }
  }
}

export default LLMPath;
