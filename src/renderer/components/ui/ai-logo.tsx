import { Sparkles } from "lucide-react"
import { cn } from "@renderer/tools/utils"
import { CSSProperties } from "react"

interface AILogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
    withText?: boolean
    text?: string
    style?: CSSProperties
}

/**
 * AI Logo 组件 - 统一的 Lumen AI 标识
 * 
 * @param size - 尺寸：sm(20px), md(32px), lg(128px), xl(128px loading)
 * @param className - 额外的类名
 * @param withText - 是否显示文字
 * @param text - 自定义文字，默认为 "Lumen"
 */
export function AILogo({
    size = 'md',
    className,
    withText = false,
    text = 'Lumen',
    style
}: AILogoProps) {
    const sizeClasses = {
        sm: 'h-5 w-5',
        md: 'h-8 w-8',
        lg: 'h-24 w-24',
        xl: 'h-32 w-32'
    }

    const iconSize = sizeClasses[size]

    return (
        <div className={cn("flex items-center", className)} style={style}>
            <Sparkles className={cn(iconSize, "text-primary")} />
            {withText && (
                <span className="ml-3 whitespace-nowrap text-lg font-semibold text-foreground">
                    {text}
                </span>
            )}
        </div>
    )
}
