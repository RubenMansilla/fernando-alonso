import React, { useEffect, useRef } from 'react';
import AnimatedBackground from '../AnimatedBackground/AnimatedBackground';
import './ContentSection.css';

const ContentSection = () => {
    const trackLeftRef = useRef(null);
    const trackRightRef = useRef(null);

    useEffect(() => {
        const updateDurations = () => {
            // Define desired speed in pixels per second
            const SPEED_PX_PER_SEC = 100; // Adjust this number to change global speed

            [trackLeftRef, trackRightRef].forEach(ref => {
                const el = ref.current;
                if (!el) return;

                // Get total width of the track content
                const width = el.scrollWidth;

                // Duration = Distance / Speed
                // Distance is 50% of width (because we translate -50%)
                const distance = width / 2;

                const duration = distance / SPEED_PX_PER_SEC;

                el.style.animationDuration = `${duration}s`;
            });
        };

        // Calculate initially
        updateDurations();

        // Recalculate on resize in case font size changes responsive
        window.addEventListener('resize', updateDurations);
        return () => window.removeEventListener('resize', updateDurations);
    }, []);

    return (
        <section className="content-section">
            <AnimatedBackground
                backgroundColor="#282c20"
                containerPosition="absolute"
                // Filter for "Deep Dark Green" (Verde Oscuro).
                // 1. sepia(1) -> Base.
                // 2. hue-rotate(85deg) -> More Green (less yellow).
                // 3. brightness(0.2) -> Very Dark.
                // 4. saturate(1.5) -> Vivid enough to be seen as green.
                videoFilter="sepia(1) hue-rotate(85deg) saturate(1.5) brightness(0.2) contrast(1.1)"
                videoMixBlendMode="screen" // Light on dark
                videoOpacity={1.0} // Max visibility
                zIndex={0} // Place behind text (z-index of text is auto/0, but text comes later in DOM so should be fine. Or use -1 with isolation)
            />
            <div className="text-row row-left">
                {/* Remove inline style class for duration, handle via JS */}
                <div className="marquee-track left" ref={trackLeftRef}>
                    <span>WE DID IT AT HOME</span>
                    <span>WE DID IT AT HOME</span>
                    <span>WE DID IT AT HOME</span>
                    <span>WE DID IT AT HOME</span>
                    <span>WE DID IT AT HOME</span>
                    <span>WE DID IT AT HOME</span>
                    <span>WE DID IT AT HOME</span>
                    <span>WE DID IT AT HOME</span>
                </div>
            </div>
            <div className="text-row row-right">
                <div className="marquee-track right" ref={trackRightRef}>
                    <span>I WILL REMEMBER FOREVER A BRITISH GP WEEKEND</span>
                    <span>I WILL REMEMBER FOREVER A BRITISH GP WEEKEND</span>
                    <span>I WILL REMEMBER FOREVER A BRITISH GP WEEKEND</span>
                    <span>I WILL REMEMBER FOREVER A BRITISH GP WEEKEND</span>
                    <span>I WILL REMEMBER FOREVER A BRITISH GP WEEKEND</span>
                    <span>I WILL REMEMBER FOREVER A BRITISH GP WEEKEND</span>
                    <span>I WILL REMEMBER FOREVER A BRITISH GP WEEKEND</span>
                    <span>I WILL REMEMBER FOREVER A BRITISH GP WEEKEND</span>
                </div>
            </div>
        </section>
    );
};

export default ContentSection;
