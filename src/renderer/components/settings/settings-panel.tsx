import { X } from "lucide-react"
import { Button } from "@renderer/components/ui/button"
import { SettingsThemeItem } from "./settings-theme-item"
import { SettingsLanguageItem } from "./settings-language-item"

interface SettingsPanelProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />

            {/* Dialog Content */}
            <div className="relative z-50 w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-2xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Settings</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
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
