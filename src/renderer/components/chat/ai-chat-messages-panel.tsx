'use client'

import { useEffect, useRef } from "react"
import { Sparkles, User } from "lucide-react"
import { ScrollArea } from "@renderer/components/ui/scroll-area"
import { cn } from "@renderer/tools/utils"
import { LLMMessage, LLMRole } from "@shared/types"

// 渲染层扩展的消息类型 (带 UI 元数据)
interface UIMessage extends LLMMessage {
    id: string
    time: string
    isStreaming?: boolean
}

interface AIChatMessagesPanelProps {
    messages: UIMessage[]
    isLoaded: boolean
}

export function AIChatMessagesPanel({ messages, isLoaded }: AIChatMessagesPanelProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    // 自动滚动到底部
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    return (
        <ScrollArea className="h-full p-4" style={{ minHeight: 0 }}>
            <div className="space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={cn(
                            "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                            message.role === "user" ? "flex-row-reverse" : ""
                        )}
                    >
                        {/* Avatar */}
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

                        {/* Message Content */}
                        <div className={cn(
                            "max-w-[80%] space-y-1",
                            message.role === LLMRole.User ? "items-end" : ""
                        )}>
                            <div className={cn(
                                "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                                message.role === LLMRole.Assistant
                                    ? "rounded-tl-sm bg-secondary text-foreground"
                                    : "rounded-tr-sm bg-primary text-primary-foreground"
                            )}>
                                {/* AI 消息且正在流式传输时显示三个点 */}
                                {message.role === LLMRole.Assistant && message.isStreaming && message.content === "" ? (
                                    <div className="flex items-center gap-1.5 h-5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse delay-75" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse delay-150" />
                                    </div>
                                ) : (
                                    // 正常渲染消息内容（支持 Markdown 风格的换行）
                                    <div className="whitespace-pre-wrap">
                                        {message.content}
                                    </div>
                                )}
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
                <div ref={scrollRef} />
            </div>
        </ScrollArea>
    )
}
