/**
 * 用户设置相关类型和常量
 * 用于主进程和渲染进程之间的类型共享
 */

// ============================================================
// 主题设置
// ============================================================

/**
 * 主题模式类型
 */
export type ThemeMode = 'system' | 'light' | 'dark';

/**
 * 主题常量
 */
export const THEMES = {
  SYSTEM: 'system' as ThemeMode,
  LIGHT: 'light' as ThemeMode,
  DARK: 'dark' as ThemeMode,
} as const;

// ============================================================
// 侧边栏导航
// ============================================================

/**
 * 侧边栏导航项标识
 */
export type SidebarNavItemKey = 
  | 'a_share'
  | 'hk_stock'
  | 'us_stock'
  | 'futures'
  | 'energy';

/**
 * 侧边栏导航项常量
 */
export const SIDEBAR_NAV_ITEMS = {
  A_SHARE: 'a_share' as SidebarNavItemKey,
  HK_STOCK: 'hk_stock' as SidebarNavItemKey,
  US_STOCK: 'us_stock' as SidebarNavItemKey,
  FUTURES: 'futures' as SidebarNavItemKey,
  ENERGY: 'energy' as SidebarNavItemKey,
} as const;

// ============================================================
// 语言设置
// ============================================================

/**
 * 语言代码类型
 */
export type LanguageCode = 'zh-CN' | 'en-US';

/**
 * 语言常量
 */
export const LANGUAGES = {
  ZH_CN: 'zh-CN' as LanguageCode,
  EN_US: 'en-US' as LanguageCode,
} as const;

// ============================================================
// 用户设置接口
// ============================================================

/**
 * 用户设置接口
 */
export interface UserSettings {
  theme: ThemeMode;
  sidebar_choose?: SidebarNavItemKey;
  language?: LanguageCode;
}

/**
 * 默认用户设置
 */
export const DEFAULT_SETTINGS = {
  THEME: THEMES.DARK,
  SIDEBAR_CHOOSE: SIDEBAR_NAV_ITEMS.A_SHARE,
  LANGUAGE: LANGUAGES.ZH_CN,
} as const;
