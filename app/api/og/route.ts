import React from 'react';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createOgImage, OgTemplateType } from '@/lib/seo/og-templates';
import { OgTemplateData } from '@/types/seo';
import {
    addCacheHeaders,
    generateCacheKey,
    startPerformanceTimer,
    trackImageGeneration,
    getCacheTTL
} from '@/lib/seo/og-cache';
import { getMemoryCache } from '@/lib/seo/og-cache-store';

// Define allowed image dimensions
const WIDTH = 1200;
const HEIGHT = 630;

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // Max 30 requests per minute per IP

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Check if request should be rate limited
 */
const checkRateLimit = (ip: string): { allowed: boolean; remaining: number } => {
    const now = Date.now();
    const key = ip;

    const current = rateLimitMap.get(key);

    if (!current || now > current.resetTime) {
        // Reset or initialize rate limit
        rateLimitMap.set(key, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW
        });
        return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
    }

    if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
        return { allowed: false, remaining: 0 };
    }

    current.count++;
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - current.count };
};

/**
 * Validate and sanitize input parameters
 */
const sanitizeInput = (input: string | null, maxLength: number): string | undefined => {
    if (!input) return undefined;

    // Basic XSS prevention - remove HTML tags and limit length
    const sanitized = input
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>&"']/g, '') // Remove potentially dangerous characters
        .trim()
        .substring(0, maxLength);

    return sanitized || undefined;
};

/**
 * Validate request parameters
 */
const validateParams = (params: URLSearchParams): {
    isValid: boolean;
    type: OgTemplateType;
    data: Partial<OgTemplateData>;
    error?: string;
} => {
    // Get and validate type parameter
    const type = params.get('type') as OgTemplateType | null;
    if (!type) {
        return {
            isValid: false,
            type: 'default',
            data: {},
            error: 'Missing type parameter'
        };
    }

    // Validate type is one of the allowed values
    const allowedTypes: OgTemplateType[] = [
        'default', 'home', 'rant', 'challenge', 'leaderboard',
        'profile', 'trending', 'about', 'roadmap'
    ];

    if (!allowedTypes.includes(type as OgTemplateType)) {
        return {
            isValid: false,
            type: 'default',
            data: {},
            error: `Invalid type: ${type}. Allowed types: ${allowedTypes.join(', ')}`
        };
    }

    // Get content ID if provided
    const id = sanitizeInput(params.get('id'), 50);

    // Build template data from parameters with sanitization
    const data: Partial<OgTemplateData> = {
        title: sanitizeInput(params.get('title'), 100),
        description: sanitizeInput(params.get('description'), 200),
        author: sanitizeInput(params.get('author'), 50),
        date: sanitizeInput(params.get('date'), 50),
        imageUrl: sanitizeInput(params.get('imageUrl'), 500),
        mood: sanitizeInput(params.get('mood'), 20)?.toLowerCase(),
    };

    // Validate mood if provided
    if (data.mood) {
        const allowedMoods = ['angry', 'sad', 'happy', 'excited', 'neutral'];
        if (!allowedMoods.includes(data.mood)) {
            data.mood = 'neutral'; // Default to neutral for invalid moods
        }
    }

    // Handle tags if present
    const tagsParam = params.get('tags');
    if (tagsParam) {
        try {
            // Fix the type issue by ensuring we only include defined values
            const processedTags = tagsParam
                .split(',')
                .map(tag => sanitizeInput(tag.trim(), 20))
                .filter((tag): tag is string => tag !== undefined)
                .slice(0, 5); // Limit to 5 tags

            data.tags = processedTags;
        } catch {
            // Ignore tag parsing errors
            data.tags = [];
        }
    }

    // Handle content-specific parameters
    switch (type) {
        case 'rant':
            // For rants, try to fetch additional data if ID is provided
            if (id) {
                // In a real implementation, this would fetch rant data from the database
                // For now, we'll just use the provided parameters
                if (!data.mood) data.mood = 'neutral';
            }
            break;

        case 'profile':
            // For profiles, ensure we have a username or ID
            if (!data.title && id) {
                data.title = `User ${id}`;
            }
            break;

        case 'challenge':
            // For challenges, ensure we have challenge details
            if (!data.description) {
                data.description = 'Complete this challenge to earn XP and unlock achievements!';
            }
            break;
    }

    // Validate required fields based on type
    if (!data.title) {
        // Provide default titles based on type
        const defaultTitles: Record<OgTemplateType, string> = {
            default: 'Rant - Express Yourself Anonymously',
            home: 'Rant - Anonymous Social Platform',
            rant: 'Anonymous Rant',
            challenge: 'Challenge - Rant Platform',
            leaderboard: 'Leaderboard - Top Contributors',
            profile: 'User Profile - Rant',
            trending: 'Trending - Popular Content',
            about: 'About - Rant Platform',
            roadmap: 'Roadmap - Rant Platform',
        };

        data.title = defaultTitles[type as OgTemplateType] || defaultTitles.default;
    }

    return { isValid: true, type: type as OgTemplateType, data };
};

/**
 * Generate a fallback image when parameters are invalid
 */
const generateFallbackImage = (error?: string) => {
    return createOgImage('default', {
        title: 'Rant - Express Yourself Anonymously',
        description: error ? `Error: ${error}` : 'Share your thoughts anonymously with the world',
    });
};

/**
 * Handle GET requests to generate Open Graph images
 */
export async function GET(request: NextRequest) {
    const stopTimer = startPerformanceTimer('OG Image Generation');
    let success = false;
    let cacheHit = false;

    try {
        // Get client IP for rate limiting
        const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

        // Check rate limit
        const { allowed, remaining } = checkRateLimit(ip);

        if (!allowed) {
            return new Response('Rate limit exceeded', {
                status: 429,
                headers: {
                    'Content-Type': 'text/plain',
                    'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': new Date(Date.now() + RATE_LIMIT_WINDOW).toISOString(),
                },
            });
        }

        // Get URL parameters
        const { searchParams } = new URL(request.url);

        // Generate cache key for performance tracking
        const cacheKey = generateCacheKey(searchParams);

        // Try to get the image from cache first
        const memoryCache = getMemoryCache();
        const cachedImageData = await memoryCache.get(cacheKey);

        if (cachedImageData) {
            // Cache hit - return the cached image
            cacheHit = true;
            success = true;

            // Create response from cached data
            const response = new Response(new Uint8Array(cachedImageData));

            // Determine appropriate cache TTL based on content type
            const type = searchParams.get('type') || 'default';
            const hasId = searchParams.has('id');
            const cacheTTL = getCacheTTL(type, hasId);

            // Add cache headers
            const cachedResponse = addCacheHeaders(response, cacheTTL);

            // Add rate limit headers
            cachedResponse.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
            cachedResponse.headers.set('X-RateLimit-Remaining', remaining.toString());

            // Add cache hit header
            cachedResponse.headers.set('X-Cache', 'HIT');
            cachedResponse.headers.set('X-Cache-Key', cacheKey);

            // Add content type
            cachedResponse.headers.set('Content-Type', 'image/png');
            cachedResponse.headers.set('Content-Disposition', 'inline; filename="og-image.png"');

            // Track metrics and return cached response
            const duration = performance.now();
            stopTimer();
            trackImageGeneration(
                searchParams.get('type') || 'unknown',
                duration,
                true,
                true // Cache hit
            );

            return cachedResponse;
        }

        // Cache miss - generate the image
        // Validate parameters
        const { isValid, type, data, error } = validateParams(searchParams);

        // Generate image component
        const imageResult = isValid
            ? createOgImage(type, data)
            : generateFallbackImage(error);

        const { Template, data: templateData } = imageResult;
        const imageComponent = React.createElement(Template, { data: templateData });

        // Create the image response with improved options
        const imageResponse = new ImageResponse(imageComponent, {
            width: WIDTH,
            height: HEIGHT,
            // Add emoji support
            emoji: 'twemoji',
            // Add fonts for better typography
            fonts: [
                {
                    name: 'Inter',
                    data: await fetch(
                        new URL('/fonts/Inter-Regular.woff', request.url)
                    ).then((res) => res.arrayBuffer()),
                    weight: 400,
                    style: 'normal',
                },
                {
                    name: 'Inter',
                    data: await fetch(
                        new URL('/fonts/Inter-Bold.woff', request.url)
                    ).then((res) => res.arrayBuffer()),
                    weight: 700,
                    style: 'normal',
                },
            ],
        });

        // Get the image data for caching
        const imageData = await imageResponse.arrayBuffer();

        // Store in cache
        const hasId = searchParams.has('id');
        const cacheTTL = getCacheTTL(type, hasId);
        await memoryCache.set(cacheKey, new Uint8Array(imageData), cacheTTL);

        // Create a new response from the image data
        const response = new Response(imageData);

        // Add cache headers and rate limit headers
        const cachedResponse = addCacheHeaders(response, cacheTTL, !isValid);
        cachedResponse.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
        cachedResponse.headers.set('X-RateLimit-Remaining', remaining.toString());

        // Add cache miss header
        cachedResponse.headers.set('X-Cache', 'MISS');
        cachedResponse.headers.set('X-Cache-Key', cacheKey);

        // Add content type and other important headers
        cachedResponse.headers.set('Content-Type', 'image/png');
        cachedResponse.headers.set('Content-Disposition', 'inline; filename="og-image.png"');

        success = true;
        return cachedResponse;
    } catch (error: unknown) {
        // Log the error with more context
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('Error generating OG image:', {
            error: errorMessage,
            stack: errorStack,
            url: request.url,
            timestamp: new Date().toISOString(),
        });

        // Return a fallback image with cache headers
        const fallbackResult = generateFallbackImage('Failed to generate image');
        const { Template: FallbackTemplate, data: fallbackData } = fallbackResult;
        const fallbackComponent = React.createElement(FallbackTemplate, { data: fallbackData });

        const fallbackResponse = new ImageResponse(
            fallbackComponent,
            {
                width: WIDTH,
                height: HEIGHT,
            }
        );

        // Add shorter cache for error responses
        return addCacheHeaders(fallbackResponse, 300); // 5 minutes cache for errors
    } finally {
        // Track performance metrics if not already tracked (for cache hits)
        if (!cacheHit) {
            const duration = performance.now();
            stopTimer();
            trackImageGeneration(
                request.nextUrl.searchParams.get('type') || 'unknown',
                duration,
                success,
                false // Cache miss
            );
        }
    }
}
