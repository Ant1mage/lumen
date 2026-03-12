# Lumen AI 股票应用 - 项目结构

## 📁 完整目录结构

```
lumen/
│
├── 📄 package.json              # 项目配置和依赖管理
├── 📄 tsconfig.json             # TypeScript 配置
├── 📄 README.md                 # 项目说明文档
├── 📄 STARTUP.md                # 快速开始指南
├── 📄 .gitignore                # Git 忽略文件
│
├── 📁 config/                   # 构建配置文件
│   ├── webpack.main.config.js   # 主进程 Webpack 配置
│   ├── webpack.renderer.config.js # 渲染进程 Webpack 配置
│   └── vite.config.js           # Vite 构建配置
│
├── 📁 src/                      # 源代码目录
│   │
│   ├── 📁 main/                 # Electron 主进程代码
│   │   ├── index.ts             # 主进程入口文件
│   │   ├── db/                  # 数据库层
│   │   │   └── database.ts      # better-sqlite3 封装
│   │   ├── llm/                 # LLM 服务层
│   │   │   └── llama.ts         # node-llama-cpp 封装
│   │   └── rag/                 # RAG 系统层
│   │       └── store.ts         # RAG 向量存储和检索
│   │
│   ├── 📁 renderer/             # React 渲染进程代码
│   │   ├── index.tsx            # 渲染进程入口
│   │   ├── App.tsx              # 主应用组件
│   │   ├── index.css            # 全局样式
│   │   └── components/          # UI 组件
│   │       ├── StockCard.tsx    # 股票卡片组件
│   │       ├── ChatBox.tsx      # 聊天框组件
│   │       ├── LoadingSpinner.tsx # 加载动画组件
│   │       └── index.css        # 组件样式
│   │
│   └── 📁 preload/              # 预加载脚本
│       ├── index.ts             # IPC 桥接
│       └── types.ts             # 类型定义
│
├── 📁 public/                   # 静态资源
│   └── index.html               # HTML 模板
│
├── 📁 models/                   # AI 模型文件
│   └── README.md                # 模型下载说明
│
├── 📄 postcss.config.js         # PostCSS 配置
└── 📄 tailwind.config.js        # Tailwind CSS 配置
```

## 🔧 核心模块说明

### 1. 主进程 (main/)

**index.ts** - 主进程入口
- 创建 Electron 窗口
- 初始化所有服务（数据库、LLM、RAG）
- 设置 IPC 通信处理器

**db/database.ts** - 数据库服务
- 基于 better-sqlite3
- 管理股票数据表
- 管理文档表（用于 RAG）
- 提供 CRUD 操作接口

**llm/llama.ts** - LLM 服务
- 基于 node-llama-cpp
- 加载 GGUF 模型
- 提供文本生成能力
- 提供简单的嵌入功能

**rag/store.ts** - RAG 系统
- 文档向量化存储
- 相似度搜索
- 股票分析生成
- 智能问答

### 2. 渲染进程 (renderer/)

**App.tsx** - 主应用
- 股票分析界面
- 智能问答界面
- 状态管理

**components/** - UI 组件库
- StockCard: 股票信息展示
- ChatBox: 聊天交互界面
- LoadingSpinner: 加载状态

### 3. 预加载脚本 (preload/)

**index.ts** - IPC 桥接
- 暴露安全的 API 给渲染进程
- 使用 contextBridge
- 实现主进程和渲染进程的通信

**types.ts** - 类型定义
- 定义 ElectronAPI 接口
- 扩展 Window 接口

## 🔄 数据流

```
用户界面 (React)
    ↓
preload.ts (IPC Bridge)
    ↓
main.ts (IPC Handlers)
    ↓
RagStore (RAG System)
    ↓
LlamaService + Database
```

## 📦 技术栈详情

| 层级 | 技术 | 用途 |
|------|------|------|
| 应用框架 | Electron | 桌面应用容器 |
| 语言 | TypeScript | 类型安全 |
| UI 框架 | React 18 | 用户界面 |
| LLM | node-llama-cpp | 本地推理 |
| 数据库 | better-sqlite3 | 数据持久化 |
| 构建工具 | Webpack/Vite | 打包编译 |
| 样式 | CSS3 | 界面美化 |
| 通信 | IPC | 进程间通信 |

## 🚀 关键特性

1. **分层架构**: 清晰的职责分离
2. **类型安全**: 全面的 TypeScript 类型定义
3. **本地优先**: 所有 AI 推理在本地运行
4. **可扩展**: 模块化设计便于添加新功能
5. **双构建系统**: 支持 Webpack 和 Vite

## 📝 下一步开发建议

1. 集成真实的股票数据 API（如 Alpha Vantage、Yahoo Finance）
2. 改进嵌入模型（使用专门的 embedding 模型）
3. 添加图表可视化（使用 Recharts 或 Chart.js）
4. 实现投资组合管理功能
5. 添加数据导出功能
