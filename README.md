# Lumen - AI 驱动的股票分析助手

<div align="center">

✨ **端云协同 · 隐私安全 · 智能对话** ✨

基于 Electron + LangChain.js + RAG 的桌面级 AI 助手

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61dafb.svg)](https://reactjs.org/)
[![Electron](https://img.shields.io/badge/Electron-35.3-47848F.svg)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.x-f69220.svg)](https://pnpm.io/)
[![electron-vite](https://img.shields.io/badge/electron--vite-3.1-C835B7.svg)](https://electron-vite.org/)

</div>

---

## 📖 简介

Lumen 是一款专为股票分析设计的桌面 AI 助手。基于**云端推理** + **本地辅助**架构，以**LangChain.js**为核心，意图分发、本地脱敏、RAG 增强，提供精准的股票分析问答服务。

### ⚠️ 重要提示

**本项目使用 Node.js 20+ 和 pnpm**。请确保 Node.js 版本 >= 20.0.0（参见 `.nvmrc` 配置）。

### 核心特性

- ☁️ **端云协同**：云端推理为主，本地辅助（意图分发、脱敏）为辅
- 🔒 **隐私安全**：敏感数据本地脱敏，保障隐私
- 🧠 **智能 RAG**：基于向量检索的增强生成系统
- 💬 **流式对话**：实时响应，支持多轮对话和历史持久化
- 🎯 **精准回答**：基于参考资料生成，减少幻觉

---

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 20.0.0（推荐使用 [nvm](https://github.com/nvm-sh/nvm) 管理）
- **pnpm**: >= 8.0.0（安装：`npm install -g pnpm`）
- **架构支持**: x64 / arm64

### 安装依赖

```bash
# 安装项目依赖
pnpm install

# 重建 Electron 原生模块（如遇到问题）
pnpm rebuild:electron
```

### 开发模式

```bash
# 启动开发服务器（支持热更新 HMR）
pnpm dev
```

应用将自动打开，运行在 `http://localhost:3001`

### 构建生产版本

```bash
# 编译打包
pnpm build

# 或分步构建
pnpm build:electron  # 构建 Electron 安装包
```

### 清理构建产物

```bash
# 删除所有构建产物（dist/, release/, build/）
pnpm clean
```

---

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────┐
│  🎨 渲染进程 (Renderer)                             │
│  React + TypeScript + Tailwind CSS                  │
│  UI 展示 / 交互逻辑                                  │
└────────────────┬────────────────────────────────────┘
                 │ window.api (IPC)
┌────────────────▼────────────────────────────────────┐
│  🔗 预加载脚本 (Preload)                            │
│  安全的 IPC 通信桥接                                 │
└────────────────┬────────────────────────────────────┘
                 │ IPC Handlers
┌────────────────▼────────────────────────────────────┐
│  ⚡ 主进程 (Main)                                   │
│  Electron 主窗口 / LumenCore 核心引擎                 │
└────────────────┬────────────────────────────────────┘
                 │
┌─────────────────────────────────────────────────────┐
│  核心服务层                                          │
│  ├─ ☁️ Cloud Engine (云端 LLM 主力推理)              │
│  ├─ 🔥 Router Engine (本地意图分发)                  │
│  ├─ 📊 Vector Engine (本地 Embedding 向量化)         │
│  ├─ 🔒 Desensitization Engine (本地脱敏)            │
│  ├─ 🧠 RAG Engine (向量检索增强)                    │
│  ├─ 💾 SQLite 数据库 (better-sqlite3)              │
│  └─ 📝 日志服务                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 核心能力

### 1. 端云协同架构

**云端推理为主 · 本地辅助为辅**

- ☁️ **云端推理**：基于 LangChain.js 的云端 LLM 主力推理
  - 支持 Qwen / OpenAI / Claude 等多模型
  - 灵活配置 API Key 和 baseURL
- 🔥 **本地辅助**：基于 `node-llama-cpp` 的本地小模型
  - Router 模型：`qwen2.5-0.5b`（意图分发）
  - Embedding 模型：`bge-m3`（向量检索）
  - Desensitization 模型：`Qwen3.5-4B`（本地脱敏）
- 🧠 **智能路由**：根据意图自动选择最优处理路径
  - 简单查询 → 云端直接回答
  - 脱敏需求 → 本地 Desensitization
  - 私有数据 → RAG + 云端 LLM

### 2. 智能对话（RAG）

**基于 LangChain LCEL 的 Pipeline 架构**

工作流: 检索 → 增强 → 生成

- 语义搜索和向量匹配
- 动态注入 Top-3 参考资料
- 保持最近 10 条对话历史

### 3. 知识库管理

- 文档向量化和存储
- 余弦相似度检索（阈值 0.3）
- LRU/FIFO 缓存淘汰策略
- TTL 过期自动清理

### 4. 模型管理

- 支持 GGUF 格式模型（Qwen、Llama 等）
- 本地模型：
  - Router: `qwen2.5-0.5b-instruct-q8_0.gguf`
  - Embedding: `bge-m3-q8_0.gguf`
  - Desensitization: `Qwen3.5-4B-Q4_K_M.gguf`
- 可调节参数：GPU 层数、上下文窗口大小

### 5. 数据持久化

- 内存 Map + SQLite 混合存储
- 聊天记录持久化
- RAG 文档缓存（TTL 1小时）
- 最多加载 1000 条本地索引

---

## 🛠️ 技术栈

| 分类 | 技术 |
|------|------|
| 💻 **前端** | React 19.1、TypeScript 5.8、Tailwind CSS 4.2 |
| ⚙️ **后端** | Electron 35.3、Node.js 20.x、better-sqlite3 11.9 |
| 🤖 **AI** | LangChain.js 1.1.24、node-llama-cpp 3.17 |
| 📦 **构建** | electron-vite 3.1、Vite 6.2、pnpm 10.x |
| 🌐 **多语言** | i18next 25.8、react-i18next 16.5 |

---

## ✨ 最近更新 (2026-03-19)

### 🔥 端云协同架构升级
- ✅ **ChatLlamaCpp 异步初始化**：修复 `node-llama-cpp` 模型加载问题
- ✅ **LlamaCppEmbeddings 异步初始化**：修复 Embeddings 模型初始化
- ✅ **Router 云端降级**：本地 LLM 失败时自动切换云端
- ✅ **动态模块加载**：解决 ESM/CJS 兼容性问题

### 🎉 构建系统迁移到 pnpm + electron-vite
- ✅ **包管理器**: npm → pnpm（更快安装速度，节省磁盘空间）
- ✅ **构建工具**: Webpack → electron-vite（瞬时 HMR，更简洁的配置）
- ✅ **性能提升**: 开发启动速度提升约 3-5x，热更新几乎即时
- ✅ **配置简化**: 移除了复杂的 Webpack 配置，代码量减少约 60%

### 清理与优化
- ✅ 删除所有 Webpack 相关配置文件
- ✅ 清理旧构建产物（build/, config/, dist/）
- ✅ 添加 `pnpm clean` 命令方便未来清理
- ✅ 更新 TypeScript 配置以适配 Vite（moduleResolution: bundler）

### 依赖版本锁定
- ✅ 所有依赖版本已精确锁定，避免安装时的版本不一致问题
- ✅ 移除了 `^` 前缀，使用精确版本号确保构建稳定性
- ✅ 包含 76 个依赖包的版本固化

### .gitignore 优化
- ✅ 添加设计稿文件忽略 (`lumen_design/`, `*.png`)
- ✅ 添加开发脚本忽略 (`rebuild.sh`)
- ✅ 添加 Bun 相关配置（为未来迁移做准备）
- ✅ 添加测试文件和本地配置文件忽略规则

### 项目结构清理
- 📁 识别并标记可删除的文件（设计稿、临时文档等）
- 🔧 优化版本控制策略，提升协作效率

## 📦 项目结构

```
lumen/
├── src/
│   ├── main/           # 主进程（Electron Backend）
│   │   ├── lumen_core/ # 核心引擎
│   │   │   ├── ai/     # AI 推理模块
│   │   │   ├── db/     # 数据库模块
│   │   │   ├── rag/    # RAG 检索模块
│   │   │   └── tools/  # 工具服务
│   │   └── index.ts    # 主进程入口
│   ├── preload/        # 预加载脚本（IPC 桥接）
│   └── renderer/       # 渲染进程（React Frontend）
│       ├── components/ # UI 组件
│       ├── App.tsx     # 应用根组件
│       └── index.tsx   # 渲染入口
├── models/             # GGUF 模型文件
├── electron.vite.config.ts  # electron-vite 构建配置
└── package.json        # 依赖配置
```

---

## 📄 许可证

MIT License

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐ Star！**

Made with ❤️ by ant1mage

</div>
