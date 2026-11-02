import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/** Single centered column. Every home section uses it so the side margins stay consistent. */
export default function Container({ children, className }: ContainerProps) {
  return <div className={cn("mx-auto w-full max-w-[920px] px-6 sm:px-8", className)}>{children}</div>;
}
