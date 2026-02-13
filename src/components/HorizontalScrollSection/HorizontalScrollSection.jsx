import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./HorizontalScrollSection.css";

import media1 from "../../assets/social/media-1.jpg";
import media2 from "../../assets/social/media-2.jpg";
import media3 from "../../assets/social/media-3.jpg";
import media4 from "../../assets/social/media-4.jpg";
import media5 from "../../assets/social/media-5.jpg";
import media6 from "../../assets/social/media-6.jpg";
import media7 from "../../assets/social/media-7.jpg";

gsap.registerPlugin(ScrollTrigger);

const images = [media1, media2, media3, media4, media5, media6, media7];

export default function HorizontalScrollSection() {
    const sectionRef = useRef(null);
    const trackRef = useRef(null);
    const overlayRef = useRef(null);

    useLayoutEffect(() => {
        const track = trackRef.current;
        const section = sectionRef.current;
        const overlay = overlayRef.current;
        if (!track || !section || !overlay) return;

        const raf = requestAnimationFrame(() => {
            const getScrollAmount = () => track.scrollWidth - window.innerWidth;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: () => "+=" + getScrollAmount(),
                    pin: true,
                    scrub: 0.6,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            });

            // Track slides left (entire duration)
            tl.to(track, { x: () => -getScrollAmount(), duration: 1, ease: "none" }, 0);

            // Overlay #f0f1eb fades in gradually (AnimatedBackground fades away)
            tl.to(overlay, { opacity: 1, duration: 1, ease: "none" }, 0);

            section._hsTl = tl;
        });

        return () => {
            cancelAnimationFrame(raf);
            if (section._hsTl) {
                section._hsTl.scrollTrigger?.kill();
                section._hsTl.kill();
            }
        };
    }, []);

    return (
        <section ref={sectionRef} className="hs-section">
            {/* Overlay that fades in over AnimatedBackground */}
            <div ref={overlayRef} className="hs-overlay" />
            {/* Image track */}
            <div ref={trackRef} className="hs-track">
                {images.map((src, i) => (
                    <div key={i} className="hs-panel">
                        <img src={src} alt={`Gallery ${i + 1}`} />
                    </div>
                ))}
            </div>
        </section>
    );
}
