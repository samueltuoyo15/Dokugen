"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Terminal, Code, FileText, Search, Github } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

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
    content: "Coming Soon, you will be able to use the --template flag to specify a custom template in upcoming Dokugen version 3.2.0.",
    type: "faq",
  },
  {
    id: 3,
    title: "Can I auto generate my readme using the --live flag?",
    content: "Coming Soon, you will be able to use the flag to watch ad auto generate your readme in upcoming Dokugen version 3.2.0.",
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
         <Image src="/smile_logo.svg" className="block text-center mx-auto" height={50} width={50} alt="Smile Logo"/>
          <h1 className="text-6xl font-bold mb-4">Dokugen Docs</h1>
          <p className="text-xl text-gray-300 mb-8">
            Everything you need to know about Dokugen, from installation to advanced usage.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Terminal className="mr-2" />
                Go to Home
              </Button>
            </Link>
            <Link href="https://github.com/samueltuoyo15/Dokugen/" target="_blank" rel="noopener noreferrer">
              <Button className="text-white border-white">
                <Github className="mr-2" />
                Contribute
              </Button>
            </Link>
          </div>
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search the docs..."
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" />
            </div>
          </div>
        </motion.div>

        {/* Display Search Results */}
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold mb-4">Search Results</h2>
            <div className="space-y-4">
              {filteredContent.length > 0 ? (
                filteredContent.map((item) => (
                  <div key={item.id} className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="text-gray-300">{item.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-300">No results found.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Getting Started Section */}
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16"
          >
            <h2 className="text-4xl font-bold mb-8">Getting Started</h2>
            <div className="space-y-8">
              {/* Step 1: Prerequisites */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">1. Prerequisites</h3>
                <p className="text-gray-300 mb-4">
                  Ensure you have <strong>Node.js</strong> installed on your machine. If not, download and install it from{" "}
                  <a href="https://nodejs.org" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                    nodejs.org
                  </a>.
                </p>
                <p className="text-gray-300 mb-4">
                  Verify your Node.js installation by running:
                </p>
                <pre className="bg-gray-900 p-4 rounded-lg">
                  <code className="text-green-400">node -v</code>
                </pre>
              </div>

              {/* Step 2: Navigate to Your Project */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">2. Navigate to Your Project</h3>
                <p className="text-gray-300 mb-4">
                  Open your terminal and navigate to your project directory:
                </p>
                <pre className="bg-gray-900 p-4 rounded-lg">
                  <code className="text-green-400">cd your-project</code>
                </pre>
              </div>

              {/* Step 3: Install Dokugen Globally */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">3. Install Dokugen Globally</h3>
                <p className="text-gray-300 mb-4">
                  Install Dokugen globally using npm:
                </p>
                <pre className="bg-gray-900 p-4 rounded-lg">
                  <code className="text-green-400">npm install -g dokugen</code>
                </pre>
              </div>

              {/* Step 4: Generate README */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">4. Generate README</h3>
                <p className="text-gray-300 mb-4">
                  Run the following command to generate your README:
                </p>
                <pre className="bg-gray-900 p-4 rounded-lg">
                  <code className="text-green-400">npx dokugen generate</code>
                </pre>
              </div>

              {/* Step 5: Customize */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">5. Customize</h3>
                <p className="text-gray-300 mb-4">
                  Edit the generated <code className="text-green-400">README.md</code> file to suit your project.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Features Section */}
        {!searchQuery && (
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
        )}

        {/* FAQs Section */}
        {!searchQuery && (
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
                    Coming Soon, you will be able to use the <code className="text-green-400">--template flag</code> flag to specify a custom template in upcoming Dokugen version 3.1.0.
                  </p>
                </div>
                   <div>
                  <h3 className="text-xl font-bold mb-2">Can I auto generate my readme using the --live flag?</h3>
                  <p className="text-gray-300">
                    Coming Soon, you will be able to use the <code className="text-green-400">--live flag</code> flag to watch ad auto generate your readme in upcoming Dokugen version 3.1.0.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-300">Need help? Check out our <a href="https://github.com/samueltuoyo15/Dokugen" className="text-blue-500 hover:underline">GitHub</a> or <a href="https://github.com/samueltuoyo15/Dokugen" className="text-blue-500 hover:underline">support page</a>.</p>
        </motion.div>
      </div>
    </div>
  )
}