import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"
import ClientLayout from "@/components/ClientLayout"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import { getDefaultMetadata } from "@/lib/seo/metadata"

export const generateMetadata = async (): Promise<Metadata> => {
    return getDefaultMetadata();
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
            <body>
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
