#!/bin/bash

# --- 配置区 ---
# 自动抓取 package.json 里的 electron 版本
ELECTRON_VERSION=$(node -p "require('./package.json').devDependencies.electron || require('./package.json').dependencies.electron")
# 淘宝最新镜像源
TAOBAO_REGISTRY="https://registry.npmmirror.com"
# Electron 二进制文件镜像
ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"

echo "------------------------------------------------"
echo "🚀 正在使用淘宝源重建 Lumen 环境..."
echo "📦 Electron 版本: $ELECTRON_VERSION"
echo "------------------------------------------------"

# 1. 深度清理
echo "正在清理旧依赖..."
rm -rf node_modules package-lock.json

# 2. 修复 Python 3.12 兼容性补丁
echo "配置 Python 环境..."
export PYTHON=$(which python3)
python3 -m pip install setuptools --break-system-packages --quiet

# 3. 设置淘宝源环境变量 (临时生效，不污染全局)
export npm_config_registry=$TAOBAO_REGISTRY
export ELECTRON_MIRROR=$ELECTRON_MIRROR

# 4. 执行安装
echo "正在通过淘宝源执行 npm install..."
npm install --registry=$TAOBAO_REGISTRY

# 5. 使用 npx 重建原生模块
echo "🛠️  正在使用 npx 重建 node-llama-cpp 和 better-sqlite3..."
# 环境变量确保 node-llama-cpp 走本地编译
export NODE_LLAMA_CPP_SKIP_DOWNLOAD=true
npx electron-rebuild -f -v $ELECTRON_VERSION -w node-llama-cpp,better-sqlite3

echo "------------------------------------------------"
echo "✅ 重建完成！"
echo "尝试运行: npm run dev"