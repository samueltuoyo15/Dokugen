"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Rocket, Download, Code, FileText, Terminal } from "lucide-react"
import { motion } from "framer-motion"
import MetricsSection from "@/components/metricsSection"

export default function Home() {
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
          <h1 className="text-6xl font-bold mb-4">Dokugen</h1>
          <p className="text-xl text-gray-300 mb-8">
            Automatically generate high-quality READMEs for your projects.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/docs">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="mr-2" />
              Download CLI
            </Button>
            </Link>
            
            <Link href="/docs">
            <Button variant="outline" className="text-white border-white">
              <Code className="mr-2" />
              View Docs
            </Button>
            </Link>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16"
        >
          <h2 className="text-4xl font-bold mb-8">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Modern READMEs */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <Rocket className="w-12 h-12 mb-4 text-blue-500" />
              <h3 className="text-xl font-bold mb-2">Modern READMEs</h3>
              <p className="text-gray-300">
                Generate READMEs with emojis, badges, and modern formatting to make your projects stand out.
              </p>
            </div>

            {/* Card 2: Cross-Platform & Multipurpose */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <Terminal className="w-12 h-12 mb-4 text-green-500" />
              <h3 className="text-xl font-bold mb-2">Cross-Platform & Multipurpose</h3>
              <p className="text-gray-300">
                Works on any OS and programming language. Fast, seamless, and easy to integrate.
              </p>
            </div>

            {/* Card 3: Easy to Install */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <FileText className="w-12 h-12 mb-4 text-purple-500" />
              <h3 className="text-xl font-bold mb-2">Easy to Install</h3>
              <p className="text-gray-300">
                Get started in minutes with a simple installation process and intuitive CLI.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mockup Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16"
        >
          <div className="bg-gray-800 p-12 rounded-lg">
            <h2 className="text-4xl font-bold mb-8 text-center">How Dokugen Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1: Write Code */}
              <div className="text-center">
                <Code className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                <h3 className="text-2xl font-bold mb-2">1. Write Code</h3>
                <p className="text-gray-300">
                  Develop your project as usual. Dokugen will automatically detect your code structure.
                </p>
              </div>

              {/* Step 2: Generate README */}
              <div className="text-center">
                <Terminal className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-2xl font-bold mb-2">2. Generate README</h3>
                <p className="text-gray-300">
                  Run the Dokugen CLI to generate a professional README in seconds.
                </p>
              </div>

              {/* Step 3: Publish */}
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                <h3 className="text-2xl font-bold mb-2">3. Publish</h3>
                <p className="text-gray-300">
                  Push your README to GitHub and showcase your project to the world.
                </p>
              </div>
            </div>

            {/* Matrix-Style Mockup */}
            <div className="mt-12 overflow-hidden">
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="flex justify-center">
                  <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <Code className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-center text-gray-300 text-sm">Code</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <Terminal className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p className="text-center text-gray-300 text-sm">CLI</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-center text-gray-300 text-sm">README</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Image Mockup Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <div className="bg-gray-800 p-12 rounded-lg">
            <h2 className="text-4xl font-bold mb-8 text-center">See Dokugen in Action</h2>
            <div className="relative w-full h-96 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transform scale-110 rotate-3"
                style={{
                  backgroundImage: "url('/Screenshot_20250303-090722.png')", 
                }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16"
        >
          <div className="bg-gray-800 p-12 rounded-lg">
            <h2 className="text-4xl font-bold mb-8 text-center">What Our Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-gray-900 p-6 rounded-lg">
                <p className="text-gray-300 italic">{`Dokugen saved me hours of writing READMEs. It’s a game-changer for developers!`}</p>
                <p className="text-white font-bold mt-4">Samuel Tuoyo</p>
                <p className="text-gray-400 text-sm">Full-Stack Developer</p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-gray-900 p-6 rounded-lg">
                <p className="text-gray-300 italic">"I love how easy it is to generate professional READMEs with Dokugen."</p>
                <p className="text-white font-bold mt-4">Treasure Uzoma</p>
                <p className="text-gray-400 text-sm">Open Source Contributor</p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-gray-900 p-6 rounded-lg">
                <p className="text-gray-300 italic">Dokugen templates are amazing. My projects have never looked better!</p>
                <p className="text-white font-bold mt-4">Daniel</p>
                <p className="text-gray-400 text-sm">DevOps Engineer</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-12 rounded-lg text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Elevate Your READMEs?</h2>
            <p className="text-gray-200 mb-8">
              Join thousands of developers using Dokugen to create stunning READMEs in seconds.
            </p>
            <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition">
              Get Started Now
            </button>
          </div>
        </motion.div>

        {/* User Metrics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-16"
        >
          <MetricsSection />
        </motion.div>
      </div>
    </div>
  )
}