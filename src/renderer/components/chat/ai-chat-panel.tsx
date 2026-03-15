'use client'

import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@renderer/components/ui/button"
import { AILogo } from "@renderer/components/ui/ai-logo"
import { useTranslation } from "react-i18next"
import { LLMMessage, LLMRole, LumenCoreState } from "@shared/types"
import { logger } from "@renderer/tools/logger"
import { Card, CardHeader } from "../ui/card"
import { cn } from "@renderer/tools/utils"
import { ChatContainer, ChatMessages, ChatForm } from "@renderer/components/ui/chat"
import { MessageList } from "@renderer/components/ui/message-list"
import { MessageInput } from "@renderer/components/ui/message-input"
import { ScrollArea } from "@renderer/components/ui/scroll-area"
import type { Message } from "@renderer/components/ui/chat-message"

// 转换 LLMMessage 为 UI Message
const convertToUIMessage = (msg: LLMMessage & { id: string; time: string; isStreaming?: boolean }): Message => {
  return {
    id: msg.id,
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
    createdAt: new Date(),
  }
}

export function AIChatPanel() {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<(LLMMessage & { id: string; time: string; isStreaming?: boolean })[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [avatarStage, setAvatarStage] = useState<'normal' | 'enlarge' | 'shrink'>('normal')
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState("")

  // 启动时加载 LumenCore
  useEffect(() => {
    if (window.lumen_core) {
      const unsubscribe = window.lumen_core.onStateChange((state: LumenCoreState) => {
        logger.debug('LumenCore 状态变化', 'AIChatPanel', state)

        switch (state.status) {
          case 'initializing':
            // 保持脉冲动画等待
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
              setIsLoaded(true)
            }, 1400)
            break
          case 'error':
            // 加载失败：显示错误信息，停止动画
            logger.error(`LumenCore 初始化失败：${state.error}`, 'AIChatPanel')
            setError(state.error || t('chat_panel.init_error'))
            // 停止动画，恢复正常状态
            setAvatarStage('normal')
            break
        }
      })

      return () => unsubscribe()
    } else {
      logger.warn('window.lumen_core not available', 'AIChatPanel')
    }
  }, [])

  const handleSendMessage = async (
    event?: { preventDefault?: () => void },
    options?: { experimental_attachments?: FileList }
  ) => {
    if (event?.preventDefault) event.preventDefault()
    if (!window.lumen_core || isStreaming || !input.trim()) return

    const content = input
    setInput("")

    // 添加用户消息
    const userMessage = {
      id: Date.now().toString(),
      role: LLMRole.User,
      content,
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
    }

    setMessages(prev => [...prev, userMessage])
    setIsStreaming(true)

    // 创建 AI 消息占位符
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage = {
      id: aiMessageId,
      role: LLMRole.Assistant,
      content: "",
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      isStreaming: true
    }

    setMessages(prev => [...prev, aiMessage])

    try {
      const unsubscribeToken = window.lumen_core.onToken((token) => {
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, content: msg.content + token }
            : msg
        ))
      })

      const result = await window.lumen_core.sendMessage(content)

      if (!result.success) {
        logger.error(`发送消息失败：${result.error}`, 'AIChatPanel')
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, content: `Error: ${result.error}` }
            : msg
        ))
      }

      unsubscribeToken()
    } catch (error) {
      logger.error(`消息发送异常：${error}`, 'AIChatPanel')
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? { ...msg, content: `Error: ${String(error)}` }
          : msg
      ))
    } finally {
      setIsStreaming(false)
    }
  }

  const handleInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setInput(e.target.value)
  }

  // 为 MessageList 适配消息格式
  const chatMessages: Message[] = messages.map(msg => ({
    id: msg.id,
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
    createdAt: new Date(),
  }))

  return (
    <Card className={cn("relative flex h-full flex-col border-0 overflow-hidden")}>
      {/* Loading Container - 覆盖整个 Chat Panel */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-card">
          {/* Logo 和文字作为整体进行动画 */}
          <div
            className={`flex flex-col items-center space-y-6 transition-all ${avatarStage === 'enlarge' ? 'animate-loading-enlarge' :
              avatarStage === 'shrink' ? 'animate-loading-shrink' :
                !isLoaded ? 'animate-pulse-fast' :
                  ''
              }`}
          >
            {/* AI Logo */}
            <AILogo size="xl" />

            {/* Status Text */}
            <p className="text-center text-sm font-medium text-muted-foreground">
              {t('splash.initializing')}
            </p>
          </div>
        </div>
      )}

      {/* Error Container - 显示错误信息 */}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-card">
          <div className="flex flex-col items-center space-y-6 max-w-md px-6">
            {/* Error Icon - 红色警告图标 */}
            <div className="h-32 w-32 text-destructive">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Error Title */}
            <h3 className="text-lg font-semibold text-foreground">
              {t('chat_panel.init_failed')}
            </h3>

            {/* Error Message */}
            <p className="text-center text-sm text-muted-foreground break-words">
              {error}
            </p>

            {/* Retry Button */}
            <Button
              onClick={() => {
                setError(null)
                setAvatarStage('normal')
                window.lumen_core?.reinitialize()
              }}
              className="mt-4"
            >
              {t('chat_panel.retry')}
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">{t('chat_panel.title')}</h2>
        </div>
      </CardHeader>

      {/* Messages & Input */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Messages Area - 使用 ScrollArea */}
        <ScrollArea className="flex-1" style={{ minHeight: 0 }}>
          <ChatMessages messages={chatMessages}>
            <MessageList
              messages={chatMessages}
              isTyping={messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content === ''}
            />
          </ChatMessages>
        </ScrollArea>

        {/* Input Area */}
        <div className="mt-4 px-2 pb-0 shrink-0">
          <ChatForm
            isPending={isStreaming}
            handleSubmit={handleSendMessage}
          >
            {({ files, setFiles }) => (
              <MessageInput
                placeholder={t('chat_panel.input_placeholder')}
                value={input}
                onChange={handleInputChange}
                allowAttachments
                files={files}
                setFiles={setFiles}
                stop={() => { }}
                isGenerating={isStreaming}
              />
            )}
          </ChatForm>
        </div>
      </div>
    </Card>
  )
}
