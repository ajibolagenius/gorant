'use client';

import { useEffect } from 'react';
import { OgTemplateData, OgTemplateType } from '@/lib/seo/og-templates';
import { generateOgImageUrl } from '@/lib/seo/og-url-generator';

interface OgImagePreloaderProps {
    type: OgTemplateType;
    data: Partial<OgTemplateData>;
    baseUrl?: string;
}

/**
 * Component for preloading Open Graph images
 * This helps ensure the OG image is cached and ready when needed
 */
export function OgImagePreloader({ type, data, baseUrl }: OgImagePreloaderProps) {
    useEffect(() => {
        // Generate the OG image URL
        const url = generateOgImageUrl(type, data, baseUrl);

        // Preload the image
        const img = new Image();
        img.src = url;

        // No need to handle onload/onerror since we're just preloading
    }, [type, JSON.stringify(data), baseUrl]);

    // This component doesn't render anything
    return null;
}

/**
 * Component for preloading multiple Open Graph images
 */
export function OgImageBatchPreloader({
    images,
    baseUrl,
}: {
    images: Array<{ type: OgTemplateType; data: Partial<OgTemplateData> }>;
    baseUrl?: string;
}) {
    useEffect(() => {
        // Generate and preload all images
        const preloadImages = async () => {
            // Limit concurrency to avoid overwhelming the browser
            const BATCH_SIZE = 3;

            for (let i = 0; i < images.length; i += BATCH_SIZE) {
                const batch = images.slice(i, i + BATCH_SIZE);

                // Preload batch in parallel
                await Promise.all(
                    batch.map(({ type, data }) => {
                        const url = generateOgImageUrl(type, data, baseUrl);
                        const img = new Image();

                        return new Promise<void>((resolve) => {
                            img.onload = () => resolve();
                            img.onerror = () => resolve(); // Still resolve on error
                            img.src = url;
                        });
                    })
                );

                // Small delay between batches
                if (i + BATCH_SIZE < images.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        };

        preloadImages();
    }, [images, baseUrl]);

    // This component doesn't render anything
    return null;
}
