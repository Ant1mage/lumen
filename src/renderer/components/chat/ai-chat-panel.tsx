'use client'

import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { AIChatMessagesPanel } from "./ai-chat-messages-panel"
import { AIChatInputPanel } from "./ai-chat-input-panel"
import { Button } from "@renderer/components/ui/button"
import { useTranslation } from "react-i18next"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    time: string
    isStreaming?: boolean
}

export function AIChatPanel() {
    const { t } = useTranslation()
    const [messages, setMessages] = useState<Message[]>([])
    const [isStreaming, setIsStreaming] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [avatarStage, setAvatarStage] = useState<'normal' | 'enlarge' | 'shrink'>('normal')
    const [containerOpacity, setContainerOpacity] = useState(1)

    // 启动时加载 LumenCore
    useEffect(() => {
        if (window.lumen_core) {
            const unsubscribe = window.lumen_core.onStateChange((state) => {
                console.log('AIChatPanel: LumenCore 状态变化', state)

                switch (state.status) {
                    case 'initializing':
                        break
                    case 'ready':
                        // 加载成功：先放大到 1.5x，然后缩小到 0
                        setTimeout(() => {
                            setAvatarStage('enlarge')
                        }, 50)

                        setTimeout(() => {
                            setAvatarStage('shrink')
                        }, 350)

                        setTimeout(() => {
                            setContainerOpacity(0)
                        }, 1400)

                        setTimeout(() => {
                            setIsLoaded(true)
                        }, 2450)
                        break
                    case 'error':
                        break
                }
            })

            return () => unsubscribe()
        } else {
            console.warn('AIChatPanel: window.lumen_core not available')
        }
    }, [])

    const handleSendMessage = async (content: string) => {
        if (!window.lumen_core || isStreaming) return

        // 添加用户消息
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content,
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
        }

        setMessages(prev => [...prev, userMessage])
        setIsStreaming(true)

        // 创建 AI 消息占位符
        const aiMessageId = (Date.now() + 1).toString()
        const aiMessage: Message = {
            id: aiMessageId,
            role: "assistant",
            content: "",  // 空内容，等待流式响应
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            isStreaming: true  // 标记为正在生成
        }

        // 先添加空消息占位
        setMessages(prev => [...prev, aiMessage])

        try {
            // 监听 token 流式响应
            const unsubscribeToken = window.lumen_core.onToken((token) => {
                // 收到第一个 token 时，取消 isStreaming 状态
                setMessages(prev => prev.map(msg =>
                    msg.id === aiMessageId
                        ? { ...msg, content: msg.content + token, isStreaming: false }
                        : msg
                ))
            })

            // 发送消息
            const result = await window.lumen_core.sendMessage(content)

            if (!result.success) {
                console.error('发送消息失败:', result.error)
                // 在 AI 消息中显示错误
                setMessages(prev => prev.map(msg =>
                    msg.id === aiMessageId
                        ? { ...msg, content: `Error: ${result.error}` }
                        : msg
                ))
            }

            // 清理 token 监听器
            unsubscribeToken()
        } catch (error) {
            console.error('消息发送异常:', error)
            setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId
                    ? { ...msg, content: `Error: ${String(error)}` }
                    : msg
            ))
        } finally {
            setIsStreaming(false)
        }
    }

    const handleQuickAction = (action: string) => {
        console.log('Quick action clicked:', action)
        // TODO: Implement quick action logic
    }

    return (
        <div className="relative flex h-full flex-col bg-card">
            {/* Loading Container - 覆盖整个 Chat Panel */}
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
                                    !isLoaded ? 'animate-pulse-fast' :
                                        ''
                                }`}
                        >
                            <Sparkles className="h-32 w-32 text-primary" />
                        </div>

                        {/* Status Text */}
                        {!isLoaded && (
                            <p className="text-center text-sm font-medium text-muted-foreground">
                                {t('splash.initializing')}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4">
                <h2 className="text-xl font-semibold text-foreground">{t('chat_panel.title')}</h2>
            </div>

            {/* Messages */}
            <AIChatMessagesPanel
                messages={messages}
                isLoaded={isLoaded}
            />

            {/* Input & Actions */}
            <AIChatInputPanel
                onSendMessage={handleSendMessage}
                onQuickAction={handleQuickAction}
            />
        </div>
    )
}
