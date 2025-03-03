"use client"

import { Button } from "@/components/ui/button"
import { Terminal, Code, FileText, Search } from "lucide-react"
import { motion } from "framer-motion"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold mb-4">Dokugen Docs</h1>
          <p className="text-xl text-gray-300 mb-8">
            Everything you need to know about Dokugen, from installation to advanced usage.
          </p>
          <div className="flex justify-center gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Terminal className="mr-2" />
              Get Started
            </Button>
            <Button variant="outline" className="text-white border-white">
              <Code className="mr-2" />
              API Reference
            </Button>
          </div>
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search the docs..."
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" />
            </div>
          </div>
        </motion.div>

        {/* Getting Started Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16"
        >
          <h2 className="text-4xl font-bold mb-8">Getting Started</h2>
          <div className="space-y-8">
            {/* Step 1: Installation */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">1. Installation</h3>
              <p className="text-gray-300 mb-4">
                Install Dokugen globally using npm:
              </p>
              <pre className="bg-gray-900 p-4 rounded-lg">
                <code className="text-green-400">npm install -g dokugen</code>
              </pre>
            </div>

            {/* Step 2: Generate README */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">2. Generate README</h3>
              <p className="text-gray-300 mb-4">
                Navigate to your project directory and run:
              </p>
              <pre className="bg-gray-900 p-4 rounded-lg">
                <code className="text-green-400">dokugen generate</code>
              </pre>
            </div>

            {/* Step 3: Customize */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">3. Customize</h3>
              <p className="text-gray-300 mb-4">
                Edit the generated README.md file to suit your project.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-4xl font-bold mb-8">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Modern READMEs */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <FileText className="w-12 h-12 mb-4 text-blue-500" />
              <h3 className="text-xl font-bold mb-2">Modern READMEs</h3>
              <p className="text-gray-300">
                Generate READMEs with emojis, badges, and modern formatting.
              </p>
            </div>

            {/* Feature 2: Cross-Platform */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <Terminal className="w-12 h-12 mb-4 text-green-500" />
              <h3 className="text-xl font-bold mb-2">Cross-Platform</h3>
              <p className="text-gray-300">
                Works on any OS and programming language.
              </p>
            </div>

            {/* Feature 3: Easy Integration */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <Code className="w-12 h-12 mb-4 text-purple-500" />
              <h3 className="text-xl font-bold mb-2">Easy Integration</h3>
              <p className="text-gray-300">
                Integrate with GitHub, GitLab, and VS Code.
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16"
        >
          <h2 className="text-4xl font-bold mb-8">FAQs</h2>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2">How do I install Dokugen?</h3>
                <p className="text-gray-300">
                  Run <code className="text-green-400">npm install -g dokugen</code> to install Dokugen globally.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Can I use custom templates?</h3>
                <p className="text-gray-300">
                  Yes, you can use the <code className="text-green-400">--template</code> flag to specify a custom template.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-300">Need help? Check out our <a href="#" className="text-blue-500 hover:underline">GitHub</a> or <a href="#" className="text-blue-500 hover:underline">support page</a>.</p>
        </motion.div>
      </div>
    </div>
  )
}