import LumenCore from "@main/lumen_core/lumen-core";
import { BrowserWindow, ipcMain } from "electron";
import { LUMEN_CORE_CHANNELS } from "@shared/channels";
import { LumenCoreState } from "@shared/types";
import { logger } from "@main/tools/logger";

/**
 * LumenCore 状态管理服务
 * 用于向渲染进程暴露 LumenCore 的初始化状态
 */
export class LumenCoreService {
  private static instance: LumenCoreService;
  private lumenCore: LumenCore | null = null;
  private stateListeners: Set<(state: LumenCoreState) => void> = new Set();

  private constructor() {}

  static getInstance(): LumenCoreService {
    if (!LumenCoreService.instance) {
      LumenCoreService.instance = new LumenCoreService();
    }
    return LumenCoreService.instance;
  }

  /**
   * 设置 LumenCore 实例
   */
  setLumenCore(lumenCore: LumenCore) {
    this.lumenCore = lumenCore;

    // 订阅状态变化并转发给所有监听器
    if (lumenCore) {
      this.lumenCore.onStateChange((state: LumenCoreState) => {
        logger.info(
          `收到状态更新：${JSON.stringify(state)}`,
          "LumenCoreService",
        );

        this.stateListeners.forEach((listener) => {
          try {
            listener(state);
          } catch (error) {
            logger.error(`状态监听器执行失败：${error}`, "LumenCoreService");
          }
        });

        // 发送到渲染进程
        const windows = BrowserWindow.getAllWindows();
        if (windows.length > 0) {
          logger.info(
            `发送状态到渲染进程：${JSON.stringify(state)}`,
            "LumenCoreService",
          );
          windows[0].webContents.send(LUMEN_CORE_CHANNELS.STATE_CHANGE, state);
        } else {
          logger.warn("没有找到任何窗口", "LumenCoreService");
        }
      });
    }
  }

  /**
   * 获取 LumenCore 实例
   */
  getLumenCore(): LumenCore | null {
    return this.lumenCore;
  }

  /**
   * 订阅状态变化
   */
  onStateChange(listener: (state: LumenCoreState) => void): () => void {
    this.stateListeners.add(listener);

    return () => {
      this.stateListeners.delete(listener);
    };
  }
}
