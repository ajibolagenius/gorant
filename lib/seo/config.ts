import { SeoSettings } from '@/types/seo';

/**
 * Default SEO configuration
 * These values are used as fallbacks when no specific metadata is provided
 */
export const defaultSeoConfig: SeoSettings = {
    // Basic metadata
    defaultTitle: 'Rant - Express Yourself Anonymously',
    defaultDescription: 'Rant is an anonymous social platform where users can express thoughts, frustrations, and emotions in a safe, supportive environment.',
    defaultKeywords: ['rant', 'anonymous', 'social platform', 'express yourself', 'community', 'emotions', 'thoughts'],

    // Site information
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://gorant.live',
    siteName: 'Rant',

    // Social media
    twitterHandle: '@gorant',
    twitterCardType: 'summary_large_image',
    facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,

    // Locale and language
    locale: 'en_US',
    alternateLocales: ['en_GB'],

    // Appearance
    themeColor: '#6366f1', // Indigo color from the app's theme
    backgroundColor: '#18181b', // Dark background color

    // Robots and indexing
    robotsPolicy: {
        index: true,
        follow: true,
        nocache: false,
        noarchive: false,
        noimageindex: false,
        nosnippet: false,
        maxImagePreview: 'large',
    },

    // Organization information
    organization: {
        name: 'Rant Platform',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://gorant.live',
        logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gorant.live'}/logo.svg`,
        sameAs: [
            'https://twitter.com/gorant',
            'https://github.com/ajibolagenius/gorant',
        ],
    },
};

/**
 * Environment-specific SEO configuration
 * Overrides default values based on the current environment
 */
export const getEnvironmentSeoConfig = (): SeoSettings => {
    // Development environment
    if (process.env.NODE_ENV === 'development') {
        return {
            ...defaultSeoConfig,
            robotsPolicy: {
                ...defaultSeoConfig.robotsPolicy,
                index: false, // Don't index development environment
                follow: false,
            },
            siteUrl: 'http://localhost:3000',
        };
    }

    // Staging/preview environment
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
        return {
            ...defaultSeoConfig,
            robotsPolicy: {
                ...defaultSeoConfig.robotsPolicy,
                index: false, // Don't index staging/preview environments
                follow: false,
            },
            siteUrl: process.env.NEXT_PUBLIC_SITE_URL || defaultSeoConfig.siteUrl,
        };
    }

    // Production environment (default)
    return defaultSeoConfig;
};

/**
 * Get the current SEO configuration
 * This is the main export that should be used throughout the application
 */
export const getSeoConfig = (): SeoSettings => {
    return getEnvironmentSeoConfig();
};

/**
 * Generate robots meta tag content based on the robots policy
 */
export const getRobotsMetaContent = (policy = getSeoConfig().robotsPolicy): string => {
    if (!policy) return '';

    const directives: string[] = [];

    // Add index/noindex
    directives.push(policy.index ? 'index' : 'noindex');

    // Add follow/nofollow
    directives.push(policy.follow ? 'follow' : 'nofollow');

    // Add optional directives
    if (policy.nocache) directives.push('nocache');
    if (policy.noarchive) directives.push('noarchive');
    if (policy.noimageindex) directives.push('noimageindex');
    if (policy.nosnippet) directives.push('nosnippet');

    // Add max directives
    if (policy.maxSnippet !== undefined) directives.push(`max-snippet:${policy.maxSnippet}`);
    if (policy.maxImagePreview) directives.push(`max-image-preview:${policy.maxImagePreview}`);
    if (policy.maxVideoPreview !== undefined) directives.push(`max-video-preview:${policy.maxVideoPreview}`);

    return directives.join(', ');
};

/**
 * Generate canonical URL for a given path
 */
export const getCanonicalUrl = (path: string): string => {
    const config = getSeoConfig();
    const baseUrl = config.siteUrl.replace(/\/$/, ''); // Remove trailing slash if present
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${normalizedPath}`;
};

/**
 * Generate absolute URL for a given path
 */
export const getAbsoluteUrl = (path: string): string => {
    return getCanonicalUrl(path);
};

/**
 * Generate Open Graph image URL
 */
export const getOgImageUrl = (params: Record<string, string>): string => {
    const config = getSeoConfig();
    const baseUrl = config.siteUrl.replace(/\/$/, '');
    const searchParams = new URLSearchParams(params);

    return `${baseUrl}/api/og?${searchParams.toString()}`;
};
