import { CopyIcon, CopyCheckIcon } from "lucide-react"
import { useState, MouseEvent } from "react"
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"

interface CopyProps {
    code: string,
    className?: string
}

const Copy = ({code, className}: CopyProps) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = (e?: MouseEvent<HTMLDivElement>) => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        
        // Default origin is centered bottom
        let origin = { x: 0.5, y: 0.85 }
        
        // If triggered by a click event, calculate exact element position
        if (e && e.currentTarget) {
            const rect = e.currentTarget.getBoundingClientRect()
            origin = {
                x: (rect.left + rect.width / 2) / window.innerWidth,
                y: (rect.top + rect.height / 2) / window.innerHeight
            }
        }
        
        // Spray gorgeous brand-colored confetti from the clicked button
        confetti({
            particleCount: 50,
            spread: 50,
            origin,
            colors: ['#7c3aed', '#38bdf8', '#10b981', '#fbbf24', '#f43f5e']
        })

        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }
  return (
    <div tabIndex={0} onClick={handleCopy} className="bg-zinc-50 hover:bg-zinc-100/70 p-4 rounded-xl border border-zinc-200/80 hover:border-zinc-300 flex justify-between items-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/20 min-w-0 gap-3">
        <div className="flex items-center gap-2 min-w-0 overflow-x-auto scrollbar-hide">
            <code className={cn("text-zinc-800 font-mono text-xs whitespace-nowrap", className)}>{code}</code>
        </div>
        {
            copied ? <CopyCheckIcon className="text-emerald-500 size-4 shrink-0" /> : <CopyIcon className="text-zinc-400 size-4 shrink-0" />
        }
    </div>
  )
}

export default Copy