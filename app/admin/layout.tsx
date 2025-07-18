import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Admin Dashboard - Rant",
    description: "Administrative dashboard for the Rant platform",
    robots: {
        index: false,
        follow: false,
    },
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background">
            {children}
        </div>
    )
}
