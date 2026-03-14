import React, { useMemo, memo } from 'react';
import { Badge } from '../ui/badge';

// Sparkline 图表组件 - 使用 memo 优化
interface SparklineProps {
  prices: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
}

const SparklineComponent: React.FC<SparklineProps> = ({ 
  prices, 
  width = 120, 
  height = 40,
  strokeColor = 'currentColor',
  fillColor = 'currentColor'
}) => {
  const { pathData, fillData } = useMemo(() => {
    if (!prices || prices.length < 2) {
      return { pathData: '', fillData: '' };
    }

    // 数据标准化到 0-1 范围
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // 生成点坐标
    const points = prices.map((price, index) => {
      const x = (index / (prices.length - 1)) * width;
      const y = height - ((price - minPrice) / priceRange) * height;
      return { x, y };
    });

    // 生成贝塞尔曲线路径
    let path = `M ${points[0].x},${points[0].y}`;
    let fillPath = `M ${points[0].x},${height} L ${points[0].x},${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const prev = points[i - 1];
      
      // 控制点（简化版贝塞尔曲线）
      const cx1 = (prev.x + current.x) / 2;
      const cy1 = prev.y;
      const cx2 = (prev.x + current.x) / 2;
      const cy2 = current.y;
      
      path += ` C ${cx1},${cy1} ${cx2},${cy2} ${current.x},${current.y}`;
      fillPath += ` C ${cx1},${cy1} ${cx2},${cy2} ${current.x},${current.y}`;
    }

    fillPath += ` L ${points[points.length - 1].x},${height} Z`;

    return { pathData: path, fillData: fillPath };
  }, [prices, width, height]);

  if (!pathData) return null;

  return (
    <div className="sparkline-container" style={{ width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkline-svg">
        {/* 填充区域 */}
        <path
          d={fillData}
          fill={fillColor}
          fillOpacity="0.2"
          className="sparkline-fill"
        />
        {/* 线条 */}
        <path
          d={pathData}
          stroke={strokeColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="sparkline-path"
        />
      </svg>
    </div>
  );
};

// 使用 memo 包装 Sparkline 组件，只有 props 变化时才重新渲染
const Sparkline = memo(SparklineComponent);

// 股票卡片组件 - 使用 memo 优化
interface StockCardProps {
  symbol: string;
  name: string;
  currentPrice: number;
  changePercent: number;
  prices: number[];
  onClick?: () => void;
}

const StockCardComponent: React.FC<StockCardProps> = ({ 
  symbol, 
  name, 
  currentPrice, 
  changePercent, 
  prices,
  onClick 
}) => {
  // 根据涨跌幅确定颜色和样式
  const isUp = changePercent > 0;
  const isDown = changePercent < 0;
  const variant = isUp ? 'up' : isDown ? 'down' : 'neutral';
  
  // 格式化价格和涨跌幅
  const formattedPrice = currentPrice.toFixed(2);
  const formattedChange = `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`;

  return (
    <div 
      className="p-4 rounded-lg border hover-card cursor-pointer transition-all duration-200 group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground truncate">{name}</div>
          <div className="text-xs text-muted-foreground font-mono truncate">{symbol}</div>
        </div>
        <div className="ml-3 flex-shrink-0">
          <Sparkline 
            prices={prices} 
            width={80} 
            height={30}
            strokeColor={isUp ? '#10b981' : isDown ? '#f43f5e' : '#3b82f6'}
            fillColor={isUp ? '#10b981' : isDown ? '#f43f5e' : '#3b82f6'}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-end">
        <div>
          <div className="font-mono font-bold text-lg text-foreground">
            ¥{formattedPrice}
          </div>
          <Badge variant={variant} className="mt-1">
            {formattedChange}
          </Badge>
        </div>
      </div>
    </div>
  );
};

// 使用 memo 包装 StockCard 组件，props 不变时不重新渲染
export const StockCard = memo(StockCardComponent);

// 默认导出
export default StockCardComponent;