"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Eye } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
            <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
                <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 font-medium transition-colors mb-8 sm:mb-12 group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Documentation
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="bg-white p-8 md:p-12 rounded-2xl border border-zinc-200/80 shadow-sm">
                        <h1 className="text-4xl md:text-5xl font-black mb-8 text-zinc-900 tracking-tight pb-2">
                            Privacy Policy
                        </h1>

                        <div className="text-sm leading-relaxed space-y-10 text-zinc-600">
                            <p className="text-lg text-zinc-500 font-light border-l-4 border-zinc-200 pl-4 leading-relaxed">
                                We respect your privacy. This policy explains what information we collect when you use the Dokugen CLI tool and how we use it.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                                <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-200/60 text-center">
                                    <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-200">
                                        <Eye className="w-6 h-6 text-zinc-600" />
                                    </div>
                                    <h3 className="font-bold text-zinc-900 mb-2">Transparency</h3>
                                    <p className="text-xs text-zinc-500">We are open source. You can verify exactly what we send.</p>
                                </div>
                                <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-200/60 text-center">
                                    <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-200">
                                        <Shield className="w-6 h-6 text-zinc-600" />
                                    </div>
                                    <h3 className="font-bold text-zinc-900 mb-2">Security</h3>
                                    <p className="text-xs text-zinc-500">Data is transmitted securely over HTTPS.</p>
                                </div>
                                <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-200/60 text-center">
                                    <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-200">
                                        <Lock className="w-6 h-6 text-zinc-600" />
                                    </div>
                                    <h3 className="font-bold text-zinc-900 mb-2">Privacy</h3>
                                    <p className="text-xs text-zinc-500">We never sell your data to third parties.</p>
                                </div>
                            </div>

                            <section>
                                <h2 className="text-2xl font-bold mb-4 text-zinc-900">Information We Collect</h2>
                                <p className="mb-4">
                                    When you use Dokugen CLI, specifically when running commands like <code>generate</code>, we collect the following technical information:
                                </p>
                                <div className="overflow-hidden rounded-xl border border-zinc-200/80 shadow-sm">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-zinc-50 text-zinc-600 font-semibold border-b border-zinc-200">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Data Point</th>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Purpose</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200 bg-white">
                                            <tr>
                                                <td className="px-6 py-4 font-mono text-zinc-800 text-xs">username</td>
                                                <td className="px-6 py-4 text-zinc-500 text-xs">To identify unique users and prevent spam.</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 font-mono text-zinc-800 text-xs">email</td>
                                                <td className="px-6 py-4 text-zinc-500 text-xs">If available in git config, used for unique user identification.</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 font-mono text-zinc-800 text-xs">os_platform</td>
                                                <td className="px-6 py-4 text-zinc-500 text-xs">To understand our user base (Windows vs Mac vs Linux).</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 font-mono text-zinc-800 text-xs">cli_version</td>
                                                <td className="px-6 py-4 text-zinc-500 text-xs">To track adoption of new versions.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4 text-zinc-900">How We Use Information</h2>
                                <ul className="list-disc pl-6 space-y-2 marker:text-zinc-300">
                                    <li>To provide and maintain the Service</li>
                                    <li>To detect, prevent and address technical issues</li>
                                    <li>To monitor the usage of the Service (analytics)</li>
                                    <li>To identify trends in tool usage to prioritize features</li>
                                </ul>
                            </section>

                             <section>
                                 <h2 className="text-2xl font-bold mb-4 text-zinc-900">Sensitive Files & Exclusion Rules</h2>
                                 <p className="mb-4">
                                     Dokugen operates local-first. While scanning repositories to build diagrams and system overviews, the CLI enforces strict filters to protect sensitive information. <strong>Dokugen never reads, indexes, or transmits any of the following:</strong>
                                 </p>
                                 <ul className="list-disc pl-6 space-y-2 marker:text-zinc-300">
                                     <li><strong>Environment Files:</strong> <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">.env</code>, <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code>, <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">.env.development</code>, <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">.env.production</code>, etc.</li>
                                     <li><strong>Package Manager Lockfiles:</strong> <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">package-lock.json</code>, <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">pnpm-lock.yaml</code>, <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">yarn.lock</code>, <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">bun.lockb</code></li>
                                     <li><strong>Local Configurations & Logs:</strong> <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">tsconfig.json</code>, <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">*.log</code>, <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">npm-debug.log</code>, etc.</li>
                                     <li><strong>Credentials & Secret Keys:</strong> SSL certificates, SSH keys, encryption keys, and private credentials.</li>
                                     <li><strong>Dependencies & Build Targets:</strong> Heavy folders such as <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">node_modules</code>, <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">.git</code>, <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">build</code>, <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">dist</code>, and <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">.next</code> are skipped entirely.</li>
                                 </ul>
                             </section>

                             <section>
                                 <h2 className="text-2xl font-bold mb-4 text-zinc-900">Data Storage</h2>
                                 <p>
                                     We use Supabase, a secure backend-as-a-service platform, to store usage metrics. The database is secured with Row Level Security (RLS) policies and is only accessible by the Dokugen administration team.
                                 </p>
                             </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4 text-zinc-900">Contact Us</h2>
                                <p>
                                    If you have any questions about this Privacy Policy, please contact us via our GitHub issue tracker.
                                </p>
                            </section>
                        </div>

                        <div className="mt-12 pt-8 border-t border-zinc-200 text-xs text-zinc-400 text-center">
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
