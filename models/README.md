# 模型文件说明

请将 GGUF 格式的模型文件放置在此目录中。

## 推荐的模型

您可以从以下来源下载兼容的 GGUF 模型：

1. **Llama 2 系列**: https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF
2. **Mistral 系列**: https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF
3. **Phi 系列**: https://huggingface.co/TheBloke/phi-2-GGUF

## 使用方法

1. 下载 `.gguf` 格式的模型文件
2. 将文件重命名为 `model.gguf` 或更新 `src/main/llm/llama.ts` 中的路径配置
3. 运行应用

## 推荐文件大小

- 4GB-8GB: 适合大多数使用场景
- Q4_K_M 或 Q5_K_M 量化版本：在质量和性能之间取得良好平衡
