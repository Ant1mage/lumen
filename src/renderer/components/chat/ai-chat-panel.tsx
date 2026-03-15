'use client'

import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { AIChatMessagesPanel } from "./ai-chat-messages-panel"
import { AIChatInputPanel } from "./ai-chat-input-panel"
import { Button } from "@renderer/components/ui/button"
import { AILogo } from "@renderer/components/ui/ai-logo"
import { useTranslation } from "react-i18next"
import { LLMMessage, LLMRole, LumenCoreState } from "@shared/types"
import { logger } from "@renderer/tools/logger"

// 渲染层扩展的消息类型（带 UI 元数据）
interface UIMessage extends LLMMessage {
  id: string
  time: string
  isStreaming?: boolean
}

export function AIChatPanel() {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [avatarStage, setAvatarStage] = useState<'normal' | 'enlarge' | 'shrink'>('normal')
  const [error, setError] = useState<string | null>(null)

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

  const handleSendMessage = async (content: string) => {
    if (!window.lumen_core || isStreaming) return

    // 添加用户消息
    const userMessage: UIMessage = {
      id: Date.now().toString(),
      role: LLMRole.User,
      content,
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
    }

    setMessages(prev => [...prev, userMessage])
    setIsStreaming(true)

    // 创建 AI 消息占位符
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage: UIMessage = {
      id: aiMessageId,
      role: LLMRole.Assistant,
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
        logger.error(`发送消息失败：${result.error}`, 'AIChatPanel')
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

  const handleQuickAction = (action: string) => {
    logger.debug(`快速操作：${action}`, 'AIChatPanel')
    // TODO: Implement quick action logic
  }

  return (
    <div className="relative flex h-full flex-col bg-card">
      {/* Loading Container - 覆盖整个 Chat Panel */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-card">
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
