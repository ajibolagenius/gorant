import React from "react"
import { FileText, ShieldCheck, Users, CheckCircle2, User, ListChecks, Lock, AlertTriangle, History } from "lucide-react"
import Link from "next/link"

const navLinks = [
    { href: "/privacy", label: "Privacy Policy", icon: <ShieldCheck className="w-4 h-4 mr-2" /> },
    { href: "/terms-of-service", label: "Terms of Service", icon: <FileText className="w-4 h-4 mr-2" /> },
    { href: "/guidelines", label: "Community Guidelines", icon: <Users className="w-4 h-4 mr-2" /> },
]

export default function TermsOfServicePage() {
    return (
        <div className="container mx-auto w-full max-w-full px-4 mb-safe-bottom wrap-screen overflow-x-auto py-8">
            <main className="max-w-2xl mx-auto">
                {/* Navigation Tabs */}
                <nav className="flex justify-center mb-8">
                    <ul className="flex flex-wrap gap-2 bg-muted/60 dark:bg-muted/30 p-1 shadow-sm w-full max-w-xl rounded-none">
                        {navLinks.map(link => (
                            <li key={link.href} className="flex-1 min-w-[140px]">
                                <Link href={link.href} legacyBehavior>
                                    <a className={`flex items-center justify-center px-4 py-2 font-medium text-sm transition-colors w-full h-full rounded-none border-0 ${link.href === "/terms-of-service" ? "bg-white dark:bg-gray-900 shadow text-purple-700 dark:text-purple-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{link.icon}{link.label}</a>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="mb-8">
                    <h1 className="font-grotesk text-4xl font-extrabold mb-2 flex items-center gap-3 tracking-tight text-purple-700 dark:text-purple-400">
                        <FileText className="w-9 h-9" variant="duotone" /> Terms of Service
                    </h1>
                    <p className="font-manrope text-lg text-gray-600 dark:text-gray-300 font-medium leading-relaxed">Please read our terms carefully. By using this platform, you agree to the following rules and responsibilities.</p>
                </div>
                {/* Section Cards */}
                <section className="mb-6">
                    <div className="rounded-none bg-green-50 dark:bg-green-950/40 shadow-sm border-0 p-6">
                        <h2 className="font-grotesk text-2xl font-bold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                            <CheckCircle2 className="w-7 h-7" variant="duotone" /> Acceptance of Terms
                        </h2>
                        <p className="font-manrope leading-relaxed text-gray-700 dark:text-gray-200">By using this platform, you agree to abide by these Terms of Service and all applicable laws and regulations. If you do not agree, please do not use the app.</p>
                    </div>
                </section>
                <section className="mb-6">
                    <div className="rounded-none bg-blue-50 dark:bg-blue-950/40 shadow-sm border-0 p-6">
                        <h2 className="font-grotesk text-2xl font-bold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <User className="w-7 h-7" variant="duotone" /> User Responsibilities
                        </h2>
                        <p className="font-manrope leading-relaxed text-gray-700 dark:text-gray-200">You are responsible for the content you post. Do not post illegal, harmful, or abusive content. Respect the privacy and dignity of others.</p>
                    </div>
                </section>
                <section className="mb-6">
                    <div className="rounded-none bg-purple-50 dark:bg-purple-950/40 shadow-sm border-0 p-6">
                        <h2 className="font-grotesk text-2xl font-bold mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                            <ListChecks className="w-7 h-7" variant="duotone" /> Content Guidelines
                        </h2>
                        <p className="font-manrope leading-relaxed text-gray-700 dark:text-gray-200">All posts must comply with our community guidelines. We reserve the right to remove content that violates these rules or is reported as inappropriate.</p>
                    </div>
                </section>
                <section className="mb-6">
                    <div className="rounded-none bg-gray-50 dark:bg-gray-900/60 shadow-sm border-0 p-6">
                        <h2 className="font-grotesk text-2xl font-bold mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                            <Lock className="w-7 h-7" variant="duotone" /> Privacy & Data Handling
                        </h2>
                        <p className="font-manrope leading-relaxed text-gray-700 dark:text-gray-200">We are committed to protecting your privacy. Please review our Privacy Policy for details on how your data is handled, stored, and protected.</p>
                    </div>
                </section>
                <section className="mb-6">
                    <div className="rounded-none bg-red-50 dark:bg-red-950/40 shadow-sm border-0 p-6">
                        <h2 className="font-grotesk text-2xl font-bold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                            <AlertTriangle className="w-7 h-7" variant="duotone" /> Disclaimer
                        </h2>
                        <div className="font-manrope leading-relaxed text-gray-700 dark:text-gray-200">
                            <p>This platform is provided as-is, without warranties of any kind. We are not liable for any damages arising from your use of the app.</p>
                            <div className="mt-4 p-4 rounded-none bg-red-100 dark:bg-red-900/60 border-l-4 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200 font-semibold">
                                <span className="block mb-1">⚠️ <b>Disclaimer:</b></span>
                                <span>Use the platform at your own risk. We do not guarantee uninterrupted or error-free service.</span>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="mb-6">
                    <div className="rounded-none bg-yellow-50 dark:bg-yellow-950/40 shadow-sm border-0 p-6">
                        <h2 className="font-grotesk text-2xl font-bold mb-2 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                            <History className="w-7 h-7" variant="duotone" /> Changes to Terms
                        </h2>
                        <p className="font-manrope leading-relaxed text-gray-700 dark:text-gray-200">We may update these Terms of Service from time to time. Continued use of the app constitutes acceptance of any changes.</p>
                    </div>
                </section>
            </main>
        </div>
    )
}
