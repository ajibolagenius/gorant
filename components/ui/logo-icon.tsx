import React from 'react';

interface LogoIconProps {
    className?: string;
    size?: number;
    weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}

export const LogoIcon: React.FC<LogoIconProps> = ({
    className = "w-6 h-6",
    size,
    weight = 'regular'
}) => {
    // Adjust opacity and stroke width based on weight to match Phosphor icon style
    const getWeightStyles = () => {
        switch (weight) {
            case 'thin':
                return { strokeWidth: 8, opacity: 0.05 };
            case 'light':
                return { strokeWidth: 12, opacity: 0.08 };
            case 'regular':
                return { strokeWidth: 16, opacity: 0.1 };
            case 'bold':
                return { strokeWidth: 20, opacity: 0.15 };
            case 'fill':
                return { strokeWidth: 16, opacity: 0.2 };
            case 'duotone':
                return { strokeWidth: 16, opacity: 0.2 };
            default:
                return { strokeWidth: 16, opacity: 0.1 };
        }
    };

    const { strokeWidth, opacity } = getWeightStyles();

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            className={className}
            width={size}
            height={size}
            fill="currentColor"
        >
            <path fill="none" d="M0 0h256v256H0z" />
            {/* Main robot head with subtle background */}
            <rect x="48" y="56" width="160" height="144" opacity={opacity} fill="currentColor" />
            {/* Robot head outline */}
            <rect x="48" y="56" width="160" height="144" fill="none" stroke="currentColor" strokeLinecap="butt" strokeLinejoin="butt" strokeWidth={strokeWidth} />
            {/* Angled eyebrows for expression */}
            <path d="M84 92 l12 8" stroke="currentColor" strokeLinecap="butt" strokeWidth={Math.max(4, strokeWidth / 4)} />
            <path d="M172 92 l-12 8" stroke="currentColor" strokeLinecap="butt" strokeWidth={Math.max(4, strokeWidth / 4)} />
            {/* Eyes (slightly larger and more expressive) */}
            <rect x="86" y="108" width="28" height="20" rx="0" fill="currentColor" />
            <rect x="142" y="108" width="28" height="20" rx="0" fill="currentColor" />
            {/* More expressive open mouth */}
            <path d="M156 152a53 53 0 0 1-56 0" fill="none" stroke="currentColor" strokeLinecap="butt" strokeLinejoin="butt" strokeWidth={strokeWidth} />
            {/* Bottom base (simplified) */}
            <path d="M80 200v24h96v-24" fill="none" stroke="currentColor" strokeLinecap="butt" strokeLinejoin="butt" strokeWidth={Math.max(12, strokeWidth * 0.75)} />
        </svg>
    );
};
