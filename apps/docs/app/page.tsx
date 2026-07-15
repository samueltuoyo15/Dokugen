"use client";

import Link from "next/link";
import Image from "next/image";
import SupportCard from "@/components/SupportCard";
import { Button } from "@/components/ui/button";
import {
  Terminal,
  Search,
  Github,
  RefreshCw,
  GitBranch,
  Workflow,
  Scale,
  Zap,
  Layers,
  Layout,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import MetricsSection from "@/components/metricsSection";
import Copy from "@/components/Copy";
import confetti from "canvas-confetti";
import { useQuery } from "@tanstack/react-query";

const searchableContent = [
  {
    id: 1,
    title: "How do I install Dokugen?",
    content:
      "Run npm install -g dokugen or pnpm add -g dokugen to install globally via Node.js, or pip install dokugen / uv tool install dokugen for Python.",
    type: "faq",
  },
  {
    id: 2,
    title: "Can I use custom templates?",
    content: "Yes, use the --template flag to specify a custom template.",
    type: "faq",
  },
  {
    id: 4,
    title: "How does the AI Commit subcommand work?",
    content: "Running dokugen aic stages your files, reads the diff from your project, and writes clean Conventional Commit messages instantly using Gemini, with a one-click push option.",
    type: "faq",
  },
  {
    id: 5,
    title: "Does Dokugen require my own API keys?",
    content: "No. Dokugen works completely out of the box with zero setup using shared backend API keys. You can also supply your own API key if you hit rate limits.",
    type: "faq",
  },
  {
    id: 6,
    title: "What is the license generation feature?",
    content: "Run dokugen license to instantly output a project LICENSE with automatic git author/year detection and a plain English summary of permissions.",
    type: "faq",
  },
  {
    id: 7,
    title: "How do the colorized flowcharts work?",
    content: "Dokugen automatically understands your project and generates colorized flowcharts (e.g. Postgres is blue, Redis is red) with optimized layout directions (TD, LR, BT).",
    type: "faq",
  },
  {
    id: 8,
    title: "What is the smart update command?",
    content: "Running dokugen update refreshes only the auto-generated parts of your README while keeping every custom description, badge, and note you wrote completely safe.",
    type: "faq",
  },
  {
    id: 9,
    title: "Modern READMEs",
    content: "Generate READMEs with emojis, badges, and modern formatting.",
    type: "feature",
  },
  {
    id: 10,
    title: "Cross-Platform",
    content: "Works on any OS and programming language.",
    type: "feature",
  },
  {
    id: 11,
    title: "Easy Integration",
    content: "Integrate with GitHub, GitLab, and VS Code.",
    type: "feature",
  },
  {
    id: 12,
    title: "Intelligent Updates",
    content:
      "Updates only auto-generated sections while preserving all your custom edits.",
    type: "feature",
  },
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroInView, setHeroInView] = useState(false);

  const { data: starsCount } = useQuery<number>({
    queryKey: ["githubStars"],
    queryFn: async () => {
      try {
        const res = await fetch("https://api.github.com/repos/samueltuoyo15/Dokugen")
        if (!res.ok) return 0
        const data = await res.json()
        return data.stargazers_count
      } catch {
        return 0
      }
    },
    staleTime: 1000 * 60 * 10
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!heroInView) return;

    // Gentle infinite confetti shower from corners when hero is in view
    const interval = setInterval(() => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.9 },
        colors: ['#7c3aed', '#38bdf8', '#10b981', '#fbbf24', '#f43f5e']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.9 },
        colors: ['#7c3aed', '#38bdf8', '#10b981', '#fbbf24', '#f43f5e']
      });
    }, 400);

    return () => clearInterval(interval);
  }, [heroInView]);

  const filteredContent = searchableContent.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white relative overflow-x-hidden">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <div className="relative inline-block mb-6">
            <Image
              src="/smile_logo.svg"
              className="block text-center mx-auto mb-2 opacity-90"
              height={70}
              width={70}
              alt="Smile Logo"
            />
            {/* Slanted GitHub Stars Badge - Responsive (inline under logo on mobile, absolute on desktop) */}
            {starsCount !== undefined && (
              <a
                href="https://github.com/samueltuoyo15/Dokugen"
                target="_blank"
                rel="noopener noreferrer"
                className="sm:absolute sm:-top-1 sm:-right-24 mt-3 sm:mt-0 mx-auto sm:mx-0 bg-yellow-100 text-yellow-800 text-[10px] px-2.5 py-1 rounded-full border border-yellow-200 font-bold rotate-[-6deg] sm:rotate-[12deg] hover:scale-105 transition-transform shadow-sm flex items-center gap-1 font-mono selection:bg-yellow-800 selection:text-white whitespace-nowrap w-fit"
              >
                ★ {starsCount.toLocaleString()} stars!
              </a>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight text-zinc-900 max-w-3xl mx-auto leading-[1.15]">
            The easiest way to generate <br />
            <span className="highlight highlight-purple">beautiful</span> and <span className="highlight highlight-yellow">accurate</span> READMEs
          </h1>

          <p className="text-lg md:text-xl text-zinc-500 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Stop spending hours writing docs nobody reads. Dokugen automatically understands your project and generates a clear, professional README in seconds and keeps it perfectly in sync every time your code changes.
          </p>

          <div className="mt-12 max-w-lg mx-auto">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full bg-white text-zinc-900 px-6 py-4 rounded-2xl border border-zinc-200 group-hover:border-zinc-300 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-5 top-[18px] text-zinc-400" />
            </div>
          </div>
        </motion.div>

        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-8 mb-20"
          >
            <h2 className="text-2xl font-semibold mb-6 text-zinc-800">
              Search Results
            </h2>
            <div className="grid gap-4">
              {filteredContent.length > 0 ? (
                filteredContent.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-6 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 transition-all duration-200"
                  >
                    <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-zinc-500 leading-relaxed text-sm">{item.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-zinc-400 py-8 text-center italic">
                  No results found matching "{searchQuery}".
                </p>
              )}
            </div>
          </motion.div>
        )}

        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16"
          >
            <h2 className="text-3xl font-bold mb-10 text-zinc-900 tracking-tight">
              Getting Started
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group bg-white p-8 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 transition-all flex flex-col">
                  <h3 className="text-xl font-bold mb-3 text-zinc-950">
                    Method 1: Node.js
                  </h3>
                  <p className="text-zinc-500 mb-6 leading-relaxed flex-grow text-sm">
                    Install globally via npm, yarn, or pnpm if you have Node.js
                    installed.
                  </p>
                  <Copy code="npm install -g dokugen" />
                  <p className="text-zinc-400 text-xs mt-3">
                    or:{" "}
                    <code className="font-mono text-zinc-600">
                      pnpm add -g dokugen@latest
                    </code>
                  </p>
                </div>

                <div className="group bg-white p-8 rounded-2xl border border-[#a7f3d0]/60 hover:border-[#34d399]/70 transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-zinc-950">
                      Method 2: Python
                    </h3>
                  </div>
                  <p className="text-zinc-500 mb-6 leading-relaxed flex-grow text-sm">
                    Install via uv (recommended) or pip. The Python client is
                    fully featured and production-ready.
                  </p>
                  <Copy code="uv tool install dokugen" />
                  <p className="text-zinc-400 text-xs mt-3">
                    or:{" "}
                    <code className="font-mono text-zinc-600">
                      pip install dokugen
                    </code>
                  </p>
                </div>
              </div>

              <div className="group bg-white p-8 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 transition-all">
                <h3 className="text-xl font-bold mb-3 text-zinc-950">
                  2. Install Globally
                </h3>
                <p className="text-zinc-500 mb-6 leading-relaxed text-sm">
                  Install Dokugen globally once, and use it forever across any
                  project on your machine:
                </p>
                <Copy code="npm install -g dokugen" className="text-sm" />
              </div>

              <div className="group bg-white p-8 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 transition-all">
                <h3 className="text-xl font-bold mb-3 text-zinc-950">
                  3. Navigate to Project
                </h3>
                <p className="text-zinc-500 mb-6 leading-relaxed text-sm">
                  Open your terminal and navigate to your project directory:
                </p>
                <Copy code="cd your-project" className="text-sm" />
              </div>

              <div className="group bg-white p-8 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 transition-all">
                <h3 className="text-xl font-bold mb-3 text-zinc-950">
                  4. Launch Interactive Menu
                </h3>
                <p className="text-zinc-500 mb-6 leading-relaxed text-sm">
                  Run the CLI command without arguments to open the interactive
                  assistant:
                </p>
                <Copy code="dokugen" className="text-sm" />
              </div>

              <div className="group bg-white p-8 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 transition-all">
                <h3 className="text-xl font-bold mb-3 text-zinc-950">
                  5. Customize
                </h3>
                <p className="text-zinc-500 leading-relaxed text-sm">
                  Edit the generated{" "}
                  <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-200/60">
                    README.md
                  </code>{" "}
                  file to check the final output.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-32"
          >
            <h2 className="text-3xl font-bold mb-10 text-zinc-900 tracking-tight">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: System Design Diagrams (Double-wide Card) */}
              <div className="md:col-span-2 group relative bg-[#f5f3ff]/60 hover:bg-[#f5f3ff] p-8 rounded-3xl border border-[#ddd6fe] hover:border-[#c084fc] transition-all duration-300 flex flex-col h-full">
                <div>
                  <div className="inline-flex p-4 rounded-2xl bg-white border border-[#ddd6fe] text-[#7c3aed] mb-6">
                    <Workflow className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-[#4c1d95] tracking-tight">
                    System Design Diagrams
                  </h3>
                  <p className="text-[#6d28d9] leading-relaxed text-sm font-normal max-w-xl">
                    Hand-drawn architecture diagrams go stale the moment you commit new code. Dokugen generates stunning, colorized system diagrams directly inside your README automatically with no extra tools, no Figma, and no fuss. Every service in your project gets its own color and a layout that actually makes sense.
                  </p>
                </div>
              </div>

              {/* Card 2: Smart Updates */}
              <div className="group relative bg-[#ecfdf5]/60 hover:bg-[#ecfdf5] p-8 rounded-3xl border border-[#a7f3d0] hover:border-[#34d399] transition-all duration-300 flex flex-col h-full">
                <div>
                  <div className="inline-flex p-4 rounded-2xl bg-white border border-[#a7f3d0] text-[#10b981] mb-6">
                    <RefreshCw className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#064e3b] tracking-tight">
                    Smart Updates
                  </h3>
                  <p className="text-[#047857] leading-relaxed text-sm font-normal">
                    Scared to regenerate because it nukes your custom edits? Smart Updates only refreshes the parts Dokugen owns (detected files, dependencies, and project structure) while leaving every note, badge, and description you wrote completely untouched.
                  </p>
                </div>
              </div>

              {/* Card 3: Quality Commit Messages */}
              <div className="group relative bg-[#f0f9ff]/60 hover:bg-[#f0f9ff] p-8 rounded-3xl border border-[#bae6fd] hover:border-[#38bdf8] transition-all duration-300 flex flex-col h-full">
                <div>
                  <div className="inline-flex p-4 rounded-2xl bg-white border border-[#bae6fd] text-[#0ea5e9] mb-6">
                    <GitBranch className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#0c4a6e] tracking-tight">
                    Quality Commit Messages
                  </h3>
                  <p className="text-[#0369a1] leading-relaxed text-sm font-normal">
                    Tired of writing "fix stuff" commit messages? Run <code className="text-[#0284c7] font-mono text-xs bg-white border border-[#bae6fd] px-1.5 py-0.5 rounded">dokugen aic</code> and Dokugen reads your staged changes to write a clean, Conventional Commit message in seconds. One more keypress and it pushes too.
                  </p>
                </div>
              </div>

              {/* Card 4: Standalone Licenses */}
              <div className="group relative bg-[#fff1f2]/60 hover:bg-[#fff1f2] p-8 rounded-3xl border border-[#fecdd3] hover:border-[#fb7185] transition-all duration-300 flex flex-col h-full">
                <div>
                  <div className="inline-flex p-4 rounded-2xl bg-white border border-[#fecdd3] text-[#f43f5e] mb-6">
                    <Scale className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#881337] tracking-tight">
                    License Generation
                  </h3>
                  <p className="text-[#be123c] leading-relaxed text-sm font-normal">
                    No license doesn't mean free to use; it means nobody knows what they're allowed to do. Contributors won't touch it. Companies won't ship it. Run <code className="text-[#e11d48] font-mono text-xs bg-white border border-[#fecdd3] px-1.5 py-0.5 rounded">dokugen license</code> to generate a proper LICENSE file in seconds, with author and year auto-detected from git, and a plain English summary of what the license permits.
                  </p>
                </div>
              </div>

              {/* Card 5: Zero-Config Setup */}
              <div className="group relative bg-[#e0e7ff]/60 hover:bg-[#e0e7ff] p-8 rounded-3xl border border-[#c7d2fe] hover:border-[#818cf8] transition-all duration-300 flex flex-col h-full">
                <div>
                  <div className="inline-flex p-4 rounded-2xl bg-white border border-[#c7d2fe] text-[#6366f1] mb-6">
                    <Zap className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#312e81] tracking-tight">
                    Zero-Config Experience
                  </h3>
                  <p className="text-[#4338ca] leading-relaxed text-sm font-normal">
                    Most AI tools make you create accounts, copy API keys, and configure environment variables before you can do anything useful. Dokugen skips all of that. Install it, run it in your project, and you're done: no setup required.
                  </p>
                </div>
              </div>

              {/* Card 6: Incremental Scanning */}
              <div className="group relative bg-[#f0fdfa]/60 hover:bg-[#f0fdfa] p-8 rounded-3xl border border-[#ccfbf1] hover:border-[#2dd4bf] transition-all duration-300 flex flex-col h-full">
                <div>
                  <div className="inline-flex p-4 rounded-2xl bg-white border border-[#ccfbf1] text-[#0d9488] mb-6">
                    <Layers className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#115e59] tracking-tight">
                    Incremental Scanning
                  </h3>
                  <p className="text-[#0f766e] leading-relaxed text-sm font-normal">
                    Re-reading your entire project on every update is slow and pointless. Dokugen caches what it already knows about your codebase and only re-processes files that actually changed, so `dokugen update` finishes in a blink, not a minute.
                  </p>
                </div>
              </div>

              {/* Card 7: Custom Templates */}
              <div className="group relative bg-[#fdf2f8]/60 hover:bg-[#fdf2f8] p-8 rounded-3xl border border-[#fbcfe8] hover:border-[#f472b6] transition-all duration-300 flex flex-col h-full">
                <div>
                  <div className="inline-flex p-4 rounded-2xl bg-white border border-[#fbcfe8] text-[#db2777] mb-6">
                    <Layout className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#831843] tracking-tight">
                    Custom Templates
                  </h3>
                  <p className="text-[#be185d] leading-relaxed text-sm font-normal">
                    Want your README to look like a project you admire? Point Dokugen at any public GitHub README with the `--template` flag and it will replicate that structure, filled with your own project's details automatically.
                  </p>
                </div>
              </div>

              {/* Card 8: Interactive Prompt */}
              <div className="group relative bg-[#fffbeb]/60 hover:bg-[#fffbeb] p-8 rounded-3xl border border-[#fde68a] hover:border-[#fbbf24] transition-all duration-300 flex flex-col h-full">
                <div>
                  <div className="inline-flex p-4 rounded-2xl bg-white border border-[#fde68a] text-[#d97706] mb-6">
                    <Terminal className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#78350f] tracking-tight">
                    Interactive Prompt
                  </h3>
                  <p className="text-[#b45309] leading-relaxed text-sm font-normal">
                    Nobody memorizes CLI flags. Just type <code className="text-[#d97706] font-mono text-xs bg-white border border-[#fde68a] px-1.5 py-0.5 rounded">dokugen</code> in your project and an interactive menu walks you through every option, including README generation, diagrams, licenses, and commits, step by step.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-32"
          >
            <h2 className="text-3xl font-bold mb-10 text-zinc-900 tracking-tight">
              FAQs
            </h2>
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 transition-all duration-200">
                <h3 className="text-lg font-bold mb-3 text-zinc-950">
                  How do I install Dokugen?
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  <strong className="text-zinc-800">Node.js:</strong> Run{" "}
                  <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-200/60">
                    npm install -g dokugen
                  </code>{" "}
                  or{" "}
                  <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-200/60">
                    pnpm add -g dokugen
                  </code>{" "}
                  to install Dokugen globally.
                  <br />
                  <span className="block mt-2">
                    <strong className="text-zinc-800">Python:</strong> Run{" "}
                    <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-200/60">
                      pip install dokugen
                    </code>{" "}
                    or{" "}
                    <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-200/60">
                      uv tool install dokugen
                    </code>
                    .
                  </span>
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 transition-all duration-200">
                <h3 className="text-lg font-bold mb-3 text-zinc-950">
                  Can I use custom templates?
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  Yes. Use the{" "}
                  <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-200/60">
                    --template
                  </code>{" "}
                  flag to specify a custom template URL.
                  <br />
                  <span className="block mt-1 text-xs text-zinc-500 font-mono">
                    Example: docs --template https://raw.github.../README.md
                  </span>
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 transition-all duration-200">
                <h3 className="text-lg font-bold mb-3 text-zinc-950">
                  How does the AI Commit subcommand work?
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  Running{" "}
                  <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-200/60">
                    dokugen aic
                  </code>{" "}
                  automatically stages your files, reads the git diff from your project, and generates a clean Conventional Commit message using Gemini, then commits and optionally pushes with a single confirmation.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 transition-all duration-200">
                <h3 className="text-lg font-bold mb-3 text-zinc-950">
                  Does Dokugen read my .env files or sensitive API keys?
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  <strong className="text-zinc-800">Absolutely not.</strong> Dokugen is built with strict privacy and security filters. It automatically ignores all environment variable files (like <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono border border-zinc-200/60">.env</code>, <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono border border-zinc-200/60">.env.local</code>, etc.), package manager lockfiles, logs, compiled binaries/bytecode, local config files, and private credentials. None of your sensitive credentials, environment keys, or token secrets are ever read or transmitted.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 transition-all duration-200">
                <h3 className="text-lg font-bold mb-3 text-zinc-950">
                  Does Dokugen require my own API keys?
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  No. Dokugen offers a zero-config experience. The CLI communicates with our secure backend transparently using shared API keys. However, if you hit rate limits, you can easily configure your own API key in your profile configuration.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 transition-all duration-200">
                <h3 className="text-lg font-bold mb-3 text-zinc-950">
                  What is the license generation feature?
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  Publishing code without a license doesn't make it free to use, as copyright is automatic in most countries. By default, nobody has legal permission to copy, modify, or redistribute your work. The problem is that people won't know that. Contributors avoid unlicensed repos, and companies outright won't touch them. By running{" "}
                  <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-200/60">
                    dokugen license
                  </code>{" "}
                  you instantly generate a proper LICENSE file (with git author and year auto-detected) along with a plain English summary so everyone knows exactly what they can and can't do with your code.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 transition-all duration-200">
                <h3 className="text-lg font-bold mb-3 text-zinc-950">
                  How do the colorized flowcharts work?
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  Dokugen automatically understands your project's architecture and builds beautiful, colorized system diagrams directly inside your markdown README. Each technology gets a unique color (Postgres → blue, Redis → red) and the layout direction is chosen automatically for the cleanest result.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 transition-all duration-200">
                <h3 className="text-lg font-bold mb-3 text-zinc-950">
                  What is the smart update command?
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  Using{" "}
                  <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-200/60">
                    dokugen update
                  </code>{" "}
                  intelligently refreshes only the auto-detected parts of your README (project files, dependencies, and detected features) while leaving every custom description, note, and badge you wrote completely intact.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-32"
        >
          <div className="bg-white p-3 rounded-3xl border border-zinc-200/80">
            <div className="bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-100 relative">
              {/* macOS control dots */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-100 bg-zinc-50">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <div className="text-[11px] text-zinc-400 font-mono mx-auto pr-10 select-none">Demo.gif</div>
              </div>
              <video
                src="/Demo.mp4"
                muted
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover opacity-95 hover:opacity-100 transition-opacity duration-500"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="text-center text-zinc-400 mt-4 mb-1 text-xs uppercase tracking-widest font-bold">
              Dokugen in Action
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-32"
        >
          <MetricsSection />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-32 pb-8 border-t border-zinc-200 pt-16 w-full"
        >
          <div className="flex flex-col items-center gap-8 text-center w-full">
            <p className="text-zinc-500 max-w-lg leading-relaxed font-light text-sm">
              Dokugen is free and open-source. If it's saved you time, a star or a contribution goes a long way in keeping it alive and growing.
            </p>
            <div className="flex justify-center mb-6">
              <Link
                href="https://github.com/samueltuoyo15/Dokugen/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-zinc-900 text-white hover:bg-zinc-800 border-0 font-semibold px-8 py-6 text-base rounded-full transition-all shadow-sm">
                  <Github className="mr-2 h-5 w-5" />
                  Contribute
                  {starsCount !== undefined && (
                    <span className="ml-2 bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full text-xs font-mono font-medium">
                      ★ {starsCount.toLocaleString()}
                    </span>
                  )}
                </Button>
              </Link>
            </div>

            {/* Side-by-Side Flex Support Section */}
            <div className="w-full max-w-4xl mt-4 mb-8">
              <h3 className="text-xl font-bold text-zinc-900 mb-2">
                Support the Project
              </h3>
              <p className="text-zinc-500 text-xs mb-10 max-w-xs mx-auto leading-relaxed">
                Dokugen is completely free. Consider sponsoring or tipping the developers!
              </p>
              
              <div className="flex flex-col md:flex-row gap-8 items-start justify-center text-left w-full">
                {/* Left hand side: GitHub Sponsors */}
                <div className="flex-1 w-full flex flex-col">
                  <div className="mb-4 text-center md:text-left">
                    <h4 className="text-sm font-bold text-zinc-800 mb-1">GitHub Sponsors</h4>
                    <p className="text-zinc-400 text-[11px]">For international sponsors worldwide</p>
                  </div>
                  <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm h-[480px] p-6 flex flex-col justify-between items-center text-center">
                    <div className="mt-4">
                      <Github className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
                      <h5 className="font-bold text-zinc-900 text-sm mb-2">Global Sponsorship</h5>
                      <p className="text-zinc-500 text-xs leading-relaxed max-w-[240px]">
                        Support Samuel Tuoyo directly on GitHub Sponsors to help fund Dokugen development.
                      </p>
                    </div>
                    <div className="w-full max-w-[360px] my-auto flex justify-center items-center">
                      <a
                        href="https://github.com/sponsors/samueltuoyo15"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-[12px] p-6 flex flex-col justify-between text-left h-[225px] hover:border-[#db61a2]/60 hover:shadow-lg transition-all duration-300 group select-none cursor-pointer"
                      >
                        <div className="flex gap-4 items-start">
                          <img
                            src="https://github.com/samueltuoyo15.png"
                            alt="Samuel Tuoyo"
                            className="w-12 h-12 rounded-full border-2 border-[#30363d] shrink-0"
                          />
                          <div className="flex flex-col">
                            <h5 className="font-semibold text-white text-sm leading-snug group-hover:text-pink-400 transition-colors duration-200">
                              Sponsor Samuel Tuoyo on GitHub Sponsors
                            </h5>
                            <p className="text-zinc-400 text-[11px] mt-1 leading-normal">
                              Support samueltuoyo15's open source work
                            </p>
                          </div>
                        </div>
                        <div className="w-full mt-4 bg-[#21262d] border border-[#30363d] group-hover:border-[#db61a2]/40 rounded-lg py-2.5 px-4 flex justify-center items-center gap-2 hover:bg-[#30363d] transition-all duration-200">
                          <Heart className="w-4 h-4 text-[#db61a2] fill-[#db61a2] group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-white text-sm font-semibold">Sponsor</span>
                        </div>
                      </a>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      github.com/sponsors/samueltuoyo15
                    </span>
                  </div>
                </div>
                
                {/* Right hand side: Myhappr Tip Card */}
                <div className="flex-1 w-full flex flex-col">
                  <div className="mb-4 text-center md:text-left">
                    <h4 className="text-sm font-bold text-zinc-800 mb-1">Myhappr Tip Card</h4>
                    <p className="text-zinc-400 text-[11px]">For African local card & mobile money transfers</p>
                  </div>
                  <SupportCard />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <Link
                href="/terms"
                className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors duration-200 font-medium"
              >
                Terms of Service
              </Link>
              <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
              <Link
                href="/privacy"
                className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors duration-200 font-medium"
              >
                Privacy Policy
              </Link>
            </div>

            <p className="text-zinc-400 text-xs font-mono">
              &copy; {new Date().getFullYear()} Dokugen. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
