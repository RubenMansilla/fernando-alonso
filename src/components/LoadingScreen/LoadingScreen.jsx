import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './LoadingScreen.css';

const LoadingScreen = ({ onLoadComplete }) => {
    const textRef = useRef(null);
    const labelRef = useRef(null);
    const logoRef = useRef(null);
    const containerRef = useRef(null);
    const [shouldAnimate, setShouldAnimate] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShouldAnimate(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Start with scale 0 (invisible)
        gsap.set(textRef.current, { scale: 0, svgOrigin: "50 50" });
    }, []);

    useEffect(() => {
        if (!shouldAnimate) return;

        const tl = gsap.timeline({
            onComplete: () => onLoadComplete?.(),
        });

        tl.to([labelRef.current, logoRef.current], {
            opacity: 0,
            duration: 0.3,
            ease: "power2.inOut",
        })
            .to(
                textRef.current,
                {
                    scale: 60,
                    duration: 1.3,
                    ease: "power3.inOut",
                    svgOrigin: "50 50",
                },
                "-=0.1"
            )
            // Fade out container
            .to(containerRef.current, { opacity: 0, duration: 0.5 }, "-=1");
    }, [shouldAnimate, onLoadComplete]);

    return (
        <div className="loading-screen" ref={containerRef}>
            <svg
                className="loading-svg"
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <mask id="cutout-mask" maskUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="100" height="100" fill="white" />
                        <g ref={textRef}>
                            <text
                                x="47"
                                y="50"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="mask-text"
                                style={{ letterSpacing: '-0.05em' }}
                            >
                                14
                            </text>
                        </g>
                    </mask>
                </defs>

                <rect x="0" y="0" width="100" height="100" className="bg-rect" mask="url(#cutout-mask)" />
            </svg>

            <div className="logo-centered" ref={logoRef}>
                {/* Placeholder Logo */}
                <span style={{ fontSize: '80px', fontWeight: 'bold' }}>A</span>
            </div>

            <div className="loading-text" ref={labelRef}>
                FERNANDO ALONSO
            </div>
        </div>
    );
};

export default LoadingScreen;
