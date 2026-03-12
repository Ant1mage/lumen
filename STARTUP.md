# 快速开始指南

## 1. 安装依赖

```bash
npm install
```

## 2. 下载模型文件

在运行应用之前，需要下载一个 GGUF 格式的 AI 模型文件：

1. 访问 https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF
2. 下载 `llama-2-7b-chat.Q4_K_M.gguf` (约 3.8GB)
3. 将文件放入 `models/` 目录并重命名为 `model.gguf`

或者使用较小的模型进行测试：
- Phi-2: https://huggingface.co/TheBloke/phi-2-GGUF
- Mistral-7B: https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF

## 3. 开发模式

### 使用 Webpack（推荐）

```bash
# 安装 concurrently（如果还没有全局安装）
npm install --save-dev concurrently

# 启动开发服务器
npm run dev:webpack
```

这会同时启动：
- 主进程监听（Webpack）
- 渲染进程开发服务器（Webpack Dev Server，端口 3000）

### 使用 Vite

```bash
# 启动 Vite 开发服务器
npm run dev:vite
```

注意：Vite 模式主要用于渲染进程的开发和测试。

## 4. 构建应用

### Webpack 构建

```bash
npm run build:webpack
```

这会在 `dist/` 目录生成生产版本。

### Vite 构建

```bash
npm run build:vite
```

### 打包为可执行文件

```bash
npm run build:electron
```

这会在 `release/` 目录生成平台特定的安装包。

## 5. 项目结构说明

```
lumen/
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── index.ts       # 主入口
│   │   ├── db/            # 数据库层
│   │   ├── llm/           # LLM 服务
│   │   └── rag/           # RAG 系统
│   ├── renderer/          # React 渲染进程
│   │   ├── components/    # UI 组件
│   │   ├── App.tsx        # 主组件
│   │   └── index.tsx      # 入口
│   └── preload/           # 预加载脚本
├── config/                # 构建配置
├── public/                # 静态资源
├── models/                # AI 模型文件
└── package.json
```

## 6. 功能说明

### 股票分析
- 输入股票代码（如 AAPL, GOOGL）
- 基于 RAG 检索相关文档
- 使用本地 LLM 生成分析报告

### 智能问答
- 支持自然语言提问
- 从数据库中检索相关信息
- 生成智能回答

### 数据管理
- 自动创建 SQLite 数据库
- 存储股票数据和文档
- 支持向量相似度搜索

## 7. 常见问题

### Q: 找不到模型文件
A: 确保已下载 GGUF 格式的模型到 `models/model.gguf`

### Q: node-llama-cpp 安装失败
A: 尝试重新安装：
```bash
npm rebuild node-llama-cpp
```

### Q: 开发服务器无法连接
A: 检查端口 3000 是否被占用，或查看控制台错误信息

### Q: TypeScript 编译错误
A: 这些是正常的（因为依赖还没安装），运行 `npm install` 后会解决

## 8. 下一步

1. 添加真实的股票数据 API
2. 改进嵌入模型以提高 RAG 精度
3. 添加更多股票分析功能
4. 优化 UI/UX

## 技术支持

如有问题，请查看：
- node-llama-cpp 文档：https://node-llama-cpp.gavinmn.com/
- Electron 文档：https://www.electronjs.org/docs
- better-sqlite3 文档：https://github.com/JoshuaWise/better-sqlite3
