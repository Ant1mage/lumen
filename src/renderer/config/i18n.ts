import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 中文翻译
const zhCN = {
  translation: {
    // 通用
    common: {
      loading: '加载中...',
      confirm: '确认',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      search: '搜索',
      settings: '设置'
    },
    
    // 侧边栏
    sidebar: {
      expand: '展开',
      collapse: '收起',
      settings: '设置',
      stocks: {
        a_share: 'A 股',
        hk_stock: '港股',
        us_stock: '美股',
        futures: '期货',
        energy: '能源'
      }
    },
    
    // 设置页面
    settings_page: {
      title: '设置',
      dark_mode: '深色模式',
      theme_options: {
        system: '跟随系统',
        light: '关闭',
        dark: '打开'
      },
      language: '语言'
    },
    
    // 股票行情面板
    stock_panel: {
      title: '行情',
      real_time: '实时数据'
    },
    
    // 新闻面板
    news_panel: {
      title: '实时新闻',
      categories: {
        tech: '科技',
        market: '市场',
        new_energy: '新能源',
        finance: '金融',
        policy: '政策'
      },
      tags: {
        tech: '科技',
        new_energy: '新能源',
        market: '市场',
        hot: '热点',
        ai: 'AI',
        fund: '资金',
        policy: '政策'
      }
    },
    
    // AI 聊天面板
    chat_panel: {
      title: '分析',
      quick_actions: {
        market_overview: '市场概览',
        stock_diagnosis: '个股诊断',
        trend_analysis: '趋势分析'
      },
      input_placeholder: '输入您的问题...',
      ai_loading: '感谢您的提问！我正在为您分析相关数据，请稍候...'
    },
    
    // 启动页
    splash: {
      initializing: '正在初始化...',
      ready: '准备就绪',
      error: '初始化失败',
      retry: '重新加载',
      retrying: '正在重试...'
    },
    
    // LumenCore 状态
    lumen_status: {
      idle: '空闲',
      initializing: '正在初始化...',
      ready: '已就绪',
      error: '错误',
      disposing: '正在释放资源...'
    }
  }
};

// 英文翻译
const enUS = {
  translation: {
    // 通用
    common: {
      loading: 'Loading...',
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      settings: 'Settings'
    },
    
    // 侧边栏
    sidebar: {
      expand: 'Expand',
      collapse: 'Collapse',
      settings: 'Settings',
      stocks: {
        a_share: 'A-Share',
        hk_stock: 'HK Stock',
        us_stock: 'US Stock',
        futures: 'Futures',
        energy: 'Energy'
      }
    },
    
    // 设置页面
    settings_page: {
      title: 'Settings',
      dark_mode: 'Dark Mode',
      theme_options: {
        system: 'System',
        light: 'Light',
        dark: 'Dark'
      },
      language: 'Language'
    },
    
    // 股票行情面板
    stock_panel: {
      title: 'Market',
      real_time: 'Real-time'
    },
    
    // 新闻面板
    news_panel: {
      title: 'Real-time News',
      categories: {
        tech: 'Technology',
        market: 'Market',
        new_energy: 'New Energy',
        finance: 'Finance',
        policy: 'Policy'
      },
      tags: {
        tech: 'Tech',
        new_energy: 'New Energy',
        market: 'Market',
        hot: 'Hot',
        ai: 'AI',
        fund: 'Fund',
        policy: 'Policy'
      }
    },
    
    // AI 聊天面板
    chat_panel: {
      title: 'Chat',
      quick_actions: {
        market_overview: 'Market Overview',
        stock_diagnosis: 'Stock Diagnosis',
        trend_analysis: 'Trend Analysis'
      },
      input_placeholder: 'Enter your question...',
      ai_loading: 'Thank you for your question! I\'m analyzing the relevant data for you, please wait...'
    },
    
    // 启动页
    splash: {
      initializing: 'Initializing...',
      ready: 'Ready',
      error: 'Initialization failed',
      retry: 'Reload',
      retrying: 'Retrying...'
    },
    
    // LumenCore 状态
    lumen_status: {
      idle: 'Idle',
      initializing: 'Initializing...',
      ready: 'Ready',
      error: 'Error',
      disposing: 'Disposing...'
    }
  }
};

const resources = {
  'zh-CN': zhCN,
  'en-US': enUS
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-CN',
    debug: false,
    interpolation: {
      escapeValue: false // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
