import { useState, useEffect } from 'react';
import type { NavCategory, Stock } from '@renderer/types';

/**
 * 股票数据 Hook
 * 实际应用中应该从 AkShare API 获取数据
 */
export function useStockData(category: NavCategory) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // TODO: 实际应用中替换为真实的 API 调用
    // const fetchStockData = async () => {
    //   try {
    //     const response = await fetch(`/api/stocks/${category}`);
    //     const data = await response.json();
    //     setStocks(data);
    //   } catch (err) {
    //     setError(err.message);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchStockData();
    
    // Mock 数据 - 实际应用中删除
    setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => {
      // 清理逻辑
    };
  }, [category]);
  
  return { stocks, loading, error };
}
