## Lumen AI 股票分析应用

基于 Electron + TypeScript + React 的 AI 股票分析应用，集成了本地 LLM 和 RAG 系统。

### 技术栈

- **Electron** - 桌面应用框架
- **TypeScript** - 类型安全
- **React** - UI 框架
- **node-llama-cpp** - 本地 LLM 推理
- **better-sqlite3** - 嵌入式数据库
- **RAG** - 检索增强生成系统
- **Webpack & Vite** - 构建工具

### 项目结构

```
lumen/
├── src/
│   ├── main/              # Electron 主进程代码
│   │   ├── index.ts       # 主进程入口
│   │   ├── db/            # 数据库相关
│   │   │   └── database.ts # better-sqlite3 数据库操作
│   │   ├── llm/           # LLM 相关
│   │   │   └── llama.ts   # node-llama-cpp 封装
│   │   └── rag/           # RAG 相关
│   │       └── store.ts   # RAG 向量存储
│   ├── renderer/          # 渲染进程代码 (React)
│   │   ├── index.tsx      # 渲染进程入口
│   │   ├── App.tsx        # 主组件
│   │   └── index.css      # 样式
│   └── preload/           # 预加载脚本
│       └── index.ts       # preload.ts
├── public/                # 静态资源
├── config/                # 配置文件
│   ├── webpack.main.config.js
│   ├── webpack.renderer.config.js
│   └── vite.config.js
├── package.json
├── tsconfig.json
└── electron-builder.json
```

### 安装依赖

```bash
npm install
```

### 开发模式

#### 使用 Webpack

```bash
npm run dev:webpack
```

这会同时启动主进程和渲染进程的监听。

#### 使用 Vite

```bash
npm run dev:vite
```

### 构建

#### Webpack 构建

```bash
npm run build:webpack
```

#### Vite 构建

```bash
npm run build:vite
```

#### 打包 Electron 应用

```bash
npm run build:electron
```

### 功能特性

1. **股票分析** - 输入股票代码，获取 AI 分析结果
2. **智能问答** - 基于 RAG 系统的问答功能
3. **本地 LLM** - 使用 node-llama-cpp 进行本地推理
4. **数据持久化** - 使用 better-sqlite3 存储数据

### 使用说明

1. 下载 GGUF 格式的模型文件到 `models/model.gguf`
2. 运行开发模式或构建应用
3. 在股票分析界面输入股票代码（如 AAPL）
4. 在智能问答界面提问

### 注意事项

- 需要下载兼容的 GGUF 模型文件
- 首次运行可能需要下载 node-llama-cpp 的二进制文件
- 建议使用 Node.js 18+ 版本

### License

MIT
