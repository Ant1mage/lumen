import { Badge } from "@renderer/components/ui/badge"
import { ScrollArea } from "@renderer/components/ui/scroll-area"
import { useTranslation } from "react-i18next"

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
        category: "tech",
        title: "宁德时代发布新电池技术：续航里程突破 1000 公里",
        tags: ["tech", "new_energy"]
    },
    {
        id: "2",
        time: "18:30",
        category: "market",
        title: "A 股大盘震荡上行，科技板块领涨",
        tags: ["market", "hot"]
    },
    {
        id: "3",
        time: "18:26",
        category: "tech",
        title: "数据大涨：科技巨头云计算业务超预期增长",
        tags: ["market", "hot"]
    },
    {
        id: "4",
        time: "18:15",
        category: "tech",
        title: "人工智能芯片需求激增，半导体板块迎来新机遇",
        tags: ["tech", "ai"]
    },
    {
        id: "5",
        time: "18:00",
        category: "market",
        title: "外资持续流入 A 股市场，北向资金净买入超 50 亿",
        tags: ["market", "fund"]
    },
    {
        id: "6",
        time: "17:45",
        category: "new_energy",
        title: "光伏产业迎政策利好，行业龙头股价创新高",
        tags: ["new_energy", "policy"]
    }
]

const tagColors: Record<string, string> = {
    "tech": "bg-accent/20 text-accent-foreground border-accent/30",
    "new_energy": "bg-primary/20 text-primary border-primary/30",
    "market": "bg-chart-5/20 text-chart-5 border-chart-5/30",
    "hot": "bg-chart-2/20 text-chart-2 border-chart-2/30",
    "ai": "bg-accent/20 text-accent-foreground border-accent/30",
    "fund": "bg-chart-4/20 text-chart-4 border-chart-4/30",
    "policy": "bg-primary/20 text-primary border-primary/30"
}

export function NewsFeedPanel() {
    const { t } = useTranslation()

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 py-4">
                <h2 className="text-sm font-semibold text-foreground">{t('news_panel.title')}</h2>
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
                                        <span className="text-muted-foreground">{t(`news_panel.categories.${news.category.toLowerCase()}`)}：</span>
                                        {news.title}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {news.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="outline"
                                                className={`text-[10px] px-1.5 py-0 font-normal ${tagColors[tag] || "bg-muted text-muted-foreground"}`}
                                            >
                                                {t(`news_panel.tags.${tag.toLowerCase()}`)}
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
