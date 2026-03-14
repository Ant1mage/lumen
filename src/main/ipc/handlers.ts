/**
 * IPC 处理程序注册器
 * 
 * 按功能模块分组管理所有 IPC 处理逻辑
 */

import { ipcMain } from 'electron';
import { STORE_CONFIG_CHANNELS, VIEW_CHANNELS } from '../shared/channels';
import { StoreService } from '../services/store.service';

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
}
