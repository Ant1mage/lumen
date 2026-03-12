import { useEffect, useMemo, useState } from 'react';
import ChatBox from './components/ChatBox';

interface ModelSelection {
  llm: string;
  embedding: string;
  llmGpuLayers: number;
  embeddingGpuLayers: number;
  contextSize: number;
}

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function App() {
  const [modelReady, setModelReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [modelSelection, setModelSelection] = useState<ModelSelection | null>(
    null,
  );
  const [modelStatus, setModelStatus] = useState<string>('');

  const checkReady = async () => {
    try {
      // @ts-ignore - window.api 在 preload 中定义
      const ready = await window.api.isReady();
      setModelReady(!!ready);
    } catch (error) {
      console.warn('检查模型状态失败', error);
    }
  };

  const refreshHistory = async () => {
    try {
      // @ts-ignore
      const records = await window.api.getChatHistory();
      setHistory(
        records.map((item: any) => ({
          id: Date.now() + Math.random(),
          role: item.role === 'assistant' ? 'assistant' : 'user',
          content: item.content,
          timestamp: new Date(item.timestamp),
        })),
      );
    } catch (error) {
      console.warn('获取会话历史失败', error);
    }
  };

  const loadModelInfo = async () => {
    try {
      // @ts-ignore
      const models = await window.api.getAvailableModels();
      setAvailableModels(models || []);

      // @ts-ignore
      const selection = await window.api.getCurrentModelSelection();
      setModelSelection(selection || null);
    } catch (error) {
      console.warn('获取模型信息失败', error);
    }
  };

  useEffect(() => {
    checkReady();
    loadModelInfo();
    refreshHistory();

    const interval = setInterval(checkReady, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (
    message: string,
    onToken: (token: string) => void,
  ) => {
    if (!modelReady) {
      return '模型正在加载中，请稍候...';
    }

    setLoading(true);
    try {
      // @ts-ignore - window.api 在 preload 中定义
      const result = await window.api.askQuestionStream(message, onToken);
      // 发送完毕后可以再次拉取历史以确保与后端一致
      await refreshHistory();
      return result;
    } catch (error) {
      return `回答失败：${error instanceof Error ? error.message : '未知错误'}`;
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      // @ts-ignore
      await window.api.clearChatHistory();
      setHistory([]);
    } catch (error) {
      console.warn('清除会话历史失败', error);
    }
  };

  const handleModelChange = async (
    key: keyof ModelSelection,
    value: string | number,
  ) => {
    if (!modelSelection) return;

    const next = {
      ...modelSelection,
      [key]: value,
    } as ModelSelection;

    setModelSelection(next);

    try {
      // @ts-ignore
      await window.api.setModels({
        llmModelFile: next.llm,
        embeddingModelFile: next.embedding,
        llmGpuLayers: next.llmGpuLayers,
        embeddingGpuLayers: next.embeddingGpuLayers,
        contextSize: next.contextSize,
      });
      setModelStatus('模型切换成功');
    } catch (error) {
      setModelStatus(
        `模型切换失败：${error instanceof Error ? error.message : '未知错误'}`,
      );
    }
  };

  const statusMessage = useMemo(() => {
    if (modelReady) return '模型已就绪，开始对话吧。';
    return '模型正在加载中，请稍候...';
  }, [modelReady]);

  return (
    <div className="app">
      <header className="header">
        <h1>✨ Lumen Chat</h1>
        <p>{statusMessage}</p>
      </header>

      <main className="main">
        <section className="section chat-section">
          <ChatBox
            initialMessages={history}
            onSendMessage={handleSendMessage}
            isLoading={loading}
          />

          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleClearHistory}>
              清空会话历史
            </button>
          </div>

          <div style={{ marginTop: 24 }}>
            <h2>模型设置</h2>
            <div className="input-group">
              <select
                className="input-field"
                value={modelSelection?.llm || ''}
                onChange={(e) => handleModelChange('llm', e.target.value)}
              >
                {availableModels.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                className="input-field"
                value={modelSelection?.embedding || ''}
                onChange={(e) => handleModelChange('embedding', e.target.value)}
              >
                {availableModels.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <p style={{ fontSize: 12, opacity: 0.8 }}>{modelStatus}</p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Local LLM + RAG + Magic UI</p>
      </footer>
    </div>
  );
}

export default App;
