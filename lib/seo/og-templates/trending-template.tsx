import { OgTemplateData } from '@/types/seo';
import { BaseTemplate } from './base-template';

/**
 * Template for Trending page Open Graph images
 * Enhanced with visual elements and trending indicators
 */
export const TrendingTemplate = ({ data }: { data: OgTemplateData }) => {
    const { tags = [] } = data;

    // Default tags if none provided
    const displayTags = tags.length > 0 ? tags : ['technology', 'productivity', 'design', 'career', 'life'];

    // Generate random engagement numbers for visual interest
    const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Trending metrics
    const metrics = [
        { icon: '📈', label: 'Engagement', value: `+${getRandomNumber(25, 75)}%` },
        { icon: '💬', label: 'Comments', value: getRandomNumber(120, 350).toString() },
        { icon: '👁️', label: 'Views', value: `${getRandomNumber(1, 9)}.${getRandomNumber(1, 9)}K` },
    ];

    return (
        <BaseTemplate data={data}>
            {/* Trending-specific content */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    marginTop: '24px',
                }}
            >
                {/* Trending header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        borderRadius: '16px',
                        border: '2px solid rgba(255, 107, 107, 0.2)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '32px',
                            }}
                        >
                            🔥
                        </div>
                        <div
                            style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                            }}
                        >
                            Trending Now
                        </div>
                    </div>

                    <div
                        style={{
                            backgroundColor: '#FF6B6B',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '16px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                        }}
                    >
                        HOT
                    </div>
                </div>

                {/* Trending topics */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                    }}
                >
                    <div
                        style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                        }}
                    >
                        Popular Topics
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                        }}
                    >
                        {displayTags.map((tag, index) => {
                            // Create a gradient of colors for tags
                            const colors = [
                                { bg: '#FF6B6B', text: 'white' },
                                { bg: '#FF9E64', text: 'white' },
                                { bg: '#4ECDC4', text: 'white' },
                                { bg: '#6A67CE', text: 'white' },
                                { bg: '#2A9D8F', text: 'white' },
                            ];
                            const color = colors[index % colors.length];

                            return (
                                <div
                                    key={index}
                                    style={{
                                        backgroundColor: color.bg,
                                        color: color.text,
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    #{tag}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Trending metrics */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '16px',
                        marginTop: '8px',
                    }}
                >
                    {metrics.map((metric, index) => (
                        <div
                            key={index}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '16px',
                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                borderRadius: '12px',
                            }}
                        >
                            <div style={{ fontSize: '24px' }}>{metric.icon}</div>
                            <div style={{ fontSize: '14px', opacity: 0.7 }}>{metric.label}</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{metric.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </BaseTemplate>
    );
};
