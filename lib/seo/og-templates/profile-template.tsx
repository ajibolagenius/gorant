import { OgTemplateData } from '@/types/seo';
import { BaseTemplate } from './base-template';

/**
 * Template for User Profile Open Graph images
 * Displays user profile information and stats
 */
export const ProfileTemplate = ({ data }: { data: OgTemplateData }) => {
    // Extract profile-specific data
    const { title, description } = data;

    // Generate random user stats for visual interest
    const rantCount = Math.floor(Math.random() * 50) + 10;
    const level = Math.floor(Math.random() * 10) + 1;
    const xp = level * 100 + Math.floor(Math.random() * 100);

    // Achievement badges (emoji placeholders)
    const badges = ['🏆', '🌟', '🔥', '💯', '🚀'].slice(0, Math.floor(Math.random() * 4) + 1);

    return (
        <BaseTemplate data={data}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    marginTop: '16px',
                }}
            >
                {/* Profile header with avatar placeholder */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                    }}
                >
                    {/* Avatar placeholder */}
                    <div
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: '#6366f1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                        }}
                    >
                        {title.charAt(0).toUpperCase()}
                    </div>

                    {/* User info */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                        }}
                    >
                        {/* Level badge */}
                        <div
                            style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                backgroundColor: '#6366f1',
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                alignSelf: 'flex-start',
                            }}
                        >
                            Level {level}
                        </div>

                        {/* XP counter */}
                        <div
                            style={{
                                fontSize: '16px',
                                opacity: 0.7,
                            }}
                        >
                            {xp} XP
                        </div>
                    </div>
                </div>

                {/* User stats */}
                <div
                    style={{
                        display: 'flex',
                        gap: '16px',
                    }}
                >
                    {/* Rants count */}
                    <div
                        style={{
                            flex: 1,
                            padding: '16px',
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            borderRadius: '12px',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '4px' }}>Rants</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{rantCount}</div>
                    </div>

                    {/* Achievements */}
                    <div
                        style={{
                            flex: 1,
                            padding: '16px',
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            borderRadius: '12px',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '4px' }}>Achievements</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{badges.length}</div>
                    </div>

                    {/* Rank */}
                    <div
                        style={{
                            flex: 1,
                            padding: '16px',
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            borderRadius: '12px',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '4px' }}>Rank</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{Math.floor(Math.random() * 100) + 1}</div>
                    </div>
                </div>

                {/* Badges */}
                {badges.length > 0 && (
                    <div
                        style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center',
                            marginTop: '8px',
                        }}
                    >
                        {badges.map((badge, index) => (
                            <div
                                key={index}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                    border: '2px solid rgba(99, 102, 241, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                }}
                            >
                                {badge}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </BaseTemplate>
    );
};
