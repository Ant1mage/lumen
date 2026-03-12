import { app, BrowserWindow, ipcMain } from 'electron/main';
import path from 'path';
import Database from './db/database';
import LlamaService from './llm/llama';
import RagStore from './rag/store';

let mainWindow: BrowserWindow | null = null;
let database: Database | null = null;
let llamaService: LlamaService | null = null;
let ragStore: RagStore | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 开发模式使用 Vite dev server
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (isDev) {
    mainWindow.loadURL(process.env.RENDERER_URL || 'http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    cleanup();
  });
}

async function initializeServices() {
  try {
    // 初始化数据库
    database = new Database();
    await database.initialize();
    
    // 初始化 LLM 服务
    llamaService = new LlamaService();
    await llamaService.initialize();
    
    // 初始化 RAG 存储
    ragStore = new RagStore(database!, llamaService!);
    await ragStore.initialize();
    
    console.log('所有服务初始化完成');
  } catch (error) {
    console.error('初始化服务失败:', error);
  }
}

function cleanup() {
  if (database) {
    database.close();
  }
  if (llamaService) {
    llamaService.dispose();
  }
}

// IPC 处理器
ipcMain.handle('query-stock', async (_event, symbol: string) => {
  return ragStore?.analyzeStock(symbol) || null;
});

ipcMain.handle('add-document', async (_event, content: string) => {
  return ragStore?.addDocument(content) || null;
});

ipcMain.handle('ask-question', async (_event, question: string) => {
  return ragStore?.answerQuestion(question) || null;
});

app.whenReady().then(async () => {
  await initializeServices();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
