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
    <div tabIndex={0} onClick={handleCopy} className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <code className={cn("text-zinc-300 font-mono text-xs", className)}>{code}</code>
        </div>
        {
            copied ? <CopyCheckIcon className="text-green-500 size-4" /> : <CopyIcon className="text-zinc-300 size-4" />
        }
    </div>
  )
}

export default Copy