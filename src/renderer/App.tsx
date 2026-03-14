import { AIChatPanel } from "@renderer/components/chat/ai-chat-panel";
import { AppSidebarPanel } from "@renderer/components/sidebar/app-sidebar-panel";
import { NewsFeedPanel } from "@renderer/components/news/news-feed-panel";
import { StockPanel } from "./components/stock/stock-panel";
import { useEffect, useState } from "react";
import i18n from "@renderer/config/i18n";



export default function Dashboard() {
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system')

  useEffect(() => {
    // 应用启动时立即读取主题和语言设置
    const loadSettings = async () => {
      if (window.store_config?.getTheme) {
        const savedTheme = await window.store_config.getTheme()
        setTheme(savedTheme)
        applyTheme(savedTheme)
      }

      if (window.store_config?.getLanguage) {
        const savedLanguage = await window.store_config.getLanguage()
        console.log('App 加载时的语言设置:', savedLanguage)
        // 使用 i18next 的 changeLanguage 方法切换语言
        await i18n.changeLanguage(savedLanguage)
      }
    }
    loadSettings()
  }, [])

  const applyTheme = (themeMode: 'system' | 'light' | 'dark') => {
    const root = document.documentElement

    if (themeMode === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', systemDark)
    } else {
      root.classList.toggle('dark', themeMode === 'dark')
    }
  }

  return (
    /* Main Content - 使用固定 padding，不设置背景色 */
    <div className="flex h-screen w-full overflow-hidden p-3">
      {/* Sidebar */}
      <AppSidebarPanel />

      {/* Main Content */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* Stock Grid - Left Section */}
        <div className="flex-1 overflow-hidden rounded-2xl border border-border/50 bg-card">
          <StockPanel />
        </div>

        {/* News Panel - Middle Section */}
        <div className="hidden w-80 overflow-hidden rounded-2xl border border-border/50 bg-card lg:block">
          <NewsFeedPanel />
        </div>

        {/* AI Chat - Right Section */}
        <div className="hidden w-96 overflow-hidden rounded-2xl border border-border/50 bg-card xl:block">
          <AIChatPanel />
        </div>
      </div>
    </div>
  )
}
