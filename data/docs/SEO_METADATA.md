# SEO Metadata Optimization

This document provides an overview of the SEO metadata optimization implementation in the Rant platform.

## Overview

The SEO and Metadata Optimization feature enhances the platform's visibility in search engines, improves content sharing on social media, and provides better structured data for web crawlers. This implementation includes comprehensive metadata management, dynamic Open Graph images, SEO best practices, sitemaps, RSS feeds, and structured data markup.

## Type Definitions

The SEO implementation uses TypeScript interfaces defined in `types/seo.ts` to ensure type safety and consistency across the application:

### Core SEO Settings

```typescript
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
```

### Robots Policy

```typescript
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
```

### Organization Information

```typescript
export interface OrganizationInfo {
    name: string;
    url: string;
    logo: string;
    sameAs?: string[];
}
```

### Page Metadata

```typescript
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
```

### Open Graph Image Template Data

```typescript
export interface OgTemplateData {
    title: string;
    description?: string;
    author?: string;
    date?: string;
    imageUrl?: string;
    tags?: string[];
    mood?: string;
}
```

### Sitemap Entry

```typescript
export interface SitemapEntry {
    url: string;
    lastModified: Date;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
}
```

### RSS Feed Item

```typescript
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
```

## Implementation Components

The SEO implementation consists of several key components:

### 1. Metadata Management

- Centralized SEO configuration with default values (`lib/seo/config.ts`)
- Page-specific metadata providers for different content types (`lib/seo/metadata.ts`)
- Integration with Next.js metadata API
- Social media metadata (Open Graph and Twitter Cards)
- Environment-specific configuration (development, staging, production)
- Metadata validation and fallback mechanisms

### 2. Dynamic Open Graph Images

- Template-based image generation for different content types (`lib/seo/og-templates.ts`)
- On-demand image generation API (`app/api/og/route.ts`)
- Caching mechanism for performance optimization (`lib/seo/og-cache.ts`)
- Fallback images for error cases
- Rate limiting to prevent abuse
- Performance monitoring and metrics tracking

### 3. Sitemap Generation

- Dynamic sitemap generation with Next.js sitemap support (`app/sitemap.ts`)
- Static route definitions with appropriate change frequency and priority
- Proper typing for sitemap entries
- Environment-aware configuration (no indexing for development/staging)

### 4. Robots.txt Configuration

- Dynamic robots.txt generation based on environment (`app/robots.ts`)
- Environment-specific rules (block crawlers in development/staging)
- Proper exclusion of private/admin routes
- Sitemap reference for search engines

## Usage Examples

### Setting Default Metadata in Root Layout

```tsx
// app/layout.tsx
import { Metadata } from 'next';
import { getDefaultMetadata } from '@/lib/seo/metadata';

export const generateMetadata = async (): Promise<Metadata> => {
  return getDefaultMetadata();
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Generating Page-Specific Metadata

```tsx
// app/[specific-route]/page.tsx
import { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo/metadata';

export const generateMetadata = async ({ params }): Promise<Metadata> => {
  const data = await fetchPageData(params);
  return getPageMetadata('specific-page-type', data);
};
```

### Generating Dynamic Open Graph Images

```tsx
// app/api/og/route.ts
import { ImageResponse } from 'next/og';
import { createOgImage } from '@/lib/seo/og-templates';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as OgTemplateType;
  const data = {
    title: searchParams.get('title'),
    description: searchParams.get('description'),
    // Other parameters...
  };

  return new ImageResponse(createOgImage(type, data), {
    width: 1200,
    height: 630,
  });
}
```

### Creating a Sitemap

```tsx
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { getSeoConfig } from '@/lib/seo/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSeoConfig().siteUrl;

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // Other routes...
  ];
}
```

## Best Practices

1. **Metadata Consistency**
   - Ensure titles and descriptions are unique for each page
   - Keep titles under 60 characters and descriptions under 160 characters
   - Include relevant keywords naturally in metadata

2. **Image Optimization**
   - Use appropriate image dimensions for Open Graph (1200x630px recommended)
   - Ensure text in OG images is readable at small sizes
   - Implement proper alt text for all images

3. **Performance**
   - Implement caching for generated images and feeds
   - Use server components for metadata generation when possible
   - Monitor and optimize SEO-related API endpoints

4. **Accessibility**
   - Ensure metadata enhances screen reader experience
   - Provide text alternatives for visual content
   - Use proper ARIA attributes alongside schema markup

5. **Environment Awareness**
   - Prevent indexing of development and staging environments
   - Use appropriate robots directives for different environments
   - Implement environment-specific configurations

## Implementation Status

The SEO metadata optimization feature is currently being implemented according to the following plan:

- ✅ Set up core SEO configuration
  - Created central SEO configuration file with default values
  - Implemented environment-specific overrides
  - Added TypeScript interfaces for SEO settings

- ✅ Implement basic metadata management
  - Created metadata provider utilities
  - Integrated with Next.js metadata API
  - Added social media metadata (Open Graph and Twitter Cards)
  - Implemented metadata validation and fallbacks

- ✅ Implement dynamic Open Graph image generation
  - Created Open Graph image templates for different content types
  - Set up image generation API with caching
  - Implemented performance monitoring and rate limiting
  - Added fallback mechanisms for error handling

- ✅ Implement basic sitemap generation
  - Created sitemap.ts file using Next.js sitemap support
  - Implemented static route definitions
  - Added proper typing for sitemap entries

- 🚧 Add dynamic content to sitemap
  - Create data fetching functions for dynamic routes
  - Implement priority and change frequency logic
  - Add pagination for large sitemaps

- 🚧 Implement sitemap indexing
  - Create sitemap index for large sites
  - Add sitemap splitting by content type
  - Implement proper caching headers

- 🚧 Create RSS feed generation
  - Implement RSS feed generator
  - Set up RSS feed API endpoint
  - Add category-specific feeds

- 🚧 Implement structured data markup
  - Create Schema.org utilities
  - Implement content-specific schemas
  - Add schema components to pages

- 🚧 Set up favicon and app icons
  - Create icon assets in multiple formats and sizes
  - Add icon references to HTML
  - Create web app manifest

- 🚧 Implement SEO monitoring and analytics
  - Create SEO dashboard components
  - Implement SEO data collection
  - Add SEO recommendation engine

- 🚧 Create content creator SEO tools
  - Implement SEO guidance components
  - Add automatic content optimization
  - Implement media optimization

## Related Files

- `types/seo.ts` - TypeScript interfaces for SEO components
- `lib/seo/config.ts` - Central SEO configuration
- `lib/seo/metadata.ts` - Metadata generation utilities
- `lib/seo/og-templates.ts` - Open Graph image templates
- `lib/seo/og-cache.ts` - Caching for Open Graph images
- `lib/seo/og-cache-store.ts` - Cache storage implementation
- `lib/seo/og-cache-manager.ts` - Cache management utilities
- `app/api/og/route.ts` - Open Graph image generation API
- `app/api/og/warm-cache/route.ts` - Cache warming endpoint
- `app/robots.ts` - Robots.txt configuration
- `app/sitemap.ts` - Sitemap generation
- `app/site.webmanifest` - Web app manifest
- `components/seo/dynamic-metadata.tsx` - Dynamic metadata component
- `components/seo/og-image-preloader.tsx` - Image preloading component
- `components/seo/social-share-buttons.tsx` - Social sharing component

## References

- [Next.js Metadata API Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org](https://schema.org/)
- [Google Search Central Documentation](https://developers.google.com/search)
