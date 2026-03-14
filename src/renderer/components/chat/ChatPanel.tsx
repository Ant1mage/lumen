import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@renderer/lib/utils';
import type { ChatMessage } from '@renderer/types';

interface ChatPanelProps {
  className?: string;
}

// Mock 初始消息
const initialMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: '您好！我是您的 AI 股票分析助手。我可以帮您分析市场趋势、解读财经新闻、提供投资建议。请问有什么可以帮您的？',
    timestamp: new Date().toISOString(),
  },
];

/**
 * 右侧 AI 智能助手面板组件
 * 包含聊天展示区和输入区
 */
export const ChatPanel: React.FC<ChatPanelProps> = ({ className }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);
  
  // 处理发送消息
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    // 添加用户消息
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // 模拟 AI 响应（实际应调用后端 API）
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '这是一个模拟回复。在实际应用中，这里会显示 AI 模型的分析结果。您可以询问我关于股票、市场、财经新闻等问题。',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // 清空输入
  const handleClear = () => {
    setInputValue('');
    textareaRef.current?.focus();
  };
  
  return (
    <div className={cn('flex h-full flex-col bg-card', className)}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h2 className="text-sm font-semibold">AI 智能助手</h2>
        <button
          onClick={() => setMessages(initialMessages)}
          className="rounded p-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          title="清空对话"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>
      
      {/* 聊天展示区 */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-hide">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {/* 头像 */}
            <div
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              )}
            >
              {message.role === 'user' ? 'U' : 'AI'}
            </div>
            
            {/* 消息内容 */}
            <div
              className={cn(
                'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <p className="whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
              <time className="mt-1 block text-[10px] opacity-60">
                {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>
          </div>
        ))}
        
        {/* 打字中状态 */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">
              AI
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-2">
              <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-current" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* 输入区 */}
      <div className="border-t p-3">
        <div className="relative flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入您的问题... (Shift+Enter 换行)"
            rows={1}
            className={cn(
              'flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm',
              'placeholder:text-muted-foreground',
              'focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring',
              'scrollbar-hide',
              'min-h-[40px] max-h-[120px]'
            )}
          />
          
          {/* 操作按钮 */}
          <div className="flex gap-1 pb-0.5">
            {inputValue && (
              <button
                onClick={handleClear}
                className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                title="清空"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
            
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className={cn(
                'rounded p-2 transition-colors',
                inputValue.trim() && !isTyping
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
              title="发送"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
