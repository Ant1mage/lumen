# Lumen 项目 UI/UX 开发需求文档 (v1.0)

## 1. 视觉规范与主题 (Theming)
* **模式支持**：必须支持原生暗黑模式切换。
* **暗黑模式 (Modern Dark)**：采用 Zinc 系列。底色 `Zinc-950` (#09090b)，卡片/容器 `Zinc-900` (#18181b)，边框 `Zinc-800` (#27272a)。
* **日间模式 (Clean Light)**：底色 `Zinc-50` (#fafafa)，卡片纯白 (#ffffff)，边框 `Zinc-200` (#e4e4e7)。
* **交互动效**：所有可点击区域（Tab、股票条目、新闻卡片）统一配置 `hover:bg-accent` 高亮，并保持平滑的 `transition-all`。
* **语义化颜色**：
    * 涨幅 (Up)：`Emerald-500` (#10b981)
    * 跌幅 (Down)：`Rose-500` (#f43f5e)
    * 中性 (Neutral)：`Blue-500` (#3b82f6)
    * 预警 (Warning)：`Orange-500` (#f97316)

## 2. 核心布局架构 (Three-Section Layout)
采用 **左-中-右** 三段式横向布局，基于 `shadcn/ui` 的 `ResizablePanelGroup` 实现：

### 2.1 左侧：分类导航 (Navigation Sidebar)
* **容器**：极窄宽度（约 64px - 80px）。
* **功能**：垂直 Tab 切换。
* **顶部/中部**：国内股票 (A股)、港股、美股、期货、能源。点击切换中间层数据流。
* **底部**：固定底部的设置 (Settings) 按钮，带图标与悬浮提示。

### 2.2 中间：市场情报枢纽 (Market & News Hub)
内部使用水平 `ResizablePanel` 分为两部分：

#### 2.2.1 股票列表 (Stock Scroll List)
* **布局**：瀑布流/垂直滚动列表，隐藏滚动条但支持平滑滚动。
* **子项 (StockCard)**：
    * **左侧区**：垂直排列。上方为股票简称 (font-bold)，下方为代码 (text-xs text-muted-foreground mono)。
    * **中间区**：**Sparkline 迷你图**。
        * **技术规格**：使用 SVG 绘制平滑贝塞尔曲线。去掉坐标轴与网格。
        * **算法**：接收 `prices: number[]`，线性映射至坐标系。使用三次贝塞尔曲线 (Cubic Bezier) 平滑路径。
        * **渲染**：Stroke 宽度 `2px`。下方填充 `linearGradient` 渐变（从涨跌色 20% 透明度降至全透明）。
    * **右侧区**：上方现价 (font-mono, font-bold)，下方涨跌幅百分比徽章 (Badge)。

#### 2.2.2 实时新闻 (News Timeline)
* **布局**：垂直时间线结构，左侧带贯穿虚线。
* **子项 (NewsCard)**：
    * **头部**：新闻标题 (text-sm, leading-snug) 及发布时间点 (font-mono)。
    * **底部标签栏**：
        * **情绪标签 (Sentiment)**：利好 (绿)、预警 (橙)、中性 (蓝) 的小尺寸 Outline Badge。
        * **关联股票 (Stocks)**：展示为微型胶囊气泡 (如 `$600519`)，悬浮高亮。

### 2.3 右侧：AI 智能助手 (AI Assistant Panel)
* **布局**：垂直伸缩排列。
* **展示区**：集成 `shadcn-chatbot-kit`。支持 Markdown 渲染、代码高亮（Shiki）、流式文本自动补全。
* **输入区**：底端固定 `ChatInput`。支持自动高度、清空按钮及发送状态反馈。

## 3. 技术约束与依赖 (Technical Specs)
* **UI 框架**：React + Tailwind CSS。
* **基础组件**：严格基于 `shadcn/ui`。
* **AI 渲染**：使用 `shadcn-chatbot-kit` 规范。
* **数据逻辑**：
    * 股票数据：对接 `AkShare` (目前先实现 A 股展示)。
    * 新闻数据：现阶段使用 Mock 假数据填充。
* **性能要求**：Electron 渲染进程内需保持 60fps，Sparkline 绘制需进行 Memo 优化，防止列表滚动卡顿。

## 4. 任务目标
1. 请生成符合该需求的 **Worktree 目录结构**。
2. 生成 `MainLayout.tsx` 顶层布局代码。
3. 生成 `StockCard.tsx`（含 SVG 曲线算法）与 `NewsCard.tsx` 组件代码。