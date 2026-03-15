import LumenCore from '@main/lumen_core/lumen-core';
import { BrowserWindow, ipcMain } from 'electron';
import { LUMEN_CORE_CHANNELS } from '@shared/channels';
import { LumenCoreState } from '@shared/types';

/**
 * LumenCore 状态管理服务
 * 用于向渲染进程暴露 LumenCore 的初始化状态
 */
export class LumenCoreService {
  private static instance: LumenCoreService;
  private _lumenCore: LumenCore | null = null;
  private _stateListeners: Set<(state: LumenCoreState) => void> = new Set();

  private constructor() { }

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
    this._lumenCore = lumenCore;

    // 订阅状态变化并转发给所有监听器
    if (lumenCore) {
      lumenCore.onStateChange((state: LumenCoreState) => {
        console.log('LumenCoreService: 收到状态更新', state)

        this._stateListeners.forEach(listener => {
          try {
            listener(state);
          } catch (error) {
            console.error('LumenCoreService: 状态监听器执行失败', error);
          }
        });

        // 发送到渲染进程
        const windows = BrowserWindow.getAllWindows();
        if (windows.length > 0) {
          console.log('LumenCoreService: 发送状态到渲染进程', state)
          windows[0].webContents.send(LUMEN_CORE_CHANNELS.STATE_CHANGE, state);
        } else {
          console.warn('LumenCoreService: 没有找到任何窗口')
        }
      });
    }
  }

  /**
   * 获取 LumenCore 实例
   */
  getLumenCore(): LumenCore | null {
    return this._lumenCore;
  }

  /**
   * 订阅状态变化
   */
  onStateChange(listener: (state: LumenCoreState) => void): () => void {
    this._stateListeners.add(listener);

    // 返回取消订阅函数
    return () => {
      this._stateListeners.delete(listener);
    };
  }
}
