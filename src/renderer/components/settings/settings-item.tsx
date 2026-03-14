import { cn } from "@renderer/tools/utils"

interface SettingItemProps {
    label: string
    children: React.ReactNode
}

export function SettingsItem({ label, children }: SettingItemProps) {
    return (
        <div className="rounded-xl bg-settings-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-settings-card-foreground">{label}</span>
                {children}
            </div>
        </div>
    )
}
