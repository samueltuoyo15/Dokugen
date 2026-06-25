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
  Undo,
  GitBranch,
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-white selection:text-zinc-950">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <Image
            src="/smile_logo.svg"
            className="block text-center mx-auto mb-8 invert opacity-90"
            height={60}
            width={60}
            alt="Smile Logo"
          />
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-500">
            Dokugen Docs
          </h1>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about Dokugen. From installation to
            advanced CLI usage.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="https://github.com/samueltuoyo15/Dokugen/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-white text-black hover:bg-zinc-200 border-0 font-medium px-8 py-6 text-lg rounded-full transition-all">
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
                className="w-full bg-zinc-900/50 text-white px-6 py-4 rounded-2xl border border-zinc-800 group-hover:border-zinc-700 focus:outline-none focus:border-zinc-500 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-5 top-4 text-zinc-500" />
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
            <h2 className="text-2xl font-semibold mb-6 text-zinc-200">
              Search Results
            </h2>
            <div className="grid gap-4">
              {filteredContent.length > 0 ? (
                filteredContent.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-zinc-400">{item.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 py-8 text-center italic">
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
            <h2 className="text-3xl font-bold mb-10 text-white tracking-tight">
              Getting Started
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group bg-zinc-900/30 p-8 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all flex flex-col">
                  <h3 className="text-xl font-semibold mb-3 text-zinc-100">
                    Method 1: Node.js
                  </h3>
                  <p className="text-zinc-400 mb-6 leading-relaxed flex-grow">
                    Install via npm, yarn, or pnpm if you have Node.js
                    installed.
                  </p>
                  <Copy code="npm install -g dokugen" />
                </div>

                <div className="group bg-zinc-900/30 p-8 rounded-2xl border border-emerald-900/40 hover:border-emerald-700/50 transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-zinc-100">
                      Method 2: Python
                    </h3>
                    <span className="inline-flex items-center gap-1.5 bg-emerald-900/50 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-700/50 font-medium">
                      <Sparkles className="w-3 h-3" />
                      NEW
                    </span>
                  </div>
                  <p className="text-zinc-400 mb-6 leading-relaxed flex-grow">
                    Install via uv (recommended) or pip. The Python client is
                    fully featured and production-ready.
                  </p>
                  <Copy code="uv tool install dokugen" />
                  <p className="text-zinc-500 text-xs mt-3">
                    or:{" "}
                    <code className="font-mono text-zinc-400">
                      pip install dokugen
                    </code>
                  </p>
                </div>
              </div>

              {/* <div className="group bg-zinc-900/10 p-8 rounded-2xl border border-dashed border-zinc-800 hover:border-zinc-700 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-zinc-300">
                    Alternative: Standalone Binary
                  </h3>
                  <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-1 rounded border border-zinc-700 font-mono">
                    No Node.js
                  </span>
                </div>

                <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-800/50 rounded-xl">
                  <p className="text-yellow-500 text-sm font-medium mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Experimental Vibes
                  </p>
                  <p className="text-yellow-500/80 text-xs leading-relaxed">
                    These standalone binaries are super new and honestly pretty
                    unstable. If you use them, you’ll probably run into issues,
                    that’s just how it is right now. If it breaks, just stick to
                    the Node.js version for now.
                  </p>
                </div>

                <p className="text-zinc-500 mb-6 text-sm leading-relaxed">
                  Avoid installing Node.js entirely. Download the single
                  executable file for your OS:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <a
                    href="https://github.com/samueltuoyo15/Dokugen/releases/download/v3.11.0/dokugen-windows-x64.exe"
                    className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg p-3 text-center transition-colors group/btn block no-underline"
                  >
                    <span className="block text-zinc-300 font-medium text-sm group-hover/btn:text-white">
                      Windows
                    </span>
                    <span className="text-zinc-600 text-xs">.exe (x64)</span>
                  </a>
                  <a
                    href="https://github.com/samueltuoyo15/Dokugen/releases/download/v3.11.0/dokugen-macos-arm64"
                    className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg p-3 text-center transition-colors group/btn block no-underline"
                  >
                    <span className="block text-zinc-300 font-medium text-sm group-hover/btn:text-white">
                      macOS
                    </span>
                    <span className="text-zinc-600 text-xs">
                      Silicon (M1/M2)
                    </span>
                  </a>
                  <a
                    href="https://github.com/samueltuoyo15/Dokugen/releases/download/v3.11.0/dokugen-macos-x64"
                    className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg p-3 text-center transition-colors group/btn block no-underline"
                  >
                    <span className="block text-zinc-300 font-medium text-sm group-hover/btn:text-white">
                      macOS
                    </span>
                    <span className="text-zinc-600 text-xs">Intel (x64)</span>
                  </a>
                  <a
                    href="https://github.com/samueltuoyo15/Dokugen/releases/download/v3.11.0/dokugen-linux-x64"
                    className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg p-3 text-center transition-colors group/btn block no-underline"
                  >
                    <span className="block text-zinc-300 font-medium text-sm group-hover/btn:text-white">
                      Linux
                    </span>
                    <span className="text-zinc-600 text-xs">x64</span>
                  </a>
                </div>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 overflow-x-auto">
                  <p className="text-zinc-500 text-xs mb-2 font-mono">
                    # Linux/macOS Quick Install:
                  </p>
                  <code className="text-zinc-400 font-mono text-xs whitespace-pre block overflow-x-auto">
                    curl -L -o dokugen
                    https://github.com/samueltuoyo15/Dokugen/releases/download/v3.11.0/dokugen-linux-x64
                    && chmod +x dokugen
                  </code>
                </div>
              </div> */}

              <div className="group bg-zinc-900/30 p-8 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-zinc-100">
                  2. Install Globally
                </h3>
                <p className="text-zinc-400 mb-6 leading-relaxed">
                  Install Dokugen globally once, and use it forever across any
                  project on your machine:
                </p>
                <Copy code="npm install -g dokugen" className="text-sm" />
              </div>

              <div className="group bg-zinc-900/30 p-8 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-zinc-100">
                  3. Navigate to Project
                </h3>
                <p className="text-zinc-400 mb-6 leading-relaxed">
                  Open your terminal and navigate to your project directory:
                </p>
                <Copy code="cd your-project" className="text-sm" />
              </div>

              <div className="group bg-zinc-900/30 p-8 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-zinc-100">
                  4. Launch Interactive Menu
                </h3>
                <p className="text-zinc-400 mb-6 leading-relaxed">
                  Run the CLI command without arguments to open the interactive
                  assistant:
                </p>
                <Copy code="dokugen" className="text-sm" />
              </div>

              <div className="group bg-zinc-900/30 p-8 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-zinc-100">
                  5. Customize
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  Edit the generated{" "}
                  <code className="text-white bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono">
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
            <h2 className="text-3xl font-bold mb-10 text-white tracking-tight">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Featured double-wide Card */}
              <div className="md:col-span-2 group relative bg-zinc-900/20 p-8 rounded-3xl border border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-900/30 transition-all duration-500 flex flex-col md:flex-row gap-8 overflow-hidden min-h-[350px]">
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">
                      Instant AI READMEs
                    </h3>
                    <p className="text-zinc-400 leading-relaxed text-sm font-light">
                      Dokugen parses your project structure, config files, and
                      code. It automatically spots your tech stack,
                      dependencies, and APIs, drafting a professional README
                      complete with badges, descriptions, and setups in seconds.
                    </p>
                  </div>
                  <div className="mt-8 font-mono text-xs text-zinc-500">
                    FEATURE_01 // CORE_GENERATOR
                  </div>
                </div>
              </div>

              {/* Card 2: Smart Updates */}
              <div className="group relative bg-zinc-900/20 p-8 rounded-3xl border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900/30 transition-all duration-500 flex flex-col justify-between min-h-[350px]">
                <div>
                  <div className="inline-flex p-3 rounded-2xl bg-zinc-950 border border-zinc-800 group-hover:border-emerald-500/30 group-hover:text-emerald-400 text-zinc-500 transition-colors mb-6">
                    <RefreshCw className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white tracking-tight">
                    Smart Updates
                  </h3>
                  <p className="text-zinc-400 leading-relaxed text-sm font-light">
                    Regenerate your README without losing manual changes. We
                    only refresh the auto-detected parts (tech stack, files,
                    features), keeping your custom paragraphs and badges
                    untouched.
                  </p>
                </div>
                <div className="font-mono text-xs text-zinc-500 mt-6">
                  FEATURE_02 // SYNC_SYSTEM
                </div>
              </div>

              {/* Card 3: AI Commit Messages */}
              <div className="group relative bg-zinc-900/20 p-8 rounded-3xl border border-zinc-800 hover:border-sky-500/50 hover:bg-zinc-900/30 transition-all duration-500 flex flex-col justify-between min-h-[320px]">
                <div>
                  <div className="inline-flex p-3 rounded-2xl bg-zinc-950 border border-zinc-800 group-hover:border-sky-500/30 group-hover:text-sky-400 text-zinc-500 transition-colors mb-6">
                    <GitBranch className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white tracking-tight">
                    AI Commit Messages
                  </h3>
                  <p className="text-zinc-400 leading-relaxed text-sm font-light">
                    Type{" "}
                    <code className="text-sky-400 font-mono text-xs bg-sky-950/30 border border-sky-800/30 px-1 py-0.5 rounded">
                      dokugen aic
                    </code>{" "}
                    to scan your staged git diff and instantly draft clean
                    Conventional Commit messages. You can even auto-push!
                  </p>
                </div>
                <div className="font-mono text-xs text-zinc-500 mt-6">
                  FEATURE_03 // GIT_WORKFLOW
                </div>
              </div>

              {/* Card 4: Safety Reverts */}
              <div className="group relative bg-zinc-900/20 p-8 rounded-3xl border border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-900/30 transition-all duration-500 flex flex-col justify-between min-h-[320px]">
                <div>
                  <div className="inline-flex p-3 rounded-2xl bg-zinc-950 border border-zinc-800 group-hover:border-rose-500/30 group-hover:text-rose-400 text-zinc-500 transition-colors mb-6">
                    <Undo className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white tracking-tight">
                    Safety Reverts
                  </h3>
                  <p className="text-zinc-400 leading-relaxed text-sm font-light">
                    Every time you run a change, we save a backup of your
                    original file. If you don't like the new result, run{" "}
                    <code className="text-rose-400 font-mono text-xs bg-rose-950/30 border border-rose-800/30 px-1 py-0.5 rounded">
                      dokugen revert
                    </code>{" "}
                    to restore it instantly.
                  </p>
                </div>
                <div className="font-mono text-xs text-zinc-500 mt-6">
                  FEATURE_04 // BACKUP_SHIELD
                </div>
              </div>

              {/* Card 5: Interactive Prompt */}
              <div className="group relative bg-zinc-900/20 p-8 rounded-3xl border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900/30 transition-all duration-500 flex flex-col justify-between min-h-[320px]">
                <div>
                  <div className="inline-flex p-3 rounded-2xl bg-zinc-950 border border-zinc-800 group-hover:border-amber-500/30 group-hover:text-amber-400 text-zinc-500 transition-colors mb-6">
                    <Terminal className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white tracking-tight">
                    Interactive Prompt
                  </h3>
                  <p className="text-zinc-400 leading-relaxed text-sm font-light">
                    Forget syntax flags and subcommands! Just type{" "}
                    <code className="text-amber-400 font-mono text-xs bg-amber-950/30 border border-amber-800/30 px-1 py-0.5 rounded">
                      dokugen
                    </code>{" "}
                    to launch a gorgeous step-by-step interactive menu in your
                    console.
                  </p>
                </div>
                <div className="font-mono text-xs text-zinc-500 mt-6">
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
            <h2 className="text-3xl font-bold mb-10 text-white tracking-tight">
              FAQs
            </h2>
            <div className="space-y-6">
              <div className="bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                <h3 className="text-lg font-semibold mb-2 text-zinc-100">
                  How do I install Dokugen?
                </h3>
                <p className="text-zinc-400">
                  <strong className="text-zinc-300">Node.js:</strong> Run{" "}
                  <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-800">
                    npm install -g dokugen
                  </code>{" "}
                  to install Dokugen globally.
                  <br />
                  <strong className="text-zinc-300">Python</strong>{" "}
                  <span className="inline-flex items-center gap-1 bg-emerald-900/40 text-emerald-400 text-xs px-1.5 py-0.5 rounded border border-emerald-700/40 font-medium ml-1">
                    NEW
                  </span>
                  <strong className="text-zinc-300">:</strong> Run{" "}
                  <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-800">
                    pip install dokugen
                  </code>{" "}
                  or{" "}
                  <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-800">
                    uv tool install dokugen
                  </code>
                  .
                </p>
              </div>
              <div className="bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                <h3 className="text-lg font-semibold mb-2 text-zinc-100">
                  Can I use custom templates?
                </h3>
                <p className="text-zinc-400">
                  Yes. Use the{" "}
                  <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-800">
                    --template
                  </code>{" "}
                  flag to specify a custom template URL.
                  <br />
                  Example:{" "}
                  <span className="text-sm font-mono opacity-70">
                    dokugen --template https://raw.github.../README.md
                  </span>
                </p>
              </div>
              <div className="bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                <h3 className="text-lg font-semibold mb-2 text-zinc-100">
                  Can I auto generate my readme using the --live flag?
                </h3>
                <p className="text-zinc-400">
                  Coming Soon. You will be able to use the{" "}
                  <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-800">
                    --live
                  </code>{" "}
                  flag to watch and auto-generate your README in upcoming
                  Dokugen versions.
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
          <div className="bg-zinc-900 p-2 rounded-2xl border border-zinc-800 shadow-2xl shadow-zinc-900/50">
            <div className="bg-zinc-950 rounded-xl overflow-hidden relative">
              <video
                src="/Demo.mp4"
                muted
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
              >
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent pointer-events-none"></div>
            </div>
            <p className="text-center text-zinc-500 mt-4 mb-2 text-xs md:text-sm uppercase tracking-widest font-medium">
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
          className="mt-32 pb-8 border-t border-zinc-900 pt-16"
        >
          <div className="flex flex-col items-center">
            <p className="text-zinc-500 mb-6 text-center max-w-lg mx-auto">
              Need help? Check out our{" "}
              <a
                href="https://github.com/samueltuoyo15/Dokugen"
                className="text-white hover:underline decoration-zinc-700 underline-offset-4 font-medium transition-colors"
              >
                GitHub
              </a>{" "}
              or{" "}
              <a
                href="https://github.com/sponsors/samueltuoyo15"
                className="text-white hover:underline decoration-zinc-700 underline-offset-4 font-medium transition-colors"
              >
                support page
              </a>
              .
            </p>

            <div className="flex items-center gap-6 mb-8">
              <Link
                href="/terms"
                className="text-sm text-zinc-500 hover:text-white transition-colors duration-200 font-medium"
              >
                Terms of Service
              </Link>
              <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
              <Link
                href="/privacy"
                className="text-sm text-zinc-500 hover:text-white transition-colors duration-200 font-medium"
              >
                Privacy Policy
              </Link>
            </div>

            <p className="text-zinc-600 text-sm font-mono">
              &copy; {new Date().getFullYear()} Dokugen. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
