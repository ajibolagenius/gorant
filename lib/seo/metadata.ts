import { Metadata } from 'next';
import { getSeoConfig, getCanonicalUrl, getRobotsMetaContent, getOgImageUrl } from './config';
import { PageMetadata } from '@/types/seo';

/**
 * Generate default metadata for the application
 * Used as the base metadata for all pages
 */
export const getDefaultMetadata = (): Metadata => {
    const config = getSeoConfig();

    return {
        title: {
            default: config.defaultTitle,
            template: `%s | ${config.siteName}`,
        },
        description: config.defaultDescription,
        keywords: config.defaultKeywords,
        authors: [
            { name: config.organization?.name || config.siteName }
        ],
        creator: config.organization?.name || config.siteName,
        publisher: config.organization?.name || config.siteName,
        formatDetection: {
            telephone: false,
            email: false,
            address: false,
        },
        metadataBase: new URL(config.siteUrl),
        alternates: {
            canonical: '/',
            languages: config.alternateLocales?.reduce((acc, locale) => {
                acc[locale] = `/${locale}`;
                return acc;
            }, {} as Record<string, string>) || {},
        },
        openGraph: {
            type: 'website',
            siteName: config.siteName,
            title: config.defaultTitle,
            description: config.defaultDescription,
            url: config.siteUrl,
            images: [
                {
                    url: getOgImageUrl({ type: 'default' }),
                    width: 1200,
                    height: 630,
                    alt: config.defaultTitle,
                },
            ],
        },
        twitter: {
            card: config.twitterCardType,
            site: config.twitterHandle,
            creator: config.twitterHandle,
            title: config.defaultTitle,
            description: config.defaultDescription,
            images: getOgImageUrl({ type: 'default' }),
        },
        robots: getRobotsMetaContent(),
        themeColor: config.themeColor,
        manifest: '/manifest.json',
        icons: {
            icon: [
                { url: '/favicon.ico' },
                { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
                { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            ],
            apple: [
                { url: '/apple-touch-icon.png' },
            ],
            other: [
                {
                    rel: 'mask-icon',
                    url: '/safari-pinned-tab.svg',
                    color: config.themeColor,
                },
            ],
        },
        viewport: {
            width: 'device-width',
            initialScale: 1,
            maximumScale: 1,
            userScalable: false,
        },
        verification: {
            google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
            yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
            yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
            other: {
                me: [config.twitterHandle],
            },
        },
        category: 'social',
    };
};

/**
 * Page types supported by the metadata provider
 */
export type PageType =
    | 'home'
    | 'rant'
    | 'challenge'
    | 'leaderboard'
    | 'profile'
    | 'trending'
    | 'bookmarks'
    | 'settings'
    | 'notifications'
    | 'about'
    | 'privacy'
    | 'terms'
    | 'roadmap'
    | 'guidelines'
    | 'admin';

/**
 * Generate page-specific metadata
 * Merges page-specific metadata with default metadata
 */
export const getPageMetadata = (
    pageType: PageType,
    data?: any
): Metadata => {
    const config = getSeoConfig();
    const defaultMetadata = getDefaultMetadata();
    let pageMetadata: PageMetadata;

    // Generate page-specific metadata based on page type
    switch (pageType) {
        case 'home':
            pageMetadata = {
                title: config.defaultTitle,
                description: config.defaultDescription,
                ogType: 'website',
            };
            break;

        case 'rant':
            if (!data) {
                throw new Error('Data is required for rant page metadata');
            }

            const rantTitle = data.title || `${data.mood || 'Anonymous'} Rant`;
            const rantDescription = data.content
                ? data.content.substring(0, 160).replace(/\s+/g, ' ').trim() + (data.content.length > 160 ? '...' : '')
                : config.defaultDescription;

            pageMetadata = {
                title: rantTitle,
                description: rantDescription,
                ogType: 'article',
                publishedTime: data.createdAt,
                modifiedTime: data.updatedAt,
                authors: data.authorName ? [data.authorName] : undefined,
                tags: data.tags || [],
                ogImage: getOgImageUrl({
                    type: 'rant',
                    id: data.id,
                    title: encodeURIComponent(rantTitle),
                    mood: data.mood || 'neutral'
                }),
            };
            break;

        case 'challenge':
            if (!data) {
                throw new Error('Data is required for challenge page metadata');
            }

            pageMetadata = {
                title: `${data.title || 'Challenge'} | Rant Challenges`,
                description: data.description || 'Take part in our community challenges and earn rewards!',
                ogType: 'article',
                ogImage: getOgImageUrl({
                    type: 'challenge',
                    id: data.id,
                    title: encodeURIComponent(data.title || 'Challenge')
                }),
            };
            break;

        case 'leaderboard':
            pageMetadata = {
                title: 'Leaderboard | Top Contributors',
                description: 'See who\'s leading the pack in our community. Check out the top contributors and most active users.',
                ogType: 'website',
                ogImage: getOgImageUrl({ type: 'leaderboard' }),
            };
            break;

        case 'profile':
            if (!data) {
                throw new Error('Data is required for profile page metadata');
            }

            pageMetadata = {
                title: `${data.displayName || 'Anonymous User'}'s Profile`,
                description: data.bio || `Check out ${data.displayName || 'this user'}'s profile and activity on Rant.`,
                ogType: 'profile',
                ogImage: getOgImageUrl({
                    type: 'profile',
                    id: data.id,
                    name: encodeURIComponent(data.displayName || 'Anonymous User')
                }),
            };
            break;

        case 'trending':
            pageMetadata = {
                title: 'Trending Rants | What\'s Hot Right Now',
                description: 'Discover the most popular trending rants on the platform right now.',
                ogType: 'website',
                ogImage: getOgImageUrl({ type: 'trending' }),
            };
            break;

        case 'bookmarks':
            pageMetadata = {
                title: 'Your Bookmarks | Saved Rants',
                description: 'View all the rants you\'ve saved for later.',
                ogType: 'website',
                noindex: true, // Don't index personal bookmark pages
            };
            break;

        case 'settings':
            pageMetadata = {
                title: 'Account Settings',
                description: 'Manage your account settings, preferences, and privacy options.',
                ogType: 'website',
                noindex: true, // Don't index personal settings pages
            };
            break;

        case 'notifications':
            pageMetadata = {
                title: 'Your Notifications',
                description: 'View your latest notifications and activity updates.',
                ogType: 'website',
                noindex: true, // Don't index personal notification pages
            };
            break;

        case 'about':
            pageMetadata = {
                title: 'About Rant',
                description: 'Learn about Rant - the anonymous expression platform designed for sharing thoughts and connecting with others in a safe environment.',
                ogType: 'website',
                ogImage: getOgImageUrl({ type: 'about' }),
            };
            break;

        case 'privacy':
            pageMetadata = {
                title: 'Privacy Policy',
                description: 'Our privacy policy explains how we collect, use, and protect your information when you use the Rant platform.',
                ogType: 'website',
            };
            break;

        case 'terms':
            pageMetadata = {
                title: 'Terms of Service',
                description: 'Our terms of service outline the rules and guidelines for using the Rant platform.',
                ogType: 'website',
            };
            break;

        case 'roadmap':
            pageMetadata = {
                title: 'Product Roadmap',
                description: 'See what features and improvements are coming to Rant in the future.',
                ogType: 'website',
                ogImage: getOgImageUrl({ type: 'roadmap' }),
            };
            break;

        case 'guidelines':
            pageMetadata = {
                title: 'Community Guidelines',
                description: 'Our community guidelines help ensure Rant remains a safe and supportive environment for everyone.',
                ogType: 'website',
            };
            break;

        case 'admin':
            pageMetadata = {
                title: 'Admin Dashboard',
                description: 'Rant platform administration and management.',
                ogType: 'website',
                noindex: true, // Don't index admin pages
                nofollow: true,
            };
            break;

        default:
            pageMetadata = {
                title: config.defaultTitle,
                description: config.defaultDescription,
            };
    }

    // Generate canonical URL if not provided
    if (!pageMetadata.canonical && data?.slug) {
        pageMetadata.canonical = getCanonicalUrl(`/${pageType}/${data.slug}`);
    }

    // Merge with default metadata
    return {
        ...defaultMetadata,
        title: pageMetadata.title,
        description: pageMetadata.description,
        keywords: pageMetadata.keywords || defaultMetadata.keywords,
        openGraph: {
            ...defaultMetadata.openGraph,
            title: pageMetadata.title,
            description: pageMetadata.description,
            type: pageMetadata.ogType || 'website',
            images: pageMetadata.ogImage ? [
                {
                    url: pageMetadata.ogImage,
                    width: 1200,
                    height: 630,
                    alt: pageMetadata.title,
                }
            ] : defaultMetadata.openGraph?.images,
            publishedTime: pageMetadata.publishedTime,
            modifiedTime: pageMetadata.modifiedTime,
            authors: pageMetadata.authors,
            tags: pageMetadata.tags,
            section: pageMetadata.section,
        },
        twitter: {
            ...defaultMetadata.twitter,
            title: pageMetadata.title,
            description: pageMetadata.description,
            card: pageMetadata.twitterCard || config.twitterCardType,
            images: pageMetadata.ogImage || defaultMetadata.twitter?.images,
        },
        alternates: {
            ...defaultMetadata.alternates,
            canonical: pageMetadata.canonical,
            languages: pageMetadata.alternates || defaultMetadata.alternates?.languages,
        },
        robots: pageMetadata.noindex
            ? `noindex, ${pageMetadata.nofollow ? 'nofollow' : 'follow'}`
            : getRobotsMetaContent(),
    };
};

/**
 * Validate metadata against SEO best practices
 * Returns an array of validation errors or an empty array if valid
 */
export const validateMetadata = (metadata: PageMetadata): string[] => {
    const errors: string[] = [];

    // Title validation
    if (!metadata.title) {
        errors.push('Title is required');
    } else if (metadata.title.length > 60) {
        errors.push('Title should be 60 characters or less');
    } else if (metadata.title.length < 10) {
        errors.push('Title should be at least 10 characters');
    }

    // Description validation
    if (!metadata.description) {
        errors.push('Description is required');
    } else if (metadata.description.length > 160) {
        errors.push('Description should be 160 characters or less');
    } else if (metadata.description.length < 50) {
        errors.push('Description should be at least 50 characters');
    }

    // Keywords validation
    if (metadata.keywords && metadata.keywords.length > 10) {
        errors.push('Too many keywords (maximum 10)');
    }

    return errors;
};

/**
 * Get fallback metadata for when page-specific metadata is not available
 * This ensures we always have valid metadata even if there's an error
 */
export const getFallbackMetadata = (): Metadata => {
    const config = getSeoConfig();

    return {
        title: config.defaultTitle,
        description: config.defaultDescription,
        openGraph: {
            title: config.defaultTitle,
            description: config.defaultDescription,
            type: 'website',
            siteName: config.siteName,
            images: [
                {
                    url: getOgImageUrl({ type: 'default' }),
                    width: 1200,
                    height: 630,
                    alt: config.defaultTitle,
                }
            ],
        },
        twitter: {
            card: config.twitterCardType,
            title: config.defaultTitle,
            description: config.defaultDescription,
            images: getOgImageUrl({ type: 'default' }),
        },
    };
};

/**
 * Create social sharing metadata for a specific page
 * This is useful for generating metadata specifically for social sharing
 */
export const getSocialSharingMetadata = (
    title: string,
    description: string,
    imageUrl?: string,
    url?: string,
    type: 'website' | 'article' | 'profile' = 'website',
    twitterCard: 'summary' | 'summary_large_image' | 'app' | 'player' = 'summary_large_image'
): { openGraph: any, twitter: any } => {
    const config = getSeoConfig();
    const baseUrl = config.siteUrl.replace(/\/$/, '');
    const fullUrl = url ? (url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`) : baseUrl;
    const image = imageUrl || getOgImageUrl({ type: 'default' });

    return {
        openGraph: {
            title,
            description,
            type,
            url: fullUrl,
            siteName: config.siteName,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title,
                }
            ],
        },
        twitter: {
            card: twitterCard,
            site: config.twitterHandle,
            creator: config.twitterHandle,
            title,
            description,
            images: image,
        },
    };
};

/**
 * Extract metadata from content
 * Useful for automatically generating metadata from user-generated content
 */
export const extractMetadataFromContent = (
    content: string,
    maxTitleLength = 60,
    maxDescriptionLength = 160
): { title: string, description: string, keywords: string[] } => {
    // Clean up content
    const cleanContent = content.replace(/\s+/g, ' ').trim();

    // Extract title (first sentence or first X characters)
    let title = '';
    const firstSentenceMatch = cleanContent.match(/^[^.!?]+[.!?]/);
    if (firstSentenceMatch && firstSentenceMatch[0].length <= maxTitleLength) {
        title = firstSentenceMatch[0].trim();
    } else {
        title = cleanContent.substring(0, maxTitleLength).trim();
        // Don't cut words in half
        if (cleanContent.length > maxTitleLength) {
            const lastSpaceIndex = title.lastIndexOf(' ');
            if (lastSpaceIndex > 0) {
                title = title.substring(0, lastSpaceIndex);
            }
        }
    }

    // Extract description (first paragraph or first X characters)
    let description = '';
    const firstParagraphMatch = cleanContent.match(/^[^\n\r]+([\n\r]+|$)/);
    if (firstParagraphMatch && firstParagraphMatch[0].length <= maxDescriptionLength) {
        description = firstParagraphMatch[0].trim();
    } else {
        description = cleanContent.substring(0, maxDescriptionLength).trim();
        // Don't cut words in half
        if (cleanContent.length > maxDescriptionLength) {
            const lastSpaceIndex = description.lastIndexOf(' ');
            if (lastSpaceIndex > 0) {
                description = description.substring(0, lastSpaceIndex) + '...';
            }
        }
    }

    // Extract potential keywords (most frequent meaningful words)
    const words = cleanContent.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3) // Only words longer than 3 chars
        .filter(word => !['this', 'that', 'with', 'from', 'have', 'were', 'they', 'will', 'would', 'could', 'should', 'about'].includes(word));

    // Count word frequency
    const wordFrequency: Record<string, number> = {};
    words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    // Get top keywords
    const keywords = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word);

    return {
        title: title.endsWith('.') || title.endsWith('!') || title.endsWith('?') ? title : `${title}...`,
        description: description.endsWith('.') ? description : `${description}...`,
        keywords,
    };
};
