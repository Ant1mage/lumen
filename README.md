# Lumen - AI 驱动的股票分析助手

<div align="center">

✨ **本地优先 · 隐私安全 · 智能对话** ✨

基于 Electron + RAG + Local LLM 的桌面级 AI 助手

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![Electron](https://img.shields.io/badge/Electron-30.5-47848F.svg)](https://www.electronjs.org/)

</div>

---

## 📖 简介

Lumen 是一款专为股票分析设计的桌面 AI 助手。采用**本地优先**架构，结合**RAG**技术和**本地大模型**，在完全离线环境下提供智能问答服务。

### 核心特性

- 🔒 **隐私安全**：所有数据本地处理，无需联网
- 🧠 **智能 RAG**：基于向量检索的增强生成系统
- 💬 **流式对话**：实时响应，支持多轮对话和历史持久化
- 🎯 **精准回答**：基于参考资料生成，减少幻觉
- ⚙️ **灵活配置**：支持切换 GGUF 模型、调整 GPU 层数等参数

---

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────┐
│  渲染进程 (Renderer)                                 │
│  React + TypeScript + Tailwind CSS                  │
│  UI 展示 / 交互逻辑                                   │
└────────────────┬────────────────────────────────────┘
                 │ window.api (IPC)
┌────────────────▼────────────────────────────────────┐
│  预加载脚本 (Preload)                                │
│  安全的 IPC 通信桥接                                  │
└────────────────┬────────────────────────────────────┘
                 │ IPC Handlers
┌────────────────▼────────────────────────────────────┐
│  主进程 (Main)                                       │
│  Electron 主窗口 / LumenCore 核心引擎                 │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│  核心服务层                                          │
│  ├─ LLM 引擎 (node-llama-cpp)                       │
│  ├─ RAG 引擎 (向量检索)                              │
│  ├─ SQLite 数据库 (better-sqlite3)                  │
│  └─ 日志服务                                        │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 核心能力

### 1. 智能对话（RAG）

**工作流**: 检索 → 增强 → 生成

- 语义搜索和向量匹配
- 动态注入 Top-3 参考资料
- 上下文智能截断（最大 3000 tokens）
- 保持最近 5 轮对话历史

### 2. 知识库管理

- 文档向量化和存储
- 余弦相似度检索（阈值 0.3）
- LRU/FIFO 缓存淘汰策略
- TTL 过期自动清理

### 3. 模型管理

- 支持 GGUF 格式模型（Qwen、Llama 等）
- 默认配置：
  - LLM: `Qwen3.5-4B-Q4_K_M.gguf`
  - Embedding: `BGE-M3`（1024 维）
- 可调节参数：GPU 层数、上下文窗口大小
- 运行时热切换模型

### 4. 数据持久化

- 三层存储：内存 Map + SQLite + LRU 缓存
- 聊天记录持久化
- 自动清理 7 天前日志
- 限制加载数量（最近 maxDocs 条）

---

## 🛠️ 技术栈

**前端**: React 18.2、TypeScript 5.3、Tailwind CSS 3.4  
**后端**: Electron 30.5、Node.js 20.x、better-sqlite3 9.4、node-llama-cpp 3.17  
**构建**: Webpack 5.89、Vite 5.0

---

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
├── config/             # 构建配置
└── package.json        # 依赖配置
```

---

## 🎯 下一步展望

### 短期
- 股票数据 API 集成（实时行情、财务指标）
- 多格式文档导入（PDF、Word、Markdown）
- 深色模式和侧边栏

### 中期
- 技术指标分析和图表可视化
- 多模型市场和 A/B 测试
- 迁移到 FAISS/Chroma 向量库
- 插件系统

### 长期
- 跨平台扩展（移动端、Web 版、CLI）
- 分布式架构（云端同步、P2P 分享）
- Agent 系统和工具调用能力
- 开放 API 和 SDK

---

## 📄 许可证

MIT License

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐ Star！**

Made with ❤️ by ant1mage

</div>
