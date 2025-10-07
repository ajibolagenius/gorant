import { OgTemplateData } from '@/types/seo';
import { DefaultTemplate } from './og-templates/default-template';
import { RantTemplate } from './og-templates/rant-template';
import { HomeTemplate } from './og-templates/home-template';
import { ChallengeTemplate } from './og-templates/challenge-template';
import { LeaderboardTemplate } from './og-templates/leaderboard-template';
import { TrendingTemplate } from './og-templates/trending-template';
import { ProfileTemplate } from './og-templates/profile-template';
import { AboutTemplate } from './og-templates/about-template';
import { RoadmapTemplate } from './og-templates/roadmap-template';

/**
 * Template type for Open Graph images
 */
export type OgTemplateType =
    | 'default'
    | 'home'
    | 'rant'
    | 'challenge'
    | 'leaderboard'
    | 'profile'
    | 'trending'
    | 'about'
    | 'roadmap';

/**
 * Get the appropriate Open Graph image template based on the content type
 */
export const getOgTemplate = (type: OgTemplateType = 'default') => {
    switch (type) {
        case 'rant':
            return RantTemplate;
        case 'home':
            return HomeTemplate;
        case 'challenge':
            return ChallengeTemplate;
        case 'leaderboard':
            return LeaderboardTemplate;
        case 'trending':
            return TrendingTemplate;
        case 'profile':
            return ProfileTemplate;
        case 'about':
            return AboutTemplate;
        case 'roadmap':
            return RoadmapTemplate;
        case 'default':
        default:
            return DefaultTemplate;
    }
};

/**
 * Validate and sanitize template data to ensure it's safe for rendering
 */
export const sanitizeTemplateData = (data: Partial<OgTemplateData>): OgTemplateData => {
    // Ensure title exists and is not too long
    const title = data.title
        ? data.title.substring(0, 100)
        : 'Rant - Express Yourself Anonymously';

    // Sanitize description
    const description = data.description
        ? data.description.substring(0, 200)
        : undefined;

    // Sanitize other fields
    return {
        title,
        description,
        author: data.author?.substring(0, 50),
        date: data.date,
        imageUrl: data.imageUrl,
        tags: data.tags?.slice(0, 5).map(tag => tag.substring(0, 20)),
        mood: data.mood?.toLowerCase(),
    };
};

/**
 * Create an Open Graph image component with the appropriate template
 */
export const createOgImage = (type: OgTemplateType, data: Partial<OgTemplateData>) => {
    const Template = getOgTemplate(type);
    const sanitizedData = sanitizeTemplateData(data);

    // Return the component constructor and data for JSX rendering
    return { Template, data: sanitizedData };
};
