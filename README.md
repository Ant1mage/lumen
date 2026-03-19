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

Lumen 是一款专为股票分析设计的桌面 AI 助手。基于**云端推理** + **本地辅助**架构，以**LangChain.js LCEL**为核心，实现意图分发、本地脱敏、RAG 增强，提供精准的股票分析问答服务。

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
│  LumenCore (基础设施)                               │
│  ├─ 💾 SQLite 数据库 (better-sqlite3)              │
│  ├─ 📊 Vector Engine (本地 Embedding 向量化)         │
│  └─ 🧠 RAG Engine (向量检索增强)                    │
└────────────────┬────────────────────────────────────┘
                 │ 懒加载
┌────────────────▼────────────────────────────────────┐
│  LumenChain (LangChain LCEL Pipeline)              │
│  ├─ ☁️ Cloud Engine (云端 LLM 主力推理)              │
│  ├─ 🔥 Router Engine (本地意图分发)                  │
│  └─ 🔒 Translator Engine (本地脱敏)                 │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 核心能力

### 1. LangChain LCEL Pipeline 架构

**基于 RunnableLambda 的链式调用**

```typescript
// LumenChain 构建流程
RunnableSequence.from([
  // 步骤1: 意图识别
  RunnableLambda.from(async (input) => {
    const routerDecision = await this.router(input.question);
    return { ...input, routerDecision };
  }),

  // 步骤2: RAG 检索
  RunnableLambda.from(async (state) => {
    const ragContexts = await this.ragSearch(state.question, 3);
    return { ...state, ragContexts };
  }),

  // 步骤3: 脱敏判定
  RunnableLambda.from(async (state) => {
    if (state.routerDecision.needTranslator) {
      state.desensitizedPrompt = await this.translate(state.question);
    }
    return state;
  }),

  // 步骤4: 构建消息
  RunnableLambda.from((state) => {
    const messages = buildMessages(state);
    return { ...state, messages };
  }),

  // 步骤5: 云端推理
  RunnableLambda.from(async (state) => {
    const response = await this.streamChat(state.messages);
    return { ...state, response };
  }),
]);
```

### 2. 懒加载机制

**按需加载，优化启动性能**

- LumenCore 启动时只加载基础设施（DB + Vector + RAG）
- Router/Cloud/Translator Engine 在首次使用时才加载
- 函数式依赖注入，解耦具体实现

```typescript
// 构造函数只接收函数签名，不依赖具体实现
constructor(
  ragSearch: (query: string, topK: number) => Promise<string[]>,
  isTranslatorEnabled: boolean,
  onToken: (token: string) => void,
)
```

### 3. 端云协同架构

**云端推理为主 · 本地辅助为辅**

- ☁️ **云端推理**：基于 LangChain.js 的云端 LLM 主力推理
  - 支持 Qwen / OpenAI / Claude 等多模型
  - 灵活配置 API Key 和 baseURL
- 🔥 **本地辅助**：基于 `node-llama-cpp` 的本地小模型
  - Router 模型：`qwen2.5-0.5b`（意图分发）
  - Embedding 模型：`bge-m3`（向量检索）
  - Translator 模型：`Qwen3.5-4B`（本地脱敏）
- 🧠 **智能路由**：根据意图自动选择最优处理路径
  - 简单查询 → 云端直接回答
  - 脱敏需求 → 本地脱敏 → 云端推理
  - 私有数据 → RAG + 云端 LLM

### 4. Prompt 工程

**Few-shot 示例 + 精简指令**

```typescript
// Router Prompt - 意图识别
static router = `判断用户输入的意图，只回答JSON。

规则：
- needPrivateData: 需要查知识库吗？
- needTranslator: 包含敏感信息（手机号、身份证、银行卡、地址、人名等）吗？
- isSimpleQuery: 是简单百科查询吗？

示例：
输入："我的手机号是13812345678"
输出：{"needPrivateData":"否","needTranslator":"是","isSimpleQuery":"否","reason":"包含手机号敏感信息"}`;

// Translator Prompt - 脱敏
static translator = `将用户输入脱敏，保留意图。

规则：
- 人名 → 某人/某员工
- 地点 → 某地
- 时间 → 某时
- 金额 → 某金额
- 股票代码 → 某股票

示例：
输入："帮我查下张三在北京的出差记录"
输出："帮我查下某员工在某地的出差记录"`;
```

### 5. 知识库管理

- 文档向量化和存储
- 余弦相似度检索（阈值 0.3）
- LRU/FIFO 缓存淘汰策略
- TTL 过期自动清理

### 6. 数据持久化

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

## ✨ 最近更新 (2026-03-20)

### 🔥 LangChain LCEL Pipeline 架构
- ✅ **LumenChain 类**：基于 RunnableLambda 的链式调用
- ✅ **懒加载机制**：Router/Cloud/Translator Engine 按需加载
- ✅ **函数式依赖注入**：解耦具体实现，便于测试
- ✅ **职责分离**：LumenCore 管理基础设施，LumenChain 管理业务逻辑

### 🎯 Prompt 工程优化
- ✅ **Few-shot 示例**：Router 和 Translator 都添加了具体示例
- ✅ **精简指令**：去除冗长解释，适合小模型理解
- ✅ **JSON 解析容错**：正则提取 JSON，提高解析成功率

### 🔧 架构优化
- ✅ **移除硬编码**：所有配置通过参数传递
- ✅ **类型安全**：避免使用 `!` 非空断言，改用判空逻辑
- ✅ **动态导入**：解决 ESM/CJS 兼容性问题

---

## 📦 项目结构

```
lumen/
├── src/
│   ├── main/           # 主进程（Electron Backend）
│   │   ├── lumen_core/ # 核心引擎
│   │   │   ├── ai/     # AI 推理模块
│   │   │   │   └── cloud/ # 云端 LLM 引擎
│   │   │   ├── db/     # 数据库模块
│   │   │   ├── rag/    # RAG 检索模块
│   │   │   ├── lumen-chain.ts  # LangChain Pipeline
│   │   │   └── lumen-core.ts   # 核心引擎入口
│   │   ├── tools/      # 工具服务
│   │   │   ├── llm-prompt.ts   # Prompt 管理
│   │   │   ├── llm-path.ts     # 模型路径
│   │   │   └── logger.ts       # 日志服务
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
