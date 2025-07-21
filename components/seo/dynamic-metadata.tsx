'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { getSocialStructuredData } from '@/lib/seo/social-metadata';
import { PageMetadata } from '@/types/seo';

interface DynamicMetadataProps {
    metadata: PageMetadata;
    url?: string;
}

/**
 * Component for dynamically updating metadata in client components
 * This is useful for pages that need to update their metadata based on client-side state
 *
 * Note: This component should be used only when metadata needs to be updated based on
 * client-side state. For static or server-rendered metadata, use the Next.js Metadata API
 * with the getPageMetadata function from lib/seo/metadata.ts
 */
export default function DynamicMetadata({ metadata, url }: DynamicMetadataProps) {
    const pathname = usePathname();
    const currentUrl = url || pathname || '';

    // Generate structured data
    const structuredData = getSocialStructuredData(metadata, currentUrl);

    // Update document title and meta tags
    useEffect(() => {
        if (metadata.title) {
            document.title = metadata.title;
        }

        // Update meta description
        let descriptionMeta = document.querySelector('meta[name="description"]');
        if (descriptionMeta) {
            descriptionMeta.setAttribute('content', metadata.description);
        } else {
            descriptionMeta = document.createElement('meta');
            descriptionMeta.setAttribute('name', 'description');
            descriptionMeta.setAttribute('content', metadata.description);
            document.head.appendChild(descriptionMeta);
        }

        // Update Open Graph meta tags
        updateMetaTag('property', 'og:title', metadata.title);
        updateMetaTag('property', 'og:description', metadata.description);
        updateMetaTag('property', 'og:type', metadata.ogType || 'website');
        updateMetaTag('property', 'og:url', currentUrl);
        if (metadata.ogImage) {
            updateMetaTag('property', 'og:image', metadata.ogImage);
        }

        // Update Twitter Card meta tags
        updateMetaTag('name', 'twitter:card', metadata.twitterCard || 'summary_large_image');
        updateMetaTag('name', 'twitter:title', metadata.title);
        updateMetaTag('name', 'twitter:description', metadata.description);
        if (metadata.ogImage) {
            updateMetaTag('name', 'twitter:image', metadata.ogImage);
        }

        // Update canonical URL
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (metadata.canonical) {
            if (canonicalLink) {
                canonicalLink.setAttribute('href', metadata.canonical);
            } else {
                canonicalLink = document.createElement('link');
                canonicalLink.setAttribute('rel', 'canonical');
                canonicalLink.setAttribute('href', metadata.canonical);
                document.head.appendChild(canonicalLink);
            }
        }

        // Update robots meta tag
        if (metadata.noindex) {
            updateMetaTag('name', 'robots', `noindex, ${metadata.nofollow ? 'nofollow' : 'follow'}`);
        }

        // Helper function to update meta tags
        function updateMetaTag(attrName: string, attrValue: string, content: string) {
            let metaTag = document.querySelector(`meta[${attrName}="${attrValue}"]`);
            if (metaTag) {
                metaTag.setAttribute('content', content);
            } else {
                metaTag = document.createElement('meta');
                metaTag.setAttribute(attrName, attrValue);
                metaTag.setAttribute('content', content);
                document.head.appendChild(metaTag);
            }
        }
    }, [metadata, currentUrl]);

    return (
        <Script
            id="structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: structuredData }}
            strategy="afterInteractive"
        />
    );
}
