import { Metadata } from 'next';
import { OgTemplateData, OgTemplateType } from '@/lib/seo/og-templates';
import { generateOgImageUrl } from '@/lib/seo/og-url-generator';

/**
 * Generate Open Graph metadata for a page
 *
 * @param type - The type of OG image to generate
 * @param data - The data to use for the image
 * @param baseMetadata - Additional metadata to include
 * @returns Metadata object for Next.js
 */
export function generateOpenGraphMetadata(
    type: OgTemplateType,
    data: Partial<OgTemplateData>,
    baseMetadata: Partial<Metadata> = {}
): Metadata {
    // Generate OG image URL
    const ogImageUrl = generateOgImageUrl(type, data);

    // Default title and description
    const title = data.title || 'Rant - Express Yourself Anonymously';
    const description = data.description || 'Share your thoughts anonymously with the world';

    // Map OG template types to Open Graph types
    const ogTypeMap: Record<OgTemplateType, string> = {
        'default': 'website',
        'home': 'website',
        'rant': 'article',
        'challenge': 'article',
        'leaderboard': 'website',
        'profile': 'profile',
        'trending': 'website',
        'about': 'website',
        'roadmap': 'website',
    };

    // Get Open Graph type
    const ogType = ogTypeMap[type] || 'website';

    // Build metadata object
    return {
        // Base metadata
        title,
        description,

        // Open Graph metadata
        openGraph: {
            title,
            description,
            type: ogType,
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                }
            ],
            ...(data.author && { authors: [data.author] }),
            ...(data.date && { publishedTime: data.date }),
            ...(data.tags && { tags: data.tags }),
        },

        // Twitter metadata
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImageUrl],
            creator: '@rantplatform',
        },

        // Merge with base metadata
        ...baseMetadata,
    };
}

/**
 * Generate metadata for a rant page
 *
 * @param rantId - The ID of the rant
 * @param data - The rant data
 * @param baseMetadata - Additional metadata to include
 * @returns Metadata object for Next.js
 */
export function generateRantMetadata(
    rantId: string,
    data: Partial<OgTemplateData>,
    baseMetadata: Partial<Metadata> = {}
): Metadata {
    return generateOpenGraphMetadata(
        'rant',
        {
            ...data,
            title: data.title || `Rant #${rantId}`,
        },
        {
            ...baseMetadata,
            alternates: {
                canonical: `/rant/${rantId}`,
            },
        }
    );
}

/**
 * Generate metadata for a profile page
 *
 * @param userId - The ID of the user
 * @param data - The profile data
 * @param baseMetadata - Additional metadata to include
 * @returns Metadata object for Next.js
 */
export function generateProfileMetadata(
    userId: string,
    data: Partial<OgTemplateData>,
    baseMetadata: Partial<Metadata> = {}
): Metadata {
    return generateOpenGraphMetadata(
        'profile',
        {
            ...data,
            title: data.title || `User Profile #${userId}`,
        },
        {
            ...baseMetadata,
            alternates: {
                canonical: `/profile/${userId}`,
            },
        }
    );
}

/**
 * Generate metadata for a challenge page
 *
 * @param challengeId - The ID of the challenge
 * @param data - The challenge data
 * @param baseMetadata - Additional metadata to include
 * @returns Metadata object for Next.js
 */
export function generateChallengeMetadata(
    challengeId: string,
    data: Partial<OgTemplateData>,
    baseMetadata: Partial<Metadata> = {}
): Metadata {
    return generateOpenGraphMetadata(
        'challenge',
        {
            ...data,
            title: data.title || `Challenge #${challengeId}`,
        },
        {
            ...baseMetadata,
            alternates: {
                canonical: `/challenge/${challengeId}`,
            },
        }
    );
}

/**
 * Generate metadata for a static page
 *
 * @param pagePath - The path of the page
 * @param data - The page data
 * @param baseMetadata - Additional metadata to include
 * @returns Metadata object for Next.js
 */
export function generatePageMetadata(
    pagePath: string,
    data: Partial<OgTemplateData>,
    baseMetadata: Partial<Metadata> = {}
): Metadata {
    // Map page paths to template types
    const pageTypeMap: Record<string, OgTemplateType> = {
        '/': 'home',
        '/about': 'about',
        '/trending': 'trending',
        '/leaderboard': 'leaderboard',
        '/roadmap': 'roadmap',
        '/challenges': 'challenge',
    };

    // Get the template type based on the page path or default to 'default'
    const type = pageTypeMap[pagePath] || 'default';

    return generateOpenGraphMetadata(
        type,
        data,
        {
            ...baseMetadata,
            alternates: {
                canonical: pagePath,
            },
        }
    );
}
