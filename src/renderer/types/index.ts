// 股票数据类型定义
export interface Stock {
  symbol: string;           // 股票代码，如 "600519"
  name: string;             // 股票简称，如 "贵州茅台"
  currentPrice: number;     // 当前价格
  changePercent: number;    // 涨跌幅百分比
  prices: number[];         // 历史价格数组（用于 Sparkline）
  market?: string;          // 市场标识，如 "A 股", "港股", "美股"
}

// 新闻数据类型定义
export interface NewsItem {
  id: string;               // 新闻唯一标识
  title: string;            // 新闻标题
  content?: string;         // 新闻摘要（可选）
  publishTime: string;      // 发布时间（ISO 字符串或格式化时间）
  sentiment: 'positive' | 'negative' | 'neutral' | 'warning'; // 情绪标签
  relatedStocks: string[];  // 关联股票代码列表
  source?: string;          // 新闻来源（可选）
}

// 导航分类类型
export type NavCategory = 
  | 'a-share'    // A 股
  | 'hk-share'   // 港股
  | 'us-share'   // 美股
  | 'futures'    // 期货
  | 'energy';    // 能源

// 导航项类型
export interface NavItem {
  id: NavCategory;
  label: string;
  icon: string;
}

// 聊天消息类型
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// 布局配置类型
export interface LayoutConfig {
  leftWidth: number;      // 左侧导航宽度
  middleWidth: number;    // 中间区域宽度
  rightMinWidth: number;  // 右侧最小宽度
}
