"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Shield, Lock, Eye } from "lucide-react"

export default function PrivacyPage() {
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
                            Privacy Policy
                        </h1>

                        <div className="text-lg leading-relaxed space-y-10 text-zinc-300">
                            <p className="text-xl text-zinc-400 font-light border-l-4 border-zinc-700 pl-4">
                                We respect your privacy. This policy explains what information we collect when you use the Dokugen CLI tool and how we use it.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                                <div className="bg-zinc-950/60 p-6 rounded-xl border border-zinc-900 text-center">
                                    <div className="bg-zinc-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                        <Eye className="w-6 h-6 text-zinc-400" />
                                    </div>
                                    <h3 className="font-semibold text-white mb-2">Transparency</h3>
                                    <p className="text-sm text-zinc-500">We are open source. You can verify exactly what we send.</p>
                                </div>
                                <div className="bg-zinc-950/60 p-6 rounded-xl border border-zinc-900 text-center">
                                    <div className="bg-zinc-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                        <Shield className="w-6 h-6 text-zinc-400" />
                                    </div>
                                    <h3 className="font-semibold text-white mb-2">Security</h3>
                                    <p className="text-sm text-zinc-500">Data is transmitted securely over HTTPS.</p>
                                </div>
                                <div className="bg-zinc-950/60 p-6 rounded-xl border border-zinc-900 text-center">
                                    <div className="bg-zinc-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                        <Lock className="w-6 h-6 text-zinc-400" />
                                    </div>
                                    <h3 className="font-semibold text-white mb-2">Privacy</h3>
                                    <p className="text-sm text-zinc-500">We never sell your data to third parties.</p>
                                </div>
                            </div>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4 text-white">Information We Collect</h2>
                                <p className="mb-4">
                                    When you use Dokugen CLI, specifically when running commands like <code>generate</code>, we collect the following technical information:
                                </p>
                                <div className="overflow-hidden rounded-xl border border-zinc-800">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-zinc-900 text-zinc-400">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Data Point</th>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Purpose</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800 bg-zinc-950/30">
                                            <tr>
                                                <td className="px-6 py-4 font-mono text-zinc-300">username</td>
                                                <td className="px-6 py-4 text-zinc-400">To identify unique users and prevent spam.</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 font-mono text-zinc-300">email</td>
                                                <td className="px-6 py-4 text-zinc-400">If available in git config, used for unique user identification.</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 font-mono text-zinc-300">os_platform</td>
                                                <td className="px-6 py-4 text-zinc-400">To understand our user base (Windows vs Mac vs Linux).</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 font-mono text-zinc-300">cli_version</td>
                                                <td className="px-6 py-4 text-zinc-400">To track adoption of new versions.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4 text-white">How We Use Information</h2>
                                <ul className="list-disc pl-6 space-y-2 marker:text-zinc-600">
                                    <li>To provide and maintain the Service</li>
                                    <li>To detect, prevent and address technical issues</li>
                                    <li>To monitor the usage of the Service (analytics)</li>
                                    <li>To identify trends in tool usage to prioritize features</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4 text-white">Data Storage</h2>
                                <p>
                                    We use Supabase, a secure backend-as-a-service platform, to store usage metrics. The database is secured with Row Level Security (RLS) policies and is only accessible by the Dokugen administraton team.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4 text-white">Contact Us</h2>
                                <p>
                                    If you have any questions about this Privacy Policy, please contact us via our GitHub issue tracker.
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
