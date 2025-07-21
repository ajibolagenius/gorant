import { MetadataRoute } from 'next';
import { getSeoConfig } from '@/lib/seo/config';

/**
 * Generate robots.txt content dynamically based on environment
 */
export default function robots(): MetadataRoute.Robots {
    const config = getSeoConfig();
    const siteUrl = config.siteUrl;

    // For non-production environments, disallow all robots
    if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
        return {
            rules: {
                userAgent: '*',
                disallow: '/',
            },
        };
    }

    // For production, allow all robots and specify sitemap
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/admin/',
                '/settings/',
                '/notifications/',
            ],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
