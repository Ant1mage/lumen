import { useState } from 'react';

function App() {
  const [stockSymbol, setStockSymbol] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyzeStock = async () => {
    if (!stockSymbol) return;
    
    setLoading(true);
    try {
      // @ts-ignore - window.api 在 preload 中定义
      const result = await window.api.analyzeStock(stockSymbol);
      setAnalysis(result);
    } catch (error) {
      setAnalysis(`分析失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question) return;
    
    setLoading(true);
    try {
      // @ts-ignore - window.api 在 preload 中定义
      const result = await window.api.askQuestion(question);
      setAnswer(result);
    } catch (error) {
      setAnswer(`回答失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📈 Lumen AI 股票分析</h1>
        <p>基于 RAG 和本地 LLM 的智能股票分析系统</p>
      </header>

      <main className="main">
        {/* 股票分析部分 */}
        <section className="section stock-analysis">
          <h2>股票分析</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="输入股票代码 (如：AAPL)"
              value={stockSymbol}
              onChange={(e) => setStockSymbol(e.target.value)}
              className="input-field"
            />
            <button 
              onClick={handleAnalyzeStock} 
              disabled={loading || !stockSymbol}
              className="btn btn-primary"
            >
              {loading ? '分析中...' : '分析股票'}
            </button>
          </div>
          
          {analysis && (
            <div className="result-box">
              <h3>分析结果</h3>
              <p className="result-content">{analysis}</p>
            </div>
          )}
        </section>

        {/* 问答部分 */}
        <section className="section qa-section">
          <h2>智能问答</h2>
          <div className="input-group">
            <textarea
              placeholder="输入您的问题..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="textarea-field"
              rows={3}
            />
            <button 
              onClick={handleAskQuestion} 
              disabled={loading || !question}
              className="btn btn-primary"
            >
              {loading ? '思考中...' : '提问'}
            </button>
          </div>
          
          {answer && (
            <div className="result-box">
              <h3>回答</h3>
              <p className="result-content">{answer}</p>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>Powered by NodeLlamaCPP + Better SQLite3 + RAG</p>
      </footer>
    </div>
  );
}

export default App;
