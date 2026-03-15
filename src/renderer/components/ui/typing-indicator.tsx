import { Dot } from "lucide-react"

export function TypingIndicator() {
  return (
    <div className="justify-left flex space-x-1">
      <div className="rounded-lg bg-muted p-1">
        <div className="flex -space-x-2">
          <Dot className="h-4 w-4 typing-dot-1" />
          <Dot className="h-4 w-4 typing-dot-2" />
          <Dot className="h-4 w-4 typing-dot-3" />
        </div>
      </div>
    </div>
  )
}
