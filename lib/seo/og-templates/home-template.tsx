import { OgTemplateData } from '@/types/seo';
import { BaseTemplate } from './base-template';

/**
 * Template for Home page Open Graph images
 * Enhanced with visual elements and feature highlights
 */
export const HomeTemplate = ({ data }: { data: OgTemplateData }) => {
    // Define feature highlights with icons (using emoji as placeholders)
    const features = [
        { icon: '🔒', text: 'Anonymous Expression' },
        { icon: '🛡️', text: 'Safe Community' },
        { icon: '🏆', text: 'Gamification' },
        { icon: '🔍', text: 'Discover Content' },
    ];

    return (
        <BaseTemplate data={data}>
            {/* Home-specific content */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    marginTop: '24px',
                }}
            >
                {/* Feature highlights */}
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '16px',
                        justifyContent: 'center',
                    }}
                >
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                fontSize: '18px',
                                fontWeight: '500',
                            }}
                        >
                            <span style={{ fontSize: '24px' }}>{feature.icon}</span>
                            {feature.text}
                        </div>
                    ))}
                </div>

                {/* Call to action */}
                <div
                    style={{
                        marginTop: '16px',
                        padding: '16px 24px',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '12px',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        border: '2px solid rgba(99, 102, 241, 0.2)',
                    }}
                >
                    Join thousands of users expressing themselves freely
                </div>
            </div>
        </BaseTemplate>
    );
};
