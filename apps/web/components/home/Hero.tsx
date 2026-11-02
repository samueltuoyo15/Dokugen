import { motion } from "framer-motion";
import { Github, Star } from "lucide-react";
import Link from "next/link";
import GradientPanel from "./GradientPanel";
import TerminalWindow from "./TerminalWindow";

interface HeroProps {
  starsCount?: number;
}

/** Headline, primary actions, and the demo video inside a terminal on a gradient panel. */
export default function Hero({ starsCount }: HeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="pt-16 pb-20"
    >
      <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-zinc-950 sm:text-5xl md:text-6xl">
        Turn your <span className="sm:hidden">repos</span><span className="hidden sm:inline">repositories</span> into
        <span className="block text-violet-600">job-ready portfolio pieces</span>
      </h1>

      <p className="mt-5 max-w-lg text-sm leading-relaxed text-zinc-500">
        Poor documentation and messy git history cause hiring managers to skip over great code. Dokugen generates
        recruiter-ready READMEs and spotless Conventional Commits directly from your terminal.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="#get-started"
          className="inline-flex h-11 items-center rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          Get started
        </Link>
        <Link
          href="https://github.com/samueltuoyo15/Dokugen"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-300"
        >
          {starsCount ? <Star className="h-4 w-4" /> : <Github className="h-4 w-4" />}
          Star on Github
          {starsCount ? <span className="font-mono text-xs text-zinc-500">{starsCount.toLocaleString()}</span> : null}
        </Link>
      </div>

      <GradientPanel variant="purple" className="mt-14 px-6 pt-10 md:px-12 md:pt-14">
        <TerminalWindow title="dokugen" className="rounded-b-none border-b-0">
          <video src="/Demo.mp4" muted autoPlay loop playsInline className="block w-full">
            <track kind="captions" />
          </video>
        </TerminalWindow>
      </GradientPanel>
    </motion.section>
  );
}
