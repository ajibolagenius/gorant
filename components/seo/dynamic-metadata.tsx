'use client';

import { useEffect } from 'react';
import Head from 'next/head';
import { usePathname } from 'next/navigation';
import { getSocialStructuredData } from '@/lib/seo/social-metadata';
import { PageMetadata } from '@/types/seo';

interface DynamicMetadataProps {
    metadata: PageMetadata;
    url?: string;
}

/**
 * Component for dynamically updating metadata in client components
 * This is useful for pages that need to update their metadata based on client-side state
 */
export default function DynamicMetadata({ metadata, url }: DynamicMetadataProps) {
    const pathname = usePathname();
    const currentUrl = url || pathname;

    // Generate structured data
    const structuredData = getSocialStructuredData(metadata, currentUrl);

    // Update document title
    useEffect(() => {
        if (metadata.title) {
            document.title = metadata.title;
        }
    }, [metadata.title]);

    return (
        <Head>
            {/* Basic metadata */}
            {metadata.title && <title>{metadata.title}</title>}
            {metadata.description && <meta name="description" content={metadata.description} />}
            {metadata.keywords && <meta name="keywords" content={metadata.keywords.join(', ')} />}

            {/* Open Graph */}
            <meta property="og:title" content={metadata.title} />
            <meta property="og:description" content={metadata.description} />
            {metadata.ogType && <meta property="og:type" content={metadata.ogType} />}
            {metadata.ogImage && <meta property="og:image" content={metadata.ogImage} />}
            <meta property="og:url" content={currentUrl} />

            {/* Twitter Card */}
            {metadata.twitterCard && <meta name="twitter:card" content={metadata.twitterCard} />}
            <meta name="twitter:title" content={metadata.title} />
            <meta name="twitter:description" content={metadata.description} />
            {metadata.ogImage && <meta name="twitter:image" content={metadata.ogImage} />}

            {/* Canonical URL */}
            {metadata.canonical && <link rel="canonical" href={metadata.canonical} />}

            {/* Robots */}
            {metadata.noindex && <meta name="robots" content={`noindex, ${metadata.nofollow ? 'nofollow' : 'follow'}`} />}

            {/* Structured Data */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
        </Head>
    );
}
