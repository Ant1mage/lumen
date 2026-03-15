# Assistant-UI 集成指南

## ✅ 已完成的工作

### 1. 依赖安装
```bash
pnpm add @assistant-ui/react ai zod
```

### 2. 核心文件创建

#### `/src/renderer/lib/lumen-runtime-adapter.ts`
✨ **转发层/适配器** - 将 LumenCore 适配到 assistant-ui 的运行时接口

**核心功能:**
- ✅ 接收 LumenCore 的 IPC 通信
- ✅ 转换为 assistant-ui 的 `ChatModelAdapter` 格式
- ✅ 支持流式 token 输出
- ✅ 预留云端模型接口（未来扩展）

**使用方式:**
```typescript
import { lumenLocalAdapter } from '@renderer/lib/lumen-runtime-adapter'

// 当前：使用本地 Llama 模型
const adapter = lumenLocalAdapter

// 未来：切换到云端大模型
const adapter = createLumenAdapter({
  mode: 'cloud',
  cloudConfig: {
    apiEndpoint: '/api/chat',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4'
  }
})
```

#### `/src/renderer/components/chat/ai-chat-panel-assistant.tsx`
🎨 **新的 Chat Panel** - 使用 assistant-ui 渲染

**特性:**
- ✅ 使用 `ThreadPrimitive` 组件
- ✅ 自定义消息渲染（UserMessage、AssistantMessage）
- ✅ 自动滚动、加载状态管理
- ✅ 完整的 TypeScript 支持

## 🏗️ 架构设计

### 整体架构

```
┌─────────────────────────────────────────┐
│   React Component (ai-chat-panel)       │
│                                         │
│  <AssistantRuntimeProvider runtime={..}>│
│    <ThreadPrimitive.Viewport>           │
│      <ThreadPrimitive.Messages />       │
│    </ThreadPrimitive.Viewport>          │
│  </AssistantRuntimeProvider>            │
└──────────────┬──────────────────────────┘
               │
               │ useLocalRuntime Hook
               ↓
┌─────────────────────────────────────────┐
│  Lumen Runtime Adapter (转发层)         │
│                                         │
│  - ChatModelAdapter                     │
│  - 消息格式转换                          │
│  - 流式响应处理                          │
└──────────────┬──────────────────────────┘
               │
               │ window.lumen_core (IPC)
               ↓
┌─────────────────────────────────────────┐
│       LumenCore (Main Process)          │
│                                         │
│  - 本地 Llama 模型                        │
│  - RAG 检索增强                           │
│  - Token 流式输出                         │
└─────────────────────────────────────────┘
```

### 数据流

1. **用户发送消息** → assistant-ui Thread 组件
2. **Thread 调用** → `runtime.startRun()`
3. **Adapter 处理** → `run()` 方法
4. **转发到 LumenCore** → `window.lumen_core.sendMessage()`
5. **流式响应** → `onToken(token)` 回调
6. **更新 UI** → assistant-ui 自动渲染

## 🚀 快速开始

### 基础使用

```typescript
import { AIChatPanelWithAssistant } from '@/renderer/components/chat/ai-chat-panel-assistant'

function App() {
  return <AIChatPanelWithAssistant />
}
```

### 替换现有的 chat-panel

在 `App.tsx` 或主界面中：

```diff
- import { AIChatPanel } from './components/chat/ai-chat-panel'
+ import { AIChatPanelWithAssistant } from './components/chat/ai-chat-panel-assistant'

- <AIChatPanel />
+ <AIChatPanelWithAssistant />
```

## 📋 API 参考

### createLumenAdapter(config)

创建 LumenCore 适配器

#### Options

```typescript
interface LumenRuntimeConfig {
  mode: 'local' | 'cloud'
  cloudConfig?: {
    apiEndpoint: string
    apiKey?: string
    model?: string
  }
}
```

#### Return Value

```typescript
ChatModelAdapter {
  run: async (options: ChatModelRunOptions) => {
    // 实现细节
  }
}
```

### AIChatPanelWithAssistant

完整的聊天面板组件

#### Props

无（所有配置通过 adapter 处理）

#### 自定义消息样式

```typescript
<ThreadPrimitive.Messages
  components={{
    UserMessage: CustomUserMessage,
    AssistantMessage: CustomAssistantMessage,
  }}
/>
```

## 🔄 切换到云端模型

### Phase 1: 准备云端 API

在主进程中创建 API handler：

```typescript
// src/main/api/cloud-chat.ts
import { ipcMain } from 'electron'

ipcMain.handle('cloud-chat', async (event, { messages }) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages,
      stream: true,
    }),
  })

  // 处理流式响应...
})
```

### Phase 2: 修改 adapter 配置

```typescript
// 从本地切换到云端
const adapter = createLumenAdapter({
  mode: 'cloud',
  cloudConfig: {
    apiEndpoint: '/api/cloud-chat',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    model: 'gpt-4'
  }
})
```

### Phase 3: 无需修改 UI

由于 adapter 层的存在，UI 组件完全不需要修改！

## 🎯 优势

### 1. **关注点分离**
- ✅ UI 层：assistant-ui 负责渲染
- ✅ 逻辑层：adapter 负责消息处理
- ✅ 模型层：LumenCore/云端 API 负责生成

### 2. **灵活切换**
- ✅ 本地/云端无缝切换
- ✅ 多模型支持（通过配置）
- ✅ 成本优化（简单问题本地，复杂问题云端）

### 3. **易于测试**
- ✅ 可以独立测试 adapter
- ✅ 可以 mock 模型响应
- ✅ 可以测试不同场景

### 4. **未来扩展**
- ✅ 支持多模态（图片、文件）
- ✅ 支持工具调用
- ✅ 支持函数执行

## ⚠️ 注意事项

### 1. unstable_前缀

assistant-ui v0.0.29 的部分 API 带有 `unstable_` 前缀：

```typescript
import { 
  unstable_useLocalRuntime as useLocalRuntime,
  unstable_ChatModelAdapter as ChatModelAdapter,
} from '@assistant-ui/react'
```

这些 API 在未来版本可能会变化，升级时需注意。

### 2. 类型安全

为了简化实现，部分地方使用了 `any` 类型。可以在后续改进中加强类型检查。

### 3. React 版本

当前使用 React 19.1.0，assistant-ui 的 peer dependency 警告可以忽略。

## 📚 相关文件

- [lumen-runtime-adapter.ts](/src/renderer/lib/lumen-runtime-adapter.ts) - 核心适配器
- [ai-chat-panel-assistant.tsx](/src/renderer/components/chat/ai-chat-panel-assistant.tsx) - UI 组件
- [Vercel AI SDK集成](/docs/Vercel-AI-SDK-集成总结.md) - 另一种方案（已废弃）

## 🔮 下一步计划

- [ ] 完善错误处理和重试机制
- [ ] 添加消息历史管理
- [ ] 支持多轮对话优化
- [ ] 实现云端模型接入
- [ ] 添加打字机效果优化
- [ ] 支持 Markdown 渲染
- [ ] 支持代码高亮

## 💡 最佳实践

### 1. 使用 adapter 层
始终通过 adapter 层与模型交互，不要在 UI 组件中直接调用 LumenCore。

### 2. 保持配置化
将模型选择、API endpoint 等配置化，便于切换和测试。

### 3. 错误处理
在 adapter 层统一处理错误，UI 层只负责显示。

### 4. 性能优化
对于大量消息的场景，考虑虚拟滚动等优化手段。

---

**恭喜！** 你现在拥有了一个现代化的、可扩展的聊天界面架构！🎊
