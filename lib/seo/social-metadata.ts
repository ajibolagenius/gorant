import { Metadata } from 'next';
import { getSeoConfig, getOgImageUrl } from './config';
import { PageMetadata } from '@/types/seo';

/**
 * Generate Open Graph metadata for different content types
 */
export const getOpenGraphMetadata = (
    pageMetadata: PageMetadata,
    url?: string
): Metadata['openGraph'] => {
    const config = getSeoConfig();
    const baseUrl = config.siteUrl.replace(/\/$/, '');
    const fullUrl = url ? (url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`) : baseUrl;

    const openGraph: Metadata['openGraph'] = {
        type: pageMetadata.ogType || 'website',
        title: pageMetadata.title,
        description: pageMetadata.description,
        siteName: config.siteName,
        url: fullUrl,
        images: pageMetadata.ogImage ? [
            {
                url: pageMetadata.ogImage,
                width: 1200,
                height: 630,
                alt: pageMetadata.title,
            }
        ] : [
            {
                url: getOgImageUrl({ type: 'default' }),
                width: 1200,
                height: 630,
                alt: pageMetadata.title,
            }
        ],
    };

    // Add article-specific properties
    if (pageMetadata.ogType === 'article') {
        openGraph.publishedTime = pageMetadata.publishedTime;
        openGraph.modifiedTime = pageMetadata.modifiedTime;
        openGraph.authors = pageMetadata.authors;
        openGraph.tags = pageMetadata.tags;
        openGraph.section = pageMetadata.section;
    }

    // Add profile-specific properties
    if (pageMetadata.ogType === 'profile' && pageMetadata.authors && pageMetadata.authors.length > 0) {
        openGraph.firstName = pageMetadata.authors[0].split(' ')[0];
        openGraph.lastName = pageMetadata.authors[0].split(' ').slice(1).join(' ');
    }

    return openGraph;
};

/**
 * Generate Twitter Card metadata
 */
export const getTwitterCardMetadata = (
    pageMetadata: PageMetadata
): Metadata['twitter'] => {
    const config = getSeoConfig();

    return {
        card: pageMetadata.twitterCard || config.twitterCardType,
        site: config.twitterHandle,
        creator: config.twitterHandle,
        title: pageMetadata.title,
        description: pageMetadata.description,
        images: pageMetadata.ogImage || getOgImageUrl({ type: 'default' }),
    };
};

/**
 * Generate social sharing links for a page
 */
export const getSocialSharingLinks = (
    url: string,
    title: string,
    description?: string,
    hashtags?: string[]
): Record<string, string> => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = description ? encodeURIComponent(description) : '';
    const encodedHashtags = hashtags ? hashtags.join(',') : '';

    return {
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${encodedHashtags}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
        email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
        telegram: `https://telegram.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    };
};

/**
 * Generate metadata for different social platforms
 */
export const getPlatformSpecificMetadata = (
    pageMetadata: PageMetadata
): Record<string, Record<string, string>> => {
    const config = getSeoConfig();

    return {
        // Facebook specific
        facebook: {
            'fb:app_id': config.facebookAppId || '',
        },

        // Pinterest specific
        pinterest: {
            'pinterest:description': pageMetadata.description,
            'pinterest:image': pageMetadata.ogImage || getOgImageUrl({ type: 'default' }),
        },

        // LinkedIn specific
        linkedin: {
            'linkedin:title': pageMetadata.title,
            'linkedin:description': pageMetadata.description,
            'linkedin:image': pageMetadata.ogImage || getOgImageUrl({ type: 'default' }),
        },
    };
};

/**
 * Generate JSON-LD structured data for social sharing
 */
export const getSocialStructuredData = (
    pageMetadata: PageMetadata,
    url: string
): string => {
    const config = getSeoConfig();
    const baseUrl = config.siteUrl.replace(/\/$/, '');
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': pageMetadata.ogType === 'article' ? 'Article' :
            pageMetadata.ogType === 'profile' ? 'Person' : 'WebPage',
        'headline': pageMetadata.title,
        'description': pageMetadata.description,
        'url': fullUrl,
        'image': pageMetadata.ogImage || getOgImageUrl({ type: 'default' }),
        'publisher': {
            '@type': 'Organization',
            'name': config.organization?.name || config.siteName,
            'logo': {
                '@type': 'ImageObject',
                'url': config.organization?.logo || `${baseUrl}/logo.svg`,
            }
        },
    };

    // Add article-specific properties
    if (pageMetadata.ogType === 'article') {
        Object.assign(structuredData, {
            'datePublished': pageMetadata.publishedTime,
            'dateModified': pageMetadata.modifiedTime || pageMetadata.publishedTime,
            'author': pageMetadata.authors?.length ? {
                '@type': 'Person',
                'name': pageMetadata.authors[0]
            } : undefined,
            'keywords': pageMetadata.tags?.join(', '),
        });
    }

    return JSON.stringify(structuredData);
};
