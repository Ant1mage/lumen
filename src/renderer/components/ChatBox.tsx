import React, { useState } from 'react';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatBoxProps {
  onSendMessage: (
    message: string,
    onToken: (token: string) => void,
  ) => Promise<string>;
  initialMessages?: ChatMessage[];
  isLoading?: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  onSendMessage,
  initialMessages = [],
  isLoading = false,
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  React.useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);
  const messagesRef = React.useRef<HTMLDivElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const assistantId = Date.now() + 1;
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    const onToken = (token: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: msg.content + token }
            : msg,
        ),
      );
    };

    try {
      await onSendMessage(input, onToken);
    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content: `发送失败：${
                  error instanceof Error ? error.message : '未知错误'
                }`,
              }
            : msg,
        ),
      );
    }
  };

  React.useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, isLoading]);

  return (
    <div className="chat-box">
      <div className="chat-messages" ref={messagesRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
            <div className="message-time">
              {msg.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant loading">
            <div className="loading-dots">思考中...</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入您的问题..."
          className="chat-input"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="send-btn"
        >
          发送
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
