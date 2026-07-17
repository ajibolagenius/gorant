import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Toaster } from "sonner"
import ClientLayout from "@/components/ClientLayout"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { getHomePageMetadata, getViewport } from "@/lib/seo/metadata"

export const generateMetadata = async (): Promise<Metadata> => {
    return getHomePageMetadata();
};

export const viewport: Viewport = getViewport();

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" dir="ltr">
            <head>
                {/* viewport, theme-color and color-scheme are provided by the `viewport` export */}
                <meta name="msapplication-TileColor" content="#a259ff" />
                <link rel="alternate" type="application/rss+xml" title="Rant — Latest Rants" href="/rss.xml" />
            </head>
            <body>
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                    Skip to main content
                </a>
                <TooltipProvider>
                    <ClientLayout>
                        <main id="main-content">
                            {children}
                        </main>
                        <Analytics /> <SpeedInsights />
                        <Toaster
                            position="top-right"
                            richColors
                            closeButton
                            aria-live="polite"
                            aria-atomic="true"
                        />
                    </ClientLayout>
                </TooltipProvider>
            </body>
        </html>
    )
}
