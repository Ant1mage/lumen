import React from 'react';
import { cn } from '@renderer/lib/utils';
import type { NavCategory } from '@renderer/types';

interface NavSidebarProps {
  activeCategory: NavCategory;
  onCategoryChange: (category: NavCategory) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onSettingsClick?: () => void;
}

const navItems: Array<{ id: NavCategory; label: string; icon: string }> = [
  { id: 'a-share', label: 'A 股', icon: '🇨🇳' },
  { id: 'hk-share', label: '港股', icon: '🇭🇰' },
  { id: 'us-share', label: '美股', icon: '🇺🇸' },
  { id: 'futures', label: '期货', icon: '📊' },
  { id: 'energy', label: '能源', icon: '⚡' },
];

/**
 * 左侧导航侧边栏组件
 * 极窄宽度设计，垂直 Tab 切换
 */
export const NavSidebar: React.FC<NavSidebarProps> = ({
  activeCategory,
  onCategoryChange,
  collapsed = false,
  onCollapsedChange,
  onSettingsClick,
}) => {
  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-background transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* 顶部 Header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              L
            </div>
            <span className="font-semibold">Lumen</span>
          </div>
        )}
        <button
          onClick={() => onCollapsedChange?.(!collapsed)}
          className={cn(
            "rounded-lg p-2 transition-colors hover:bg-accent",
            collapsed && "mx-auto"
          )}
          title={collapsed ? "展开" : "收起"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("transition-transform", collapsed && "rotate-180")}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* 导航项目区 */}
      <div className="flex-1 space-y-2 py-4 px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onCategoryChange(item.id)}
            className={cn(
              'group relative flex w-full items-center rounded-lg transition-all duration-200',
              'hover:bg-accent hover:text-accent-foreground',
              activeCategory === item.id && 'bg-accent text-accent-foreground',
              collapsed ? 'justify-center py-3' : 'justify-start px-3 py-2'
            )}
            title={collapsed ? item.label : undefined}
          >
            <span className="text-xl min-w-[24px]">{item.icon}</span>
            {!collapsed && (
              <span className="ml-3 text-sm font-medium whitespace-nowrap">{item.label}</span>
            )}

            {/* 激活状态指示器 */}
            {activeCategory === item.id && (
              <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 translate-x-0 rounded-r-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* 底部设置按钮 */}
      <div className="border-t p-2">
        <button
          onClick={onSettingsClick}
          className={cn(
            "group flex w-full items-center rounded-lg transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
            collapsed ? 'justify-center py-3' : 'justify-start px-3 py-2'
          )}
          title="设置"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {!collapsed && <span className="ml-3 text-sm font-medium">设置</span>}
        </button>
      </div>
    </div>
  );
};
