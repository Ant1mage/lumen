# Lumen AI Stock - pnpm + electron-vite 版本

## 迁移说明

本项目已从 npm + Webpack 迁移到 pnpm + electron-vite 构建系统。

## 环境要求

- Node.js >= 20.0.0
- pnpm >= 8.0.0

## 安装步骤

### 1. 安装依赖

```bash
pnpm install
```

### 2. 重建原生模块（如遇到错误）

```bash
# 使用 electron-rebuild 重建所有原生模块
./node_modules/.bin/electron-rebuild -f
```

如果遇到 better-sqlite3 或 node-llama-cpp 相关的错误，请执行此命令。

## 开发模式

```bash
pnpm dev
```

这将启动 electron-vite 开发服务器，自动监听文件变化并热重载。

## 构建生产版本

```bash
# 构建所有进程
pnpm build

# 打包 Electron 应用
pnpm build:electron
```

## 预览生产版本

```bash
pnpm preview
```

## 主要变更

### package.json
- 移除了 webpack 相关依赖和脚本
- 添加了 electron-vite、vite 等依赖
- 简化了开发命令：`pnpm dev`
- 引擎要求改为 pnpm >= 8.0.0

### 配置文件
- 新增 `electron.vite.config.ts`：配置 main、preload、renderer 三个进程
- 更新 `tsconfig.json`：调整 module 和 moduleResolution 以适配 Vite
- 保留路径别名：`@main/*`, `@renderer/*`, `@preload/*`, `@shared/*`

### 源代码
- 更新 `src/main/index.ts`：使用 `process.env.NODE_ENV` 判断开发/生产模式
- 其他源代码无需修改

## 常见问题

### 问题 1：Electron 无法启动

如果遇到 "Electron failed to install correctly" 错误：

```bash
# 重新安装 electron
pnpm remove electron
pnpm add -D electron@35.3.0 --legacy-peer-deps

# 重建原生模块
./node_modules/.bin/electron-rebuild -f
```

### 问题 2：better-sqlite3 或 node-llama-cpp 错误

如果遇到 NODE_MODULE_VERSION 不匹配错误：

```bash
# 重建所有原生模块
./node_modules/.bin/electron-rebuild -f
```

### 问题 3：编译 C++ 错误

如果遇到 C++ 编译错误，确保 Xcode Command Line Tools 已安装：

```bash
xcode-select --install
```

## 优势

相比之前的 npm + Webpack 方案，新方案具有以下优势：

1. **更快的安装速度**：pnpm 比 npm 快 2-3 倍
2. **更节省磁盘空间**：pnpm 使用硬链接和符号链接
3. **更快的构建速度**：Vite 的 HMR 是瞬时的
4. **更简洁的配置**：electron-vite 一体化配置
5. **更好的开发体验**：更快的冷启动和热更新

## 技术栈

- **构建工具**：electron-vite + Vite 6
- **包管理器**：pnpm
- **框架**：React 19
- **UI 库**：Radix UI + Tailwind CSS 4
- **原生模块**：better-sqlite3, node-llama-cpp
- **Electron**：35.3.0
