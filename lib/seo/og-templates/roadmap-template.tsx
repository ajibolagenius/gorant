import { OgTemplateData } from '@/types/seo';
import { BaseTemplate } from './base-template';

/**
 * Template for Roadmap page Open Graph images
 * Displays platform roadmap and upcoming features
 */
export const RoadmapTemplate = ({ data }: { data: OgTemplateData }) => {
    // Roadmap milestones
    const milestones = [
        { status: 'completed', title: 'Core Platform', date: 'Q1 2025' },
        { status: 'completed', title: 'Analytics Dashboard', date: 'Q2 2025' },
        { status: 'in-progress', title: 'Community Groups', date: 'Q3 2025' },
        { status: 'planned', title: 'Mobile App', date: 'Q4 2025' },
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
                {/* Roadmap header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '12px',
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
                            🗺️
                        </div>
                        <div
                            style={{
                                fontSize: '20px',
                                fontWeight: 'bold',
                            }}
                        >
                            Platform Roadmap
                        </div>
                    </div>

                    <div
                        style={{
                            fontSize: '16px',
                            opacity: 0.8,
                        }}
                    >
                        2025
                    </div>
                </div>

                {/* Roadmap timeline */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                    }}
                >
                    {milestones.map((milestone, index) => {
                        // Define status-based styling
                        const statusStyles: Record<string, { color: string; bg: string; border: string; label: string }> = {
                            'completed': {
                                color: '#10B981',
                                bg: 'rgba(16, 185, 129, 0.1)',
                                border: 'rgba(16, 185, 129, 0.3)',
                                label: 'Completed'
                            },
                            'in-progress': {
                                color: '#F59E0B',
                                bg: 'rgba(245, 158, 11, 0.1)',
                                border: 'rgba(245, 158, 11, 0.3)',
                                label: 'In Progress'
                            },
                            'planned': {
                                color: '#6366F1',
                                bg: 'rgba(99, 102, 241, 0.1)',
                                border: 'rgba(99, 102, 241, 0.3)',
                                label: 'Planned'
                            }
                        };

                        const style = statusStyles[milestone.status];

                        return (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '16px',
                                    backgroundColor: style.bg,
                                    borderRadius: '12px',
                                    border: `1px solid ${style.border}`,
                                }}
                            >
                                {/* Status indicator */}
                                <div
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        backgroundColor: style.color,
                                    }}
                                />

                                {/* Milestone title */}
                                <div style={{ flex: 1, fontSize: '18px', fontWeight: '500' }}>
                                    {milestone.title}
                                </div>

                                {/* Status label */}
                                <div
                                    style={{
                                        padding: '4px 10px',
                                        backgroundColor: style.bg,
                                        border: `1px solid ${style.border}`,
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        color: style.color,
                                        fontWeight: '500',
                                    }}
                                >
                                    {style.label}
                                </div>

                                {/* Date */}
                                <div style={{ fontSize: '16px', opacity: 0.7 }}>
                                    {milestone.date}
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
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        textAlign: 'center',
                        fontWeight: '500',
                    }}
                >
                    Follow our journey and contribute your ideas!
                </div>
            </div>
        </BaseTemplate>
    );
};
