import { X } from "lucide-react"
import { SettingsThemeItem } from "./settings-theme-item"
import { SettingsLanguageItem } from "./settings-language-item"
import { useTranslation } from "react-i18next"
import { cn } from "@renderer/tools/utils"

interface SettingsPanelProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
    const { t } = useTranslation()

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />

            {/* Dialog Content */}
            <div className="relative z-50 w-full max-w-md rounded-2xl border border-border/50 bg-background p-6 shadow-2xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Settings</h2>
                    <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-3">
                    <SettingsThemeItem />
                    <SettingsLanguageItem />
                </div>
            </div>
        </div>
    )
}
