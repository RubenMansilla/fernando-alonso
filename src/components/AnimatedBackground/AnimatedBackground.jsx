import React from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
    return (
        <div className="animated-bg">
            <svg viewBox="0 0 1440 1024" preserveAspectRatio="xMidYMid slice">
                <path
                    className="organic-blob"
                    d="M1150.5 450.5C1250 350 1400 300 1440 200V0H800C850 100 900 250 950 350C1000 450 1051 551 1150.5 450.5Z"
                    opacity="0.6"
                >
                </path>

                <path
                    className="organic-blob"
                    d="M-50 800 C 50 700, 200 650, 350 750 S 500 1000, 400 1100 H -50 Z"
                    opacity="0.4"
                    style={{ animationDelay: '-5s', fill: '#eaece5' }}
                />

                <path className="organic-line" d="M-100 400 C 200 300, 400 800, 800 600 S 1200 200, 1500 300">
                    <animate
                        attributeName="d"
                        dur="10s"
                        repeatCount="indefinite"
                        values="M-100 400 C 200 300, 400 800, 800 600 S 1200 200, 1500 300;
                                M-100 450 C 200 400, 400 700, 800 650 S 1200 300, 1500 250;
                                M-100 400 C 200 300, 400 800, 800 600 S 1200 200, 1500 300"
                    />
                </path>

                <path className="organic-line dashed" d="M-100 600 C 300 700, 500 400, 900 500 S 1300 900, 1600 700">
                    <animate
                        attributeName="d"
                        dur="13s"
                        repeatCount="indefinite"
                        values="M-100 600 C 300 700, 500 400, 900 500 S 1300 900, 1600 700;
                                M-100 550 C 300 600, 500 500, 900 450 S 1300 800, 1600 750;
                                M-100 600 C 300 700, 500 400, 900 500 S 1300 900, 1600 700"
                    />
                </path>

                <path className="organic-line" d="M1200 -50 C 1100 200, 1300 500, 1500 600" style={{ opacity: 0.3 }}>
                    <animate
                        attributeName="d"
                        dur="18s"
                        repeatCount="indefinite"
                        values="M1200 -50 C 1100 200, 1300 500, 1500 600;
                                M1250 -50 C 1150 250, 1350 450, 1550 550;
                                M1200 -50 C 1100 200, 1300 500, 1500 600"
                    />
                </path>
            </svg>
        </div>
    );
};

export default AnimatedBackground;
