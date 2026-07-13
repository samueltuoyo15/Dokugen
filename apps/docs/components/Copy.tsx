import { CopyIcon, CopyCheckIcon } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface CopyProps {
    code: string,
    className?: string
}

const Copy = ({code, className}: CopyProps) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }
  return (
    <div tabIndex={0} onClick={handleCopy} className="bg-zinc-50 hover:bg-zinc-100/70 p-4 rounded-xl border border-zinc-200/80 hover:border-zinc-300 flex justify-between items-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/20 select-none">
        <div className="flex items-center gap-2">
            <code className={cn("text-zinc-800 font-mono text-xs", className)}>{code}</code>
        </div>
        {
            copied ? <CopyCheckIcon className="text-emerald-500 size-4 shrink-0" /> : <CopyIcon className="text-zinc-400 size-4 shrink-0" />
        }
    </div>
  )
}

export default Copy