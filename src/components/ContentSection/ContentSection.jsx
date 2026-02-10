import React, { useEffect, useRef } from 'react';
import './ContentSection.css';

const ContentSection = () => {
    const trackLeftRef = useRef(null);
    const trackRightRef = useRef(null);

    useEffect(() => {
        const updateDurations = () => {
            // Define desired speed in pixels per second
            const SPEED_PX_PER_SEC = 80; // Adjust this number to change global speed

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
            <div className="text-row row-left">
                {/* Remove inline style class for duration, handle via JS */}
                <div className="marquee-track left" ref={trackLeftRef}>
                    <span>NO HAY VICTORIAS SIN SACRIFICIO</span>
                    <span>NO HAY VICTORIAS SIN SACRIFICIO</span>
                    <span>NO HAY VICTORIAS SIN SACRIFICIO</span>
                    <span>NO HAY VICTORIAS SIN SACRIFICIO</span>
                    <span>NO HAY VICTORIAS SIN SACRIFICIO</span>
                    <span>NO HAY VICTORIAS SIN SACRIFICIO</span>
                    <span>NO HAY VICTORIAS SIN SACRIFICIO</span>
                    <span>NO HAY VICTORIAS SIN SACRIFICIO</span>
                </div>
            </div>
            <div className="text-row row-right">
                <div className="marquee-track right" ref={trackRightRef}>
                    <span>LA DISCIPLINA CONSTRUYE CAMPEONES</span>
                    <span>LA DISCIPLINA CONSTRUYE CAMPEONES</span>
                    <span>LA DISCIPLINA CONSTRUYE CAMPEONES</span>
                    <span>LA DISCIPLINA CONSTRUYE CAMPEONES</span>
                    <span>LA DISCIPLINA CONSTRUYE CAMPEONES</span>
                    <span>LA DISCIPLINA CONSTRUYE CAMPEONES</span>
                    <span>LA DISCIPLINA CONSTRUYE CAMPEONES</span>
                    <span>LA DISCIPLINA CONSTRUYE CAMPEONES</span>
                </div>
            </div>
        </section>
    );
};

export default ContentSection;
