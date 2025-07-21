/**
 * Schema.org type definitions
 */

/**
 * Base Schema.org type
 */
export interface SchemaOrgBase {
    '@context': 'https://schema.org';
    '@type': string;
}

/**
 * Schema.org WebSite type
 */
export interface WebSiteSchema extends SchemaOrgBase {
    '@type': 'WebSite';
    name: string;
    url: string;
    description?: string;
    potentialAction?: {
        '@type': 'SearchAction';
        target: string;
        'query-input': string;
    };
}

/**
 * Schema.org Organization type
 */
export interface OrganizationSchema extends SchemaOrgBase {
    '@type': 'Organization';
    name: string;
    url: string;
    logo?: string;
    sameAs?: string[];
    description?: string;
}

/**
 * Schema.org Article type
 */
export interface ArticleSchema extends SchemaOrgBase {
    '@type': 'Article' | 'BlogPosting' | 'NewsArticle' | 'SocialMediaPosting';
    headline: string;
    description?: string;
    image?: string | string[];
    datePublished: string;
    dateModified?: string;
    author: PersonSchema | OrganizationSchema | string;
    publisher?: OrganizationSchema;
    mainEntityOfPage?: string;
    keywords?: string[];
}

/**
 * Schema.org Person type
 */
export interface PersonSchema extends SchemaOrgBase {
    '@type': 'Person';
    name: string;
    url?: string;
    image?: string;
    sameAs?: string[];
}

/**
 * Schema.org BreadcrumbList type
 */
export interface BreadcrumbListSchema extends SchemaOrgBase {
    '@type': 'BreadcrumbList';
    itemListElement: {
        '@type': 'ListItem';
        position: number;
        name: string;
        item?: string;
    }[];
}

/**
 * Schema.org FAQPage type
 */
export interface FAQPageSchema extends SchemaOrgBase {
    '@type': 'FAQPage';
    mainEntity: {
        '@type': 'Question';
        name: string;
        acceptedAnswer: {
            '@type': 'Answer';
            text: string;
        };
    }[];
}

/**
 * Union type of all supported Schema.org types
 */
export type SchemaOrgType =
    | WebSiteSchema
    | OrganizationSchema
    | ArticleSchema
    | PersonSchema
    | BreadcrumbListSchema
    | FAQPageSchema;

/**
 * Page-specific data types for schema generation
 */
export type HomePageData = {
    siteName: string;
    siteUrl: string;
    description?: string;
    searchUrl?: string;
};

export type RantPageData = {
    title: string;
    content: string;
    image?: string | string[];
    publishedAt: string;
    updatedAt?: string;
    authorName: string;
    url: string;
    tags?: string[];
    category: string;
    siteUrl: string;
};

export type ProfilePageData = {
    name: string;
    url: string;
    image?: string;
    socialLinks?: string[];
};

export type FAQPageData = {
    faqs: Array<{
        question: string;
        answer: string;
    }>;
    siteName: string;
    siteUrl: string;
    description?: string;
};

/**
 * Discriminated union for page data types
 */
export type PageData =
    | { type: 'home'; data: HomePageData }
    | { type: 'rant'; data: RantPageData }
    | { type: 'profile'; data: ProfilePageData }
    | { type: 'faq'; data: FAQPageData }
    | { type: 'default'; data: HomePageData };
