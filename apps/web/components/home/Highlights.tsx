import { useSiteStats } from "@/lib/useSiteStats";
import Container from "./Container";
import GradientPanel from "./GradientPanel";
import TerminalWindow from "./TerminalWindow";

/** Two-card block: a live usage stat on a gradient, and a language-agnostic terminal card. */
export default function Highlights() {
  const { data: stats } = useSiteStats();

  return (
    <Container className="pb-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 className="text-4xl font-bold leading-[1.05] tracking-tight text-zinc-950 md:text-5xl">
          Docs and commits, <span className="text-violet-600">sorted</span> in seconds
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
          Dokugen is free, open source and works with any codebase, so you can spend your time building.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <GradientPanel variant="orange" className="flex min-h-[420px] flex-col justify-between p-8 text-white">
          <div>
            <h3 className="text-2xl font-medium tracking-tight">Trusted by developers</h3>
            <p className="mt-3 max-w-[260px] text-sm leading-relaxed text-white/80">
              Real usage from real projects, updated live from the Dokugen backend.
            </p>
          </div>
          <div>
            <p className="text-5xl font-semibold tracking-[-0.04em]">
              {(stats?.totalGenerations ?? 2137).toLocaleString()}
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-white/60">generations so far</p>
          </div>
        </GradientPanel>

        <div className="flex min-h-[420px] flex-col justify-between rounded-2xl bg-[#e8e8e3] p-8">
          <h3 className="text-2xl font-medium tracking-tight text-zinc-900">Works with any language</h3>
          <TerminalWindow className="mt-8">
            <div className="space-y-2 px-4 py-4 font-mono text-[11px] leading-relaxed">
              <p className="text-zinc-100">$ cd your-project</p>
              <p className="text-zinc-100">$ dokugen</p>
              <p className="text-emerald-400">✓ Detected project type</p>
              <p className="text-emerald-400">✓ README.md created successfully</p>
            </div>
          </TerminalWindow>
          <p className="mt-8 text-sm leading-relaxed text-zinc-700">
            React, Node, Python, Go, Rust, Java, PHP, C++ or Django. Install once, run it in any directory.
          </p>
        </div>
      </div>
    </Container>
  );
}
