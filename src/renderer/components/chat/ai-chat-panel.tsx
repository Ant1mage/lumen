'use client'

import { useState, useEffect } from "react"
import { AIChatMessagesPanel } from "./ai-chat-messages-panel"
import { AIChatInputPanel } from "./ai-chat-input-panel"
import { useTranslation } from "react-i18next"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    time: string
}

export function AIChatPanel() {
    const { t } = useTranslation()
    const [messages, setMessages] = useState<Message[]>([])
    const [lumenCoreState, setLumenCoreState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
    const [isStreaming, setIsStreaming] = useState(false)

    // 启动时加载 LumenCore
    useEffect(() => {
        if (window.lumen_core) {
            setLumenCoreState('loading')

            const unsubscribe = window.lumen_core.onStateChange((state) => {
                console.log('AIChatPanel: LumenCore 状态变化', state)

                switch (state.status) {
                    case 'initializing':
                        setLumenCoreState('loading')
                        break
                    case 'ready':
                        setLumenCoreState('ready')
                        break
                    case 'error':
                        setLumenCoreState('error')
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
            content: "",
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
        }

        // 先添加空消息占位
        setMessages(prev => [...prev, aiMessage])

        try {
            // 监听 token 流式响应
            const unsubscribeToken = window.lumen_core.onToken((token) => {
                setMessages(prev => prev.map(msg =>
                    msg.id === aiMessageId
                        ? { ...msg, content: msg.content + token }
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

    const handleRetryLoad = async () => {
        console.log('AIChatPanel: 重试加载 LumenCore')
        setLumenCoreState('loading')

        try {
            if (window.lumen_core?.reinitialize) {
                const result = await window.lumen_core.reinitialize()
                if (!result.success) {
                    throw new Error(result.error)
                }
            } else {
                throw new Error('lumen_core.reinitialize not available')
            }
        } catch (error) {
            console.error('AIChatPanel: 重试失败', error)
            setLumenCoreState('error')
        }
    }

    return (
        <div className="flex h-full flex-col bg-card">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4">
                <h2 className="text-xl font-semibold text-foreground">{t('chat_panel.title')}</h2>
                <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
            </div>

            {/* Messages */}
            <AIChatMessagesPanel
                messages={messages}
                lumenCoreState={lumenCoreState}
                onRetryLoad={handleRetryLoad}
            />

            {/* Input & Actions */}
            <AIChatInputPanel
                onSendMessage={handleSendMessage}
                onQuickAction={handleQuickAction}
            />
        </div>
    )
}
