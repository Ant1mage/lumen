import { useState, useEffect } from "react"
import { Languages } from "lucide-react"
import { SettingsItem } from "./settings-item"
import { useTranslation } from "react-i18next"
import { logger } from "@renderer/tools/logger"
import { cn } from "@renderer/tools/utils"

export function SettingsLanguageItem() {
    const [language, setLanguage] = useState<'zh-CN' | 'en-US'>('zh-CN')
    const [isOpen, setIsOpen] = useState(false)
    const { t, i18n } = useTranslation()

    useEffect(() => {
        const loadLanguage = async () => {
            if (window.store_config?.getUserSettings) {
                const settings = await window.store_config.getUserSettings()
                if (settings.language) {
                    const lang = settings.language as 'zh-CN' | 'en-US'
                    setLanguage(lang)
                    // 不要在这里立即调用 i18n.changeLanguage，避免闪烁
                }
            }
        }
        loadLanguage()
    }, [])

    const handleLanguageChange = async (selectedLang: 'zh-CN' | 'en-US') => {
        setLanguage(selectedLang)
        setIsOpen(false)

        // 更新 i18next 的语言设置
        await i18n.changeLanguage(selectedLang)

        // 保存到主进程
        if (window.store_config?.setLanguage) {
            window.store_config.setLanguage(selectedLang)
        }

        logger.info(`语言已切换为：${selectedLang}`, 'Settings')
    }

    const getLanguageIcon = () => {
        return <Languages className="h-4 w-4" />
    }

    return (
        <SettingsItem label={t('settings_page.language')}>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm",
                        "hover:bg-accent hover:text-accent-foreground",
                        "dark:border-border/50"
                    )}
                >
                    {getLanguageIcon()}
                    <span>{language === 'zh-CN' ? '简体中文' : 'English'}</span>
                </button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className={cn(
                            "absolute right-0 top-full mt-2 z-20 min-w-[160px] rounded-md border bg-popover p-1 shadow-md",
                            "dark:border-border/50 dark:bg-popover"
                        )}>
                            <button
                                onClick={() => handleLanguageChange('zh-CN')}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded px-3 py-2 text-sm mb-0.5",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    language === 'zh-CN' && "bg-accent text-accent-foreground"
                                )}
                            >
                                <Languages className="h-4 w-4" />
                                简体中文
                            </button>
                            <button
                                onClick={() => handleLanguageChange('en-US')}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded px-3 py-2 text-sm",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    language === 'en-US' && "bg-accent text-accent-foreground"
                                )}
                            >
                                <Languages className="h-4 w-4" />
                                English
                            </button>
                        </div>
                    </>
                )}
            </div>
        </SettingsItem>
    )
}
