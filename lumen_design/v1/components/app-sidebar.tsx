"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { 
  BarChart3, 
  Globe2, 
  DollarSign, 
  Flame, 
  Zap, 
  Settings,
  Sparkles,
  PanelLeftClose,
  PanelLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface NavItem {
  icon: React.ElementType
  label: string
  active?: boolean
  badge?: string
}

const navItems: NavItem[] = [
  { icon: BarChart3, label: "A股", active: true },
  { icon: Globe2, label: "港股" },
  { icon: DollarSign, label: "美股" },
  { icon: Flame, label: "期货" },
  { icon: Zap, label: "能源" }
]

export function AppSidebar() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={cn(
      "mr-3 flex h-full flex-col rounded-2xl border border-border/50 bg-card transition-all duration-300",
      expanded ? "w-[200px]" : "w-[72px]"
    )}>
      {/* AI Avatar */}
      <div className="flex h-16 items-center justify-center px-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <span className={cn(
          "whitespace-nowrap text-lg font-semibold text-foreground transition-all duration-300 overflow-hidden",
          expanded ? "ml-3 w-auto opacity-100" : "ml-0 w-0 opacity-0"
        )}>Lumen</span>
      </div>
      
      {/* Navigation */}
      <TooltipProvider delayDuration={0}>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "group relative flex h-11 items-center rounded-xl transition-colors duration-200",
                    expanded ? "w-full justify-start px-3" : "w-11 justify-center",
                    item.active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {item.active && (
                    <div className="absolute left-0 h-6 w-1 rounded-r-full bg-primary" />
                  )}
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className={cn(
                    "whitespace-nowrap text-sm font-medium transition-all duration-300 overflow-hidden",
                    expanded ? "ml-3 w-auto opacity-100" : "ml-0 w-0 opacity-0"
                  )}>{item.label}</span>
                </button>
              </TooltipTrigger>
              {!expanded && (
                <TooltipContent side="right" className="border-border/50 bg-popover">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
      
      {/* Bottom actions */}
      <div className="flex flex-col gap-2 px-3 py-4">
        <TooltipProvider delayDuration={0}>
          {/* Toggle Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-11 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground",
                  expanded ? "w-full justify-start px-3" : "w-11 justify-center px-0"
                )}
                onClick={() => setExpanded(!expanded)}
              >
                <PanelLeft className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-300",
                  expanded && "rotate-180"
                )} />
                <span className={cn(
                  "whitespace-nowrap text-sm font-medium transition-all duration-300 overflow-hidden",
                  expanded ? "ml-3 w-auto opacity-100" : "ml-0 w-0 opacity-0"
                )}>收起</span>
              </Button>
            </TooltipTrigger>
            {!expanded && (
              <TooltipContent side="right" className="border-border/50 bg-popover">
                展开
              </TooltipContent>
            )}
          </Tooltip>
          
          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-11 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground",
                  expanded ? "w-full justify-start px-3" : "w-11 justify-center px-0"
                )}
              >
                <Settings className="h-5 w-5 shrink-0" />
                <span className={cn(
                  "whitespace-nowrap text-sm font-medium transition-all duration-300 overflow-hidden",
                  expanded ? "ml-3 w-auto opacity-100" : "ml-0 w-0 opacity-0"
                )}>设置</span>
              </Button>
            </TooltipTrigger>
            {!expanded && (
              <TooltipContent side="right" className="border-border/50 bg-popover">
                设置
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
