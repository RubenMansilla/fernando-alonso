import React, { useRef, useLayoutEffect } from 'react';
import './LegacySection.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const LegacySection = () => {
    const sectionRef = useRef(null);

    return (
        <section ref={sectionRef} className="legacy-section">
            <div className="legacy-content">
                <div className="legacy-line">
                    <span className="font-serif color-green">REDEFINING</span>
                    <span className="font-sans color-white"> LIMITS,</span>
                </div>
                <div className="legacy-line">
                    <span className="font-sans color-white">FIGHTING FOR </span>
                    <span className="font-serif color-green">WINS</span>
                    <span className="font-sans color-white">,</span>
                </div>
                <div className="legacy-line">
                    <span className="font-sans color-white">BRINGING IT ALL IN</span>
                </div>
                <div className="legacy-line">
                    <span className="font-sans color-white">ALL WAYS. DEFINING A</span>
                </div>
                <div className="legacy-line">
                    <span className="font-serif color-green">LEGACY</span>
                    <span className="font-sans color-white"> IN FORMULA 1</span>
                </div>
                <div className="legacy-line">
                    <span className="font-sans color-white">ON AND OFF THE</span>
                </div>
                <div className="legacy-line">
                    <span className="font-sans color-white">TRACK</span>
                </div>
            </div>
        </section>
    );
};

export default LegacySection;
