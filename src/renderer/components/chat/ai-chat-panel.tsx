'use client'

import { useState } from "react"
import { Send, Sparkles, User, LineChart, TrendingUp, BarChart3 } from "lucide-react"
import { Button } from "@renderer/components/ui/button"
import { ScrollArea } from "@renderer/components/ui/scroll-area"
import { cn } from "@renderer/tools/utils"
import { useTranslation } from "react-i18next"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    time: string
}

const initialMessages: Message[] = [
    {
        id: "1",
        role: "assistant",
        content: "", // Will be set by translation
        time: "18:40"
    },
    {
        id: "2",
        role: "user",
        content: "", // Will be set by translation
        time: "18:42"
    },
    {
        id: "3",
        role: "assistant",
        content: "", // Will be set by translation
        time: "18:43"
    }
]

const quickActions = [
    { label: "market_overview", icon: LineChart },
    { label: "stock_diagnosis", icon: BarChart3 },
    { label: "trend_analysis", icon: TrendingUp }
]

export function AIChatPanel() {
    const { t } = useTranslation()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")

    const handleSend = () => {
        if (!input.trim()) return

        const newMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
        }

        setMessages([...messages, newMessage])
        setInput("")

        // Simulate AI response
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: t('chat_panel.ai_loading'),
                time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
            }
            setMessages(prev => [...prev, aiResponse])
        }, 1000)
    }

    return (
        <div className="flex h-full flex-col bg-card">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                "flex gap-3",
                                message.role === "user" ? "flex-row-reverse" : ""
                            )}
                        >
                            <div className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                message.role === "assistant"
                                    ? "bg-primary/10"
                                    : "bg-accent/10"
                            )}>
                                {message.role === "assistant" ? (
                                    <Sparkles className="h-4 w-4 text-primary" />
                                ) : (
                                    <User className="h-4 w-4 text-accent" />
                                )}
                            </div>

                            <div className={cn(
                                "max-w-[80%] space-y-1",
                                message.role === "user" ? "items-end" : ""
                            )}>
                                <div className={cn(
                                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                                    message.role === "assistant"
                                        ? "rounded-tl-sm bg-secondary text-foreground"
                                        : "rounded-tr-sm bg-primary text-primary-foreground"
                                )}>
                                    {message.content.split("\n").map((line, i) => (
                                        <p key={i} className={i > 0 ? "mt-2" : ""}>
                                            {line}
                                        </p>
                                    ))}
                                </div>
                                <span className={cn(
                                    "block text-[10px] text-muted-foreground",
                                    message.role === "user" ? "text-right" : ""
                                )}>
                                    {message.time}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="flex gap-2 px-4 py-3">
                {quickActions.map((action) => (
                    <Button
                        key={action.label}
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 rounded-full border-border/50 bg-secondary/50 text-xs hover:bg-secondary hover:text-foreground"
                    >
                        <action.icon className="h-3 w-3" />
                        {t(`chat_panel.quick_actions.${action.label}`)}
                    </Button>
                ))}
            </div>

            {/* Input */}
            <div className="px-4 pb-4">
                <div className="flex items-center gap-2 rounded-2xl bg-secondary/50 px-4 py-2.5">
                    <input
                        type="text"
                        placeholder={t('chat_panel.input_placeholder')}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <Button
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-full bg-primary hover:bg-primary/90"
                        onClick={handleSend}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
