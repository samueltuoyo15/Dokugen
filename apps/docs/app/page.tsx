"use client";

import Link from "next/link";
import Image from "next/image";
import SupportButton from "@/components/SupportButton";
import { Button } from "@/components/ui/button";
import {
  Terminal,
  Search,
  Github,
  RefreshCw,
  Sparkles,
  GitBranch,
  Workflow,
  Scale,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import MetricsSection from "@/components/metricsSection";
import Copy from "@/components/Copy";

const searchableContent = [
  {
    id: 1,
    title: "How do I install Dokugen?",
    content:
      "Run npm install -g dokugen to install globally via Node.js, or pip install dokugen / uv tool install dokugen for Python.",
    type: "faq",
  },
  {
    id: 2,
    title: "Can I use custom templates?",
    content: "Yes, use the --template flag to specify a custom template.",
    type: "faq",
  },
  {
    id: 3,
    title: "Can I auto generate my readme using the --live flag?",
    content: "Coming soon: Use the --live flag to watch and auto-generate.",
    type: "faq",
  },
  {
    id: 4,
    title: "Modern READMEs",
    content: "Generate READMEs with emojis, badges, and modern formatting.",
    type: "feature",
  },
  {
    id: 5,
    title: "Cross-Platform",
    content: "Works on any OS and programming language.",
    type: "feature",
  },
  {
    id: 6,
    title: "Easy Integration",
    content: "Integrate with GitHub, GitLab, and VS Code.",
    type: "feature",
  },
  {
    id: 7,
    title: "Intelligent Updates",
    content:
      "Updates only auto-generated sections while preserving all your custom edits.",
    type: "feature",
  },
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContent = searchableContent.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <motion.div
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

          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-zinc-900 max-w-3xl mx-auto leading-[1.15]">
            The easiest way to generate <br />
            <span className="highlight highlight-purple">beautiful</span> and <span className="highlight highlight-yellow">accurate</span> READMEs
          </h1>

          <p className="text-lg md:text-xl text-zinc-500 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
         Dokugen is a helpful tool that automatically creates and updates README files for your projects. It takes a look at your codebase, figures out what your project does, and then writes a clear, detailed README so you don't have to spend time doing it yourself. It's built to make sure your project always has professional and accurate documentation.   </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="https://github.com/samueltuoyo15/Dokugen/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-zinc-900 text-white hover:bg-zinc-800 border-0 font-semibold px-8 py-6 text-base rounded-full transition-all">
                <Github className="mr-2 h-5 w-5" />
                Contribute
              </Button>
            </Link>

            <SupportButton />
          </div>

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
                </div>

                <div className="group bg-white p-8 rounded-2xl border border-[#a7f3d0]/60 hover:border-[#34d399]/70 transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-zinc-950">
                      Method 2: Python
                    </h3>
                    <span className="inline-flex items-center gap-1.5 bg-[#ecfdf5] text-[#047857] text-xs px-2.5 py-1 rounded-full border border-[#a7f3d0] font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      NEW
                    </span>
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
              <div className="md:col-span-2 group relative bg-[#f5f3ff]/60 hover:bg-[#f5f3ff] p-8 rounded-3xl border border-[#ddd6fe] hover:border-[#c084fc] transition-all duration-300 flex flex-col justify-between min-h-[350px]">
                <div>
                  <div className="inline-flex p-4 rounded-2xl bg-white border border-[#ddd6fe] text-[#7c3aed] mb-6">
                    <Workflow className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-[#4c1d95] tracking-tight">
                    System Design Diagrams
                  </h3>
                  <p className="text-[#6d28d9] leading-relaxed text-sm font-normal max-w-xl">
                    Generate beautiful system flowcharts directly inside your docs. Auto-colors your tech stack (Redis is red, Postgres is blue, MongoDB is green) and dynamically selects the best layout direction (TD, LR, BT) to fit your architecture.
                  </p>
                </div>
                <div className="mt-8 font-mono text-[10px] uppercase tracking-wider text-[#7c3aed]/70">
                  FEATURE_01 // DIAGRAM_ENGINE
                </div>
              </div>

              {/* Card 2: Smart Updates */}
              <div className="group relative bg-[#ecfdf5]/60 hover:bg-[#ecfdf5] p-8 rounded-3xl border border-[#a7f3d0] hover:border-[#34d399] transition-all duration-300 flex flex-col justify-between min-h-[350px]">
                <div>
                  <div className="inline-flex p-4 rounded-2xl bg-white border border-[#a7f3d0] text-[#10b981] mb-6">
                    <RefreshCw className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#064e3b] tracking-tight">
                    Smart Updates
                  </h3>
                  <p className="text-[#047857] leading-relaxed text-sm font-normal">
                    Regenerate your README without losing manual changes. We only refresh the auto-detected parts (tech stack, files, features), keeping your custom paragraphs and badges untouched.
                  </p>
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#10b981]/70 mt-6">
                  FEATURE_02 // SYNC_SYSTEM
                </div>
              </div>

              {/* Card 3: AI Commit Messages */}
              <div className="group relative bg-[#f0f9ff]/60 hover:bg-[#f0f9ff] p-8 rounded-3xl border border-[#bae6fd] hover:border-[#38bdf8] transition-all duration-300 flex flex-col justify-between min-h-[320px]">
                <div>
                  <div className="inline-flex p-4 rounded-2xl bg-white border border-[#bae6fd] text-[#0ea5e9] mb-6">
                    <GitBranch className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#0c4a6e] tracking-tight">
                    AI Commit Messages
                  </h3>
                  <p className="text-[#0369a1] leading-relaxed text-sm font-normal">
                    Type{" "}
                    <code className="text-[#0284c7] font-mono text-xs bg-white border border-[#bae6fd] px-1.5 py-0.5 rounded">
                      dokugen aic
                    </code>{" "}
                    to scan your staged git diff and instantly draft clean Conventional Commit messages. You can even auto-push!
                  </p>
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#0ea5e9]/70 mt-6">
                  FEATURE_03 // GIT_WORKFLOW
                </div>
              </div>

              {/* Card 4: Standalone Licenses */}
              <div className="group relative bg-[#fff1f2]/60 hover:bg-[#fff1f2] p-8 rounded-3xl border border-[#fecdd3] hover:border-[#fb7185] transition-all duration-300 flex flex-col justify-between min-h-[320px]">
                <div>
                  <div className="inline-flex p-4 rounded-2xl bg-white border border-[#fecdd3] text-[#f43f5e] mb-6">
                    <Scale className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#881337] tracking-tight">
                    License Generation
                  </h3>
                  <p className="text-[#be123c] leading-relaxed text-sm font-normal">
                    Run{" "}
                    <code className="text-[#e11d48] font-mono text-xs bg-white border border-[#fecdd3] px-1.5 py-0.5 rounded">
                      dokugen license
                    </code>{" "}
                    to instantly output project licenses. Features automatic git author/year detection and plain-English permission summaries.
                  </p>
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#f43f5e]/70 mt-6">
                  FEATURE_04 // LEGAL_HELPER
                </div>
              </div>

              {/* Card 5: Interactive Prompt */}
              <div className="group relative bg-[#fffbeb]/60 hover:bg-[#fffbeb] p-8 rounded-3xl border border-[#fde68a] hover:border-[#fbbf24] transition-all duration-300 flex flex-col justify-between min-h-[320px]">
                <div>
                  <div className="inline-flex p-4 rounded-2xl bg-white border border-[#fde68a] text-[#d97706] mb-6">
                    <Terminal className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#78350f] tracking-tight">
                    Interactive Prompt
                  </h3>
                  <p className="text-[#b45309] leading-relaxed text-sm font-normal">
                    Forget syntax flags and subcommands! Just type{" "}
                    <code className="text-[#d97706] font-mono text-xs bg-white border border-[#fde68a] px-1.5 py-0.5 rounded">
                      dokugen
                    </code>{" "}
                    to launch a gorgeous step-by-step interactive menu in your console.
                  </p>
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#d97706]/70 mt-6">
                  FEATURE_05 // CLI_MENU
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
                  to install Dokugen globally.
                  <br />
                  <span className="block mt-2">
                    <strong className="text-zinc-800">Python</strong>{" "}
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-xs px-1.5 py-0.5 rounded border border-emerald-200/60 font-medium ml-1">
                      NEW
                    </span>
                    <strong className="text-zinc-800">:</strong> Run{" "}
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
                  Can I auto generate my readme using the --live flag?
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  Coming Soon. You will be able to use the{" "}
                  <code className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-200/60">
                    --live
                  </code>{" "}
                  flag to watch and auto-generate your README in upcoming Dokugen versions.
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
                <div className="text-[11px] text-zinc-400 font-mono mx-auto pr-10 select-none">Demo.mp4</div>
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
          className="mt-32 pb-8 border-t border-zinc-200 pt-16"
        >
          <div className="flex flex-col items-center">
            <p className="text-zinc-500 mb-6 text-center max-w-lg mx-auto">
              Need help? Check out our{" "}
              <a
                href="https://github.com/samueltuoyo15/Dokugen"
                className="text-zinc-800 hover:text-zinc-950 hover:underline decoration-zinc-400 underline-offset-4 font-semibold transition-colors"
              >
                GitHub
              </a>{" "}
              or{" "}
              <a
                href="https://github.com/sponsors/samueltuoyo15"
                className="text-zinc-800 hover:text-zinc-950 hover:underline decoration-zinc-400 underline-offset-4 font-semibold transition-colors"
              >
                support page
              </a>
              .
            </p>

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
