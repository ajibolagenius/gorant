import { MetadataRoute } from 'next';
import { getSeoConfig } from '@/lib/seo/config';

/**
 * Generate robots.txt content dynamically based on environment
 */
export default function robots(): MetadataRoute.Robots {
    const config = getSeoConfig();
    const siteUrl = config.siteUrl;
    const robotsPolicy = config.robotsPolicy;

    // For non-production environments or if robotsPolicy.index is false, disallow all robots
    if (
        process.env.NODE_ENV !== 'production' ||
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
        (robotsPolicy && !robotsPolicy.index)
    ) {
        return {
            rules: {
                userAgent: '*',
                disallow: '/',
            },
            host: siteUrl,
        };
    }

    // For production, use configured robot policies
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/admin/',
                '/settings/',
                '/notifications/',
                '/test-charts/',
            ],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    };
}
