import type React from "react"
import type { Metadata } from "next"
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: "Admin Dashboard - Rant",
    description: "Administrative dashboard for the Rant platform",
    robots: {
        index: false,
        follow: false,
    },
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Server-side admin check
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // Get the current session
    const { data: { session } } = await supabase.auth.getSession()

    // If no session, redirect to login
    if (!session) {
        redirect('/')
    }

    // Check if user has admin role
    const { data: { user } } = await supabase.auth.getUser()
    const isAdmin = user?.user_metadata?.is_admin === true

    // If not admin, redirect to home
    if (!isAdmin) {
        // For development, check if we should allow access based on localStorage
        // This should be removed in production
        if (process.env.NODE_ENV === 'development') {
            // We can't check localStorage on server, so we'll let the client-side check handle it
            // The useAdminProtection hook will redirect if needed
        } else {
            redirect('/')
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Admin navigation will be client-side rendered */}
            {children}
        </div>
    )
}
