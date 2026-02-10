"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Terminal, Code, FileText, Search, Github } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import MetricsSection from "@/components/metricsSection"

const searchableContent = [
  {
    id: 1,
    title: "How do I install Dokugen?",
    content: "Run npm install -g dokugen to install Dokugen globally.",
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
]

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredContent = searchableContent.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            Everything you need to know about Dokugen. From installation to advanced CLI usage.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="https://github.com/samueltuoyo15/Dokugen/" target="_blank" rel="noopener noreferrer">
              <Button className="bg-white text-black hover:bg-zinc-200 border-0 font-medium px-8 py-6 text-lg rounded-full transition-all">
                <Github className="mr-2 h-5 w-5" />
                Contribute
              </Button>
            </Link>
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
            <h2 className="text-2xl font-semibold mb-6 text-zinc-200">Search Results</h2>
            <div className="grid gap-4">
              {filteredContent.length > 0 ? (
                filteredContent.map((item) => (
                  <div key={item.id} className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-zinc-400">{item.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 py-8 text-center italic">No results found matching "{searchQuery}".</p>
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
            <h2 className="text-3xl font-bold mb-10 text-white tracking-tight">Getting Started</h2>
            <div className="space-y-6">
              <div className="group bg-zinc-900/30 p-8 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-zinc-100">1. Prerequisites</h3>
                <p className="text-zinc-400 mb-6 leading-relaxed">
                  Ensure you have <strong>Node.js</strong> installed. If not, download it from{" "}
                  <a href="https://nodejs.org" className="text-white underline decoration-zinc-600 underline-offset-4 hover:decoration-white transition-all" target="_blank" rel="noopener noreferrer">
                    nodejs.org
                  </a>.
                </p>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                  <code className="text-zinc-300 font-mono text-sm">node -v</code>
                </div>
              </div>

              <div className="group bg-zinc-900/30 p-8 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-zinc-100">2. Install Globally</h3>
                <p className="text-zinc-400 mb-6 leading-relaxed">
                  Install Dokugen globally once, and use it forever across any project on your machine:
                </p>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                  <code className="text-zinc-300 font-mono text-sm">npm install -g dokugen</code>
                </div>
              </div>

              <div className="group bg-zinc-900/30 p-8 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-zinc-100">3. Navigate to Project</h3>
                <p className="text-zinc-400 mb-6 leading-relaxed">
                  Open your terminal and navigate to your project directory:
                </p>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                  <code className="text-zinc-300 font-mono text-sm">cd your-project</code>
                </div>
              </div>

              <div className="group bg-zinc-900/30 p-8 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-zinc-100">4. Generate README</h3>
                <p className="text-zinc-400 mb-6 leading-relaxed">
                  Run the CLI command to interactively generate your README:
                </p>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                  <code className="text-zinc-300 font-mono text-sm">npx dokugen generate</code>
                </div>
              </div>

              <div className="group bg-zinc-900/30 p-8 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-zinc-100">5. Customize</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Edit the generated <code className="text-white bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono">README.md</code> file to check the final output.
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
            <h2 className="text-3xl font-bold mb-10 text-white tracking-tight">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-zinc-900/20 p-8 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-all">
                <div className="w-12 h-12 mb-6 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-100">Modern READMEs</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Generate professional READMEs with emojis, badges, and modern formatting standards automatically.
                </p>
              </div>

              <div className="bg-zinc-900/20 p-8 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-all">
                <div className="w-12 h-12 mb-6 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800">
                  <Terminal className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-100">Cross-Platform</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Built to work on any OS and supports any programming language or framework.
                </p>
              </div>

              <div className="bg-zinc-900/20 p-8 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-all">
                <div className="w-12 h-12 mb-6 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-100">Easy Integration</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Designed for seamless integration with GitHub, GitLab, and VS Code workflows.
                </p>
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
            <h2 className="text-3xl font-bold mb-10 text-white tracking-tight">FAQs</h2>
            <div className="space-y-6">
              <div className="bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800/50">
                <h3 className="text-lg font-semibold mb-2 text-zinc-100">How do I install Dokugen?</h3>
                <p className="text-zinc-400">
                  Run <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded text-sm font-mono">npm install -g dokugen</code> to install Dokugen globally.
                </p>
              </div>
              <div className="bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800/50">
                <h3 className="text-lg font-semibold mb-2 text-zinc-100">Can I use custom templates?</h3>
                <p className="text-zinc-400">
                  Yes. Use the <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded text-sm font-mono">--template</code> flag to specify a custom template URL.
                  <br />Example: <span className="text-sm font-mono opacity-70">dokugen --template https://raw.github.../README.md</span>
                </p>
              </div>
              <div className="bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800/50">
                <h3 className="text-lg font-semibold mb-2 text-zinc-100">Can I auto generate my readme using the --live flag?</h3>
                <p className="text-zinc-400">
                  Coming Soon. You will be able to use the <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded text-sm font-mono">--live</code> flag to watch and auto-generate your README in upcoming Dokugen versions.
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
          <div className="bg-zinc-900 p-2 rounded-2xl border border-zinc-800">
            <div className="bg-zinc-950 rounded-xl overflow-hidden relative">
              <video src="/Demo.mp4" muted autoPlay loop playsInline className="w-full h-full object-cover opacity-90">
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 to-transparent pointer-events-none"></div>
            </div>
            <p className="text-center text-zinc-500 mt-4 mb-2 text-sm uppercase tracking-widest font-medium">Dokugen in Action</p>
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
          className="mt-32 pb-16 text-center border-t border-zinc-900 pt-16"
        >
          <p className="text-zinc-500 mb-8">
            Need help? Check out our <a href="https://github.com/samueltuoyo15/Dokugen" className="text-white hover:underline decoration-zinc-700 underline-offset-4">GitHub</a> or <a href="https://github.com/sponsors/samueltuoyo15" className="text-white hover:underline decoration-zinc-700 underline-offset-4">support page</a>.
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <Link href="/terms" className="text-zinc-600 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="text-zinc-600 hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
