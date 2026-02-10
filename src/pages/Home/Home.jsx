import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroCard from '../../components/HeroCard/HeroCard';
import ContentSection from '../../components/ContentSection/ContentSection';
import LegacySection from '../../components/LegacySection/LegacySection';
import FanCards from '../../components/FanCards/FanCards';
import SignatureSVG from '../../components/SignatureSVG/SignatureSVG';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
    const mainRef = useRef(null);
    const heroWrapperRef = useRef(null);
    const heroAnimRef = useRef(null);
    const heroLogicRef = useRef(null);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            // Common Scroll config
            const scrollConfig = {
                trigger: heroWrapperRef.current,
                start: "top top",
                end: "+=200%",
                scrub: 1,
                pin: true,
                invalidateOnRefresh: true, // Force recalculation on resize
                onUpdate: (self) => {
                    if (heroLogicRef.current) {
                        // Keep animations active until almost fully scrolled (0.9)
                        // This allows the user to play with the reveal while the card shrinks
                        const shouldDisable = self.progress > 0.45;
                        heroLogicRef.current.setScrolling(shouldDisable);
                    }
                    // Toggle header scrolled class
                    const header = document.querySelector(".main-header");
                    if (header) {
                        if (self.progress > 0.01) {
                            header.classList.add("scrolled");
                        } else {
                            header.classList.remove("scrolled");
                        }
                    }
                }
            };

            // 1. Desktop Condition (Standard Landscape)
            mm.add("(min-width: 800px)", () => {
                const tl = gsap.timeline({ scrollTrigger: scrollConfig });

                // Target: 35% of screen width
                // Height: 16:9 ratio of that width
                // We use standard units to let CSS handle it if possible, but force aspect ratio via vw 
                // FIXED: Explicit start/end states to prevent jumps. Linear ease for direct control.
                tl.fromTo(heroAnimRef.current,
                    { width: "100vw", height: "100vh" },
                    {
                        width: "35vw",
                        height: "22vw", // Strictly 16:9 of 32vw
                        ease: "none",
                    }
                );

                // Zoom effect: Scale UP the inner content
                tl.to(".hero-card-inner", {
                    scale: 1.5,
                    opacity: 1,
                    ease: "power2.inOut"
                }, "<");

                // Tint Overlay: Darken the WHOLE card (including face) with #494d40
                tl.to(".hero-overlay", {
                    opacity: 0.8,
                    ease: "power2.inOut"
                }, "<");

                // Hide the animated blobs/lines (now videos) so they don't show through the tint
                tl.to(".hero-card-inner .bg-video-wrapper", {
                    opacity: 0,
                    ease: "power2.inOut"
                }, "<");

                // Change background color of animated-bg
                tl.to(".hero-card-inner .animated-bg", {
                    backgroundColor: "#0058bdff", // Muted slate blue
                    ease: "power2.inOut"
                }, "<");

                // Reduce baseImg opacity (but keep visible)
                tl.to("#baseImg", {
                    opacity: 0.5,
                    ease: "power2.inOut"
                }, "<");

                // Transition GLOBAL background to ContentSection Blue (#0090D0)
                // This ensures that as user scrolls down and Hero shrinks, the background becomes ContentSection's color
                tl.to(".global-bg", {
                    backgroundColor: "#0090D0",
                    filter: "sepia(1) hue-rotate(190deg) saturate(2) brightness(0.6) contrast(1.1)", // Brighter for ContentSection
                    ease: "power2.inOut"
                }, "<");




                // Scrollbar Color Transition (Dark -> Lighter Grey)
                // "First scroll" effect: Rapid transition to #8f8f91
                tl.fromTo(document.body,
                    { "--sb-thumb-color": "#414142" },
                    { "--sb-thumb-color": "#aba9af", duration: 0.15, ease: "none" },
                    0
                );

                // SVG Signature Animation
                // Matches the end of the scroll exactly.
                // Starts at 70% of the timeline (0.35s / 0.5s)
                // Stroke continues until the very end to avoid dead scroll
                tl.fromTo(".sig-path",
                    { strokeDashoffset: 1 },
                    { strokeDashoffset: 0, ease: "none", duration: 0.15 },
                    0.35
                );

                // Fill Animation (Fade in during the last part of stroke)
                // Overlaps significantly to ensure no dead space
                tl.to(".sig-path", {
                    fillOpacity: 1,
                    duration: 0.05,
                    ease: "power2.inOut"
                }, ">-0.05"); // Starts at 90% of scroll
            });

            // 2. Tablet Portrait (500px - 799px)
            mm.add("(min-width: 500px) and (max-width: 799px)", () => {
                const tl = gsap.timeline({ scrollTrigger: scrollConfig });

                tl.fromTo(heroAnimRef.current,
                    { width: "100vw", height: "100vh" },
                    {
                        width: "50vw",
                        height: "30vw",
                        ease: "none",
                    }
                );

                tl.fromTo(document.body,
                    { "--sb-thumb-color": "#414142" },
                    { "--sb-thumb-color": "#8f8f91", duration: 0.15, ease: "none" },
                    0
                );

                tl.to(".hero-card-inner", {
                    scale: 1.3,
                    ease: "power2.inOut"
                }, "<");

                tl.to(".hero-overlay", {
                    opacity: 0.8,
                    ease: "power2.inOut"
                }, "<");

                tl.to(".hero-card-inner .bg-video-wrapper", {
                    opacity: 0,
                    ease: "power2.inOut"
                }, "<");

                tl.to(".hero-card-inner .animated-bg", {
                    backgroundColor: "#365063",
                    ease: "power2.inOut"
                }, "<");

                tl.to("#baseImg", {
                    opacity: 0.3,
                    ease: "power2.inOut"
                }, "<");

                // SVG Signature Animation (Tablet)
                // Stroke continues until the very end to avoid dead scroll
                tl.fromTo(".sig-path",
                    { strokeDashoffset: 1 },
                    { strokeDashoffset: 0, ease: "none", duration: 0.15 },
                    0.35
                );

                // Fill Animation (Fade in during the last part of stroke)
                tl.to(".sig-path", {
                    fillOpacity: 1,
                    duration: 0.05,
                    ease: "power2.inOut"
                }, ">-0.05"); // Starts at 90% of scroll
            });

            // 3. Mobile (menos de 500px) - HeroCard más grande
            mm.add("(max-width: 499px)", () => {
                const tl = gsap.timeline({ scrollTrigger: scrollConfig });

                tl.fromTo(heroAnimRef.current,
                    { width: "100vw", height: "100vh" },
                    {
                        width: "75vw",
                        height: "90vw", // Más grande en móvil
                        ease: "none",
                    }
                );

                tl.fromTo(document.body,
                    { "--sb-thumb-color": "#414142" },
                    { "--sb-thumb-color": "#8f8f91", duration: 0.15, ease: "none" },
                    0
                );

                tl.to(".hero-card-inner", {
                    scale: 1.3,
                    ease: "power2.inOut"
                }, "<");

                tl.to(".hero-overlay", {
                    opacity: 0.8,
                    ease: "power2.inOut"
                }, "<");

                tl.to(".hero-card-inner .bg-video-wrapper", {
                    opacity: 0,
                    ease: "power2.inOut"
                }, "<");

                tl.to(".hero-card-inner .animated-bg", {
                    backgroundColor: "#365063",
                    ease: "power2.inOut"
                }, "<");

                tl.to("#baseImg", {
                    opacity: 0.3,
                    ease: "power2.inOut"
                }, "<");

                // SVG Signature Animation (Mobile)
                // Stroke continues until the very end to avoid dead scroll
                tl.fromTo(".sig-path",
                    { strokeDashoffset: 1 },
                    { strokeDashoffset: 0, ease: "none", duration: 0.15 },
                    0.35
                );

                // Fill Animation (Fade in during the last part of stroke)
                tl.to(".sig-path", {
                    fillOpacity: 1,
                    duration: 0.05,
                    ease: "power2.inOut"
                }, ">-0.05"); // Starts at 90% of scroll
            });

            // --- Separate Trigger for LegacySection ---
            // When LegacySection enters viewport, change background to Dark (#0e2640 or #1a1a1a)
            // Target ONLY .global-bg to avoid affecting HeroCard's local background
            ScrollTrigger.create({
                trigger: ".legacy-section",
                start: "top 80%", // Start changing when top of section is 80% down viewport
                end: "top 20%",
                scrub: true,
                onEnter: () => {
                    // Animate to Dark
                    gsap.to(".global-bg", {
                        backgroundColor: "#0e2640",
                        filter: "sepia(1) hue-rotate(190deg) saturate(2) brightness(0.2) contrast(1.1)",
                        duration: 0.5
                    });
                },
                onLeaveBack: () => {
                    // Animate back to Blue (ContentSection)
                    gsap.to(".global-bg", {
                        backgroundColor: "#0090D0",
                        filter: "sepia(1) hue-rotate(190deg) saturate(2) brightness(0.6) contrast(1.1)",
                        duration: 0.5
                    });
                }
            });

        }, mainRef);

        return () => ctx.revert();
    }, []);

    return (
        <main ref={mainRef} className="home-container">
            {/* Wrapper pinned */}
            <div ref={heroWrapperRef} className="hero-wrapper" style={{
                height: '100vh',
                width: '100%',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Layer */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1
                }}>
                    <ContentSection />
                </div>

                {/* Signature SVG Layer - Above HeroCard */}
                <SignatureSVG />

                {/* Foreground Card Layer */}
                <div ref={heroAnimRef} className="hero-card-animatable" style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                    overflow: 'hidden',
                }}>
                    <HeroCard ref={heroLogicRef} />
                </div>
            </div>
            <LegacySection />
            <FanCards />
        </main>
    );
};

export default Home;
