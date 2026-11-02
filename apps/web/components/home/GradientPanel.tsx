import { cn } from "@/lib/utils";
import Image from "next/image";
import type { ReactNode } from "react";

const GRADIENTS = {
  purple: "/gradients/purple.webp",
  orange: "/gradients/orange.webp",
  green: "/gradients/green.webp",
  amber: "/gradients/amber.webp",
} as const;

export type GradientVariant = keyof typeof GRADIENTS;

interface GradientPanelProps {
  variant: GradientVariant;
  children: ReactNode;
  className?: string;
}

/** Rounded panel with a grainy wave gradient behind its children. */
export default function GradientPanel({ variant, children, className }: GradientPanelProps) {
  return (
    <div className={cn("relative isolate overflow-hidden rounded-2xl", className)}>
      <Image
        src={GRADIENTS[variant]}
        alt=""
        fill
        sizes="(min-width: 920px) 920px, 100vw"
        className="-z-10 object-cover"
      />
      {children}
    </div>
  );
}
