import { AIChatPanel } from "@renderer/components/chat/ai-chat-panel";
import { AppSidebarPanel } from "@renderer/components/sidebar/app-sidebar-panel";
import { NewsFeedPanel } from "@renderer/components/news/news-feed-panel";
import { StockPanel } from "./components/stock/stock-panel";



export default function Dashboard() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background p-3">
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
