#!/bin/bash

# --- 配置区 ---
REGISTRY="https://registry.npmjs.org/"

echo "------------------------------------------------"
echo "📦 pnpm 模式：重建 Lumen 原生环境"
echo "------------------------------------------------"

# 1. 彻底清理 npm 痕迹
echo "清理旧依赖与缓存..."
rm -rf node_modules
rm -rf ~/.cache/electron
rm -f package-lock.json
rm -f yarn.lock

# 2. 环境变量（针对本地编译）
export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=http://127.0.0.1:7890
export NODE_LLAMA_CPP_SKIP_DOWNLOAD=true
export npm_config_build_from_source=true

# 3. 使用 pnpm 安装
echo "正在通过 pnpm 安装依赖..."
pnpm install --registry=$REGISTRY --verbose

# 4. 针对 Electron 30 本地编译
# 注意：pnpm 模式下，我们依然使用 npx 运行 electron-rebuild
echo "正在为 M1 Mac 编译 node-llama-cpp 和 better-sqlite3..."
npx electron-rebuild -f -w node-llama-cpp,better-sqlite3

echo "------------------------------------------------"
echo "✅ pnpm 迁移完成！"