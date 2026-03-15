import { Badge } from "@renderer/components/ui/badge"
import { useTranslation } from "react-i18next"

interface NewsFeedItemPanelProps {
    id: string
    time: string
    category: string
    title: string
    tags: string[]
}

const tagColors: Record<string, string> = {
    "tech": "bg-accent/20 text-accent-foreground border-accent/30",
    "new_energy": "bg-primary/20 text-primary border-primary/30",
    "market": "bg-chart-5/20 text-chart-5 border-chart-5/30",
    "hot": "bg-chart-2/20 text-chart-2 border-chart-2/30",
    "ai": "bg-accent/20 text-accent-foreground border-accent/30",
    "fund": "bg-chart-4/20 text-chart-4 border-chart-4/30",
    "policy": "bg-primary/20 text-primary border-primary/30"
}

export function NewsFeedCard({ id, time, category, title, tags }: NewsFeedItemPanelProps) {
    const { t } = useTranslation()

    return (
        <div
            key={id}
            className="group cursor-pointer rounded-xl p-3 transition-all duration-200 hover:bg-secondary/50"
        >
            <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xs font-medium text-muted-foreground">
                    {time}
                </span>
                <div className="flex-1 space-y-2">
                    <p className="text-sm leading-relaxed text-foreground/90 group-hover:text-foreground">
                        <span className="mr-1 text-muted-foreground">|</span>
                        <span className="text-muted-foreground">{t(`news_panel.categories.${category.toLowerCase()}`)}：</span>
                        {title}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
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
    )
}
