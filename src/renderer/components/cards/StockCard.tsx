import React, { useMemo } from 'react';
import { cn, formatNumber, formatChangePercent, getChangeColor } from '@renderer/lib/utils';
import { generateSparklinePath } from '@renderer/lib/sparkline';
import type { Stock } from '@renderer/types';

interface StockCardProps {
  stock: Stock;
  className?: string;
}

/**
 * 股票卡片组件
 * 包含：股票信息、Sparkline 迷你图、现价和涨跌幅
 */
export const StockCard: React.FC<StockCardProps> = React.memo(({ stock, className }) => {
  // Sparkline 配置
  const sparklineWidth = 120;
  const sparklineHeight = 40;
  
  // 使用 useMemo 缓存 Sparkline 路径计算结果
  const sparklineData = useMemo(() => {
    return generateSparklinePath(
      stock.prices,
      sparklineWidth,
      sparklineHeight,
      stock.changePercent
    );
  }, [stock.prices, stock.changePercent]);
  
  return (
    <div
      className={cn(
        'group relative flex items-center gap-3 rounded-lg border bg-card p-3',
        'transition-all duration-200 hover:bg-accent hover:text-accent-foreground',
        'cursor-pointer',
        className
      )}
    >
      {/* 左侧区：股票信息 */}
      <div className="flex min-w-[80px] flex-col">
        <span className="text-sm font-bold leading-tight">{stock.name}</span>
        <span className="mt-1 text-xs font-mono text-muted-foreground">
          {stock.symbol}
        </span>
      </div>
      
      {/* 中间区：Sparkline 迷你图 */}
      <div className="relative h-10 flex-1">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${sparklineWidth} ${sparklineHeight}`}
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          <defs>
            <linearGradient
              id={sparklineData.gradientId}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={sparklineData.strokeColor}
                stopOpacity={0.2}
              />
              <stop
                offset="100%"
                stopColor={sparklineData.strokeColor}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          
          {/* 填充区域 */}
          <path
            d={sparklineData.fillArea}
            fill={`url(#${sparklineData.gradientId})`}
            stroke="none"
          />
          
          {/* 走势线 */}
          <path
            d={sparklineData.strokeLine}
            fill="none"
            stroke={sparklineData.strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      {/* 右侧区：价格和涨跌幅 */}
      <div className="flex min-w-[70px] flex-col items-end">
        <span className="font-mono text-sm font-bold">
          {formatNumber(stock.currentPrice)}
        </span>
        <span
          className={cn(
            'mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            stock.changePercent > 0 && 'bg-up/10 text-up',
            stock.changePercent < 0 && 'bg-down/10 text-down',
            stock.changePercent === 0 && 'bg-neutral/10 text-neutral'
          )}
        >
          {formatChangePercent(stock.changePercent)}
        </span>
      </div>
    </div>
  );
});

StockCard.displayName = 'StockCard';
