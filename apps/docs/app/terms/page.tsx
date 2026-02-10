"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-white selection:text-zinc-950">
            <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
                <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors mb-8 sm:mb-12 group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Documentation
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="bg-zinc-900/40 p-8 md:p-12 rounded-2xl border border-zinc-800/50 shadow-2xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-500 pb-2">
                            Terms of Service
                        </h1>

                        <div className="text-lg leading-relaxed space-y-8 text-zinc-300">
                            <p className="text-xl text-zinc-400 font-light border-l-4 border-zinc-700 pl-4">
                                By downloading or using the Dokugen CLI tool, these terms will automatically apply to you. You should make sure therefore that you read them carefully before using the app.
                            </p>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                                    <span className="bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 border border-zinc-700">1</span>
                                    Acceptance of Terms
                                </h2>
                                <p>
                                    Dokugen is an open-source command-line interface tool designed to generate README documentation. By installing and using this software, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use the software.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                                    <span className="bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 border border-zinc-700">2</span>
                                    Data Collection & Usage
                                </h2>
                                <p className="mb-4">
                                    To improve the Dokugen experience and understand our user base, we collect minimal, non-sensitive usage data when you run specific commands (like <code>dokugen generate</code>).
                                </p>
                                <div className="bg-zinc-950/50 p-6 rounded-xl border border-zinc-900">
                                    <p className="mb-2 text-zinc-400 text-sm uppercase tracking-wide font-semibold">We collect:</p>
                                    <ul className="list-disc list-inside space-y-2 text-zinc-300">
                                        <li>CLI Version number</li>
                                        <li>System Username (to prevent duplicate counting)</li>
                                        <li>Git Author Email (if configured, purely for unique identification)</li>
                                        <li>Operating System Platform</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                                    <span className="bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 border border-zinc-700">3</span>
                                    Open Source License
                                </h2>
                                <p>
                                    Dokugen is licensed under the MIT License. You are free to view, modify, and distribute the source code in accordance with the license terms found in our GitHub repository.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                                    <span className="bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 border border-zinc-700">4</span>
                                    Disclaimer of Warranty
                                </h2>
                                <p>
                                    The software is provided "AS IS", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors be liable for any claim, damages or other liability.
                                </p>
                            </section>
                        </div>

                        <div className="mt-12 pt-8 border-t border-zinc-800 text-sm text-zinc-500 text-center">
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
