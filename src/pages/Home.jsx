import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroCard from '../components/HeroCard/HeroCard';
import ContentSection from '../components/ContentSection/ContentSection';
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
                    opacity: 1, // Full opacity for multiply blend mode
                    ease: "power2.inOut"
                }, "<");

                // Hide the animated blobs/lines (now videos) so they don't show through the tint
                tl.to(".bg-video-wrapper", {
                    opacity: 0,
                    ease: "power2.inOut"
                }, "<");

                // Change background color of animated-bg
                tl.to(".animated-bg", {
                    backgroundColor: "#494d40",
                    ease: "power2.inOut"
                }, "<");

                // Reduce baseImg opacity (but keep visible)
                tl.to("#baseImg", {
                    opacity: 0.4,
                    ease: "power2.inOut"
                }, "<");


                // Header Color Transition (Desktop)
                // Select elements globally because Header is outside this component's scope
                // Duration 0.05 at position 0 ensures immediate change on first scroll
                const brandLogo = document.querySelector(".brand-logo");
                const btnMenu = document.querySelector(".btn-menu");
                const menuBars = document.querySelectorAll(".btn-menu .bar");

                if (brandLogo) tl.to(brandLogo, { color: "#e9eae4", duration: 0.2, ease: "none" }, 0);
                if (btnMenu) tl.to(btnMenu, { borderColor: "#e9eae4", duration: 0.2, ease: "none" }, 0);
                if (menuBars.length) tl.to(menuBars, { backgroundColor: "#e9eae4", duration: 0.2, ease: "none" }, 0);

                // Scrollbar Color Transition (Dark -> Lighter Grey)
                // "First scroll" effect: Rapid transition to #8f8f91
                tl.fromTo(document.body,
                    { "--sb-thumb-color": "#414142" },
                    { "--sb-thumb-color": "#aba9af", duration: 0.15, ease: "none" },
                    0
                );
            });

            // 2. Mobile/Tablet Portrait (Vertical Screens)
            // Goal: A horizontal card in a vertical screen.
            // Width: 90% of screen (almost full width)
            // Height: 16:9 ratio of THAT width (creates a horizontal bar)
            mm.add("(max-width: 799px)", () => {
                const tl = gsap.timeline({ scrollTrigger: scrollConfig });

                // FIXED: Explicit start/end for mobile too
                tl.fromTo(heroAnimRef.current,
                    { width: "100vw", height: "100vh" },
                    {
                        width: "80vw",
                        height: "55vw", // Strictly 16:9 of 80vw
                        ease: "none",
                    }
                );


                // Header Color Transition (Mobile)
                const brandLogoM = document.querySelector(".brand-logo");
                const btnMenuM = document.querySelector(".btn-menu");
                const menuBarsM = document.querySelectorAll(".btn-menu .bar");

                if (brandLogoM) tl.to(brandLogoM, { color: "#e9eae4", duration: 0.05, ease: "none" }, 0);
                if (btnMenuM) tl.to(btnMenuM, { borderColor: "#e9eae4", duration: 0.05, ease: "none" }, 0);
                if (menuBarsM.length) tl.to(menuBarsM, { backgroundColor: "#e9eae4", duration: 0.05, ease: "none" }, 0);

                // Scrollbar Color Transition (Mobile)
                tl.fromTo(document.body,
                    { "--sb-thumb-color": "#414142" },
                    { "--sb-thumb-color": "#8f8f91", duration: 0.15, ease: "none" },
                    0
                );

                // Zoom effect for mobile
                tl.to(".hero-card-inner", {
                    scale: 1.3,
                    ease: "power2.inOut"
                }, "<");

                // Tint Overlay for mobile
                tl.to(".hero-overlay", {
                    opacity: 1,
                    ease: "power2.inOut"
                }, "<");

                // Hide blobs (videos) on mobile too
                tl.to(".bg-video-wrapper", {
                    opacity: 0,
                    ease: "power2.inOut"
                }, "<");

                // Change background color of animated-bg (Mobile)
                tl.to(".animated-bg", {
                    backgroundColor: "#494d40",
                    ease: "power2.inOut"
                }, "<");

                // Reduce baseImg opacity (Mobile)
                tl.to("#baseImg", {
                    opacity: 0.3,
                    ease: "power2.inOut"
                }, "<");

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
                    // Force initial state to clear any lingering styles?
                    // No, keeping it 100% full screen initially
                }}>
                    <HeroCard ref={heroLogicRef} />
                </div>
            </div>
        </main>
    );
};

export default Home;
