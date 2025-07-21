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

- Centralized SEO configuration with default values
- Page-specific metadata providers for different content types
- Integration with Next.js metadata API
- Social media metadata (Open Graph and Twitter Cards)

### 2. Dynamic Open Graph Images

- Template-based image generation for different content types
- On-demand image generation API
- Caching mechanism for performance optimization
- Fallback images for error cases

### 3. Sitemap and RSS Feeds

- Dynamic sitemap generation with Next.js sitemap support
- Content-specific RSS feeds
- Proper caching and update mechanisms
- Sitemap indexing for large sites

### 4. Structured Data Markup

- JSON-LD schema generation for different content types
- Schema validation and testing
- Integration with page layouts
- Enhanced search result appearance

### 5. Favicon and App Icons

- Comprehensive icon set for different platforms
- Light and dark mode variants
- Web app manifest for PWA support
- Proper HTML integration

### 6. SEO Monitoring

- Performance tracking and metrics
- Admin dashboard for SEO insights
- Recommendation engine for improvements
- Automated testing and validation

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

### Adding Structured Data to a Page

```tsx
// components/specific-page.tsx
import { SchemaGenerator } from '@/components/seo/schema-generator';

export default function SpecificPage({ data }) {
  return (
    <>
      <SchemaGenerator pageType="article" data={data} />
      {/* Page content */}
    </>
  );
}
```

### Generating Dynamic Open Graph Images

```tsx
// app/api/og/route.ts
import { ImageResponse } from 'next/og';
import { getOgImageTemplate } from '@/lib/seo/og-templates';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  const data = await fetchDataForOgImage(type, id);
  const template = getOgImageTemplate(type);

  return new ImageResponse(template(data), {
    width: 1200,
    height: 630,
  });
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

3. **Structured Data**
   - Use the most specific schema type for your content
   - Include all required properties for each schema type
   - Test schemas with Google's Structured Data Testing Tool

4. **Performance**
   - Implement caching for generated images and feeds
   - Use server components for metadata generation when possible
   - Monitor and optimize SEO-related API endpoints

5. **Accessibility**
   - Ensure metadata enhances screen reader experience
   - Provide text alternatives for visual content
   - Use proper ARIA attributes alongside schema markup

## Implementation Status

The SEO metadata optimization feature is currently being implemented according to the following plan:

- ✅ Set up core SEO configuration
- 🚧 Implement basic metadata management
- ⏳ Implement dynamic Open Graph image generation
- ⏳ Implement sitemap generation
- ⏳ Create RSS feed generation
- ⏳ Implement structured data markup
- ⏳ Set up favicon and app icons
- ⏳ Implement SEO monitoring and analytics
- ⏳ Create content creator SEO tools
- ⏳ Write tests and documentation

## Related Files

- `types/seo.ts` - TypeScript interfaces for SEO components
- `lib/seo/config.ts` - Central SEO configuration
- `lib/seo/metadata.ts` - Metadata generation utilities
- `app/robots.ts` - Robots.txt configuration
- `app/sitemap.ts` - Sitemap generation
- `app/site.webmanifest` - Web app manifest
- `public/favicon.ico` and other icon assets

## References

- [Next.js Metadata API Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org](https://schema.org/)
- [Google Search Central Documentation](https://developers.google.com/search)
