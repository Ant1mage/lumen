import { useState, useEffect } from "react"
import { Languages, ChevronRight } from "lucide-react"
import { cn } from "@renderer/tools/utils"
import { SettingsItem } from "./settings-item"
import { useTranslation } from "react-i18next"
import { logger } from "@renderer/tools/logger"

export function SettingsLanguageItem() {
    const [language, setLanguage] = useState<'zh-CN' | 'en-US'>('zh-CN')
    const [showPopover, setShowPopover] = useState(false)
    const { t, i18n } = useTranslation()

    useEffect(() => {
        const loadLanguage = async () => {
            if (window.store_config?.getUserSettings) {
                const settings = await window.store_config.getUserSettings()
                if (settings.language) {
                    const lang = settings.language as 'zh-CN' | 'en-US'
                    setLanguage(lang)
                    await i18n.changeLanguage(lang)
                }
            }
        }
        loadLanguage()
    }, [])

    const handleLanguageChange = async (selectedLang: 'zh-CN' | 'en-US') => {
        setLanguage(selectedLang)
        setShowPopover(false)

        // 更新 i18next 的语言设置
        await i18n.changeLanguage(selectedLang)

        // 保存到主进程
        if (window.store_config?.setLanguage) {
            window.store_config.setLanguage(selectedLang)
        }

        logger.info(`语言已切换为：${selectedLang}`, 'Settings')
    }

    return (
        <SettingsItem label={t('settings_page.language')}>
            <div className="relative">
                <button
                    className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent transition-all"
                    onClick={() => setShowPopover(!showPopover)}
                >
                    <span className="text-foreground">{language === 'zh-CN' ? '简体中文' : 'English'}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                {showPopover && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowPopover(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl border border-border bg-card p-1.5 shadow-lg">
                            <button
                                className={cn(
                                    "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
                                    language === 'zh-CN'
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-accent/50 text-foreground"
                                )}
                                onClick={() => handleLanguageChange('zh-CN')}
                            >
                                <Languages className="h-4 w-4" />
                                <span>简体中文</span>
                            </button>
                            <button
                                className={cn(
                                    "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
                                    language === 'en-US'
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-accent/50 text-foreground"
                                )}
                                onClick={() => handleLanguageChange('en-US')}
                            >
                                <Languages className="h-4 w-4" />
                                <span>English</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </SettingsItem>
    )
}
