import React, { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

gsap.registerPlugin(DrawSVGPlugin, MorphSVGPlugin);

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

    // --- Animation refs ---
    const outlineRef = useRef<SVGRectElement>(null);
    const mouthRef = useRef<SVGPathElement>(null);
    const leftEyeRef = useRef<SVGRectElement>(null);
    const rightEyeRef = useRef<SVGRectElement>(null);
    const logoRef = useRef<SVGSVGElement>(null);

    // --- Morph path for mouth (smile <-> surprised) ---
    const mouthSmile = "M156 152a53 53 0 0 1-56 0";
    const mouthSurprised = "M128 152a20 20 0 1 1 0.1 0z"; // circle-like

    // --- Animation pool ---
    const animations = [
        // Draw mouth
        () => {
            if (mouthRef.current) {
                gsap.fromTo(
                    mouthRef.current,
                    { drawSVG: "0% 0%" },
                    { drawSVG: "0% 100%", duration: 1, ease: "power2.inOut" }
                );
            }
        },
        // Morph mouth
        () => {
            if (mouthRef.current) {
                gsap.to(mouthRef.current, {
                    duration: 0.7,
                    morphSVG: { shape: mouthSurprised },
                    yoyo: true,
                    repeat: 1,
                    ease: "power1.inOut"
                });
            }
        },
        // Eyes blink
        () => {
            if (leftEyeRef.current && rightEyeRef.current) {
                gsap.to([leftEyeRef.current, rightEyeRef.current], {
                    duration: 0.2,
                    scaleY: 0.1,
                    transformOrigin: "50% 50%",
                    yoyo: true,
                    repeat: 1,
                    ease: "power1.inOut"
                });
            }
        },
        // Head shake (rotate left-right for 'no' gesture)
        () => {
            if (logoRef.current) {
                gsap.fromTo(
                    logoRef.current,
                    { rotate: 0 },
                    {
                        rotate: -15, duration: 0.1, yoyo: true, repeat: 5, ease: "power1.inOut", onComplete: () => {
                            gsap.to(logoRef.current, { rotate: 0, duration: 0.1 });
                        }
                    }
                );
            }
        },
        // Eyebrow wiggle/raise
        () => {
            if (leftBrowRef.current && rightBrowRef.current) {
                gsap.to([leftBrowRef.current, rightBrowRef.current], {
                    duration: 0.15,
                    y: -8,
                    yoyo: true,
                    repeat: 1,
                    ease: "power1.inOut",
                    onComplete: () => {
                        gsap.to([leftBrowRef.current, rightBrowRef.current], { y: 0, duration: 0.1 });
                    }
                });
            }
        },
        // Eye movement (look left/right)
        () => {
            if (leftEyeRef.current && rightEyeRef.current) {
                gsap.to([leftEyeRef.current, rightEyeRef.current], {
                    duration: 0.2,
                    x: 10,
                    yoyo: true,
                    repeat: 1,
                    ease: "power1.inOut",
                    onComplete: () => {
                        gsap.to([leftEyeRef.current, rightEyeRef.current], { x: 0, duration: 0.1 });
                    }
                });
            }
        },
        // Sequential: blink, then mouth morph, then head shake
        () => {
            if (leftEyeRef.current && rightEyeRef.current && mouthRef.current && logoRef.current) {
                const tl = gsap.timeline();
                tl.to([leftEyeRef.current, rightEyeRef.current], {
                    duration: 0.15,
                    scaleY: 0.1,
                    transformOrigin: "50% 50%",
                    yoyo: true,
                    repeat: 1,
                    ease: "power1.inOut"
                })
                    .to(mouthRef.current, {
                        duration: 0.5,
                        morphSVG: { shape: mouthSurprised },
                        yoyo: true,
                        repeat: 1,
                        ease: "power1.inOut"
                    }, ">-0.1")
                    .fromTo(
                        logoRef.current,
                        { rotate: 0 },
                        {
                            rotate: 15, duration: 0.1, yoyo: true, repeat: 5, ease: "power1.inOut", onComplete: () => {
                                gsap.to(logoRef.current, { rotate: 0, duration: 0.1 });
                            }
                        }
                        , ">-0.1");
            }
        }
    ];

    // --- Add refs for eyebrows ---
    const leftBrowRef = useRef<SVGPathElement>(null);
    const rightBrowRef = useRef<SVGPathElement>(null);

    // --- Random animation trigger ---
    const playRandomAnimation = useCallback(() => {
        const idx = Math.floor(Math.random() * animations.length);
        animations[idx]();
    }, []);

    // --- Idle animation interval ref ---
    const idleIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const IDLE_INTERVAL = 15000; // 15 seconds

    // --- Helper to start idle interval ---
    const startIdleInterval = useCallback(() => {
        if (idleIntervalRef.current) clearInterval(idleIntervalRef.current);
        idleIntervalRef.current = setInterval(() => {
            playRandomAnimation();
        }, IDLE_INTERVAL);
    }, [playRandomAnimation]);

    // --- On mount: play animation and start interval ---
    useEffect(() => {
        playRandomAnimation();
        startIdleInterval();
        return () => {
            if (idleIntervalRef.current) clearInterval(idleIntervalRef.current);
        };
    }, [playRandomAnimation, startIdleInterval]);

    // --- On hover/click handlers: play animation and reset interval ---
    const handleUserInteraction = () => {
        if (idleIntervalRef.current) clearInterval(idleIntervalRef.current);
        playRandomAnimation();
        startIdleInterval();
    };

    return (
        <svg
            ref={logoRef}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            className={className}
            width={size}
            height={size}
            fill="currentColor"
            style={{ cursor: 'pointer' }}
            onMouseEnter={handleUserInteraction}
            onClick={handleUserInteraction}
        >
            <path fill="none" d="M0 0h256v256H0z" />
            {/* Main robot head with subtle backgbutt */}
            <rect x="48" y="56" width="160" height="144" opacity={opacity} fill="currentColor" />
            {/* Robot head outline */}
            <rect ref={outlineRef} x="48" y="56" width="160" height="144" fill="none" stroke="currentColor" strokeLinecap="butt" strokeLinejoin="miter" strokeWidth={strokeWidth} />
            {/* Angled eyebrows for expression */}
            <path ref={leftBrowRef} d="M84 92 l12 8" stroke="currentColor" strokeLinecap="butt" strokeWidth={Math.max(4, strokeWidth / 4)} />
            <path ref={rightBrowRef} d="M172 92 l-12 8" stroke="currentColor" strokeLinecap="butt" strokeWidth={Math.max(4, strokeWidth / 4)} />
            {/* Eyes (slightly larger and more expressive) */}
            <rect ref={leftEyeRef} x="86" y="108" width="28" height="20" rx="0" fill="currentColor" />
            <rect ref={rightEyeRef} x="142" y="108" width="28" height="20" rx="0" fill="currentColor" />
            {/* More expressive open mouth */}
            <path ref={mouthRef} d={mouthSmile} fill="none" stroke="currentColor" strokeLinecap="butt" strokeLinejoin="miter" strokeWidth={strokeWidth} />
            {/* Bottom base (simplified) */}
            <path d="M80 200v24h96v-24" fill="none" stroke="currentColor" strokeLinecap="butt" strokeLinejoin="miter" strokeWidth={Math.max(12, strokeWidth * 0.75)} />
        </svg>
    );
};
