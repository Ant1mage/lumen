#!/bin/bash

# --- 配置区 ---
# 自动抓取 package.json 里的 electron 版本
ELECTRON_VERSION=$(node -p "require('./package.json').devDependencies.electron || require('./package.json').dependencies.electron")

echo "------------------------------------------------"
echo "🚀 正在重建 Lumen 环境..."
echo "📦 Electron 版本：$ELECTRON_VERSION"
echo "------------------------------------------------"

# 1. 深度清理
echo "正在清理旧依赖..."
rm -rf node_modules pnpm-lock.yaml

# 2. 修复 Python 3.12 兼容性补丁
echo "配置 Python 环境..."
export PYTHON=$(which python3)
python3 -m pip install setuptools --break-system-packages --quiet

# 3. 使用 pnpm 执行安装（.npmrc 已配置淘宝源）
echo "正在执行 pnpm install..."
pnpm install

# 4. 强制重建特定的原生模块（使用 electron-rebuild）
echo "🛠️  强制重建 node-llama-cpp 和 better-sqlite3..."
# 使用 electron-rebuild 确保与 Electron 版本匹配
npx electron-rebuild -f

echo "------------------------------------------------"
echo "✅ 重建完成！"
echo "尝试运行：pnpm run dev"