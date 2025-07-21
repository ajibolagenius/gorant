/**
 * SEO settings and configuration types
 */

/**
 * Core SEO settings interface
 * Contains all configurable SEO properties for the application
 */
export interface SeoSettings {
    // Basic metadata
    defaultTitle: string;
    defaultDescription: string;
    defaultKeywords: string[];

    // Site information
    siteUrl: string;
    siteName: string;

    // Social media
    twitterHandle: string;
    twitterCardType: 'summary' | 'summary_large_image' | 'app' | 'player';
    facebookAppId?: string;

    // Locale and language
    locale: string;
    alternateLocales?: string[];

    // Appearance
    themeColor: string;
    backgroundColor: string;

    // Robots and indexing
    robotsPolicy?: RobotsPolicy;

    // Organization information
    organization?: OrganizationInfo;
}

/**
 * Robots policy configuration
 */
export interface RobotsPolicy {
    index: boolean;
    follow: boolean;
    nocache?: boolean;
    noarchive?: boolean;
    noimageindex?: boolean;
    nosnippet?: boolean;
    maxSnippet?: number;
    maxImagePreview?: 'none' | 'standard' | 'large';
    maxVideoPreview?: number;
}

/**
 * Organization information for structured data
 */
export interface OrganizationInfo {
    name: string;
    url: string;
    logo: string;
    sameAs?: string[];
}

/**
 * Page-specific metadata interface
 */
export interface PageMetadata {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
    ogType?: 'website' | 'article' | 'profile' | 'book' | 'music' | 'video';
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    canonical?: string;
    noindex?: boolean;
    nofollow?: boolean;
    alternates?: Record<string, string>;
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    section?: string;
    tags?: string[];
}

/**
 * Open Graph image template data
 */
export interface OgTemplateData {
    title: string;
    description?: string;
    author?: string;
    date?: string;
    imageUrl?: string;
    tags?: string[];
    mood?: string;
}

/**
 * Sitemap entry configuration
 */
export interface SitemapEntry {
    url: string;
    lastModified: Date;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
}

/**
 * RSS feed item configuration
 */
export interface RssFeedItem {
    title: string;
    description: string;
    url: string;
    guid: string;
    date: Date;
    author?: string;
    categories?: string[];
    enclosure?: {
        url: string;
        type: string;
        length: number;
    };
}
