import React from "react"
import { Users, ShieldCheck, FileText, Handshake, ShieldCheck as ShieldCheck2, AlertTriangle, Eye, ThumbsUp } from "lucide-react"
import Link from "next/link"

const navLinks = [
    { href: "/privacy", label: "Privacy Policy", icon: <ShieldCheck className="w-4 h-4 mr-2" /> },
    { href: "/terms-of-service", label: "Terms of Service", icon: <FileText className="w-4 h-4 mr-2" /> },
    { href: "/guidelines", label: "Community Guidelines", icon: <Users className="w-4 h-4 mr-2" /> },
]

export default function GuidelinesPage() {
    return (
        <div className="container mx-auto w-full max-w-full px-4 mb-safe-bottom wrap-screen overflow-x-auto py-8">
            <main className="max-w-2xl mx-auto">
                {/* Navigation Tabs */}
                <nav className="flex justify-center mb-8">
                    <ul className="flex flex-wrap gap-2 bg-muted/60 dark:bg-muted/30 p-1 shadow-sm w-full max-w-xl rounded-none">
                        {navLinks.map(link => (
                            <li key={link.href} className="flex-1 min-w-[140px]">
                                <Link href={link.href} legacyBehavior>
                                    <a className={`flex items-center justify-center px-4 py-2 font-medium text-sm transition-colors w-full h-full rounded-none border-0 ${link.href === "/guidelines" ? "bg-white dark:bg-gray-900 shadow text-purple-700 dark:text-purple-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{link.icon}{link.label}</a>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="mb-8">
                    <h1 className="font-grotesk text-4xl font-extrabold mb-2 flex items-center gap-3 tracking-tight text-purple-700 dark:text-purple-400">
                        <Users className="w-9 h-9" /> Community Guidelines
                    </h1>
                    <p className="font-manrope text-lg text-gray-600 dark:text-gray-300 font-medium leading-relaxed">Help us keep the community safe, positive, and welcoming for everyone. Please follow these guidelines.</p>
                </div>
                {/* Section Cards */}
                <section className="mb-6">
                    <div className="rounded-none bg-green-50 dark:bg-green-950/40 shadow-sm border-0 p-6">
                        <h2 className="font-grotesk text-2xl font-bold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                            <Handshake className="w-7 h-7" /> Be Respectful
                        </h2>
                        <p className="font-manrope leading-relaxed text-gray-700 dark:text-gray-200">Treat all users with kindness and respect. Harassment, hate speech, or abusive behavior will not be tolerated.</p>
                    </div>
                </section>
                <section className="mb-6">
                    <div className="rounded-none bg-red-50 dark:bg-red-950/40 shadow-sm border-0 p-6">
                        <h2 className="font-grotesk text-2xl font-bold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                            <AlertTriangle className="w-7 h-7" /> No Harmful Content
                        </h2>
                        <div className="font-manrope leading-relaxed text-gray-700 dark:text-gray-200">
                            <p>Do not post content that is illegal, violent, threatening, or promotes self-harm. We are committed to maintaining a safe and supportive environment.</p>
                            <div className="mt-4 p-4 rounded-none bg-red-100 dark:bg-red-900/60 border-l-4 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200 font-semibold">
                                <span className="block mb-1">🚫 <b>Important:</b></span>
                                <span>Content that is harmful or abusive will be removed and may result in a ban.</span>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="mb-6">
                    <div className="rounded-none bg-blue-50 dark:bg-blue-950/40 shadow-sm border-0 p-6">
                        <h2 className="font-grotesk text-2xl font-bold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <ShieldCheck2 className="w-7 h-7" /> Protect Privacy
                        </h2>
                        <p className="font-manrope leading-relaxed text-gray-700 dark:text-gray-200">Do not share personal information—yours or others'. All posts are anonymous, and privacy is a core value of this platform.</p>
                    </div>
                </section>
                <section className="mb-6">
                    <div className="rounded-none bg-purple-50 dark:bg-purple-950/40 shadow-sm border-0 p-6">
                        <h2 className="font-grotesk text-2xl font-bold mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                            <Eye className="w-7 h-7" /> Reporting
                        </h2>
                        <p className="font-manrope leading-relaxed text-gray-700 dark:text-gray-200">If you see content that violates these guidelines, please use the report feature. Our team will review and take appropriate action.</p>
                    </div>
                </section>
                <section className="mb-6">
                    <div className="rounded-none bg-yellow-50 dark:bg-yellow-950/40 shadow-sm border-0 p-6">
                        <h2 className="font-grotesk text-2xl font-bold mb-2 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                            <ThumbsUp className="w-7 h-7" /> Best Practices
                        </h2>
                        <p className="font-manrope leading-relaxed text-gray-700 dark:text-gray-200">Support others, use respectful language, and help foster a positive community. For more on privacy and safety, see our Privacy Policy and Terms of Service.</p>
                    </div>
                </section>
            </main>
        </div>
    )
}
