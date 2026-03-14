import { useState, memo, useCallback } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../ui/resizable";
import { Button } from "../ui/button";
import { useTheme } from "../../hooks/useTheme";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { StockCard } from "../cards/StockCard";
import { NewsTimeline } from "../cards/NewsCard";
import { ChatBox } from "../chat/ChatBox";

// 使用 memo 优化 MainLayout 组件
const MainLayoutComponent = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("A股");

  const tabs = ["A股", "港股", "美股", "期货", "能源"];

  // 使用 useCallback 优化事件处理函数
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const handleStockClick = useCallback((stockName: string) => {
    console.log(`点击股票: ${stockName}`);
  }, []);

  // 模拟股票数据
  const mockStocks = [
    {
      symbol: "600519",
      name: "贵州茅台",
      currentPrice: 1780.50,
      changePercent: 2.3,
      prices: [1740, 1750, 1765, 1770, 1760, 1775, 1780.50]
    },
    {
      symbol: "000858",
      name: "五粮液",
      currentPrice: 165.80,
      changePercent: -1.2,
      prices: [168, 167, 166, 165, 164, 165, 165.80]
    },
    {
      symbol: "600036",
      name: "招商银行",
      currentPrice: 38.25,
      changePercent: 0.8,
      prices: [37.8, 38.0, 38.1, 38.0, 38.2, 38.3, 38.25]
    },
    {
      symbol: "601318",
      name: "中国平安",
      currentPrice: 45.60,
      changePercent: 3.1,
      prices: [44.2, 44.8, 45.0, 45.2, 45.1, 45.4, 45.60]
    },
    {
      symbol: "000001",
      name: "平安银行",
      currentPrice: 12.35,
      changePercent: -0.5,
      prices: [12.4, 12.4, 12.3, 12.4, 12.3, 12.3, 12.35]
    }
  ];

  // 模拟新闻数据
  const mockNews = [
    {
      title: "市场快讯：A股三大指数集体收涨，北向资金净买入超50亿元",
      content: "今日A股市场表现强劲，上证指数上涨1.2%，深证成指上涨1.8%，创业板指上涨2.1%。北向资金全天净买入52.3亿元，其中沪股通净买入28.1亿元，深股通净买入24.2亿元。",
      timestamp: "14:35",
      sentiment: "positive" as const,
      relatedStocks: [{ symbol: "600519", name: "贵州茅台" }]
    },
    {
      title: "白酒板块午后拉升，贵州茅台股价创历史新高",
      content: "受消费复苏预期提振，白酒板块午后强势拉升。贵州茅台股价一度触及1785元，创历史新高。机构分析认为，高端白酒需求韧性较强，估值修复行情有望延续。",
      timestamp: "13:45",
      sentiment: "positive" as const,
      relatedStocks: [{ symbol: "600519", name: "贵州茅台" }, { symbol: "000858", name: "五粮液" }]
    },
    {
      title: "央行发布最新货币政策报告，强调保持流动性合理充裕",
      content: "中国人民银行发布2024年第一季度货币政策报告，强调将继续实施稳健的货币政策，保持流动性合理充裕，为经济高质量发展提供有力支撑。",
      timestamp: "11:20",
      sentiment: "neutral" as const,
      relatedStocks: []
    },
    {
      title: "美联储官员暗示可能暂停加息，全球股市普遍上涨",
      content: "多位美联储官员表示，考虑到当前通胀水平和就业市场状况，可能在下次会议上暂停加息。受此影响，全球主要股指普遍上涨，投资者风险偏好有所回升。",
      timestamp: "10:15",
      sentiment: "positive" as const,
      relatedStocks: []
    },
    {
      title: "新能源汽车销量增速放缓，产业链公司面临压力",
      content: "最新数据显示，3月份新能源汽车销量同比增长仅为15%，较去年同期明显放缓。业内人士担忧，补贴退坡和竞争加剧可能导致产业链公司业绩承压。",
      timestamp: "09:30",
      sentiment: "warning" as const,
      relatedStocks: []
    }
  ];

  // 模拟聊天发送函数
  const handleSendMessage = useCallback(async (message: string): Promise<string> => {
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 简单的回复逻辑
    if (message.includes('股票') || message.includes('分析')) {
      return "我注意到您对股票分析感兴趣。基于当前市场情况，建议关注以下几个方面：\n\n1. **价值投资**：选择基本面良好的优质公司\n2. **分散投资**：不要把鸡蛋放在一个篮子里\n3. **长期持有**：避免频繁交易，关注长期趋势\n\n需要我为您分析具体的某只股票吗？";
    } else if (message.includes('市场') || message.includes('趋势')) {
      return "当前市场呈现以下特点：\n\n📈 **积极因素**：\n- 流动性保持宽松\n- 政策面持续支持\n- 外资持续流入\n\n⚠️ **需要注意**：\n- 部分板块估值偏高\n- 地缘政治风险\n- 通胀预期变化\n\n建议保持适度谨慎，精选个股。";
    } else {
      return "您好！我是您的 AI 投资助手。我可以帮您：\n\n• 分析股票基本面和技术面\n• 解读市场新闻和政策\n• 提供投资建议和风险提示\n• 跟踪市场热点和行业动态\n\n请问有什么具体想了解的吗？";
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Lumen AI Stock</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {theme === 'light' ? '日间模式' : '暗黑模式'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8"
          >
            {theme === 'light' ? (
              <MoonIcon className="h-4 w-4" />
            ) : (
              <SunIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Sidebar - Navigation */}
        <ResizablePanel defaultSize={10} minSize={8} maxSize={15}>
          <div className="h-full border-r flex flex-col">
            <nav className="flex-1 p-2">
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? "secondary" : "ghost"}
                    className="w-full justify-start h-10 text-sm"
                    onClick={() => handleTabChange(tab)}
                  >
                    {tab}
                  </Button>
                ))}
              </div>
            </nav>
            <div className="p-2 border-t">
              <Button variant="ghost" className="w-full justify-start h-10 text-sm">
                设置
              </Button>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Middle Panel - Market Hub */}
        <ResizablePanel defaultSize={60} minSize={50}>
          <ResizablePanelGroup direction="horizontal">
            {/* Stock List */}
            <ResizablePanel defaultSize={60} minSize={40}>
              <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">股票列表</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {mockStocks.map((stock) => (
                    <StockCard
                      key={stock.symbol}
                      symbol={stock.symbol}
                      name={stock.name}
                      currentPrice={stock.currentPrice}
                      changePercent={stock.changePercent}
                      prices={stock.prices}
                      onClick={() => handleStockClick(stock.name)}
                    />
                  ))}
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* News Timeline */}
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">市场新闻</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <NewsTimeline newsItems={mockNews} />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - AI Assistant */}
        <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
          <div className="h-full">
            <ChatBox 
              onSendMessage={handleSendMessage}
              isLoading={false}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

// 使用 memo 包装组件
export const MainLayout = memo(MainLayoutComponent);

export default MainLayout;