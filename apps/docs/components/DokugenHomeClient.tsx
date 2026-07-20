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
  Globe,
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
      "Dokugen installs in seconds on any system. For Node.js users, run npm install -g dokugen or pnpm add -g dokugen. For Python, run uv tool install dokugen or pip install dokugen. You're just one command away from clean documentation.",
    type: "faq",
  },
  {
    id: 2,
    title: "Can I use custom templates?",
    content: "Absolutely. Stand out from the crowd by matching the layout of your favorite repositories. Simply use the --template flag and provide any public README URL to instantly model your documentation after the best in the industry.",
    type: "faq",
  },
  {
    id: 4,
    title: "How does the AI Commit subcommand work?",
    content: "Writing commits is tedious, but clean history is crucial for team projects. Dokugen reads your changes, writes Conventional Commits using Gemini, and lets you commit and push with one confirmation. Look professional without the cognitive load.",
    type: "faq",
  },
  {
    id: 5,
    title: "Does Dokugen require my own API keys?",
    content: "No API keys or payment required to start. We provide a fully managed backend with shared API keys so you can experience Dokugen instantly. If you have extremely large projects or hit rate limits, you can easily plug in your own API key for unlimited use.",
    type: "faq",
  },
  {
    id: 6,
    title: "What is the license generation feature?",
    content: "Did you know that without a LICENSE file, other developers legally cannot use, modify, or contribute to your code? Unlicensed repositories scare away contributors and companies alike. Protect your work and open the door to collaboration by running dokugen license. It auto-detects git details and generates a compliant LICENSE along with a human-readable summary that builds trust.",
    type: "faq",
  },
  {
    id: 7,
    title: "How do the colorized flowcharts work?",
    content: "A picture is worth a thousand words. Dokugen automatically maps your project's structure and renders clean, color-coded architecture flowcharts inside your README. It assigns distinct colors to each service (like database, cache, or queue) and optimizes layout directions so your project structure is instantly readable.",
    type: "faq",
  },
  {
    id: 8,
    title: "What is the smart update command?",
    content: "Most generators completely overwrite your manual edits, forcing you to copy-paste. Dokugen's smart update is different: it updates the technical directories and dependencies while leaving your carefully written descriptions, tutorials, and badges untouched. Keep your docs in sync with your code effortlessly.",
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
    content: "Integrate with GitHub, GitLab, and terminal workflows.",
    type: "feature",
  },
  {
    id: 12,
    title: "Intelligent Updates",
    content:
      "Updates only auto-generated sections while preserving all your custom edits.",
    type: "feature",
  },
  {
    id: 13,
    title: "Language & Framework Agnostic",
    content:
      "Works with all languages and frameworks (React, Django, Go, Node, etc.). Just install globally via npm or Python and run in any repository.",
    type: "feature",
  },
];

export default function DokugenHomeClient() {
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
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight text-zinc-900 max-w-3xl mx-auto leading-[1.15]">
            The easiest way to generate <br />
            <span className="highlight highlight-purple">beautiful</span> and <span className="highlight highlight-yellow">accurate</span> READMEs
          </h1>

          <p className="text-lg md:text-xl text-zinc-500 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Writing READMEs is a chore, and keeping them updated is even worse. Dokugen takes that pain away by scanning your codebase to generate a beautiful, detailed README in seconds. It lets you update it instantly as your code changes, so you can spend your time building, not formatting markdown.
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
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-24"
          >
            <div className="bg-white p-3 rounded-3xl border border-zinc-200/80 shadow-sm">
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
                    Developers love visuals, but manual diagrams go stale the second you push code. Dokugen automatically renders interactive, color-coded architecture flowcharts directly inside your README. Show off your system design instantly, build trust with users, and make your repo look 10x more professional without touching Figma.
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
                    Never worry about losing your custom descriptions, notes, or badges. Smart Updates intelligently target only the auto-generated elements of your README, preserving your hand-written text perfectly. Keep your docs fresh and accurate without repeating your hard work.
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
                    Unprofessional git logs hurt your credibility. Boost your project's reputation with clean, Conventional Commit messages generated instantly from your actual file diffs. Save mental energy and push your changes with a single keystroke.
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
                    Unlicensed code is dead code, companies won't touch it, and developers won't contribute. Protect your intellectual property and welcome contributors in seconds. Automatically detect the author and year, generate a compliant LICENSE, and get a human-readable summary so everyone feels safe using your work.
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
                    No login, no API keys to copy, and zero setup friction. We believe you should experience value in less than 30 seconds. Just run Dokugen in your project and see the magic immediately, with no strings attached.
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
                    Don't waste time waiting for slow documentation builds. Our intelligent caching engine only rescans the files you modified, delivering lightning-fast updates in milliseconds. High performance that respects your development flow.
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
                    Success leaves clues. If you admire a popular repository's layout, simply point Dokugen to it. We will replicate its exact structure and fill it with your project's details automatically, giving you the layout of top-tier projects instantly.
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
                    Say goodbye to memorizing complex CLI arguments. Type a single command and let our friendly interactive guide walk you through README generation, licensing, and commits step-by-step. Smooth, effortless, and simple.
                  </p>
                </div>
              </div>

              {/* Card 9: Language & Framework Agnostic */}
              <div className="group relative bg-[#f0f7ff]/60 hover:bg-[#f0f7ff] p-8 rounded-3xl border border-[#d0e1fd] hover:border-[#a0c4ff] transition-all duration-300 flex flex-col h-full">
                <div>
                  <div className="inline-flex p-4 rounded-2xl bg-white border border-[#d0e1fd] text-[#2563eb] mb-6">
                    <Globe className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#1e3a8a] tracking-tight">
                    Language Agnostic
                  </h3>
                  <p className="text-[#2563eb] leading-relaxed text-sm font-normal">
                    Dokugen works with any codebase! Whether your project is built in React, Node, Python, Go, Rust, Java, PHP, C++, or Django, it doesn't matter. Just install Dokugen globally on your machine using npm or Python, and run it in any directory.
                  </p>
                </div>
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
          <MetricsSection />
        </motion.div>

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
                  Dokugen installs in seconds on any system. For Node.js users, run{" "}
                  <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-200/60">
                    npm install -g dokugen
                  </code>{" "}
                  or{" "}
                  <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-200/60">
                    pnpm add -g dokugen
                  </code>. For Python, run{" "}
                  <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-200/60">
                    uv tool install dokugen
                  </code>{" "}
                  or{" "}
                  <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-200/60">
                    pip install dokugen
                  </code>. You're just one command away from clean documentation.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 transition-all duration-200">
                <h3 className="text-lg font-bold mb-3 text-zinc-950">
                  Can I use custom templates?
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  Absolutely. Stand out from the crowd by matching the layout of your favorite repositories. Simply use the{" "}
                  <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-200/60">
                    --template
                  </code>{" "}
                  flag and provide any public README URL to instantly model your documentation after the best in the industry.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 transition-all duration-200">
                <h3 className="text-lg font-bold mb-3 text-zinc-950">
                  How does the AI Commit subcommand work?
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  Writing commits is tedious, but clean history is crucial for team projects. Running{" "}
                  <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-200/60">
                    dokugen aic
                  </code>{" "}
                  stages your files, reads the git diff, and writes Conventional Commits using Gemini, then commits and optionally pushes with one confirmation. Look professional without the cognitive load.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 transition-all duration-200">
                <h3 className="text-lg font-bold mb-3 text-zinc-950">
                  Does Dokugen read my .env files or sensitive API keys?
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  Your trust is our top priority. Dokugen has built-in security filters that strictly ignore sensitive files like <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono border border-zinc-200/60">.env</code>, credentials, bytecode, and lockfiles. None of your private keys or secrets are ever read or transmitted. Your intellectual property and credentials remain 100% secure.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 transition-all duration-200">
                <h3 className="text-lg font-bold mb-3 text-zinc-950">
                  Does Dokugen require my own API keys?
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  No API keys or payment required to start. We provide a fully managed backend with shared API keys so you can experience Dokugen instantly. If you have extremely large projects or hit rate limits, you can easily plug in your own API key for unlimited use.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 transition-all duration-200">
                <h3 className="text-lg font-bold mb-3 text-zinc-950">
                  Which languages and frameworks does Dokugen support?
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  Dokugen is 100% language and framework agnostic! It supports all types of frameworks and programming languages (Node.js, React, Python, Django, Go, Rust, Java, PHP, C++, and more). You do not need Node.js or Python to be the main language of your project. You simply install Dokugen globally on your machine using npm/pnpm/yarn or Python (pip/uv), and run it in any repository.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 transition-all duration-200">
                <h3 className="text-lg font-bold mb-3 text-zinc-950">
                  What is the license generation feature?
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  Did you know that without a LICENSE file, other developers legally cannot use, modify, or distribute your code? Unlicensed repositories scare away contributors and companies alike. Protect your work and open the door to collaboration by running <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-200/60">dokugen license</code>. It auto-detects git details and generates a compliant LICENSE along with a human-readable summary that builds trust.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 transition-all duration-200">
                <h3 className="text-lg font-bold mb-3 text-zinc-950">
                  How do the colorized flowcharts work?
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  A picture is worth a thousand words. Dokugen automatically maps your project's structure and renders clean, color-coded architecture flowcharts inside your README. It assigns distinct colors to each service (like database, cache, or queue) and optimizes layout directions so your project structure is instantly readable.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 transition-all duration-200">
                <h3 className="text-lg font-bold mb-3 text-zinc-950">
                  What is the smart update command?
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  Most generators completely overwrite your manual edits, forcing you to copy-paste. Using <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-200/60">dokugen update</code> is different: it updates the technical directories and dependencies while leaving your carefully written descriptions, tutorials, and badges untouched. Keep your docs in sync with your code effortlessly.
                </p>
              </div>
            </div>
          </motion.div>
        )}

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
              
              <div className="flex flex-col md:flex-row gap-8 justify-center text-left w-full">
                {/* Left hand side: GitHub Sponsors */}
                <div className="flex-1 w-full flex">
                  <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm p-5 flex flex-col w-full">
                    <div className="mb-4 text-center md:text-left">
                      <h4 className="text-sm font-bold text-zinc-800 mb-1">GitHub Sponsors</h4>
                      <p className="text-zinc-400 text-[10px] leading-relaxed">
                        Support Samuel Tuoyo directly on GitHub Sponsors to help fund Dokugen development if you are outside Africa.
                      </p>
                    </div>
                    <a
                      href="https://github.com/sponsors/samueltuoyo15"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-grow w-full bg-[#F8F9FA] border border-[#e9ecef] rounded-xl p-6 flex flex-col text-center hover:border-blue-200 hover:shadow-lg transition-all duration-300 group select-none cursor-pointer min-h-[360px]"
                    >
                      <p className="text-center text-zinc-800 font-bold text-base mb-6 tracking-tight">
                        Support Dokugen
                      </p>
                      <div className="flex flex-col items-center justify-center my-auto">
                        <Image
                          src="https://github.com/samueltuoyo15.png"
                          alt="Samuel Tuoyo"
                          width={80}
                          height={80}
                          className="rounded-full border-2 border-zinc-200 shrink-0 mb-4 shadow-sm"
                        />
                        <h5 className="font-bold text-zinc-800 text-lg leading-snug group-hover:text-blue-600 transition-colors duration-200 max-w-[280px]">
                          Sponsor Samuel Tuoyo on GitHub Sponsors
                        </h5>
                      </div>
                      <div className="mt-auto w-full bg-[#eab308] border border-[#ca8a04] group-hover:bg-[#d97706] group-hover:border-[#b45309] rounded-full py-3 px-6 flex justify-center items-center gap-2 transition-all duration-200">
                        <Heart className="w-4 h-4 text-rose-600 fill-rose-600 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-zinc-900 text-sm font-bold tracking-wide">Support Dokugen</span>
                      </div>
                    </a>
                  </div>
                </div>
                
                {/* Right hand side: Myhappr Tip Card */}
                <div className="flex-1 w-full flex">
                  <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm p-0 sm:p-5 flex flex-col w-full">
                    <div className="px-4 pt-4 pb-2 md:p-0 md:mb-4 text-center md:text-left">
                      <h4 className="text-sm font-bold text-zinc-800 mb-1">Myhappr Tip Card</h4>
                      <p className="text-zinc-400 text-[10px] leading-relaxed">
                        Support Samuel Tuoyo directly on Myhappr Tip Card to help fund Dokugen development if you are in Africa.
                      </p>
                    </div>
                    <div className="flex-grow flex items-center justify-center p-1 sm:p-0">
                      <SupportCard />
                    </div>
                  </div>
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
