"use client"

import { useState } from "react"
import { Send, Sparkles, User, LineChart, TrendingUp, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

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
    content: "你好！我是您的 AI 股票分析助手。我可以帮您分析市场趋势、解读财经新闻、提供投资建议。请问有什么可以帮您的吗？",
    time: "18:40"
  },
  {
    id: "2",
    role: "user",
    content: "你什么是塞近？",
    time: "18:42"
  },
  {
    id: "3",
    role: "assistant",
    content: "您好！我是您的 AI 股票分析助手。我可以帮您分析市场趋势，解读财经新闻，推荐投资策略。\n\n根据当前市场数据，热门板块包括新能源、科技和消费。建议关注龙头企业的表现。\n\n请问有什么具体问题需要我分析吗？",
    time: "18:43"
  }
]

const quickActions = [
  { label: "市场概览", icon: LineChart },
  { label: "个股诊断", icon: BarChart3 },
  { label: "趋势分析", icon: TrendingUp }
]

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
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
        content: "感谢您的提问！我正在为您分析相关数据，请稍候...",
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
            {action.label}
          </Button>
        ))}
      </div>
      
      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 rounded-2xl bg-secondary/50 px-4 py-2.5">
          <input
            type="text"
            placeholder="输入您的问题..."
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
