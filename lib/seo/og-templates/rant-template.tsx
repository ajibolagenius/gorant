import { OgTemplateData } from '@/types/seo';
import { BaseTemplate } from './base-template';

/**
 * Template for Rant content Open Graph images
 * Enhanced with visual elements and engagement metrics
 */
export const RantTemplate = ({ data }: { data: OgTemplateData }) => {
    const { tags = [], mood = 'neutral' } = data;

    // Generate random engagement metrics for visual interest
    const likes = Math.floor(Math.random() * 100) + 5;
    const comments = Math.floor(Math.random() * 20) + 1;

    // Get mood emoji
    const moodEmojis: Record<string, string> = {
        angry: '😡',
        sad: '😢',
        happy: '😊',
        excited: '🤩',
        neutral: '😐',
    };

    const moodEmoji = moodEmojis[mood] || moodEmojis.neutral;

    return (
        <BaseTemplate data={data}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                }}
            >
                {/* Content preview box */}
                <div
                    style={{
                        marginTop: '16px',
                        padding: '20px',
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        borderRadius: '12px',
                        borderLeft: '4px solid rgba(99, 102, 241, 0.6)',
                        position: 'relative',
                    }}
                >
                    {/* Quote marks for visual interest */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            fontSize: '40px',
                            opacity: 0.1,
                            fontFamily: 'serif',
                        }}
                    >
                        "
                    </div>

                    <div
                        style={{
                            fontSize: '18px',
                            fontStyle: 'italic',
                            lineHeight: 1.5,
                            opacity: 0.9,
                        }}
                    >
                        {data.description || "Express yourself freely and connect with others who share your experiences."}
                    </div>

                    <div
                        style={{
                            position: 'absolute',
                            bottom: '10px',
                            right: '10px',
                            fontSize: '40px',
                            opacity: 0.1,
                            fontFamily: 'serif',
                        }}
                    >
                        "
                    </div>
                </div>

                {/* Tags display with improved styling */}
                {tags && tags.length > 0 && (
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                            marginTop: '8px',
                        }}
                    >
                        {tags.slice(0, 5).map((tag, index) => (
                            <div
                                key={index}
                                style={{
                                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                    color: 'inherit',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                }}
                            >
                                #{tag}
                            </div>
                        ))}
                    </div>
                )}

                {/* Engagement metrics */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '8px',
                    }}
                >
                    {/* Left side - mood */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '16px',
                        }}
                    >
                        <span style={{ fontSize: '24px' }}>{moodEmoji}</span>
                        <span style={{ textTransform: 'capitalize' }}>{mood}</span>
                    </div>

                    {/* Right side - engagement */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '16px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>❤️</span>
                            <span>{likes}</span>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>💬</span>
                            <span>{comments}</span>
                        </div>
                    </div>
                </div>
            </div>
        </BaseTemplate>
    );
};
