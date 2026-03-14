import { useState, useEffect } from "react"
import { Sun, Moon, Monitor, ChevronRight } from "lucide-react"
import { cn } from "@renderer/tools/utils"
import { SettingsItem } from "./settings-item"
import { useTranslation } from "react-i18next"

export function SettingsThemeItem() {
    const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('dark')
    const [showPopover, setShowPopover] = useState(false)
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
        setShowPopover(false)

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

    return (
        <SettingsItem label={t('settings_page.dark_mode')}>
            <div className="relative">
                <button
                    className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent transition-all"
                    onClick={() => setShowPopover(!showPopover)}
                >
                    <span className="text-foreground">{getThemeLabel()}</span>
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
                                    theme === 'system'
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-accent/50 text-foreground"
                                )}
                                onClick={() => handleThemeChange('system')}
                            >
                                <Monitor className="h-4 w-4" />
                                <span>{t('settings_page.theme_options.system')}</span>
                            </button>
                            <button
                                className={cn(
                                    "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
                                    theme === 'light'
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-accent/50 text-foreground"
                                )}
                                onClick={() => handleThemeChange('light')}
                            >
                                <Sun className="h-4 w-4" />
                                <span>{t('settings_page.theme_options.light')}</span>
                            </button>
                            <button
                                className={cn(
                                    "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
                                    theme === 'dark'
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-accent/50 text-foreground"
                                )}
                                onClick={() => handleThemeChange('dark')}
                            >
                                <Moon className="h-4 w-4" />
                                <span>{t('settings_page.theme_options.dark')}</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </SettingsItem>
    )
}
