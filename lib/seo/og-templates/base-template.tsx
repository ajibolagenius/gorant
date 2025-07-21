import { ReactNode } from 'react';
import { OgTemplateData } from '@/types/seo';

interface BaseTemplateProps {
    data: OgTemplateData;
    children?: ReactNode;
}

/**
 * Base template for Open Graph images
 * Provides consistent styling and layout for all OG images
 */
export const BaseTemplate = ({ data, children }: BaseTemplateProps) => {
    const { title, description, author, date, mood, imageUrl } = data;

    // Define mood-based colors
    const moodColors: Record<string, { bg: string; text: string; accent: string }> = {
        angry: { bg: '#FFEBEE', text: '#C62828', accent: '#EF5350' },
        sad: { bg: '#E8EAF6', text: '#283593', accent: '#5C6BC0' },
        happy: { bg: '#E8F5E9', text: '#2E7D32', accent: '#66BB6A' },
        excited: { bg: '#FFF3E0', text: '#EF6C00', accent: '#FFA726' },
        neutral: { bg: '#ECEFF1', text: '#455A64', accent: '#78909C' },
        default: { bg: '#F5F5F5', text: '#212121', accent: '#6366f1' }, // Default indigo from theme
    };

    // Get colors based on mood or use default
    const colors = mood && mood in moodColors ? moodColors[mood] : moodColors.default;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                padding: '40px',
                backgroundColor: colors.bg,
                color: colors.text,
                fontFamily: 'system-ui, sans-serif',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            {/* Header with logo and branding */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                    position: 'relative',
                    zIndex: 10,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    {/* Logo placeholder - replace with actual logo */}
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: colors.accent,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '20px',
                        }}
                    >
                        R
                    </div>
                    <div
                        style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                        }}
                    >
                        Rant
                    </div>
                </div>

                {/* Mood indicator if available */}
                {mood && (
                    <div
                        style={{
                            backgroundColor: colors.accent,
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '16px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            textTransform: 'capitalize',
                        }}
                    >
                        {mood}
                    </div>
                )}
            </div>

            {/* Main content area */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 10,
                }}
            >
                {/* Title */}
                <h1
                    style={{
                        fontSize: '48px',
                        fontWeight: 'bold',
                        margin: '0 0 16px 0',
                        lineHeight: 1.2,
                        // Ensure title doesn't overflow
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {title}
                </h1>

                {/* Description if available */}
                {description && (
                    <p
                        style={{
                            fontSize: '24px',
                            margin: '0 0 24px 0',
                            opacity: 0.8,
                            // Ensure description doesn't overflow
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {description}
                    </p>
                )}

                {/* Custom content */}
                {children}
            </div>

            {/* Footer with metadata */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: `1px solid ${colors.accent}20`,
                    paddingTop: '16px',
                    marginTop: '16px',
                    fontSize: '14px',
                    opacity: 0.8,
                    position: 'relative',
                    zIndex: 10,
                }}
            >
                {/* Author and date */}
                <div>
                    {author && <span style={{ fontWeight: 'bold' }}>{author}</span>}
                    {author && date && <span> • </span>}
                    {date && <span>{date}</span>}
                </div>

                {/* Website URL */}
                <div>gorant.live</div>
            </div>

            {/* Background image if available */}
            {imageUrl && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '40%',
                        height: '100%',
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.15,
                        zIndex: 1,
                    }}
                />
            )}

            {/* Background pattern for visual interest */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '30%',
                    background: `linear-gradient(135deg, ${colors.accent}10 25%, transparent 25%, transparent 50%, ${colors.accent}10 50%, ${colors.accent}10 75%, transparent 75%, transparent)`,
                    backgroundSize: '20px 20px',
                    opacity: 0.5,
                    zIndex: 0,
                }}
            />
        </div>
    );
};
