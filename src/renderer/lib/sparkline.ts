/**
 * Sparkline 迷你图算法工具
 * 使用三次贝塞尔曲线生成平滑的股价走势线
 */

interface Point {
  x: number;
  y: number;
}

/**
 * 将价格数据映射到 SVG 坐标系
 */
export function mapPricesToCoordinates(
  prices: number[],
  width: number,
  height: number,
  padding: number = 4
): Point[] {
  if (prices.length === 0) return [];
  
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1; // 避免除零
  
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  
  return prices.map((price, index) => {
    const x = padding + (index / (prices.length - 1)) * innerWidth;
    // Y 轴反转（SVG 坐标系原点在左上角）
    const y = padding + (1 - (price - minPrice) / priceRange) * innerHeight;
    
    return { x, y };
  });
}

/**
 * 使用三次贝塞尔曲线生成平滑路径
 * 基于 Catmull-Rom 样条曲线算法
 */
export function createSmoothPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  
  // 构建平滑的贝塞尔曲线路径
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    
    if (i === 0) {
      // 起点：使用简单的二次曲线
      const midX = (p0.x + p1.x) / 2;
      const midY = (p0.y + p1.y) / 2;
      path += ` Q ${p0.x} ${p0.y} ${midX} ${midY}`;
    } else {
      // 中间点：使用三次贝塞尔曲线
      const prevPoint = points[i - 1];
      const midX = (p0.x + p1.x) / 2;
      const midY = (p0.y + p1.y) / 2;
      
      // 计算控制点
      const cp1x = p0.x + (midX - prevPoint.x) / 2;
      const cp1y = p0.y + (midY - prevPoint.y) / 2;
      const cp2x = midX - (p1.x - midX) / 2;
      const cp2y = midY - (p1.y - midY) / 2;
      
      path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${midX} ${midY}`;
    }
  }
  
  // 连接到最后一个点
  const lastPoint = points[points.length - 1];
  path += ` L ${lastPoint.x} ${lastPoint.y}`;
  
  return path;
}

/**
 * 生成 Sparkline 的 SVG 路径和渐变填充
 */
export function generateSparklinePath(
  prices: number[],
  width: number,
  height: number,
  changePercent: number
): {
  strokeLine: string;
  fillArea: string;
  strokeColor: string;
  gradientId: string;
} {
  const points = mapPricesToCoordinates(prices, width, height);
  const strokeLine = createSmoothPath(points);
  
  // 生成填充区域的路径（闭合路径）
  const fillArea = points.length > 0
    ? `${strokeLine} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
    : '';
  
  const strokeColor = getChangeColor(changePercent);
  const gradientId = `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return { strokeLine, fillArea, strokeColor, gradientId };
}

/**
 * 获取涨跌颜色的十六进制值
 */
function getChangeColor(percent: number): string {
  if (percent > 0) return '#10b981';   // Emerald-500
  if (percent < 0) return '#f43f5e';   // Rose-500
  return '#3b82f6';                     // Blue-500
}
