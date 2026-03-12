import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import LumenCore from "./lumen_core/lumen_core";

let mainWindow: BrowserWindow | null = null;
let lumenCore: LumenCore | null = null;
let lumenReady = false;

console.log("Runtime Node Version:", process.versions.node);
console.log("Runtime Electron Version:", process.versions.electron);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 开发模式使用 Vite dev server
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    mainWindow.loadURL(process.env.RENDERER_URL || "http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
    cleanup();
  });
}

function cleanup() {
  if (lumenCore) {
    void lumenCore.dispose();
  }
}

async function initializeServices() {
  lumenCore = new LumenCore();
  try {
    await lumenCore.initEngine();
    lumenReady = true;
  } catch (error) {
    console.error("Lumen Engine 初始化失败:", error);
  }
}

ipcMain.handle("is-ready", async () => {
  return lumenReady;
});

ipcMain.handle("ask-question", async (_event, question: string) => {
  if (!lumenCore || !lumenReady) {
    return "模型正在加载中，请稍候再试...";
  }

  let response = "";
  await lumenCore.chat(question, (token) => {
    response += token;
  });
  return response;
});

ipcMain.handle(
  "ask-question-stream",
  async (event, question: string, sessionId: string = "default") => {
    if (!lumenCore || !lumenReady) {
      return "模型正在加载中，请稍候再试...";
    }

    let response = "";
    await lumenCore.chat(question, (token) => {
      response += token;
      event.sender.send(`chat-token-${sessionId}`, token);
    });
    return response;
  },
);

ipcMain.handle("get-chat-history", async () => {
  if (!lumenCore || !lumenReady) return [];
  return await lumenCore.getChatHistory();
});

ipcMain.handle("clear-chat-history", async () => {
  if (!lumenCore || !lumenReady) return false;
  await lumenCore.clearHistory();
  return true;
});

ipcMain.handle("get-available-models", async () => {
  if (!lumenCore) return [];
  return lumenCore.getAvailableModels();
});

ipcMain.handle("get-current-model-selection", async () => {
  if (!lumenCore) return null;
  return lumenCore.getCurrentModelSelection();
});

ipcMain.handle(
  "set-models",
  async (
    _event,
    options: {
      llmModelFile?: string;
      embeddingModelFile?: string;
      llmGpuLayers?: number;
      embeddingGpuLayers?: number;
      contextSize?: number;
    },
  ) => {
    if (!lumenCore) return false;
    await lumenCore.switchModels(options);
    return true;
  },
);

ipcMain.handle("add-document", async (_event, content: string) => {
  if (!lumenCore || !lumenReady) return null;
  return lumenCore.addDocument(content);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  createWindow();
  initializeServices();
});
