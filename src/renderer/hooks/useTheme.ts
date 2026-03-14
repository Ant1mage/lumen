import { useState, useEffect } from 'react';

/**
 * 主题切换 Hook
 * 支持暗黑模式切换
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    // 检查系统偏好或本地存储
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  const toggleTheme = () => {
    setIsDark((prev) => {
      const newValue = !prev;
      
      if (newValue) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      
      return newValue;
    });
  };
  
  return { isDark, toggleTheme, theme: isDark ? 'dark' : 'light' };
}
