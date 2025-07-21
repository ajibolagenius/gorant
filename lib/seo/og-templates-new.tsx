import React from 'react';
import { ImageResponse } from 'next/og';
import { OgTemplateData } from '@/types/og-template';

// Define the template types
export type OgTemplateType = 'default' | 'home' | 'rant' | 'challenge' | 'leaderboard' | 'profile' | 'trending' | 'about' | 'roadmap';

// Sanitize template data to prevent XSS and ensure valid values
const sanitizeTemplateData = (data: any): OgTemplateData => {
    return {
        title: String(data?.title || '').slice(0, 100),
        description: String(data?.description || '').slice(0, 200),
        author: String(data?.author || ''),
        date: String(data?.date || ''),
        imageUrl: String(data?.imageUrl || ''),
        tags: Array.isArray(data?.tags) ? data.tags.map(String) : [],
        mood: String(data?.mood || '')
    };
};

// Get the appropriate template based on content type
const getOgTemplate = (type: string): React.FC<{ data: OgTemplateData }> => {
    switch (type) {
        case 'rant':
            return RantTemplate;
        case 'challenge':
            return ChallengeTemplate;
        default:
            return DefaultTemplate;
    }
};

// Default template for general content
const DefaultTemplate: React.FC<{ data: OgTemplateData }> = ({ data }) => (
    <div
        style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a1a',
            padding: '40px'
        }}
    >
        <h1 style={{ color: '#fff', fontSize: '48px', marginBottom: '20px' }}>
            {data.title}
        </h1>
        {data.description && (
            <p style={{ color: '#a259ff', fontSize: '24px', textAlign: 'center' }}>
                {data.description}
            </p>
        )}
    </div>
);

// Template for rants
const RantTemplate: React.FC<{ data: OgTemplateData }> = ({ data }) => (
    <div
        style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#1a1a1a',
            padding: '40px'
        }}
    >
        {data.mood && (
            <div style={{ fontSize: '32px', marginBottom: '20px' }}>
                {data.mood}
            </div>
        )}
        <h1 style={{ color: '#fff', fontSize: '48px', marginBottom: '20px' }}>
            {data.title}
        </h1>
        <p style={{ color: '#a259ff', fontSize: '24px' }}>
            {data.description}
        </p>
        {data.author && (
            <p style={{ color: '#666', fontSize: '20px', marginTop: 'auto' }}>
                Posted by {data.author}
            </p>
        )}
    </div>
);

// Template for challenges
const ChallengeTemplate: React.FC<{ data: OgTemplateData }> = ({ data }) => (
    <div
        style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#1a1a1a',
            padding: '40px'
        }}
    >
        <h1 style={{ color: '#fff', fontSize: '48px', marginBottom: '20px' }}>
            {data.title}
        </h1>
        <p style={{ color: '#a259ff', fontSize: '24px' }}>
            {data.description}
        </p>
        {data.tags && data.tags.length > 0 && (
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                {data.tags.map((tag, index) => (
                    <span
                        key={index}
                        style={{
                            backgroundColor: '#333',
                            color: '#fff',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '18px'
                        }}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        )}
    </div>
);

// Generate OG image based on type and data
export const generateOgImage = (type: string, data: any): ImageResponse => {
    const Template = getOgTemplate(type);
    const sanitizedData = sanitizeTemplateData(data);

    return new ImageResponse(
        <Template data={sanitizedData} />,
        {
            width: 1200,
            height: 630
        }
    );
};
