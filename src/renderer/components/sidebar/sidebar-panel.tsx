
import { useState, useEffect } from "react"
import { cn } from "@renderer/tools/utils"
import {
    BarChart3,
    Globe2,
    DollarSign,
    Flame,
    Zap,
    Settings,
    PanelLeftClose,
    PanelLeft
} from "lucide-react"
import { Button } from "@renderer/components/ui/button"
import { AILogo } from "@renderer/components/ui/ai-logo"
import { SettingsPanel } from "@renderer/components/settings/settings-panel"
import { useTranslation } from "react-i18next"
import { Card } from "../ui/card"

interface SidebarNavItem {
    icon: React.ElementType
    label: string
    key: string // 导航项的标识
    active?: boolean
    badge?: string
    onClick?: () => void
}

export function SidebarPanel() {
    const [expanded, setExpanded] = useState(false)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [activeItem, setActiveItem] = useState<string>('a_share')
    const { t } = useTranslation()

    // 定义导航项（使用函数来获取翻译）
    const getNavItems = (): SidebarNavItem[] => [
        { icon: BarChart3, label: t('sidebar.stocks.a_share'), key: "a_share" },
        { icon: Globe2, label: t('sidebar.stocks.hk_stock'), key: "hk_stock" },
        { icon: DollarSign, label: t('sidebar.stocks.us_stock'), key: "us_stock" },
        { icon: Flame, label: t('sidebar.stocks.futures'), key: "futures" },
        { icon: Zap, label: t('sidebar.stocks.energy'), key: "energy" }
    ]

    const getBottomItems = (): SidebarNavItem[] => [
        {
            icon: PanelLeft,
            label: t('sidebar.collapse'),
            key: "collapse",
            onClick: () => { }
        },
        {
            icon: Settings,
            label: t('sidebar.settings'),
            key: "settings",
            onClick: () => { }
        }
    ]

    // 从主进程读取选中的导航项
    useEffect(() => {
        const loadActiveItem = async () => {
            if (window.view?.getSidebarChoose) {
                const savedKey = await window.view.getSidebarChoose()
                setActiveItem(savedKey)
            }
        }
        loadActiveItem()
    }, [])

    const navItems = getNavItems()
    const bottomItems = getBottomItems()

    // 更新底部项的 onClick
    bottomItems[0].onClick = () => setExpanded(!expanded)
    bottomItems[1].onClick = () => setSettingsOpen(true)

    return (
        <Card className={cn(
            "mr-3 flex h-full flex-col rounded-2xl border border-border/50 bg-card transition-all duration-300",
            expanded ? "w-[200px]" : "w-[72px]"
        )}>
            {/* AI Avatar */}
            <div className="flex h-16 items-center px-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <AILogo size="sm" />
                </div>
                <span className={cn(
                    "whitespace-nowrap text-lg font-semibold text-foreground transition-all duration-300 overflow-hidden",
                    expanded ? "w-auto opacity-100 ml-3" : "w-0 opacity-0 ml-0"
                )}>Lumen</span>
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
                {navItems.map((item) => (
                    <button
                        key={item.key}
                        className={cn(
                            "group relative flex h-11 items-center rounded-xl transition-colors duration-200",
                            activeItem === item.key
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                        onClick={async () => {
                            setActiveItem(item.key)
                            if (window.view?.setSidebarChoose) {
                                await window.view.setSidebarChoose(item.key)
                            }
                        }}
                    >
                        {activeItem === item.key && (
                            <div className="absolute left-0 h-6 w-1 rounded-r-full bg-primary" />
                        )}
                        <div className={cn(
                            "flex shrink-0 items-center justify-center transition-all duration-300",
                            expanded ? "h-11 w-11" : "h-11 w-11"
                        )}>
                            <item.icon className="h-5 w-5 shrink-0" />
                        </div>
                        <span className={cn(
                            "whitespace-nowrap text-sm font-medium transition-all duration-300 overflow-hidden",
                            expanded ? "w-auto opacity-100 ml-2" : "w-0 opacity-0 ml-0"
                        )}>{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Bottom actions */}
            <div className="flex flex-col gap-2 px-3 py-4">
                {bottomItems.map((item) => (
                    <button
                        key={item.key}
                        className={cn(
                            "group relative flex h-11 items-center rounded-xl transition-colors duration-200",
                            "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                        onClick={item.onClick}
                    >
                        <div className={cn(
                            "flex shrink-0 items-center justify-center transition-all duration-300",
                            expanded ? "h-11 w-11" : "h-11 w-11"
                        )}>
                            {item.icon === PanelLeft && (
                                <item.icon className={cn(
                                    "h-5 w-5 shrink-0 transition-transform duration-300",
                                    expanded && "rotate-180"
                                )} />
                            )}
                            {item.icon !== PanelLeft && (
                                <item.icon className="h-5 w-5 shrink-0" />
                            )}
                        </div>
                        <span className={cn(
                            "whitespace-nowrap text-sm font-medium transition-all duration-300 overflow-hidden",
                            expanded ? "w-auto opacity-100 ml-2" : "w-0 opacity-0 ml-0"
                        )}>{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Settings Panel */}
            <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
        </Card>
    )
}
