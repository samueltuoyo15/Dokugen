import { GitBranch, Globe, Layers, Layout, RefreshCw, Scale, Terminal, Workflow, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SearchItem {
  id: number;
  title: string;
  content: string;
  type: "faq" | "feature";
}

export interface FeatureCard {
  icon: LucideIcon;
  title: string;
  body: string;
}

export const searchableContent: SearchItem[] = [
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
    content:
      "Absolutely. Stand out from the crowd by matching the layout of your favorite repositories. Simply use the --template flag and provide any public README URL to instantly model your documentation after the best in the industry.",
    type: "faq",
  },
  {
    id: 4,
    title: "How does the AI Commit subcommand work?",
    content:
      "Writing commits is tedious, but clean history is crucial for team projects. Dokugen reads your changes, writes Conventional Commits using Gemini, and lets you commit and push with one confirmation. Look professional without the cognitive load.",
    type: "faq",
  },
  {
    id: 5,
    title: "Does Dokugen require my own API keys?",
    content:
      "No API keys or payment required to start. We provide a fully managed backend with shared API keys so you can experience Dokugen instantly. If you have extremely large projects or hit rate limits, you can easily plug in your own API key for unlimited use.",
    type: "faq",
  },
  {
    id: 6,
    title: "What is the license generation feature?",
    content:
      "Did you know that without a LICENSE file, other developers legally cannot use, modify, or contribute to your code? Unlicensed repositories scare away contributors and companies alike. Protect your work and open the door to collaboration by running dokugen license. It auto-detects git details and generates a compliant LICENSE along with a human-readable summary that builds trust.",
    type: "faq",
  },
  {
    id: 7,
    title: "How do the colorized flowcharts work?",
    content:
      "A picture is worth a thousand words. Dokugen automatically maps your project's structure and renders clean, color-coded architecture flowcharts inside your README. It assigns distinct colors to each service (like database, cache, or queue) and optimizes layout directions so your project structure is instantly readable.",
    type: "faq",
  },
  {
    id: 8,
    title: "What is the smart update command?",
    content:
      "Most generators completely overwrite your manual edits, forcing you to copy-paste. Dokugen's smart update is different: it updates the technical directories and dependencies while leaving your carefully written descriptions, tutorials, and badges untouched. Keep your docs in sync with your code effortlessly.",
    type: "faq",
  },
  {
    id: 14,
    title: "Does Dokugen read my .env files or sensitive secrets?",
    content:
      "Never. Dokugen explicitly ignores .env files and private credentials. Furthermore, Dokugen strictly respects everything in your repository's .gitignore file, so node_modules, build artifacts, and any custom ignored patterns are completely skipped during scans.",
    type: "faq",
  },
  {
    id: 9,
    title: "Modern READMEs",
    content: "Generate READMEs with emojis, badges, and modern formatting.",
    type: "feature",
  },
  { id: 10, title: "Cross-Platform", content: "Works on any OS and programming language.", type: "feature" },
  {
    id: 11,
    title: "Easy Integration",
    content: "Integrate with GitHub, GitLab, and terminal workflows.",
    type: "feature",
  },
  {
    id: 12,
    title: "Intelligent Updates",
    content: "Updates only auto-generated sections while preserving all your custom edits.",
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

export const featureCards: FeatureCard[] = [
  {
    icon: Workflow,
    title: "System Design Diagrams",
    body: "Developers love visuals, but manual diagrams go stale the second you push code. Dokugen automatically renders interactive, color-coded architecture flowcharts directly inside your README. Show off your system design instantly, build trust with users, and make your repo look 10x more professional without touching Figma.",
  },
  {
    icon: RefreshCw,
    title: "Smart Updates",
    body: "Never worry about losing your custom descriptions, notes, or badges. Smart Updates intelligently target only the auto-generated elements of your README, preserving your hand-written text perfectly. Keep your docs fresh and accurate without repeating your hard work.",
  },
  {
    icon: GitBranch,
    title: "Quality Commit Messages",
    body: "Unprofessional git logs hurt your credibility. Boost your project's reputation with clean, Conventional Commit messages generated instantly from your actual file diffs. Save mental energy and push your changes with a single keystroke.",
  },
  {
    icon: Scale,
    title: "License Generation",
    body: "Unlicensed code is dead code, companies won't touch it, and developers won't contribute. Protect your intellectual property and welcome contributors in seconds. Automatically detect the author and year, generate a compliant LICENSE, and get a human-readable summary so everyone feels safe using your work.",
  },
  {
    icon: Zap,
    title: "Zero-Config Experience",
    body: "No API keys to copy and no account form to fill out. Sign in once through GitHub's secure device flow, then run Dokugen directly in any project.",
  },
  {
    icon: Layers,
    title: "Incremental Scanning",
    body: "Don't waste time waiting for slow documentation builds. Our intelligent caching engine only rescans the files you modified, delivering lightning-fast updates in milliseconds. High performance that respects your development flow.",
  },
  {
    icon: Layout,
    title: "Custom Templates",
    body: "Success leaves clues. If you admire a popular repository's layout, simply point Dokugen to it. We will replicate its exact structure and fill it with your project's details automatically, giving you the layout of top-tier projects instantly.",
  },
  {
    icon: Terminal,
    title: "Interactive Prompt",
    body: "Say goodbye to memorizing complex CLI arguments. Type a single command and let our friendly interactive guide walk you through README generation, licensing, and commits step-by-step. Smooth, effortless, and simple.",
  },
  {
    icon: Globe,
    title: "Language Agnostic",
    body: "Dokugen works with any codebase! Whether your project is built in React, Node, Python, Go, Rust, Java, PHP, C++, or Django, it doesn't matter. Just install Dokugen globally on your machine using npm or Python, and run it in any directory.",
  },
];
