import { OgTemplateData } from '@/types/seo';
import { BaseTemplate } from './base-template';

/**
 * Template for Leaderboard page Open Graph images
 * Enhanced with visual elements and leaderboard details
 */
export const LeaderboardTemplate = ({ data }: { data: OgTemplateData }) => {
    // Define medal colors and icons
    const medals = [
        { color: '#FFD700', icon: '🥇', shadow: 'rgba(255, 215, 0, 0.3)' }, // Gold
        { color: '#C0C0C0', icon: '🥈', shadow: 'rgba(192, 192, 192, 0.3)' }, // Silver
        { color: '#CD7F32', icon: '🥉', shadow: 'rgba(205, 127, 50, 0.3)' }, // Bronze
    ];

    return (
        <BaseTemplate data={data}>
            {/* Leaderboard-specific content */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    marginTop: '24px',
                }}
            >
                {/* Leaderboard header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '12px',
                        marginBottom: '8px',
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
                                fontSize: '28px',
                            }}
                        >
                            🏆
                        </div>
                        <div
                            style={{
                                fontSize: '22px',
                                fontWeight: 'bold',
                            }}
                        >
                            Top Contributors
                        </div>
                    </div>

                    <div
                        style={{
                            fontSize: '16px',
                            opacity: 0.8,
                            fontWeight: '500',
                        }}
                    >
                        Weekly Rankings
                    </div>
                </div>

                {/* Mock leaderboard entries */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                    }}
                >
                    {[1, 2, 3].map((position) => {
                        const medal = medals[position - 1];
                        return (
                            <div
                                key={position}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '16px',
                                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                    borderRadius: '12px',
                                    border: `1px solid ${medal.color}40`,
                                    boxShadow: `0 4px 12px ${medal.shadow}`,
                                }}
                            >
                                <div
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: medal.color,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px',
                                        color: 'white',
                                    }}
                                >
                                    {medal.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                        Anonymous User #{position}
                                    </div>
                                    <div style={{ fontSize: '14px', opacity: 0.7 }}>
                                        Level {10 - (position - 1)} • {position === 1 ? '42' : position === 2 ? '38' : '31'} Rants
                                    </div>
                                </div>
                                <div
                                    style={{
                                        fontSize: '22px',
                                        fontWeight: 'bold',
                                        color: medal.color,
                                    }}
                                >
                                    {1000 - (position - 1) * 150} XP
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Call to action */}
                <div
                    style={{
                        marginTop: '8px',
                        padding: '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        textAlign: 'center',
                    }}
                >
                    Join the competition and climb the ranks!
                </div>
            </div>
        </BaseTemplate>
    );
};
