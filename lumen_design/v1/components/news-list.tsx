"use client"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NewsItem {
  id: string
  time: string
  category: string
  title: string
  tags: string[]
}

const newsData: NewsItem[] = [
  {
    id: "1",
    time: "18:45",
    category: "科技",
    title: "宁德时代发布新电池技术：续航里程突破1000公里",
    tags: ["科技", "新能源"]
  },
  {
    id: "2",
    time: "18:30",
    category: "市场",
    title: "A股大盘震荡上行，科技板块领涨",
    tags: ["市场", "热点"]
  },
  {
    id: "3",
    time: "18:26",
    category: "科技",
    title: "数据大涨：科技巨头云计算业务超预期增长",
    tags: ["市场", "热点"]
  },
  {
    id: "4",
    time: "18:15",
    category: "科技",
    title: "人工智能芯片需求激增，半导体板块迎来新机遇",
    tags: ["科技", "AI"]
  },
  {
    id: "5",
    time: "18:00",
    category: "市场",
    title: "外资持续流入A股市场，北向资金净买入超50亿",
    tags: ["市场", "资金"]
  },
  {
    id: "6",
    time: "17:45",
    category: "新能源",
    title: "光伏产业迎政策利好，行业龙头股价创新高",
    tags: ["新能源", "政策"]
  }
]

const tagColors: Record<string, string> = {
  "科技": "bg-accent/20 text-accent-foreground border-accent/30",
  "新能源": "bg-primary/20 text-primary border-primary/30",
  "市场": "bg-chart-5/20 text-chart-5 border-chart-5/30",
  "热点": "bg-chart-2/20 text-chart-2 border-chart-2/30",
  "AI": "bg-accent/20 text-accent-foreground border-accent/30",
  "资金": "bg-chart-4/20 text-chart-4 border-chart-4/30",
  "政策": "bg-primary/20 text-primary border-primary/30"
}

export function NewsList() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-sm font-semibold text-foreground">实时新闻</h2>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-1 px-3 pb-3">
          {newsData.map((news) => (
            <div
              key={news.id}
              className="group cursor-pointer rounded-xl p-3 transition-all duration-200 hover:bg-secondary/50"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xs font-medium text-muted-foreground">
                  {news.time}
                </span>
                <div className="flex-1 space-y-2">
                  <p className="text-sm leading-relaxed text-foreground/90 group-hover:text-foreground">
                    <span className="mr-1 text-muted-foreground">|</span>
                    <span className="text-muted-foreground">{news.category}：</span>
                    {news.title}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {news.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 font-normal ${tagColors[tag] || "bg-muted text-muted-foreground"}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
