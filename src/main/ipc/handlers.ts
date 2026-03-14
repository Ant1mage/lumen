/**
 * IPC 处理程序注册器
 * 
 * 按功能模块分组管理所有 IPC 处理逻辑
 */

import { ipcMain } from 'electron';
import { STORE_CONFIG_CHANNELS, VIEW_CHANNELS, LUMEN_CORE_CHANNELS } from '@shared/channels';
import { StoreService } from '@main/services/store.service';
import { LumenCoreService } from '@main/services/lumen-core.service';

const storeService = StoreService.getInstance();

/**
 * 注册所有 IPC 处理程序
 */
export function registerIpcHandlers() {
  // ==================== 1. 系统与配置模块 ====================
  
  // 主题相关
  ipcMain.handle(STORE_CONFIG_CHANNELS.THEME.GET, async () => {
    const settings = await storeService.getUserSettings();
    return settings.theme;
  });

  ipcMain.handle(STORE_CONFIG_CHANNELS.THEME.SET, async (event, theme: 'system' | 'light' | 'dark') => {
    const settings = await storeService.getUserSettings();
    settings.theme = theme;
    await storeService.setUserSettings(settings);
    return true;
  });

  // 语言相关
  ipcMain.handle(STORE_CONFIG_CHANNELS.LANGUAGE.GET, async () => {
    const settings = await storeService.getUserSettings();
    return settings.language || 'zh-CN';
  });

  ipcMain.handle(STORE_CONFIG_CHANNELS.LANGUAGE.SET, async (event, language: 'zh-CN' | 'en-US') => {
    const settings = await storeService.getUserSettings();
    settings.language = language;
    await storeService.setUserSettings(settings);
  });

  // 用户设置相关
  ipcMain.handle(STORE_CONFIG_CHANNELS.SETTINGS.GET_USER, async () => {
    return await storeService.getUserSettings();
  });

  // ==================== 2. 视图与交互状态模块 ====================
  
  // 侧边栏相关
  ipcMain.handle(VIEW_CHANNELS.SIDEBAR.GET_CHOOSE, async () => {
    return await storeService.getSidebarChoose();
  });

  ipcMain.handle(VIEW_CHANNELS.SIDEBAR.SET_CHOOSE, async (event, key: string) => {
    await storeService.setSidebarChoose(key as any);
    return true;
  });

  // ==================== 3. LumenCore 状态监听 ====================
  
  // 监听 LumenCore 状态变化并转发给渲染进程
  const lumenCoreService = LumenCoreService.getInstance();
  lumenCoreService.onStateChange((state) => {
    // 这里不需要手动发送，因为我们在 preload 中直接使用 ipcRenderer.on
    // 但我们需要一个方法来触发事件
  });

  // 重新初始化 LumenCore
  ipcMain.handle(LUMEN_CORE_CHANNELS.REINITIALIZE, async () => {
    try {
      console.log('收到重新初始化 LumenCore 的请求')
      const lumenCore = lumenCoreService.getLumenCore()
      if (lumenCore) {
        // 先释放资源
        await lumenCore.dispose()
        // 等待一小段时间
        await new Promise(resolve => setTimeout(resolve, 500))
        // 重新初始化
        await lumenCore.initEngine()
        console.log('LumenCore 重新初始化完成')
        return { success: true }
      } else {
        console.error('LumenCore 实例不存在')
        return { success: false, error: 'LumenCore not initialized' }
      }
    } catch (error) {
      console.error('重新初始化 LumenCore 失败:', error)
      return { success: false, error: String(error) }
    }
  })

  // 发送消息到 LumenCore
  ipcMain.handle(LUMEN_CORE_CHANNELS.SEND_MESSAGE, async (event, content: string) => {
    try {
      console.log('收到发送消息请求:', content)
      const lumenCore = lumenCoreService.getLumenCore()
      if (!lumenCore) {
        console.error('LumenCore 实例不存在')
        return { success: false, error: 'LumenCore not initialized' }
      }

      // 调用 LumenCore 的 chat 方法
      await lumenCore.chat(content, (token) => {
        // 流式响应：将每个 token 发送回渲染进程
        event.sender.send('lumen-core-token', token)
      })

      console.log('消息发送完成')
      return { success: true }
    } catch (error) {
      console.error('发送消息失败:', error)
      return { success: false, error: String(error) }
    }
  })
}
