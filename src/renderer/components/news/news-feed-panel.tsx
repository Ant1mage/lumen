import { Badge } from "@renderer/components/ui/badge"
import { ScrollArea } from "@renderer/components/ui/scroll-area"
import { useTranslation } from "react-i18next"
import { NewsFeedCard } from "@renderer/components/news/news-feed-card"
import { Card, CardHeader } from "@renderer/components/ui/card"

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

export function NewsFeedPanel() {
    const { t } = useTranslation()

    return (
        <Card className="flex h-full flex-col border-0">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">{t('news_panel.title')}</h2>
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                </div>
            </CardHeader>

            <ScrollArea className="flex-1" style={{ minHeight: 0 }}>
                <div className="space-y-1 px-3 pb-3">
                    {newsData.map((news) => (
                        <NewsFeedCard
                            key={news.id}
                            id={news.id}
                            time={news.time}
                            category={news.category}
                            title={news.title}
                            tags={news.tags}
                        />
                    ))}
                </div>
            </ScrollArea>
        </Card>
    )
}
