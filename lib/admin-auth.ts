import { supabase } from './supabaseClient';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Checks if the current user has admin privileges
 * This implementation checks the user's metadata for an admin role
 */
export async function isAdmin(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return false;

        // Check if user has admin role in user metadata
        const { data: user } = await supabase.auth.getUser();

        if (!user) return false;

        // Check for admin role in user metadata
        const isAdminUser = user.user?.user_metadata?.is_admin === true;

        return isAdminUser;
    } catch (err) {
        console.error('Error checking admin status:', err);
        return false;
    }
}

/**
 * For development/testing only - sets admin status in local storage
 * This should be removed in production
 */
export function setAdminStatus(isAdmin: boolean): void {
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') return;

    try {
        localStorage.setItem('user_is_admin', isAdmin ? 'true' : 'false');
        console.warn('DEV MODE: Admin status set via localStorage. This should not be used in production.');
    } catch (err) {
        console.error('Failed to set admin status:', err);
    }
}

/**
 * Hook to protect admin routes
 * Redirects non-admin users away from admin pages
 */
export function useAdminProtection(router: ReturnType<typeof useRouter>): boolean {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            setIsLoading(true);

            // First check if we're in development mode with localStorage override
            if (process.env.NODE_ENV === 'development') {
                try {
                    const devAdminStatus = localStorage.getItem('user_is_admin') === 'true';
                    if (devAdminStatus) {
                        setIsAuthorized(true);
                        setIsLoading(false);
                        return;
                    }
                } catch (err) {
                    // Ignore localStorage errors
                }
            }

            // Check actual admin status
            const adminStatus = await isAdmin();
            setIsAuthorized(adminStatus);

            // Redirect if not admin
            if (!adminStatus) {
                router.push('/');
            }

            setIsLoading(false);
        };

        checkAdminStatus();
    }, [router]);

    return isLoading ? false : !!isAuthorized;
}
