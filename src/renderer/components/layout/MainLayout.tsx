import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from '@renderer/components/ui/resizable';
import { NavSidebar } from '../navigation/NavSidebar';
import { MarketHub } from '../market/MarketHub';
import { ChatPanel } from '../chat/ChatPanel';
import { SettingsDialog } from '../settings/SettingsDialog';
import type { NavCategory } from '@renderer/types';

/**
 * 主布局组件
 * 三段式布局：左导航 + 中情报 + 右 AI
 */
export const MainLayout: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<NavCategory>('a-share');
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* 左侧：分类导航（可收缩） */}
      <NavSidebar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      {/* 中间 + 右侧：可调整面板组 */}
      <PanelGroup direction="horizontal" className="flex-1">
        {/* 中间区域：市场情报枢纽 */}
        <Panel defaultSize={55} minSize={30}>
          <MarketHub activeCategory={activeCategory} />
        </Panel>

        {/* 调整手柄 */}
        <PanelResizeHandle className="w-1 bg-border transition-colors hover:bg-primary/50" />

        {/* 右侧区域：AI 智能助手 */}
        <Panel defaultSize={25} minSize={20}>
          <ChatPanel />
        </Panel>
      </PanelGroup>

      {/* 设置对话框 */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};
