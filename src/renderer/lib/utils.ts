import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * shadcn/ui 标准的类名合并工具
 * 自动处理 Tailwind CSS 类名冲突
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化数字为带千分位的字符串
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * 格式化涨跌幅为带符号的百分比字符串
 */
export function formatChangePercent(percent: number): string {
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

/**
 * 根据涨跌幅获取语义化颜色类名
 */
export function getChangeColorClass(percent: number): string {
  if (percent > 0) return 'text-up';
  if (percent < 0) return 'text-down';
  return 'text-neutral';
}

/**
 * 根据涨跌幅获取语义化颜色值（用于 SVG 填充）
 */
export function getChangeColor(percent: number): string {
  if (percent > 0) return '#10b981';   // Emerald-500
  if (percent < 0) return '#f43f5e';   // Rose-500
  return '#3b82f6';                     // Blue-500
}

/**
 * 格式化时间为相对友好的显示格式
 */
export function formatTime(timeString: string): string {
  const date = new Date(timeString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
