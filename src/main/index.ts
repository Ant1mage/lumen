import { app, BrowserWindow } from "electron";
import path from "path";
import Database from "./lumen_core/db/database_engine";
import LlmEngine from "./lumen_core/ai/llm_engine";
// RagEngine is declared but not used in this entrypoint.
let mainWindow: BrowserWindow | null = null;
let database: Database | null = null;
let llamaService: LlmEngine | null = null;

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
  if (database) {
    database.close();
  }
  if (llamaService) {
    void llamaService.dispose();
  }
}

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
