import { OgTemplateData } from '@/types/seo';
import { BaseTemplate } from './base-template';

/**
 * Template for About page Open Graph images
 * Displays information about the platform
 */
export const AboutTemplate = ({ data }: { data: OgTemplateData }) => {
    // Platform features to highlight
    const features = [
        { icon: '🔒', title: 'Anonymous', description: 'Express yourself freely' },
        { icon: '🛡️', title: 'Safe', description: 'Moderated community' },
        { icon: '🏆', title: 'Gamified', description: 'Earn XP and badges' },
        { icon: '🔍', title: 'Discover', description: 'Find like-minded people' },
    ];

    return (
        <BaseTemplate data={data}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    marginTop: '16px',
                }}
            >
                {/* Mission statement */}
                <div
                    style={{
                        padding: '20px',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '12px',
                        borderLeft: '4px solid rgba(99, 102, 241, 0.6)',
                        fontSize: '18px',
                        fontStyle: 'italic',
                        lineHeight: 1.5,
                    }}
                >
                    "Our mission is to provide a safe space for authentic self-expression without judgment."
                </div>

                {/* Feature grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px',
                    }}
                >
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '16px',
                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                borderRadius: '12px',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '28px',
                                }}
                            >
                                {feature.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{feature.title}</div>
                                <div style={{ fontSize: '14px', opacity: 0.7 }}>{feature.description}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Community stats */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '16px',
                        marginTop: '8px',
                    }}
                >
                    <div
                        style={{
                            flex: 1,
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>10K+</div>
                        <div style={{ fontSize: '14px', opacity: 0.7 }}>Users</div>
                    </div>
                    <div
                        style={{
                            flex: 1,
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>50K+</div>
                        <div style={{ fontSize: '14px', opacity: 0.7 }}>Rants</div>
                    </div>
                    <div
                        style={{
                            flex: 1,
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>100K+</div>
                        <div style={{ fontSize: '14px', opacity: 0.7 }}>Comments</div>
                    </div>
                </div>
            </div>
        </BaseTemplate>
    );
};
