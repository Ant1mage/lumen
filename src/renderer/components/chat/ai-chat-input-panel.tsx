'use client'

import { useState } from "react"
import { Send, LineChart, TrendingUp, BarChart3 } from "lucide-react"
import { Button } from "@renderer/components/ui/button"
import { cn } from "@renderer/tools/utils"
import { useTranslation } from "react-i18next"

interface AIChatInputPanelProps {
    onSendMessage: (content: string) => void
    onQuickAction: (action: string) => void
}

const quickActions = [
    { label: "market_overview", icon: LineChart },
    { label: "stock_diagnosis", icon: BarChart3 },
    { label: "trend_analysis", icon: TrendingUp }
]

export function AIChatInputPanel({ onSendMessage, onQuickAction }: AIChatInputPanelProps) {
    const { t } = useTranslation()
    const [input, setInput] = useState("")

    const handleSend = () => {
        if (!input.trim()) return
        onSendMessage(input)
        setInput("")
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex flex-col gap-3 px-4 pb-4">
            {/* Quick Actions - 可左右滑动 */}
            <div className="flex overflow-x-auto scrollbar-hide gap-2 -mx-4 px-4 py-2">
                {quickActions.map((action) => (
                    <Button
                        key={action.label}
                        variant="outline"
                        size="sm"
                        onClick={() => onQuickAction(action.label)}
                        className="h-8 gap-1.5 rounded-full border-border/50 bg-secondary/50 text-xs hover:bg-secondary hover:text-foreground shrink-0"
                    >
                        <action.icon className="h-3 w-3" />
                        {t(`chat_panel.quick_actions.${action.label}`)}
                    </Button>
                ))}
            </div>

            {/* Input Area */}
            <div className="flex items-center gap-2 rounded-2xl bg-secondary/50 px-4 py-2.5">
                <input
                    type="text"
                    placeholder={t('chat_panel.input_placeholder')}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <Button
                    size="icon"
                    disabled={!input.trim()}
                    className={cn(
                        "h-8 w-8 shrink-0 rounded-full",
                        input.trim()
                            ? "bg-primary hover:bg-primary/90"
                            : "bg-button-disabled cursor-not-allowed"
                    )}
                    onClick={handleSend}
                >
                    <Send className={cn(
                        "h-4 w-4",
                        input.trim()
                            ? "text-primary-foreground"
                            : "text-button-disabled-foreground"
                    )} />
                </Button>
            </div>
        </div>
    )
}
