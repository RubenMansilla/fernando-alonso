// src/components/FanCards/FanCards.jsx
import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./FanCards.css";

import cascoWebp from "../../assets/casco.webp";
import fernandoPng from "../../assets/fernando.png";
import background from "../../assets/background.png";

gsap.registerPlugin(ScrollTrigger);

const cardsData = [
    { id: 1, img: fernandoPng, title: "Monaco", year: "2023" },
    { id: 2, img: cascoWebp, title: "Brazil", year: "2023" },
    { id: 3, img: background, title: "Zandvoort", year: "2023" },
    { id: 4, img: fernandoPng, title: "Qatar", year: "2024" },
    { id: 5, img: cascoWebp, title: "Miami", year: "2024" },
    { id: 6, img: fernandoPng, title: "Silverstone", year: "2024" },
    { id: 7, img: background, title: "Suzuka", year: "2024" },
];


const getResponsiveBase = () => {
    const w = window.innerWidth;

    if (w >= 1024) {
        // 🖥️ DESKTOP
        const s = Math.min(w * 0.33, 420); // Spread dinámico (máx 420)
        return [
            { x: -s, y: 120, r: -17, s: 0.78, z: 1 },
            { x: -s * 0.72, y: 80, r: -12, s: 0.86, z: 2 },
            { x: -s * 0.4, y: 48, r: -7, s: 0.94, z: 3 },
            { x: 0, y: 30, r: 0, s: 1.0, z: 10 },
            { x: s * 0.4, y: 48, r: 7, s: 0.94, z: 3 },
            { x: s * 0.72, y: 80, r: 12, s: 0.86, z: 2 },
            { x: s, y: 120, r: 17, s: 0.78, z: 1 },
        ];
    }

    if (w >= 768) {
        // 📱 TABLET - Más curvatura
        const s = Math.min(w * 0.28, 250);
        return [
            { x: -s, y: 115, r: -22, s: 0.80, z: 1 },
            { x: -s * 0.65, y: 75, r: -15, s: 0.88, z: 2 },
            { x: -s * 0.32, y: 40, r: -8, s: 0.95, z: 3 },
            { x: 0, y: 20, r: 0, s: 1.0, z: 10 },
            { x: s * 0.32, y: 40, r: 8, s: 0.95, z: 3 },
            { x: s * 0.65, y: 75, r: 15, s: 0.88, z: 2 },
            { x: s, y: 115, r: 22, s: 0.80, z: 1 },
        ];
    }

    // 📱 MÓVIL - Curvatura más suave
    const s = Math.min(w * 0.25, 85);
    return [
        { x: -s * 1.4, y: 90, r: -16, s: 0.82, z: 1 },
        { x: -s * 0.9, y: 55, r: -11, s: 0.90, z: 2 },
        { x: -s * 0.45, y: 30, r: -5, s: 0.96, z: 3 },
        { x: 0, y: 18, r: 0, s: 1.0, z: 10 },
        { x: s * 0.45, y: 30, r: 5, s: 0.96, z: 3 },
        { x: s * 0.9, y: 55, r: 11, s: 0.90, z: 2 },
        { x: s * 1.4, y: 90, r: 16, s: 0.82, z: 1 },
    ];
};

export default function FanCards() {
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            let BASE = getResponsiveBase(); // 👈 BASE DINÁMICA
            const els = gsap.utils.toArray(".fan-card");

            const leftExtreme = 0;
            const rightExtreme = BASE.length - 1;
            const isExtreme = (i) => i === leftExtreme || i === rightExtreme;

            let activeIndex = null;
            let leaveTimer = null;

            const killAll = () => {
                gsap.killTweensOf(els);
            };

            const applyPose = (pose, opts = {}) => {
                els.forEach((el, i) => {
                    el.style.zIndex = String(BASE[i]?.z ?? 1);
                });

                gsap.to(els, {
                    duration: opts.duration ?? 0.42,
                    ease: opts.ease ?? "power2.out",
                    overwrite: true,
                    stagger: opts.stagger || {
                        each: 0.04,
                        from: opts.from ?? "center",
                        ease: "power1.out",
                    },
                    x: (i) => pose[i].x,
                    y: (i) => pose[i].y,
                    rotation: (i) => pose[i].r,
                    scale: (i) => pose[i].s,
                    opacity: 1,
                    transformOrigin: "50% 50%",
                });
            };

            const makeHoverPose = (hoverIndex) => {
                const w = window.innerWidth;
                const maxPush = w < 768 ? Math.min(w * 0.15, 55) : Math.min(w * 0.1, 95);

                const falloff = 0.62;
                const biasStrength = 0.9;
                const minSideFactor = 0.55;

                const hoverLift = window.innerWidth < 768 ? 10 : 14;
                const hoverScale = 1.1;

                const edgeNeighborDamp = 0.72;
                const extremeNeighborDamp = 0.45;

                const leftDepth = hoverIndex - leftExtreme;
                const rightDepth = rightExtreme - hoverIndex;
                const totalDepth = Math.max(1, leftDepth + rightDepth);

                const leftShare = leftDepth / totalDepth;
                const rightShare = rightDepth / totalDepth;

                const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

                const leftFactorRaw = 1 - biasStrength * (rightShare - 0.5) * 2;
                const rightFactorRaw = 1 + biasStrength * (rightShare - 0.5) * 2;

                const leftFactor = clamp(leftFactorRaw, minSideFactor, 1.6);
                const rightFactor = clamp(rightFactorRaw, minSideFactor, 1.6);

                return BASE.map((p, j) => {
                    if (j === hoverIndex) {
                        return {
                            ...p,
                            y: p.y - (hoverLift + 18),
                            s: p.s * hoverScale,
                        };
                    }

                    if (isExtreme(j)) return { ...p };

                    const dist = Math.abs(j - hoverIndex);
                    const isRight = j > hoverIndex;
                    const dir = isRight ? 1 : -1;

                    let basePush = maxPush * Math.pow(falloff, dist - 1);
                    const factor = isRight ? rightFactor : leftFactor;

                    const isNearLeftEdge = hoverIndex === 1 && j === 2;
                    const isNearRightEdge =
                        hoverIndex === BASE.length - 2 && j === BASE.length - 3;

                    if (dist === 1 && (isNearLeftEdge || isNearRightEdge)) {
                        basePush *= edgeNeighborDamp;
                    }

                    const isHoverOnLeftExtremeNeighbor =
                        hoverIndex === leftExtreme && j === 1;
                    const isHoverOnRightExtremeNeighbor =
                        hoverIndex === rightExtreme && j === rightExtreme - 1;

                    if (
                        dist === 1 &&
                        (isHoverOnLeftExtremeNeighbor ||
                            isHoverOnRightExtremeNeighbor)
                    ) {
                        basePush *= extremeNeighborDamp;
                    }

                    return {
                        ...p,
                        x: p.x + dir * basePush * factor,
                    };
                });
            };

            // Recalcular BASE en resize
            const onResize = () => {
                BASE = getResponsiveBase();
                killAll();
                applyPose(BASE, { duration: 0 });
            };

            window.addEventListener("resize", onResize);

            // INTRO
            gsap.set(els, { opacity: 0, x: 0, y: 40, rotation: 0, scale: 0.98 });

            gsap.to(els, {
                opacity: 1,
                duration: 0.85,
                ease: "power3.out",
                stagger: 0.06,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 70%",
                    toggleActions: "play none none reverse",
                },
                onComplete: () => applyPose(BASE, { duration: 0.45 }),
            });

            applyPose(BASE, { duration: 0 });

            // HOVER EN TODAS
            const handlers = [];

            els.forEach((el, i) => {
                const onEnter = () => {
                    if (leaveTimer) {
                        clearTimeout(leaveTimer);
                        leaveTimer = null;
                    }

                    activeIndex = i;
                    killAll();

                    applyPose(makeHoverPose(i), {
                        duration: 0.38,
                        from: i,
                        ease: "power2.out",
                        stagger: {
                            each: 0.035,
                            from: i,
                            ease: "power1.out",
                        },
                    });
                };

                const onLeave = () => {
                    leaveTimer = setTimeout(() => {
                        if (activeIndex !== i) return;

                        activeIndex = null;
                        killAll();
                        applyPose(BASE, {
                            duration: 0.34,
                            from: "center",
                            ease: "power2.out",
                            stagger: {
                                each: 0.03,
                                from: "center",
                                ease: "power1.out",
                            },
                        });
                    }, 40);
                };

                el.addEventListener("pointerenter", onEnter);
                el.addEventListener("pointerleave", onLeave);

                handlers.push({ el, onEnter, onLeave });
            });

            return () => {
                window.removeEventListener("resize", onResize);
                if (leaveTimer) clearTimeout(leaveTimer);
                handlers.forEach(({ el, onEnter, onLeave }) => {
                    el.removeEventListener("pointerenter", onEnter);
                    el.removeEventListener("pointerleave", onLeave);
                });
            };
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="fan-cards-section">
            <div className="fan-cards-container" aria-label="Fan cards gallery">
                {cardsData.map((card) => (
                    <div key={card.id} className="fan-card">
                        <div className="fan-card-inner">
                            <img
                                src={card.img}
                                alt={`${card.title} ${card.year}`}
                                className="fan-card-img"
                            />
                            <div className="fan-card-overlay">
                                <h3>{card.title}</h3>
                                <span>{card.year}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
