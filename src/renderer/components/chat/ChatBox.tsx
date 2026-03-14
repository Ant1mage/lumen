import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

// 消息类型
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// 聊天框组件属性
interface ChatBoxProps {
  messages?: Message[];
  onSendMessage?: (message: string) => Promise<string>;
  isLoading?: boolean;
  className?: string;
}

// 单个消息组件 - 使用 memo 优化
const MessageItem = memo(({ message }: { message: Message }) => {
  // 格式化时间
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  return (
    <div 
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          message.role === 'user' 
            ? 'bg-primary text-primary-foreground rounded-br-md' 
            : 'bg-muted text-foreground rounded-bl-md'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
        <div 
          className={`text-xs mt-2 ${
            message.role === 'user' 
              ? 'text-primary-foreground/70' 
              : 'text-muted-foreground'
          }`}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
});

// 加载指示器组件
const LoadingIndicator = memo(() => (
  <div className="flex justify-start">
    <div className="bg-muted text-foreground rounded-2xl rounded-bl-md px-4 py-3">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span className="text-sm text-muted-foreground ml-2">AI 正在思考...</span>
      </div>
    </div>
  </div>
));

export const ChatBoxComponent: React.FC<ChatBoxProps> = ({ 
  messages = [], 
  onSendMessage,
  isLoading = false,
  className = '' 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部 - 使用 useCallback 优化
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [localMessages, scrollToBottom]);

  // 发送消息处理 - 使用 useCallback 优化
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || !onSendMessage || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // 添加用户消息
    setLocalMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      // 调用发送消息回调
      const response = await onSendMessage(inputValue.trim());
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      // 添加助手回复
      setLocalMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `抱歉，发送消息时出现错误: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: new Date(),
      };
      setLocalMessages(prev => [...prev, errorMessage]);
    }
  }, [inputValue, onSendMessage, isLoading]);

  // 键盘事件处理 - 使用 useCallback 优化
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // 快捷提示点击处理
  const handleQuickSuggestionClick = useCallback((text: string) => {
    setInputValue(text);
  }, []);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {localMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="text-lg mb-2">👋</div>
            <div className="text-center">
              <p className="font-medium">欢迎使用 Lumen AI 助手</p>
              <p className="text-sm mt-1">有什么我可以帮助您的吗？</p>
            </div>
          </div>
        ) : (
          localMessages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))
        )}
        
        {/* 加载指示器 */}
        {isLoading && <LoadingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="输入您的问题..."
              disabled={isLoading}
              rows={1}
              className="w-full px-4 py-3 border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                minHeight: '44px',
                maxHeight: '120px',
              }}
            />
          </div>
          <Button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="self-end h-11 px-6"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                发送中
              </div>
            ) : (
              '发送'
            )}
          </Button>
        </div>
        
        {/* 快捷提示 */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge 
            variant="secondary" 
            className="text-xs cursor-pointer hover:bg-accent"
            onClick={() => handleQuickSuggestionClick('分析这只股票')}
          >
            分析这只股票
          </Badge>
          <Badge 
            variant="secondary" 
            className="text-xs cursor-pointer hover:bg-accent"
            onClick={() => handleQuickSuggestionClick('市场趋势')}
          >
            市场趋势
          </Badge>
          <Badge 
            variant="secondary" 
            className="text-xs cursor-pointer hover:bg-accent"
            onClick={() => handleQuickSuggestionClick('投资建议')}
          >
            投资建议
          </Badge>
        </div>
      </div>
    </div>
  );
};

// 使用 memo 包装主组件
export const ChatBox = memo(ChatBoxComponent);

export default ChatBox;