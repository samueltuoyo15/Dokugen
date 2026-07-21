import { CopyIcon, CopyCheckIcon } from "lucide-react"
import { useState, MouseEvent } from "react"
import { cn } from "@/lib/utils"

interface CopyProps {
    code: string,
    className?: string
}

const Copy = ({code, className}: CopyProps) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = (e?: MouseEvent<HTMLDivElement>) => {
        navigator.clipboard.writeText(code)
        setCopied(true)

        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }

  return (
    <div tabIndex={0} onClick={handleCopy} className="bg-zinc-50 hover:bg-zinc-100/70 p-4 rounded-xl border border-zinc-200/80 hover:border-zinc-300 flex justify-between items-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/20 min-w-0 gap-3">
        <div className="flex items-center gap-2 min-w-0 overflow-x-auto scrollbar-hide">
            <code className={cn("text-zinc-800 font-mono text-xs whitespace-nowrap", className)}>{code}</code>
        </div>
        <button
            type="button"
            className="text-zinc-400 hover:text-zinc-700 transition-colors p-1 flex-shrink-0"
            aria-label="Copy code to clipboard"
        >
            {copied ? (
                <CopyCheckIcon className="w-4 h-4 text-emerald-600 transition-all scale-110" />
            ) : (
                <CopyIcon className="w-4 h-4" />
            )}
        </button>
    </div>
  )
}

export default Copy