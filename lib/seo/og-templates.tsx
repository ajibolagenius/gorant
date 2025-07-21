/** @jsxRuntime automatic @jsxImportSource next/og */

import { ImageResponse } from 'next/og';
import { OgTemplateData } from '@/types/og-template';

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

type StyleObject = Record<string, Record<string, string | number>>;

// Default template component
const DefaultTemplate = ({ data }: { data: OgTemplateData }) => {
    const styles: StyleObject = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a1a',
            padding: '40px',
            width: '100%',
            height: '100%'
        },
        title: {
            color: '#fff',
            fontSize: '48px',
            marginBottom: '20px'
        },
        description: {
            color: '#a259ff',
            fontSize: '24px',
            textAlign: 'center'
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>{data.title}</h1>
            {data.description && (
                <p style={styles.description}>{data.description}</p>
            )}
        </div>
    );
};

// Rant template component
const RantTemplate = ({ data }: { data: OgTemplateData }) => {
    const styles: StyleObject = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#1a1a1a',
            padding: '40px',
            width: '100%',
            height: '100%'
        },
        mood: {
            fontSize: '32px',
            marginBottom: '20px'
        },
        title: {
            color: '#fff',
            fontSize: '48px',
            marginBottom: '20px'
        },
        description: {
            color: '#a259ff',
            fontSize: '24px'
        },
        author: {
            color: '#666',
            fontSize: '20px',
            marginTop: 'auto'
        }
    };

    return (
        <div style={styles.container}>
            {data.mood && (
                <div style={styles.mood}>{data.mood}</div>
            )}
            <h1 style={styles.title}>{data.title}</h1>
            <p style={styles.description}>{data.description}</p>
            {data.author && (
                <p style={styles.author}>Posted by {data.author}</p>
            )}
        </div>
    );
};

// Challenge template component
const ChallengeTemplate = ({ data }: { data: OgTemplateData }) => {
    const styles: StyleObject = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#1a1a1a',
            padding: '40px',
            width: '100%',
            height: '100%'
        },
        title: {
            color: '#fff',
            fontSize: '48px',
            marginBottom: '20px'
        },
        description: {
            color: '#a259ff',
            fontSize: '24px'
        },
        tagsContainer: {
            marginTop: '20px',
            display: 'flex',
            gap: '10px'
        },
        tag: {
            backgroundColor: '#333',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '18px'
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>{data.title}</h1>
            <p style={styles.description}>{data.description}</p>
            {data.tags && data.tags.length > 0 && (
                <div style={styles.tagsContainer}>
                    {data.tags.map((tag, index) => (
                        <span key={index} style={styles.tag}>
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

// Get the appropriate template based on content type
const getOgTemplate = (type: string) => {
    switch (type) {
        case 'rant':
            return RantTemplate;
        case 'challenge':
            return ChallengeTemplate;
        default:
            return DefaultTemplate;
    }
};

// Generate OG image based on type and data
export const generateOgImage = async (type: string, data: any) => {
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
