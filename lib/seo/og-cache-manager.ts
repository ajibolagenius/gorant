import { OgTemplateData, OgTemplateType } from '@/lib/seo/og-templates';
import { generateOgImageUrl } from '@/lib/seo/og-url-generator';

/**
 * Cache warming configuration
 */
interface CacheWarmingConfig {
    baseUrl?: string;
    concurrency?: number;
    delayBetweenBatches?: number;
    onProgress?: (completed: number, total: number) => void;
    onComplete?: () => void;
    onError?: (error: Error) => void;
}

/**
 * Warm the cache for a list of OG images
 *
 * @param images - List of images to warm
 * @param config - Cache warming configuration
 */
export async function warmOgImageCache(
    images: Array<{
        type: OgTemplateType;
        data: Partial<OgTemplateData>;
        id?: string;
    }>,
    config: CacheWarmingConfig = {}
): Promise<void> {
    const {
        baseUrl,
        concurrency = 3,
        delayBetweenBatches = 100,
        onProgress,
        onComplete,
        onError,
    } = config;

    let completed = 0;
    const total = images.length;

    try {
        // Process images in batches to limit concurrency
        for (let i = 0; i < total; i += concurrency) {
            const batch = images.slice(i, i + concurrency);

            // Process batch in parallel
            await Promise.all(
                batch.map(async ({ type, data, id }) => {
                    try {
                        // Generate URL with ID parameter if provided
                        let url = generateOgImageUrl(type, data, baseUrl);
                        if (id) {
                            url += `&id=${encodeURIComponent(id)}`;
                        }

                        // Fetch the image to warm the cache
                        await fetch(url, { method: 'GET' });

                        // Update progress
                        completed++;
                        onProgress?.(completed, total);
                    } catch (error) {
                        console.error(`Error warming cache for ${type}:`, error);
                        onError?.(error instanceof Error ? error : new Error(String(error)));
                    }
                })
            );

            // Add delay between batches
            if (i + concurrency < total) {
                await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
            }
        }

        onComplete?.();
    } catch (error) {
        console.error('Error warming OG image cache:', error);
        onError?.(error instanceof Error ? error : new Error(String(error)));
    }
}

/**
 * Generate a list of popular content for cache warming
 *
 * @returns List of popular content items
 */
export function getPopularContentForCacheWarming(): Array<{
    type: OgTemplateType;
    data: Partial<OgTemplateData>;
    id?: string;
}> {
    return [
        // Home page
        {
            type: 'home',
            data: {
                title: 'Rant - Express Yourself Anonymously',
                description: 'Share your thoughts and feelings anonymously with the world.',
            },
        },

        // About page
        {
            type: 'about',
            data: {
                title: 'About Rant',
                description: 'Learn about Rant - the anonymous expression platform designed for sharing thoughts and connecting with others in a safe environment.',
            },
        },

        // Trending page
        {
            type: 'trending',
            data: {
                title: 'Trending Rants | What\'s Hot Right Now',
                description: 'Discover the most popular trending rants on the platform right now.',
                tags: ['technology', 'productivity', 'design', 'career', 'life'],
            },
        },

        // Leaderboard page
        {
            type: 'leaderboard',
            data: {
                title: 'Leaderboard | Top Contributors',
                description: 'See who\'s leading the pack in our community. Check out the top contributors and most active users.',
            },
        },

        // Roadmap page
        {
            type: 'roadmap',
            data: {
                title: 'Product Roadmap',
                description: 'See what features and improvements are coming to Rant in the future.',
            },
        },

        // Popular rants (mock data)
        {
            type: 'rant',
            data: {
                title: 'Why does programming have to be so frustrating sometimes?',
                mood: 'angry',
                tags: ['programming', 'frustration', 'debugging'],
            },
            id: '1',
        },
        {
            type: 'rant',
            data: {
                title: 'Just landed my dream job in tech!',
                mood: 'happy',
                tags: ['career', 'success', 'tech'],
            },
            id: '2',
        },
        {
            type: 'rant',
            data: {
                title: 'Feeling overwhelmed with all these deadlines',
                mood: 'sad',
                tags: ['work', 'stress', 'deadlines'],
            },
            id: '3',
        },

        // Popular challenges
        {
            type: 'challenge',
            data: {
                title: 'Code for 30 Days Straight',
                description: 'Challenge yourself to code every day for a month and track your progress!',
            },
            id: '1',
        },
        {
            type: 'challenge',
            data: {
                title: 'Positivity Challenge',
                description: 'Share one positive thing that happened to you each day for a week.',
            },
            id: '2',
        },
    ];
}

/**
 * Initialize cache warming for the application
 * This should be called during application startup
 *
 * @param baseUrl - Base URL for the API
 */
export async function initializeCacheWarming(baseUrl?: string): Promise<void> {
    console.log('[OG Cache] Starting cache warming...');

    const popularContent = getPopularContentForCacheWarming();

    await warmOgImageCache(popularContent, {
        baseUrl,
        concurrency: 2,
        delayBetweenBatches: 200,
        onProgress: (completed, total) => {
            console.log(`[OG Cache] Warming progress: ${completed}/${total}`);
        },
        onComplete: () => {
            console.log('[OG Cache] Cache warming completed');
        },
        onError: (error) => {
            console.error('[OG Cache] Error during cache warming:', error);
        },
    });
}
