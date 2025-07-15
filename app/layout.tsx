import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import ClientLayout from "@/components/ClientLayout"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Rant - Anonymous Expression Platform",
    description: "A safe, anonymous space to express your thoughts and feelings.",
    generator: 'v0.dev',
    keywords: [
        "anonymous",
        "mental health",
        "venting",
        "community",
        "support",
        "rant",
        "expression",
        "safe space",
        "social platform"
    ],
    authors: [{ name: "Rant Team", url: "https://gorant.live" }],
    openGraph: {
        title: "Rant - Anonymous Expression Platform",
        description: "A safe, anonymous space to express your thoughts and feelings. Join the community and share your story anonymously.",
        url: "https://gorant.live",
        siteName: "Rant",
        images: [
            {
                url: "/app_screenshot.png",
                width: 1200,
                height: 630,
                alt: "Rant - Anonymous Expression Platform"
            }
        ],
        locale: "en_US",
        type: "website"
    },
    twitter: {
        card: "summary_large_image",
        title: "Rant - Anonymous Expression Platform",
        description: "A safe, anonymous space to express your thoughts and feelings. Join the community and share your story anonymously.",
        images: ["/app_screenshot.png"],
        creator: "@rantapp"
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                {/*  */}
            </head>
            <body className={inter.className}>
                <TooltipProvider>
                    <ClientLayout>
                        {children}
                        <Analytics /> <SpeedInsights />
                        <Toaster position="top-right" richColors />
                    </ClientLayout>
                </TooltipProvider>
            </body>
        </html>
    )
}
