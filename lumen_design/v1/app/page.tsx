"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { StockGrid } from "@/components/stock-grid"
import { NewsList } from "@/components/news-list"
import { AIChat } from "@/components/ai-chat"

export default function Dashboard() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background p-3">
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Main Content */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* Stock Grid - Left Section */}
        <div className="flex-1 overflow-hidden rounded-2xl border border-border/50 bg-card">
          <StockGrid />
        </div>
        
        {/* News Panel - Middle Section */}
        <div className="hidden w-80 overflow-hidden rounded-2xl border border-border/50 bg-card lg:block">
          <NewsList />
        </div>
        
        {/* AI Chat - Right Section */}
        <div className="hidden w-96 overflow-hidden rounded-2xl border border-border/50 bg-card xl:block">
          <AIChat />
        </div>
      </div>
    </div>
  )
}
