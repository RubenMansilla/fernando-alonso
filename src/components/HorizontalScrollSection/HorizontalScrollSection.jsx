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

/*  ┌──────────────────────────────────────────────┐
    │  Each card:                                  │
    │   src    – image                             │
    │   label  – title above the image             │
    │   w / h  – CSS width & height of the image   │
    │   align  – vertical position in column:      │
    │            "start" | "center" | "end"         │
    │   text   – optional text below the image     │
    └──────────────────────────────────────────────┘ */
const cards = [
    { src: media1, label: "OVIEDO, 2024", w: "14vw", h: "18vw", align: "start" },
    { src: media2, label: "HIGH PERFORMANCE GALA, 2024", w: "18vw", h: "22vw", align: "end" },
    {
        src: media3, label: "BARCELONA, 2024", w: "424px", h: "424px", align: "start",
        text: "Since I was 3 years old and had my first experience with kart racing, I've worked tirelessly to make that dream come true."
    },
    { src: media4, label: "SILVERSTONE, 2025", w: "16vw", h: "20vw", align: "center" },
    { src: media5, label: "ABU DHABI, 2024", w: "18vw", h: "22vw", align: "end" }, /* Was 22vw, 15vw */
    { src: media6, label: "MONACO, 2024", w: "26vw", h: "32vw", align: "start" }, /* Was 34vh, potentially horizontal */
    { src: media7, label: "SUZUKA, 2025", w: "14vw", h: "18vw", align: "end" },
    { src: media3, label: "MONZA, 2024", w: "20vw", h: "26vw", align: "center" }, /* Was 26vh */
    { src: media1, label: "ASTURIAS, 2023", w: "16vw", h: "20vw", align: "start" },
    { src: media5, label: "JEDDAH, 2025", w: "24vw", h: "30vw", align: "end" }, /* Was 32vh */
    { src: media4, label: "SPA, 2024", w: "18vw", h: "22vw", align: "start" },
    { src: media2, label: "MADRID, 2024", w: "14vw", h: "18vw", align: "center" },
    { src: media6, label: "SINGAPUR, 2024", w: "22vw", h: "28vw", align: "end" }, /* Was 28vh */
    { src: media7, label: "INTERLAGOS, 2025", w: "18vw", h: "24vw", align: "start" },
    { src: media2, label: "IMOLA, 2024", w: "16vw", h: "20vw", align: "end" }, /* Was 20, 16vw */
    { src: media4, label: "BAHRAIN, 2025", w: "24vw", h: "30vw", align: "start" }, /* Was 30vh */
    { src: media1, label: "ZANDVOORT, 2024", w: "14vw", h: "18vw", align: "center" },
    { src: media6, label: "MONTREAL, 2024", w: "18vw", h: "24vw", align: "end" },
];

export default function HorizontalScrollSection() {
    const sectionRef = useRef(null);
    const trackRef = useRef(null);
    const overlayRef = useRef(null);

    useLayoutEffect(() => {
        const track = trackRef.current;
        const section = sectionRef.current;
        const overlay = overlayRef.current;
        if (!track || !section || !overlay) return;

        const isMobile = window.matchMedia("(max-width: 990px)").matches;

        const raf = requestAnimationFrame(() => {
            if (isMobile) {
                /* ── Vertical mode: just animate the overlay color ── */
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom",
                        end: "bottom bottom",
                        scrub: 0.6,
                        invalidateOnRefresh: true,
                    },
                });

                tl.to(overlay, { opacity: 1, duration: 1, ease: "none" }, 0);
                section._hsTl = tl;
            } else {
                /* ── Horizontal mode (original) ── */
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

                tl.to(track, { x: () => -getScrollAmount(), duration: 1, ease: "none" }, 0);
                tl.to(overlay, { opacity: 1, duration: 1, ease: "none" }, 0);
                section._hsTl = tl;
            }
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
            <div ref={overlayRef} className="hs-overlay" />
            <div ref={trackRef} className="hs-track">
                {cards.map((card, i) => (
                    <div
                        key={i}
                        className={`hs-column ${card.text ? "hs-column-text" : ""}`}
                        style={{ justifyContent: card.align === "start" ? "flex-start" : card.align === "end" ? "flex-end" : "center" }}
                    >
                        <div className="hs-card">
                            <span className="hs-card-label">{card.label}</span>
                            <div className="hs-card-img" style={{ width: card.w, height: card.h }}>
                                <img src={card.src} alt={card.label} />
                            </div>
                            {card.text && <p className="hs-card-text">{card.text}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
