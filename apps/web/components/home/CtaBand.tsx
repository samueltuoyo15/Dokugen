import { ChevronsRight, Github, Zap } from "lucide-react";
import Link from "next/link";

interface CtaBandProps {
  starsCount?: number;
}

/** Full-bleed lavender band that breaks out of the page margins. Carries the contribute call to action. */
export default function CtaBand({ starsCount }: CtaBandProps) {
  return (
    <section className="relative overflow-hidden bg-[#ecebf7] py-20">
      <Zap className="absolute left-[8%] top-1/2 hidden h-16 w-16 -translate-y-1/2 fill-violet-300/70 text-violet-300/70 md:block" />
      <ChevronsRight className="absolute right-[8%] top-1/2 hidden h-16 w-16 -translate-y-1/2 text-violet-200 md:block" />

      <div className="relative mx-auto flex max-w-md flex-col items-center px-6 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-zinc-950 md:text-5xl">
          Want to improve <span className="text-violet-600">Dokugen?</span>
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-zinc-600">
          <strong className="font-semibold text-zinc-950">Dokugen is free and open-source.</strong> If it&apos;s saved you
          time, a star or a contribution goes a long way in keeping it alive and growing.
        </p>
        <Link
          href="https://github.com/samueltuoyo15/Dokugen/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-zinc-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          <Github className="h-4 w-4" />
          Contribute
          {starsCount !== undefined && (
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-xs font-medium text-zinc-300">
              ★ {starsCount.toLocaleString()}
            </span>
          )}
        </Link>
      </div>
    </section>
  );
}
