# 模型文件说明

请将 GGUF 格式的模型文件放置在此目录中。

## 推荐的模型

您可以从以下来源下载兼容的 GGUF 模型：

1. **Llama 2 系列**: https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF
2. **Mistral 系列**: https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF
3. **Phi 系列**: https://huggingface.co/TheBloke/phi-2-GGUF
4. **Qwen 系列**: https://huggingface.co/Qwen

## 使用方法

1. 下载 `.gguf` 格式的模型文件
2. 将文件重命名为 `model.gguf` 或更新 `src/main/llm/llama.ts` 中的路径配置
3. 运行应用

## 推荐文件大小

- 4GB-8GB: 适合大多数使用场景
- Q4_K_M 或 Q5_K_M 量化版本：在质量和性能之间取得良好平衡

## 自动机型适配

系统会根据您的机型自动调整以下参数：

### GPU Layers（GPU 层数）
- **Apple Silicon Max/Ultra** (M1/M2/M3 Max, 64GB+ RAM): 99 层（尽可能使用 GPU）
- **Apple Silicon Pro** (M1/M2/M3 Pro, 32GB+ RAM): 64 层
- **Apple Silicon Base** (M1/M2/M3, <32GB RAM): 32 层
- **Intel Mac 高配** (32GB+ RAM): 48 层
- **Intel Mac 低配** (<32GB RAM): 16 层

### Context Size（上下文长度）
- **Apple Silicon Max/Ultra**: 8192 tokens
- **Apple Silicon Pro**: 6144 tokens
- **Apple Silicon Base**: 4096 tokens
- **Intel Mac 高配**: 4096 tokens
- **Intel Mac 低配**: 3072 tokens

### Embedding 模型配置
- **Apple Silicon**: 默认使用 GPU 加速（99 层）
- **Intel Mac**: 根据配置使用 0-24 层 GPU

## 手动调整参数

您可以通过以下方式手动调整参数：

```typescript
// 在 UI 中调用 API
window.api.setModels({
  llmModelFile: 'Qwen3.5-4B-Q4_K_M.gguf',
  llmGpuLayers: 50,      // 设置为 null 使用自动推荐
  contextSize: 4096,     // 设置为 null 使用自动推荐
});
```

## 注意事项

- 首次启动时会自动检测机型并应用推荐配置
- 手动设置的参数会覆盖自动推荐值
- 设置为 `null` 或 `-1` 表示使用自动推荐
