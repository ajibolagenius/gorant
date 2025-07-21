import { useState, useEffect } from 'react';
import { OgTemplateData, OgTemplateType } from '@/lib/seo/og-templates';
import { generateOgImageUrl } from '@/lib/seo/og-url-generator';
import { getLocalStorageCache } from '@/lib/seo/og-cache-store';

/**
 * Hook for generating and caching Open Graph image URLs
 *
 * @param type - The type of OG image to generate
 * @param data - The data to use for the image
 * @param options - Additional options
 * @returns The OG image URL and loading state
 */
export function useOgImage(
    type: OgTemplateType,
    data: Partial<OgTemplateData>,
    options: {
        cacheTime?: number; // Cache time in seconds
        baseUrl?: string; // Base URL for the API
    } = {}
) {
    const [url, setUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const cacheTime = options.cacheTime || 60 * 60 * 24; // 24 hours by default
    const baseUrl = options.baseUrl || '';

    useEffect(() => {
        let isMounted = true;

        const generateUrl = async () => {
            try {
                setIsLoading(true);

                // Generate a cache key
                const cacheKey = `${type}:${JSON.stringify(data)}`;

                // Try to get from cache first
                const cache = getLocalStorageCache();
                const cachedUrl = await cache.get(cacheKey);

                if (cachedUrl) {
                    // Use cached URL
                    if (isMounted) {
                        setUrl(cachedUrl);
                        setIsLoading(false);
                    }
                    return;
                }

                // Generate new URL
                const generatedUrl = generateOgImageUrl(type, data, baseUrl);

                // Cache the URL
                await cache.set(cacheKey, generatedUrl, cacheTime);

                if (isMounted) {
                    setUrl(generatedUrl);
                    setIsLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error(String(err)));
                    setIsLoading(false);
                }
            }
        };

        generateUrl();

        return () => {
            isMounted = false;
        };
    }, [type, JSON.stringify(data), cacheTime, baseUrl]);

    return { url, isLoading, error };
}

/**
 * Hook for generating and caching Open Graph image URLs for rants
 *
 * @param rantId - The ID of the rant
 * @param data - Additional data for the image
 * @param options - Additional options
 * @returns The OG image URL and loading state
 */
export function useRantOgImage(
    rantId: string,
    data: Partial<OgTemplateData>,
    options: {
        cacheTime?: number;
        baseUrl?: string;
    } = {}
) {
    return useOgImage(
        'rant',
        {
            ...data,
            title: data.title || `Rant #${rantId}`,
        },
        options
    );
}

/**
 * Hook for generating and caching Open Graph image URLs for profiles
 *
 * @param userId - The ID of the user
 * @param data - Additional data for the image
 * @param options - Additional options
 * @returns The OG image URL and loading state
 */
export function useProfileOgImage(
    userId: string,
    data: Partial<OgTemplateData>,
    options: {
        cacheTime?: number;
        baseUrl?: string;
    } = {}
) {
    return useOgImage(
        'profile',
        {
            ...data,
            title: data.title || `User Profile #${userId}`,
        },
        options
    );
}

/**
 * Hook for generating and caching Open Graph image URLs for challenges
 *
 * @param challengeId - The ID of the challenge
 * @param data - Additional data for the image
 * @param options - Additional options
 * @returns The OG image URL and loading state
 */
export function useChallengeOgImage(
    challengeId: string,
    data: Partial<OgTemplateData>,
    options: {
        cacheTime?: number;
        baseUrl?: string;
    } = {}
) {
    return useOgImage(
        'challenge',
        {
            ...data,
            title: data.title || `Challenge #${challengeId}`,
        },
        options
    );
}
