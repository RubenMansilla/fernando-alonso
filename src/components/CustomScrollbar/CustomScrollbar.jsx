import React, { useEffect, useState, useRef } from 'react';
import './CustomScrollbar.css';

const CustomScrollbar = () => {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef(null);
    const trackRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            // Calculate scroll percentage
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / totalHeight) * 100;

            // Safety check for short pages
            if (totalHeight <= 0) {
                setScrollProgress(0);
            } else {
                setScrollProgress(progress);
            }

            // Show scrollbar
            setIsVisible(true);

            // Clear existing timeout to keep it visible while scrolling
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Hide after 1 second of inactivity
            timeoutRef.current = setTimeout(() => {
                setIsVisible(false);
            }, 1000);
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div ref={trackRef} className={`custom-scrollbar-track ${isVisible ? 'visible' : ''}`}>
            <div
                className="custom-scrollbar-thumb"
                style={{
                    height: '10vh',
                    transform: `translateY(${trackRef.current ? scrollProgress * (trackRef.current.clientHeight - (window.innerHeight * 0.1)) / 100 : 0}px)`
                }}
            ></div>
        </div>
    );
};

export default CustomScrollbar;
