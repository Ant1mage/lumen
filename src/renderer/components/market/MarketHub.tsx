import React, { useMemo } from 'react';
import { PanelGroup, Panel } from '@renderer/components/ui/resizable';
import { StockCard } from '../cards/StockCard';
import { NewsCard } from '../cards/NewsCard';
import type { NavCategory, Stock, NewsItem } from '@renderer/types';

interface MarketHubProps {
  activeCategory: NavCategory;
}

// Mock 股票数据
const mockStocks: Record<NavCategory, Stock[]> = {
  'a-share': [
    { symbol: '600519', name: '贵州茅台', currentPrice: 1678.50, changePercent: 2.35, prices: [1650, 1655, 1660, 1658, 1665, 1670, 1675, 1678], market: 'A 股' },
    { symbol: '000858', name: '五粮液', currentPrice: 142.80, changePercent: -1.20, prices: [145, 144, 143, 144, 143, 142, 143, 142.8], market: 'A 股' },
    { symbol: '300750', name: '宁德时代', currentPrice: 185.60, changePercent: 3.45, prices: [178, 180, 182, 181, 183, 184, 185, 185.6], market: 'A 股' },
    { symbol: '601318', name: '中国平安', currentPrice: 42.15, changePercent: 0.85, prices: [41.5, 41.8, 42, 41.9, 42, 42.1, 42.1, 42.15], market: 'A 股' },
    { symbol: '600036', name: '招商银行', currentPrice: 32.80, changePercent: -0.50, prices: [33, 32.9, 32.8, 32.9, 32.8, 32.7, 32.8, 32.8], market: 'A 股' },
  ],
  'hk-share': [
    { symbol: '0700', name: '腾讯控股', currentPrice: 368.40, changePercent: 1.80, prices: [360, 362, 365, 364, 366, 367, 368, 368.4], market: '港股' },
    { symbol: '9988', name: '阿里巴巴', currentPrice: 78.50, changePercent: -2.10, prices: [80, 79, 78, 79, 78, 77, 78, 78.5], market: '港股' },
  ],
  'us-share': [
    { symbol: 'AAPL', name: '苹果', currentPrice: 178.35, changePercent: 0.95, prices: [176, 177, 177.5, 178, 177.8, 178, 178.2, 178.35], market: '美股' },
    { symbol: 'TSLA', name: '特斯拉', currentPrice: 245.60, changePercent: -3.20, prices: [255, 252, 250, 248, 247, 246, 245, 245.6], market: '美股' },
  ],
  'futures': [
    { symbol: 'AU2406', name: '黄金 2406', currentPrice: 545.80, changePercent: 1.25, prices: [538, 540, 542, 541, 543, 544, 545, 545.8], market: '期货' },
    { symbol: 'AG2406', name: '白银 2406', currentPrice: 6850.00, changePercent: 2.10, prices: [6700, 6750, 6780, 6800, 6820, 6830, 6840, 6850], market: '期货' },
  ],
  'energy': [
    { symbol: 'CL', name: '原油', currentPrice: 78.45, changePercent: -1.80, prices: [80, 79.5, 79, 78.8, 78.5, 78.3, 78.4, 78.45], market: '能源' },
    { symbol: 'NG', name: '天然气', currentPrice: 2.15, changePercent: 0.50, prices: [2.1, 2.12, 2.13, 2.14, 2.13, 2.14, 2.15, 2.15], market: '能源' },
  ],
};

// Mock 新闻数据
const mockNews: NewsItem[] = [
  {
    id: '1',
    title: '央行宣布降准 0.25 个百分点，释放长期资金约 1 万亿元',
    publishTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    sentiment: 'positive',
    relatedStocks: ['600519', '000858', '601318'],
  },
  {
    id: '2',
    title: '宁德时代发布新一代麒麟电池，能量密度提升 15%',
    publishTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    sentiment: 'positive',
    relatedStocks: ['300750'],
  },
  {
    id: '3',
    title: '国际油价波动加剧，多家投行下调 Brent 原油预期',
    publishTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    sentiment: 'warning',
    relatedStocks: ['CL'],
  },
  {
    id: '4',
    title: '美联储会议纪要显示利率政策将保持谨慎',
    publishTime: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    sentiment: 'neutral',
    relatedStocks: ['AAPL', 'TSLA'],
  },
  {
    id: '5',
    title: '贵州茅台一季度营收同比增长 18%，超预期增长',
    publishTime: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    sentiment: 'positive',
    relatedStocks: ['600519'],
  },
];

/**
 * 市场情报枢纽组件
 * 包含股票列表和新闻时间线两个可调整面板
 */
export const MarketHub: React.FC<MarketHubProps> = ({ activeCategory }) => {
  const stocks = useMemo(() => mockStocks[activeCategory], [activeCategory]);
  
  return (
    <div className="flex h-full flex-col">
      {/* 标题栏 */}
      <div className="flex items-center border-b bg-card px-4 py-2">
        <h2 className="text-sm font-semibold">市场情报</h2>
      </div>
      
      {/* 可调整面板组：股票列表 + 新闻时间线 */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          {/* 左侧：股票列表 */}
          <Panel defaultSize={50} minSize={30} className="border-r">
            <div className="flex h-full flex-col">
              <div className="border-b bg-muted/30 px-3 py-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  股票行情
                </span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-3 scrollbar-hide">
                {stocks.map((stock) => (
                  <StockCard key={stock.symbol} stock={stock} />
                ))}
              </div>
            </div>
          </Panel>
          
          {/* 右侧：新闻时间线 */}
          <Panel defaultSize={50} minSize={30}>
            <div className="flex h-full flex-col">
              <div className="border-b bg-muted/30 px-3 py-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  实时新闻
                </span>
              </div>
              <div className="relative flex-1 space-y-3 overflow-y-auto p-3 pl-6 scrollbar-hide">
                {/* 时间线贯穿虚线 */}
                <div className="absolute left-4 top-3 bottom-3 w-px border-l border-dashed border-border" />
                
                {mockNews.map((news) => (
                  <NewsCard key={news.id} news={news} showTimeLine />
                ))}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};
