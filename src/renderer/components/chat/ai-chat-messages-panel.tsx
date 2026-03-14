'use client'

import { Sparkles, User } from "lucide-react"
import { ScrollArea } from "@renderer/components/ui/scroll-area"
import { cn } from "@renderer/tools/utils"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    time: string
}

interface AIChatMessagesPanelProps {
    messages: Message[]
    isLoaded: boolean
}

export function AIChatMessagesPanel({ messages, isLoaded }: AIChatMessagesPanelProps) {
    return (
        <ScrollArea className="h-full p-4" style={{ minHeight: 0 }}>
            {messages.length > 0 && (
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
            )}
        </ScrollArea>
    )
}
