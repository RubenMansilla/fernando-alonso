import React from 'react';
import './RollingText.css';

const RollingText = ({ text }) => (
    <span className="rolling-text-wrapper">
        {/* Original Text (Front) */}
        <span className="rolling-text-content" aria-hidden="true">
            {text.split('').map((char, index) => (
                <span key={index} className="char" style={{ transitionDelay: `${index * 0.02}s` }}>
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </span>
        {/* Duplicate Text (Back/Hover) */}
        <span className="rolling-text-clone" aria-hidden="true">
            {text.split('').map((char, index) => (
                <span key={index} className="char" style={{ transitionDelay: `${index * 0.02}s` }}>
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </span>
    </span>
);

export default RollingText;
