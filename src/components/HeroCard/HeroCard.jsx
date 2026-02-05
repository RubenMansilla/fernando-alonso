import React, { forwardRef, useImperativeHandle, useState } from 'react';
import LiquidHero from '../LiquidHero/LiquidHero';
import AnimatedBackground from '../AnimatedBackground/AnimatedBackground';
import './HeroCard.css';

const HeroCard = forwardRef((props, ref) => {
    const [disableAnimations, setDisableAnimations] = useState(false);

    useImperativeHandle(ref, () => ({
        setScrolling: (isScrolling) => {
            setDisableAnimations(isScrolling);
        }
    }));

    return (
        <div className="hero-card-container">
            <div className="hero-card-inner">
                <AnimatedBackground />
                <LiquidHero disableAnimations={disableAnimations} />
                <div className="hero-overlay"></div>
            </div>
        </div>
    );
});

export default HeroCard;
