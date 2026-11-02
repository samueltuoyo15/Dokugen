import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface TerminalWindowProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

/** Dark macOS-style terminal window with a crisp border. Children render in the monospace body. */
export default function TerminalWindow({ title, children, className }: TerminalWindowProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-white/10 bg-[#161616] text-zinc-300", className)}>
      <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        {title && <span className="mx-auto select-none pr-10 font-mono text-[11px] text-zinc-500">{title}</span>}
      </div>
      {children}
    </div>
  );
}
