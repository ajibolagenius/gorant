import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"
import ClientLayout from "@/components/ClientLayout"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import { getHomePageMetadata } from "@/lib/seo/metadata"

export const generateMetadata = async (): Promise<Metadata> => {
    return getHomePageMetadata();
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#a259ff" />

                {/* PWA manifest and icons */}
                <link rel="manifest" href="/manifest.json" />
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#a259ff" />
            </head>
            <body>
                <TooltipProvider>
                    <ClientLayout>
                        {children}
                        <Analytics />
                        <SpeedInsights />
                        <Toaster position="top-right" richColors />
                    </ClientLayout>
                </TooltipProvider>
            </body>
        </html>
    )
}
