import { useState, useEffect } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { SettingsItem } from "./settings-item"
import { useTranslation } from "react-i18next"
import { cn } from "@renderer/tools/utils"

export function SettingsThemeItem() {
    const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('dark')
    const [isOpen, setIsOpen] = useState(false)
    const { t } = useTranslation()

    useEffect(() => {
        const loadTheme = async () => {
            if (window.store_config?.getTheme) {
                const savedTheme = await window.store_config.getTheme()
                setTheme(savedTheme)
                applyTheme(savedTheme)
            }
        }
        loadTheme()
    }, [])

    const applyTheme = (selectedTheme: 'system' | 'light' | 'dark') => {
        const html = document.documentElement

        if (selectedTheme === 'system') {
            const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            if (isSystemDark) {
                html.classList.add('dark')
            } else {
                html.classList.remove('dark')
            }
        } else if (selectedTheme === 'dark') {
            html.classList.add('dark')
        } else {
            html.classList.remove('dark')
        }

        localStorage.setItem("theme", selectedTheme)
    }

    const handleThemeChange = (selectedTheme: 'system' | 'light' | 'dark') => {
        setTheme(selectedTheme)
        applyTheme(selectedTheme)
        setIsOpen(false)

        if (window.store_config?.setTheme) {
            window.store_config.setTheme(selectedTheme)
        }
    }

    const getThemeLabel = () => {
        switch (theme) {
            case 'system': return t('settings_page.theme_options.system')
            case 'light': return t('settings_page.theme_options.light')
            case 'dark': return t('settings_page.theme_options.dark')
        }
    }

    const getThemeIcon = () => {
        switch (theme) {
            case 'system': return <Monitor className="h-4 w-4" />
            case 'light': return <Sun className="h-4 w-4" />
            case 'dark': return <Moon className="h-4 w-4" />
        }
    }

    return (
        <SettingsItem label={t('settings_page.dark_mode')}>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm",
                        "hover:bg-accent hover:text-accent-foreground",
                        "dark:border-border/50"
                    )}
                >
                    {getThemeIcon()}
                    <span>{getThemeLabel()}</span>
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
                                onClick={() => handleThemeChange('system')}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded px-3 py-2 text-sm mb-0.5",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    theme === 'system' && "bg-accent text-accent-foreground"
                                )}
                            >
                                <Monitor className="h-4 w-4" />
                                {t('settings_page.theme_options.system')}
                            </button>
                            <button
                                onClick={() => handleThemeChange('light')}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded px-3 py-2 text-sm mb-0.5",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    theme === 'light' && "bg-accent text-accent-foreground"
                                )}
                            >
                                <Sun className="h-4 w-4" />
                                {t('settings_page.theme_options.light')}
                            </button>
                            <button
                                onClick={() => handleThemeChange('dark')}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded px-3 py-2 text-sm",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    theme === 'dark' && "bg-accent text-accent-foreground"
                                )}
                            >
                                <Moon className="h-4 w-4" />
                                {t('settings_page.theme_options.dark')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </SettingsItem>
    )
}
