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

// ---------- BASE (tu abanico actual) ----------
// ---------- BASE (MISMA DISPOSICIÓN, UN POCO MÁS CURVA) ----------
const BASE = [
    { x: -420, y: 120, r: -17, s: 0.78, z: 1 }, // extremo
    { x: -300, y: 80, r: -12, s: 0.86, z: 2 }, // 2ª (igual)
    { x: -170, y: 48, r: -7, s: 0.94, z: 3 }, // 3ª → BAJADA (antes 40)
    { x: 0, y: 30, r: 0, s: 1.00, z: 10 },// 4ª → LIGERAMENTE BAJA
    { x: 170, y: 48, r: 7, s: 0.94, z: 3 }, // 5ª → BAJADA (antes 40)
    { x: 300, y: 80, r: 12, s: 0.86, z: 2 }, // 6ª (igual)
    { x: 420, y: 120, r: 17, s: 0.78, z: 1 }, // extremo
];


export default function FanCards() {
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const els = gsap.utils.toArray(".fan-card");

            const leftExtreme = 0;
            const rightExtreme = BASE.length - 1;

            const isExtreme = (i) => i === leftExtreme || i === rightExtreme;

            // ---------- Aplicar poses con z-index fijo (NO se rompe el abanico) ----------
            const applyPose = (pose, opts = {}) => {
                els.forEach((el, i) => {
                    el.style.zIndex = String(BASE[i]?.z ?? 1);
                });

                gsap.to(els, {
                    duration: opts.duration ?? 0.24,
                    ease: opts.ease ?? "power3.out",
                    overwrite: "auto",
                    x: (i) => pose[i].x,
                    y: (i) => pose[i].y,
                    rotation: (i) => pose[i].r,
                    scale: (i) => pose[i].s,
                    opacity: 1,
                    transformOrigin: "50% 50%",
                });
            };

            // ---------- GENERADOR DE HOVER (tu lógica final) ----------
            const makeHoverPose = (hoverIndex) => {
                // === TUNING ===
                const maxPush = 95;       // fuerza base
                const falloff = 0.62;     // caída por distancia
                const biasStrength = 0.9; // asimetría por “depth”
                const minSideFactor = 0.55;

                const hoverLift = 8;
                const hoverScale = 1.03;

                // damping específico (hover 2ª → reduce 3ª) y (hover 6ª → reduce 5ª)
                const edgeNeighborDamp = 0.72;

                // ✅ SOLO para: hover en 1ª -> reducir 2ª, hover en 7ª -> reducir 6ª
                const extremeNeighborDamp = 0.45; // (0.35 fuerte, 0.55 suave)

                const leftExtreme = 0;
                const rightExtreme = BASE.length - 1;
                const isExtreme = (i) => i === leftExtreme || i === rightExtreme;

                // Depth (cuántas cartas hay hasta el extremo)
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
                    // extremos nunca se mueven
                    if (isExtreme(j)) return { ...p };

                    // hovered: sutil lift/scale, sin cambiar z-index
                    if (j === hoverIndex) {
                        return { ...p, y: p.y - hoverLift, s: p.s * hoverScale };
                    }

                    const dist = Math.abs(j - hoverIndex);
                    if (dist === 0) return { ...p };

                    const isRight = j > hoverIndex;
                    const dir = isRight ? 1 : -1;

                    // base decay por distancia
                    let basePush = maxPush * Math.pow(falloff, dist - 1);
                    const factor = isRight ? rightFactor : leftFactor;

                    // ---- DAMPING ESPECÍFICO (lo que ya tenías) ----
                    const isNearLeftEdge = hoverIndex === 1 && j === 2; // hover 2ª -> reduce 3ª
                    const isNearRightEdge = hoverIndex === BASE.length - 2 && j === BASE.length - 3; // hover 6ª -> reduce 5ª

                    if (dist === 1 && (isNearLeftEdge || isNearRightEdge)) {
                        basePush *= edgeNeighborDamp;
                    }

                    // ---- ✅ SOLO vecino inmediato cuando hover está en extremos ----
                    const isHoverOnLeftExtremeNeighbor = hoverIndex === leftExtreme && j === 1; // 1ª -> 2ª
                    const isHoverOnRightExtremeNeighbor = hoverIndex === rightExtreme && j === rightExtreme - 1; // 7ª -> 6ª

                    if (dist === 1 && (isHoverOnLeftExtremeNeighbor || isHoverOnRightExtremeNeighbor)) {
                        basePush *= extremeNeighborDamp;
                    }

                    return {
                        ...p,
                        x: p.x + dir * basePush * factor,
                    };
                });
            };


            // ---------- INTRO ----------
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

            // ---------- HOVER EN TODAS ----------
            const handlers = [];

            els.forEach((el, i) => {
                const onEnter = () => applyPose(makeHoverPose(i), { duration: 0.20 });
                const onLeave = () => applyPose(BASE, { duration: 0.22 });

                el.addEventListener("mouseenter", onEnter);
                el.addEventListener("mouseleave", onLeave);

                handlers.push({ el, onEnter, onLeave });
            });

            return () => {
                handlers.forEach(({ el, onEnter, onLeave }) => {
                    el.removeEventListener("mouseenter", onEnter);
                    el.removeEventListener("mouseleave", onLeave);
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
