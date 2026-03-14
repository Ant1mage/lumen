import { logger } from "./logger";
import * as os from "os";

export interface SystemInfo {
  platform: string;
  arch: string;
  cpuCores: number;
  totalMemoryGB: number;
  isAppleSilicon: boolean;
  machineType: MachineType;
}

export type MachineType = 
  | "apple_silicon_high"      // M1/M2/M3 Max/Ultra
  | "apple_silicon_mid"       // M1/M2/M3 Pro
  | "apple_silicon_base"      // M1/M2/M3 基础版
  | "intel_mac_high"          // Intel Mac 高配
  | "intel_mac_low"           // Intel Mac 低配
  | "unknown";

export class SystemMonitor {
  private static instance: SystemMonitor;
  private _systemInfo: SystemInfo | null = null;

  private constructor() {}

  static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  /**
   * 获取系统信息（带缓存）
   */
  async getSystemInfo(): Promise<SystemInfo> {
    if (this._systemInfo) {
      return this._systemInfo;
    }

    try {
      const os = await eval('import("os")');
      const { exec } = await eval('import("child_process")');
      const util = await eval('import("util")');
      const execPromise = util.promisify(exec);

      const platform = os.platform();
      const arch = os.arch();
      const cpuCores = os.cpus().length;
      const totalMemoryGB = Math.round(os.totalmem() / (1024 ** 3));

      // 检测是否为 Apple Silicon
      let isAppleSilicon = false;
      let machineType: MachineType = "unknown";

      if (platform === "darwin") {
        try {
          const { stdout } = await execPromise("uname -m");
          const architecture = stdout.trim();
          
          if (architecture === "arm64") {
            isAppleSilicon = true;
            
            // 通过 sysctl 检测具体型号
            try {
              const { stdout: modelOutput } = await execPromise(
                "sysctl -n machdep.cpu.brand_string"
              );
              const cpuModel = modelOutput.toLowerCase();
              
              // 根据内存和 CPU 核心数判断机型档次
              if (cpuModel.includes("max") || cpuModel.includes("ultra")) {
                machineType = "apple_silicon_high";
              } else if (cpuModel.includes("pro")) {
                machineType = "apple_silicon_mid";
              } else {
                machineType = "apple_silicon_base";
              }
              
              // 如果无法通过 CPU 名称判断，则根据内存判断
              if (totalMemoryGB >= 64) {
                machineType = "apple_silicon_high";
              } else if (totalMemoryGB >= 32) {
                machineType = "apple_silicon_mid";
              } else {
                machineType = "apple_silicon_base";
              }
            } catch (error) {
              logger.info("无法获取详细 CPU 信息，使用默认判断", "SYSTEM");
              // 降级方案：仅根据内存判断
              if (totalMemoryGB >= 64) {
                machineType = "apple_silicon_high";
              } else if (totalMemoryGB >= 32) {
                machineType = "apple_silicon_mid";
              } else {
                machineType = "apple_silicon_base";
              }
            }
          } else {
            // Intel Mac
            machineType = totalMemoryGB >= 32 ? "intel_mac_high" : "intel_mac_low";
          }
        } catch (error) {
          logger.error("获取 macOS 系统信息失败", error);
          isAppleSilicon = arch === "arm64";
          machineType = isAppleSilicon ? "apple_silicon_base" : "intel_mac_low";
        }
      } else {
        // 非 macOS 系统
        machineType = "unknown";
      }

      this._systemInfo = {
        platform,
        arch,
        cpuCores,
        totalMemoryGB,
        isAppleSilicon,
        machineType,
      };

      logger.info(
        `系统信息：${platform} ${arch}, ${cpuCores} 核，${totalMemoryGB}GB RAM, ${machineType}`,
        "SYSTEM"
      );

      return this._systemInfo;
    } catch (error) {
      logger.error("获取系统信息失败", error);
      
      // 返回保守的默认值
      return {
        platform: process.platform,
        arch: process.arch,
        cpuCores: os.cpus().length,
        totalMemoryGB: Math.round(os.totalmem() / (1024 ** 3)),
        isAppleSilicon: process.arch === "arm64",
        machineType: "unknown",
      };
    }
  }

  /**
   * 根据机型获取推荐的 LLM 参数
   */
  async getRecommendedLLMParams(): Promise<{
    gpuLayers: number;
    contextSize: number;
    temperature: number;
    topP: number;
  }> {
    const info = await this.getSystemInfo();

    // 根据不同机型返回推荐参数
    switch (info.machineType) {
      case "apple_silicon_high":
        // M1/M2/M3 Max/Ultra - 高性能
        return {
          gpuLayers: 99, // 尽可能使用 GPU
          contextSize: 8192,
          temperature: 0.7,
          topP: 0.9,
        };

      case "apple_silicon_mid":
        // M1/M2/M3 Pro - 中等性能
        return {
          gpuLayers: 64,
          contextSize: 6144,
          temperature: 0.7,
          topP: 0.9,
        };

      case "apple_silicon_base":
        // M1/M2/M3 基础版 - 保守配置
        return {
          gpuLayers: 32,
          contextSize: 4096,
          temperature: 0.7,
          topP: 0.9,
        };

      case "intel_mac_high":
        // Intel Mac 高配 - 适度使用 GPU
        return {
          gpuLayers: 48,
          contextSize: 4096,
          temperature: 0.7,
          topP: 0.9,
        };

      case "intel_mac_low":
        // Intel Mac 低配 - 主要使用 CPU
        return {
          gpuLayers: 16,
          contextSize: 3072,
          temperature: 0.7,
          topP: 0.9,
        };

      default:
        // 未知机型 - 使用保守配置
        return {
          gpuLayers: 32,
          contextSize: 4096,
          temperature: 0.7,
          topP: 0.9,
        };
    }
  }

  /**
   * 根据机型获取推荐的 Embedding 参数
   */
  async getRecommendedEmbeddingParams(): Promise<{
    gpuLayers: number;
    contextSize: number;
  }> {
    const info = await this.getSystemInfo();

    // Embedding 模型通常较小，可以更多使用 GPU
    switch (info.machineType) {
      case "apple_silicon_high":
        return {
          gpuLayers: 99,
          contextSize: 512,
        };

      case "apple_silicon_mid":
        return {
          gpuLayers: 99,
          contextSize: 512,
        };

      case "apple_silicon_base":
        return {
          gpuLayers: 0, // Embedding 推理很快，用 CPU 也足够
          contextSize: 512,
        };

      case "intel_mac_high":
        return {
          gpuLayers: 24,
          contextSize: 512,
        };

      case "intel_mac_low":
        return {
          gpuLayers: 0,
          contextSize: 512,
        };

      default:
        return {
          gpuLayers: 0,
          contextSize: 512,
        };
    }
  }

  /**
   * 清除缓存的系统信息（用于重新检测）
   */
  clearCache(): void {
    this._systemInfo = null;
    logger.info("系统信息缓存已清除", "SYSTEM");
  }
}

// 导出单例
export const systemMonitor = SystemMonitor.getInstance();
