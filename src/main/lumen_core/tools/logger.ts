import log from "electron-log/main";
import path from "path";
import * as fs from "fs";
import { LLMRole } from "../ai/llm_config";

// 1. 深度配置日志文件路径
log.transports.file.resolvePathFn = (variables) => {
  // 获取当前日期 (YYYY-MM-DD)
  const date = new Date().toISOString().split("T")[0];

  // 拼上 lumen 前缀：lumen-2026-03-12.log
  const fileName = `lumen-${date}.log`;

  return path.join(variables.libraryDefaultDir, fileName);
};

// 2. 基础展示格式配置
log.initialize();
log.transports.file.level = "info";
// 格式：[时间] [级别] [标签] 内容
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";

class LoggerService {
  private static instance: LoggerService;

  private constructor() {}

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  /**
   * 自动清理 7 天前的日志文件，防止占用空间
   */
  public pruneOldLogs(daysToKeep: number = 7) {
    try {
      const logFile = log.transports.file.getFile();
      const logDir = path.dirname(logFile.path);

      const files = fs.readdirSync(logDir);
      const now = Date.now();
      const expirationMs = daysToKeep * 24 * 60 * 60 * 1000;

      files.forEach((file) => {
        // 只处理以 lumen- 开头且以 .log 结尾的文件
        if (file.startsWith("lumen-") && file.endsWith(".log")) {
          const filePath = path.join(logDir, file);
          const stats = fs.statSync(filePath);

          if (now - stats.mtimeMs > expirationMs) {
            fs.unlinkSync(filePath);
            this.info(`清理过期日志: ${file}`, "SYSTEM");
          }
        }
      });
    } catch (error) {
      this.error("清理旧日志失败", error);
    }
  }

  // --- 业务方法 ---

  info(message: string, context: string = "CORE") {
    log.info(`[${context}] ${message}`);
  }

  chat(role: LLMRole, content: string) {
    const label = role.toUpperCase();
    const abstract =
      content.length > 50 ? content.substring(0, 50) + "..." : content;
    log.info(`[CHAT] ${label}: ${abstract}`);
  }

  perf(label: string, duration: number) {
    log.info(`[PERF] ${label} took ${duration}ms`);
  }

  error(message: string, error?: any) {
    log.error(`[ERROR] ${message}`, error);
  }
}

export const logger = LoggerService.getInstance();
