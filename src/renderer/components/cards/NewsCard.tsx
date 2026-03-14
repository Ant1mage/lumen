import React from 'react';
import { cn, formatTime } from '@renderer/lib/utils';
import type { NewsItem } from '@renderer/types';

interface NewsCardProps {
  news: NewsItem;
  className?: string;
  showTimeLine?: boolean;
}

// 情绪标签配置
const sentimentConfig = {
  positive: {
    label: '利好',
    className: 'border-up text-up hover:bg-up/10',
  },
  negative: {
    label: '利空',
    className: 'border-down text-down hover:bg-down/10',
  },
  neutral: {
    label: '中性',
    className: 'border-neutral text-neutral hover:bg-neutral/10',
  },
  warning: {
    label: '预警',
    className: 'border-warning text-warning hover:bg-warning/10',
  },
};

/**
 * 新闻卡片组件
 * 垂直时间线结构，包含标题、时间、情绪标签和关联股票
 */
export const NewsCard: React.FC<NewsCardProps> = ({
  news,
  className,
  showTimeLine = true,
}) => {
  const sentiment = sentimentConfig[news.sentiment];
  
  return (
    <div
      className={cn(
        'group relative flex flex-col gap-2 rounded-lg border bg-card p-3',
        'transition-all duration-200 hover:bg-accent hover:text-accent-foreground',
        'cursor-pointer',
        className
      )}
    >
      {/* 时间线指示器（可选） */}
      {showTimeLine && (
        <div className="absolute -left-6 top-6 flex size-3 items-center justify-center">
          <div className="size-2 rounded-full bg-border group-hover:bg-primary" />
        </div>
      )}
      
      {/* 头部：标题和时间 */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium leading-snug">{news.title}</h3>
        <time
          className="shrink-0 font-mono text-xs text-muted-foreground"
          dateTime={news.publishTime}
        >
          {formatTime(news.publishTime)}
        </time>
      </div>
      
      {/* 底部标签栏 */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 情绪标签 */}
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
            'transition-colors hover:scale-105',
            sentiment.className
          )}
        >
          {sentiment.label}
        </span>
        
        {/* 关联股票胶囊 */}
        {news.relatedStocks.map((stock) => (
          <span
            key={stock}
            className={cn(
              'inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-mono',
              'transition-all hover:bg-accent hover:text-accent-foreground',
              'cursor-default'
            )}
          >
            ${stock}
          </span>
        ))}
      </div>
    </div>
  );
};
