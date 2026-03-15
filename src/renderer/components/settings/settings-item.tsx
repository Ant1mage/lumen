import { cn } from "@renderer/tools/utils"

interface SettingItemProps {
    label: string
    children: React.ReactNode
}

export function SettingsItem({ label, children }: SettingItemProps) {
    return (
        <div className={cn(
            "flex items-center justify-between rounded-xl bg-card p-4 shadow-sm",
            "dark:bg-card/50"
        )}>
            <span className="text-sm font-medium text-foreground">{label}</span>
            {children}
        </div>
    )
}
