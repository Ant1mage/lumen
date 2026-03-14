import {
  UserSettings,
  ThemeMode,
  SidebarNavItemKey,
  LanguageCode,
  DEFAULT_SETTINGS
} from '@shared/user-settings'

/**
 * StoreService - 配置存储服务
 * 
 * 负责管理配置的持久化存储
 * 提供完整的配置对象读写接口
 */
export class StoreService {
  private static instance: StoreService;
  private userStore: any = null;

  private constructor() {}

  // 获取单例实例
  public static getInstance(): StoreService {
    if (!StoreService.instance) {
      StoreService.instance = new StoreService();
    }
    return StoreService.instance;
  }

  /**
   * 懒加载初始化 store
   */
  private async initStore(): Promise<void> {
    if (!this.userStore) {
      const ElectronStore = (await import('electron-store')).default;
      this.userStore = new ElectronStore({
        name: 'UserSettingConfig',
        defaults: {
          theme: DEFAULT_SETTINGS.THEME,
          sidebar_choose: DEFAULT_SETTINGS.SIDEBAR_CHOOSE,
          language: DEFAULT_SETTINGS.LANGUAGE
        }
      });
    }
  }

  // ==================== 用户设置相关方法 ====================

  /**
   * 获取用户设置
   */
  async getUserSettings(): Promise<UserSettings> {
    await this.initStore();
    return this.userStore.store as UserSettings;
  }

  /**
   * 设置用户设置
   * @param settings - 完整的用户设置对象
   */
  async setUserSettings(settings: UserSettings): Promise<void> {
    await this.initStore();
    // 将 UserSettings 对象转换为 map 存储
    Object.entries(settings).forEach(([key, value]) => {
      this.userStore.set(key, value);
    });
  }

  // ==================== 侧边栏选中项相关便捷方法 ====================

  /**
   * 获取当前选中的侧边栏导航项
   */
  async getSidebarChoose(): Promise<SidebarNavItemKey> {
    const settings = await this.getUserSettings();
    return (settings.sidebar_choose as SidebarNavItemKey) || DEFAULT_SETTINGS.SIDEBAR_CHOOSE;
  }

  /**
   * 设置当前选中的侧边栏导航项
   * @param key - 导航项的标识（如 "a_share", "hk_stock" 等）
   */
  async setSidebarChoose(key: SidebarNavItemKey): Promise<void> {
    const settings = await this.getUserSettings();
    settings.sidebar_choose = key;
    await this.setUserSettings(settings);
  }
}
