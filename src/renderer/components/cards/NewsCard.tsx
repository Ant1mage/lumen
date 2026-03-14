import React from 'react';
import { Badge } from '../ui/badge';

// 新闻情感类型
type Sentiment = 'positive' | 'negative' | 'neutral' | 'warning';

// 关联股票类型
interface RelatedStock {
  symbol: string;
  name: string;
}

// 新闻卡片组件属性
interface NewsCardProps {
  title: string;
  content: string;
  timestamp: string;
  sentiment: Sentiment;
  relatedStocks?: RelatedStock[];
  onClick?: () => void;
}

// 情感标签映射
const sentimentConfig: Record<Sentiment, { label: string; variant: any }> = {
  positive: { label: '利好', variant: 'up' },
  negative: { label: '利空', variant: 'down' },
  neutral: { label: '中性', variant: 'neutral' },
  warning: { label: '预警', variant: 'warning' },
};

export const NewsCard: React.FC<NewsCardProps> = ({ 
  title, 
  content, 
  timestamp, 
  sentiment, 
  relatedStocks = [],
  onClick 
}) => {
  const { label, variant } = sentimentConfig[sentiment];

  return (
    <div 
      className="p-4 rounded-lg border hover-card cursor-pointer transition-all duration-200 group"
      onClick={onClick}
    >
      {/* 标题 */}
      <h3 className="text-sm font-medium text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      
      {/* 内容摘要 */}
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {content}
      </p>
      
      {/* 底部信息栏 */}
      <div className="flex items-center justify-between">
        {/* 时间戳 */}
        <div className="text-xs font-mono text-muted-foreground">
          {timestamp}
        </div>
        
        {/* 标签栏 */}
        <div className="flex items-center gap-2">
          {/* 情感标签 */}
          <Badge variant={variant} className="text-xs px-2 py-0.5">
            {label}
          </Badge>
          
          {/* 关联股票 */}
          {relatedStocks.length > 0 && (
            <div className="flex gap-1">
              {relatedStocks.slice(0, 3).map((stock, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                >
                  {stock.symbol}
                </span>
              ))}
              {relatedStocks.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                  +{relatedStocks.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 时间线容器组件
interface NewsTimelineProps {
  newsItems: NewsCardProps[];
  className?: string;
}

export const NewsTimeline: React.FC<NewsTimelineProps> = ({ 
  newsItems, 
  className = '' 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {newsItems.map((item, index) => (
        <div key={index} className="relative pl-6">
          {/* 时间线指示器 */}
          <div className="absolute left-0 top-6 w-4 h-0.5 bg-border"></div>
          <div className="absolute left-0 top-4 w-2 h-2 rounded-full bg-primary"></div>
          
          <NewsCard {...item} />
        </div>
      ))}
    </div>
  );
};

// 默认导出 NewsCard
export default NewsCard;