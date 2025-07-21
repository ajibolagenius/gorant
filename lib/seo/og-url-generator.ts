import { OgTemplateData, OgTemplateType } from '@/lib/seo/og-templates';

/**
 * Generate a URL for an Open Graph image
 *
 * @param type - The type of OG image to generate
 * @param data - The data to use for the image
 * @param baseUrl - The base URL for the API (defaults to the current origin)
 * @returns A URL string for the OG image
 */
export const generateOgImageUrl = (
    type: OgTemplateType,
    data: Partial<OgTemplateData>,
    baseUrl?: string
): string => {
    // Use provided base URL or default to environment variable or fallback
    const apiBase = baseUrl ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        (typeof window !== 'undefined' ? window.location.origin : '');

    // Create URL object
    const url = new URL(`${apiBase}/api/og`);

    // Add type parameter
    url.searchParams.append('type', type);

    // Add data parameters if they exist
    if (data.title) url.searchParams.append('title', data.title);
    if (data.description) url.searchParams.append('description', data.description);
    if (data.author) url.searchParams.append('author', data.author);
    if (data.date) url.searchParams.append('date', data.date);
    if (data.imageUrl) url.searchParams.append('imageUrl', data.imageUrl);
    if (data.mood) url.searchParams.append('mood', data.mood);

    // Handle tags array
    if (data.tags && data.tags.length > 0) {
        url.searchParams.append('tags', data.tags.join(','));
    }

    return url.toString();
};

/**
 * Generate a URL for a rant Open Graph image
 *
 * @param rantId - The ID of the rant
 * @param data - Additional data for the image
 * @param baseUrl - The base URL for the API
 * @returns A URL string for the rant OG image
 */
export const generateRantOgUrl = (
    rantId: string,
    data: Partial<OgTemplateData>,
    baseUrl?: string
): string => {
    return generateOgImageUrl(
        'rant',
        {
            ...data,
            // Add rant ID as a parameter
            title: data.title || `Rant #${rantId}`,
        },
        baseUrl
    ) + `&id=${encodeURIComponent(rantId)}`;
};

/**
 * Generate a URL for a profile Open Graph image
 *
 * @param userId - The ID of the user
 * @param data - Additional data for the image
 * @param baseUrl - The base URL for the API
 * @returns A URL string for the profile OG image
 */
export const generateProfileOgUrl = (
    userId: string,
    data: Partial<OgTemplateData>,
    baseUrl?: string
): string => {
    return generateOgImageUrl(
        'profile',
        {
            ...data,
            // Add user ID as a parameter
            title: data.title || `User Profile #${userId}`,
        },
        baseUrl
    ) + `&id=${encodeURIComponent(userId)}`;
};

/**
 * Generate a URL for a challenge Open Graph image
 *
 * @param challengeId - The ID of the challenge
 * @param data - Additional data for the image
 * @param baseUrl - The base URL for the API
 * @returns A URL string for the challenge OG image
 */
export const generateChallengeOgUrl = (
    challengeId: string,
    data: Partial<OgTemplateData>,
    baseUrl?: string
): string => {
    return generateOgImageUrl(
        'challenge',
        {
            ...data,
            // Add challenge ID as a parameter
            title: data.title || `Challenge #${challengeId}`,
        },
        baseUrl
    ) + `&id=${encodeURIComponent(challengeId)}`;
};

/**
 * Generate a URL for a page-specific Open Graph image
 *
 * @param pagePath - The path of the page (e.g., '/about', '/trending')
 * @param data - Additional data for the image
 * @param baseUrl - The base URL for the API
 * @returns A URL string for the page OG image
 */
export const generatePageOgUrl = (
    pagePath: string,
    data: Partial<OgTemplateData>,
    baseUrl?: string
): string => {
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

    return generateOgImageUrl(type, data, baseUrl);
};
