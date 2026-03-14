import { StockCard } from "@renderer/components/stock/stock-card"
import { ScrollArea } from "@renderer/components/ui/scroll-area"
import { useTranslation } from "react-i18next"

interface Stock {
    name: string
    code: string
    price: number
    change: number
    sparklineData: number[]
}

// Generate random sparkline data
const generateSparkline = (trend: "up" | "down" | "mixed"): number[] => {
    const data: number[] = []
    let value = 50

    for (let i = 0; i < 12; i++) {
        if (trend === "up") {
            value += Math.random() * 8 - 2
        } else if (trend === "down") {
            value -= Math.random() * 8 - 2
        } else {
            value += Math.random() * 10 - 5
        }
        data.push(Math.max(10, Math.min(90, value)))
    }

    return data
}

const stocksData: Stock[] = [
    { name: "贵州茅台", code: "600519", price: 1678.50, change: 2.35, sparklineData: generateSparkline("up") },
    { name: "五粮液", code: "000858", price: 142.30, change: 1.85, sparklineData: generateSparkline("up") },
    { name: "宁德时代", code: "300750", price: 185.60, change: 3.45, sparklineData: generateSparkline("up") },
    { name: "中国平安", code: "601318", price: 42.15, change: 0.85, sparklineData: generateSparkline("up") },
    { name: "招商银行", code: "600036", price: 35.80, change: -0.32, sparklineData: generateSparkline("down") },
    { name: "其他", code: "600339", price: 32.80, change: -0.50, sparklineData: generateSparkline("down") },
    { name: "比亚迪", code: "002594", price: 287.00, change: 4.57, sparklineData: generateSparkline("up") },
    { name: "腾讯控股", code: "00700", price: 380.60, change: 2.15, sparklineData: generateSparkline("up") },
    { name: "阿里巴巴", code: "09988", price: 80.20, change: 1.43, sparklineData: generateSparkline("up") },
    { name: "京东", code: "09618", price: 129.10, change: -0.54, sparklineData: generateSparkline("down") },
    { name: "美团", code: "03690", price: 145.50, change: 1.28, sparklineData: generateSparkline("up") },
    { name: "小米集团", code: "01810", price: 18.60, change: -0.49, sparklineData: generateSparkline("down") },
    { name: "宁国时代", code: "300657", price: 33.20, change: 0.94, sparklineData: generateSparkline("up") },
    { name: "东宁秦", code: "300666", price: 15.40, change: -0.82, sparklineData: generateSparkline("down") },
    { name: "小米集团", code: "01811", price: 24.30, change: 0.05, sparklineData: generateSparkline("mixed") },
    { name: "中国平安", code: "600378", price: 23.40, change: 0.22, sparklineData: generateSparkline("up") },
    { name: "持戴缘业", code: "600039", price: 8.75, change: -1.25, sparklineData: generateSparkline("down") },
    { name: "招商银行", code: "600038", price: 32.80, change: -0.80, sparklineData: generateSparkline("down") }
]

export function StockPanel() {
    const { t } = useTranslation()

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
                <h1 className="text-xl font-semibold text-foreground">{t('stock_panel.title')}</h1>
                <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-xs font-medium text-primary">{t('stock_panel.real_time')}</span>
                </div>
            </div>

            {/* Stock Grid */}
            <ScrollArea className="flex-1">
                <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {stocksData.map((stock, index) => (
                        <StockCard
                            key={`${stock.code}-${index}`}
                            name={stock.name}
                            code={stock.code}
                            price={stock.price}
                            change={stock.change}
                            sparklineData={stock.sparklineData}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
