import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@renderer/tools/utils"

interface StockCardProps {
    name: string
    code: string
    price: number
    change: number
    sparklineData?: number[]
}

export function StockCard({ name, code, price, change, sparklineData = [] }: StockCardProps) {
    const isPositive = change >= 0

    // Generate sparkline path
    const generateSparkline = () => {
        if (sparklineData.length === 0) return ""
        const width = 60
        const height = 24
        const min = Math.min(...sparklineData)
        const max = Math.max(...sparklineData)
        const range = max - min || 1

        const points = sparklineData.map((value, index) => {
            const x = (index / (sparklineData.length - 1)) * width
            const y = height - ((value - min) / range) * height
            return `${x},${y}`
        })

        return `M ${points.join(" L ")}`
    }

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-xl p-4 transition-all duration-300",
            isPositive
                ? "bg-gradient-to-br from-up/10 via-up/5 to-transparent"
                : "bg-gradient-to-br from-down/10 via-down/5 to-transparent"
        )}>
            {/* Subtle glow effect on hover */}
            <div className={cn(
                "absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100",
                isPositive
                    ? "bg-gradient-to-br from-up/15 via-up/8 to-transparent"
                    : "bg-gradient-to-br from-down/15 via-down/8 to-transparent"
            )} />

            <div className="relative flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="font-semibold text-foreground text-sm">{name}</h3>
                    <p className="text-xs text-muted-foreground">{code}</p>
                </div>

                <div className="text-right">
                    <p className="font-mono text-lg font-bold text-foreground">
                        {price.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                    </p>
                    <div className={cn(
                        "flex items-center justify-end gap-1 text-xs font-medium",
                        isPositive ? "text-up" : "text-down"
                    )}>
                        {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                        ) : (
                            <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{isPositive ? "+" : ""}{change.toFixed(2)}%</span>
                    </div>
                </div>
            </div>

            {/* Mini sparkline chart */}
            {sparklineData.length > 0 && (
                <div className="mt-3 flex justify-end">
                    <svg width="60" height="24" className="overflow-visible">
                        <path
                            d={generateSparkline()}
                            fill="none"
                            stroke={isPositive ? "var(--up)" : "var(--down)"}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-sm"
                        />
                    </svg>
                </div>
            )}
        </div>
    )
}
