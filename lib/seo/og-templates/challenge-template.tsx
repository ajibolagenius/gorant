import { OgTemplateData } from '@/types/seo';
import { BaseTemplate } from './base-template';

/**
 * Template for Challenge page Open Graph images
 * Enhanced with visual elements and gamification details
 */
export const ChallengeTemplate = ({ data }: { data: OgTemplateData }) => {
    return (
        <BaseTemplate data={data}>
            {/* Challenge-specific content */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    marginTop: '24px',
                }}
            >
                {/* Challenge badge */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '20px',
                        backgroundColor: 'rgba(255, 167, 38, 0.1)',
                        borderRadius: '16px',
                        border: '2px solid rgba(255, 167, 38, 0.3)',
                    }}
                >
                    {/* Challenge icon */}
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            backgroundColor: '#FFA726',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            boxShadow: '0 4px 12px rgba(255, 167, 38, 0.3)',
                        }}
                    >
                        🏆
                    </div>

                    {/* Challenge info */}
                    <div style={{ flex: 1 }}>
                        <div
                            style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                marginBottom: '8px',
                            }}
                        >
                            Challenge Available
                        </div>
                        <div
                            style={{
                                fontSize: '18px',
                                opacity: 0.8,
                            }}
                        >
                            Complete challenges to earn XP and unlock achievements
                        </div>
                    </div>
                </div>

                {/* Reward information */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '16px',
                    }}
                >
                    {/* XP reward */}
                    <div
                        style={{
                            flex: 1,
                            padding: '16px',
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            borderRadius: '12px',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: '18px', marginBottom: '8px' }}>XP Reward</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>+500 XP</div>
                    </div>

                    {/* Badge reward */}
                    <div
                        style={{
                            flex: 1,
                            padding: '16px',
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            borderRadius: '12px',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: '18px', marginBottom: '8px' }}>Difficulty</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>⭐⭐⭐</div>
                    </div>

                    {/* Time limit */}
                    <div
                        style={{
                            flex: 1,
                            padding: '16px',
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            borderRadius: '12px',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: '18px', marginBottom: '8px' }}>Time Limit</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>7 Days</div>
                    </div>
                </div>
            </div>
        </BaseTemplate>
    );
};
