'use client'

import { useState, useEffect } from "react"
import { Sparkles, User, RotateCcw } from "lucide-react"
import { ScrollArea } from "@renderer/components/ui/scroll-area"
import { Button } from "@renderer/components/ui/button"
import { cn } from "@renderer/tools/utils"
import { useTranslation } from "react-i18next"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    time: string
}

interface AIChatMessagesPanelProps {
    messages: Message[]
    lumenCoreState: 'idle' | 'loading' | 'ready' | 'error'
    onRetryLoad: () => void
}

export function AIChatMessagesPanel({ messages, lumenCoreState, onRetryLoad }: AIChatMessagesPanelProps) {
    const { t } = useTranslation()
    const [isLoaded, setIsLoaded] = useState(false)
    const [avatarStage, setAvatarStage] = useState<'normal' | 'enlarge' | 'shrink'>('normal')
    const [containerOpacity, setContainerOpacity] = useState(1)
    const [isRetrying, setIsRetrying] = useState(false)

    // 监听 LumenCore 状态变化
    useEffect(() => {
        if (lumenCoreState === 'ready') {
            // 加载成功：先放大到 1.5x，然后缩小到 0
            setTimeout(() => {
                setAvatarStage('enlarge')
            }, 50)

            setTimeout(() => {
                setAvatarStage('shrink')
            }, 350) // 50ms + 300ms

            setTimeout(() => {
                setContainerOpacity(0)
            }, 1400) // 350ms + 1000ms + 50ms 缓冲

            setTimeout(() => {
                setIsLoaded(true)
            }, 2450) // 1400ms + 1000ms + 50ms 缓冲
        }
    }, [lumenCoreState])

    const handleRetry = async () => {
        setIsRetrying(true)
        await onRetryLoad()
        setIsRetrying(false)
    }

    return (
        <div className="relative flex-1 overflow-hidden">
            {/* Loading Container - 只覆盖 AIChatMessagesPanel，使用 AIChatPanel 背景色 (bg-card) */}
            {!isLoaded && (
                <div
                    className="absolute inset-0 z-10 flex items-center justify-center bg-card transition-opacity duration-1000 ease-out"
                    style={{ opacity: containerOpacity }}
                >
                    <div className="flex flex-col items-center space-y-6">
                        {/* Avatar Logo - 使用绿色 (primary) */}
                        <div
                            className={`transition-all ${avatarStage === 'enlarge' ? 'animate-loading-enlarge' :
                                avatarStage === 'shrink' ? 'animate-loading-shrink' :
                                    lumenCoreState === 'loading' ? 'animate-pulse-fast' :
                                        ''
                                }`}
                        >
                            <Sparkles className="h-32 w-32 text-primary" />
                        </div>

                        {/* Status Text & Retry Button */}
                        {lumenCoreState === 'loading' && (
                            <p className="text-center text-sm font-medium text-muted-foreground">
                                {t('splash.initializing')}
                            </p>
                        )}

                        {lumenCoreState === 'error' && (
                            <Button
                                onClick={handleRetry}
                                disabled={isRetrying}
                                variant="outline"
                                className="gap-2"
                            >
                                <RotateCcw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                                {t(isRetrying ? 'splash.retrying' : 'splash.retry')}
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Messages - 只在加载完成后渲染 */}
            {isLoaded && (
                <ScrollArea className="h-full p-4" style={{ minHeight: 0 }}>
                    {messages.length > 0 && (
                        // Messages list
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
            )}
        </div>
    )
}
