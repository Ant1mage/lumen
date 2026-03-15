import {
  ChatMessage,
  type ChatMessageProps,
  type Message,
} from "@renderer/components/ui/chat-message"
import { TypingIndicator } from "@renderer/components/ui/typing-indicator"

type AdditionalMessageOptions = Omit<ChatMessageProps, keyof Message>

interface MessageListProps {
  messages: Message[]
  showTimeStamps?: boolean
  isTyping?: boolean
  messageOptions?:
  | AdditionalMessageOptions
  | ((message: Message) => AdditionalMessageOptions)
}

export function MessageList({
  messages,
  showTimeStamps = true,
  isTyping = false,
  messageOptions,
}: MessageListProps) {
  return (
    <div className="space-y-4 px-3 py-4">
      {messages.map((message, index) => {
        const additionalOptions =
          typeof messageOptions === "function"
            ? messageOptions(message)
            : messageOptions

        // 如果是最后一条 assistant 消息且内容为空，在气泡内显示 TypingIndicator
        if (
          message.role === 'assistant' &&
          message.content === '' &&
          index === messages.length - 1
        ) {
          return (
            <ChatMessage
              key={index}
              showTimeStamp={showTimeStamps}
              {...message}
              content={<TypingIndicator />}
              {...additionalOptions}
            />
          )
        }

        return (
          <ChatMessage
            key={index}
            showTimeStamp={showTimeStamps}
            {...message}
            {...additionalOptions}
          />
        )
      })}
    </div>
  )
}
