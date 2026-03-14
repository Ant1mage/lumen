import { app, BrowserWindow } from 'electron';
import path from 'path';
import { registerIpcHandlers } from './ipc/handlers';
import LumenCore from './lumen_core/lumen-core';
import { LumenCoreService } from './services/lumen-core.service';

let mainWindow: BrowserWindow | null = null;
let lumenCore: LumenCore | null = null;
const isDev = process.env.RENDERER_URL;

function createWindow() {
  // 在创建窗口前先读取主题和语言设置（使用同步方式）
  const ElectronStore = require('electron-store').default;
  const userStore = new ElectronStore({ name: 'UserSettingConfig' });
  const theme = userStore.get('theme', 'system');
  const language = userStore.get('language', 'zh-CN');
  
  // 根据主题设置确定是否使用暗色模式
  let isDarkMode = false;
  if (theme === 'dark') {
    isDarkMode = true;
  } else if (theme === 'light') {
    isDarkMode = false;
  } else {
    // system - 检测系统主题
    const nativeTheme = require('electron').nativeTheme;
    isDarkMode = nativeTheme.shouldUseDarkColors;
  }
  
  // 背景色必须与 global.css 中的 --background 值匹配
  // 浅色模式：oklch(0.92 0.01 260) ≈ #e8e9ea
  // 深色模式：oklch(0.12 0.015 260) ≈ #18181b
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    backgroundColor: isDarkMode ? '#18181b' : '#e8e9ea', // 与 global.css 的 --background 一致
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev && process.env.RENDERER_URL) {
    // 开发模式：使用 Webpack Dev Server
    mainWindow.loadURL(process.env.RENDERER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式：加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
  
  // 设置初始语言
  console.log('启动时语言设置:', language);
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  createWindow();

  // 注册所有 IPC 处理程序
  registerIpcHandlers();

  // 初始化 LumenCore（在后台进行，不阻塞 UI）
  lumenCore = new LumenCore();
  LumenCoreService.getInstance().setLumenCore(lumenCore);
  
  // 启动初始化（异步，不阻塞）
  lumenCore.initEngine().catch(err => {
    console.error('LumenCore 初始化失败:', err);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});