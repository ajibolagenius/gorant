// This is a placeholder for actual authentication logic
// In a real implementation, this would check against a database or auth provider
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Checks if the current user has admin privileges
 * This is a placeholder implementation that will be replaced in task 14
 * with proper authentication checks
 */
export function isAdmin(): boolean {
    // For now, we'll use localStorage to simulate admin status
    // This will be replaced with proper auth in task 14
    if (typeof window === 'undefined') return false;

    try {
        return localStorage.getItem('user_is_admin') === 'true';
    } catch (err) {
        return false;
    }
}

/**
 * Sets the admin status for the current user (for development/testing only)
 * This will be removed in the actual implementation
 */
export function setAdminStatus(isAdmin: boolean): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem('user_is_admin', isAdmin ? 'true' : 'false');
        // Force reload to apply changes immediately
        window.location.reload();
    } catch (err) {
        console.error('Failed to set admin status:', err);
    }
}

/**
 * Redirects non-admin users away from admin pages
 * This is a client-side implementation that will be replaced with
 * server-side middleware in task 14
 */
export function useAdminProtection(router: ReturnType<typeof useRouter>): boolean {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        // Check admin status
        const adminStatus = isAdmin();
        setIsAuthorized(adminStatus);

        // Redirect if not admin
        if (!adminStatus) {
            router.push('/');
        }
    }, [router]);

    return !!isAuthorized;
}
