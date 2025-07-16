import React from "react"
import { ShieldCheck, FileText, Users, Lock, EyeOff, Trash2, History, Info } from "lucide-react"
import Link from "next/link"

const navLinks = [
    { href: "/privacy", label: "Privacy Policy", icon: <ShieldCheck className="w-4 h-4 mr-2" /> },
    { href: "/terms-of-service", label: "Terms of Service", icon: <FileText className="w-4 h-4 mr-2" /> },
    { href: "/guidelines", label: "Community Guidelines", icon: <Users className="w-4 h-4 mr-2" /> },
]

export default function PrivacyPage() {
    return (
        <div className="container mx-auto w-full max-w-full px-4 mb-safe-bottom wrap-screen overflow-x-auto py-8">
            <main className="max-w-2xl mx-auto">
                {/* Navigation Tabs */}
                <nav className="flex justify-center mb-8">
                    <ul className="flex flex-wrap gap-2 bg-muted/60 dark:bg-muted/30 p-1 shadow-sm w-full max-w-xl rounded-none">
                        {navLinks.map(link => (
                            <li key={link.href} className="flex-1 min-w-[140px]">
                                <Link href={link.href} legacyBehavior>
                                    <a className={`flex items-center justify-center px-4 py-2 font-medium text-sm transition-colors w-full h-full rounded-none border-0 ${link.href === "/privacy" ? "bg-white dark:bg-gray-900 shadow text-purple-700 dark:text-purple-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{link.icon}{link.label}</a>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="mb-8">
                    <h1 className="font-grotesk text-4xl font-extrabold mb-2 flex items-center gap-3 tracking-tight text-purple-700 dark:text-purple-400">
                        <ShieldCheck className="w-9 h-9" /> Privacy Policy
                    </h1>
                    <p className="font-manrope text-lg text-gray-600 dark:text-gray-300 font-medium leading-relaxed">Your privacy is our top priority. Learn how we protect your data and ensure your anonymity.</p>
                </div>
                {/* Section Cards */}
                <section className="mb-6">
                    <div className="rounded-none bg-blue-50 dark:bg-blue-950/40 shadow-sm border-0 p-6">
                        <h2 className="font-grotesk text-2xl font-bold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <EyeOff className="w-7 h-7" /> Anonymous Posting
                        </h2>
                        <p className="font-manrope leading-relaxed text-gray-700 dark:text-gray-200">We do not require accounts or collect personal data. All rants and comments are posted anonymously, and no personally identifiable information is stored or associated with your activity.</p>
                    </div>
                </section>
                <section className="mb-6">
                    <div className="rounded-none bg-green-50 dark:bg-green-950/40 shadow-sm border-0 p-6">
                        <h2 className="font-grotesk text-2xl font-bold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                            <Lock className="w-7 h-7" /> Local Storage & Encryption
                        </h2>
                        <p className="font-manrope leading-relaxed text-gray-700 dark:text-gray-200">Your bookmarks and history are stored only in your browser and are encrypted using strong AES encryption. Only you can access this data, and you can delete it at any time from the settings page.</p>
                    </div>
                </section>
                <section className="mb-6">
                    <div className="rounded-none bg-gray-50 dark:bg-gray-900/60 shadow-sm border-0 p-6">
                        <h2 className="font-grotesk text-2xl font-bold mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                            <EyeOff className="w-7 h-7" /> No Tracking
                        </h2>
                        <p className="font-manrope leading-relaxed text-gray-700 dark:text-gray-200">We do not use third-party analytics, cookies, or tracking scripts. Your activity is never tracked, shared, or sold to anyone.</p>
                    </div>
                </section>
                <section className="mb-6">
                    <div className="rounded-none bg-red-50 dark:bg-red-950/40 shadow-sm border-0 p-6">
                        <h2 className="font-grotesk text-2xl font-bold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                            <Trash2 className="w-7 h-7" /> User Control
                        </h2>
                        <div className="font-manrope leading-relaxed text-gray-700 dark:text-gray-200">
                            <p>You have full control over your data. You can delete your bookmarks, history, and settings at any time via the settings page. Once deleted, your data is permanently removed and cannot be recovered.</p>
                            <div className="mt-4 p-4 rounded-none bg-red-100 dark:bg-red-900/60 border-l-4 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200 font-semibold">
                                <span className="block mb-1">⚠️ <b>Warning:</b></span>
                                <span>Deleted data cannot be recovered. Please be certain before deleting your data.</span>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="mb-6">
                    <div className="rounded-none bg-yellow-50 dark:bg-yellow-950/40 shadow-sm border-0 p-6">
                        <h2 className="font-grotesk text-2xl font-bold mb-2 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                            <History className="w-7 h-7" /> Data Retention
                        </h2>
                        <p className="font-manrope leading-relaxed text-gray-700 dark:text-gray-200">Rants and comments are kept unless you delete them locally. We never share or sell your data. All content is anonymous and cannot be linked back to you.</p>
                    </div>
                </section>
                <section className="mb-6">
                    <div className="rounded-none bg-purple-50 dark:bg-purple-950/40 shadow-sm border-0 p-6">
                        <h2 className="font-grotesk text-2xl font-bold mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                            <Info className="w-7 h-7" /> Transparency
                        </h2>
                        <p className="font-manrope leading-relaxed text-gray-700 dark:text-gray-200">We are committed to transparency. If you have questions about privacy or data handling, please contact us via the support link in the app.</p>
                    </div>
                </section>
            </main>
        </div>
    )
}
