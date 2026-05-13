import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';
import img1 from '../../assets/navbar/navbarImg1.jpg';
import img2 from '../../assets/navbar/navbarImg2.webp';
import img4 from '../../assets/navbar/navbarImg4.avif';
import img5 from '../../assets/navbar/navbarImg5.png';
import laurelHelmet from '../../assets/icon/laurel-helmet.png';

// Función de ayuda para la interpolación (suavizado matemático)
const lerp = (start, end, factor) => {
    return start + (end - start) * factor;
};

// Helper to split text into characters for staggered animation
const RollingText = ({ text }) => (
    <span className="nav-text-wrapper">
        {/* Original Text (Front) */}
        <span className="nav-text" aria-hidden="true">
            {text.split('').map((char, index) => (
                <span key={index} className="char" style={{ transitionDelay: `${index * 0.02}s` }}>
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </span>
        {/* Duplicate Text (Back/Hover) */}
        <span className="nav-text-clone" aria-hidden="true">
            {text.split('').map((char, index) => (
                <span key={index} className="char" style={{ transitionDelay: `${index * 0.02}s` }}>
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </span>
    </span>
);

const Navigation = ({ isOpen, toggleMenu }) => {
    const gridRef = useRef(null);
    const location = useLocation();

    // Usamos refs para guardar valores sin renderizar de nuevo
    const targetY = useRef(0);  // Dónde está el ratón realmente
    const currentY = useRef(0); // Dónde está la animación ahora mismo
    const requestRef = useRef(null); // Para cancelar la animación

    const [activeLink, setActiveLink] = useState('home');
    const [hoveredLink, setHoveredLink] = useState(null);

    // Sync active link with current route
    useEffect(() => {
        const path = location.pathname;
        if (path === '/') setActiveLink('home');
        else if (path === '/career') setActiveLink('trayectoria');
        else if (path === '/honors') setActiveLink('logros');
        else if (path === '/calendar') setActiveLink('calendario');
        else setActiveLink('');
    }, [location]);

    // Determine which image should be highlighted
    const getHighlightClass = (linkName) => {
        // If hovering, highlight the hovered one
        if (hoveredLink) {
            return hoveredLink === linkName ? 'highlight' : '';
        }
        // If not hovering, highlight the active one
        return activeLink === linkName ? 'highlight' : '';
    };

    const handleLinkClick = (linkName) => {
        setActiveLink(linkName);
        if (toggleMenu) toggleMenu();
    };

    useEffect(() => {
        const handleWindowMouseMove = (e) => {
            const { clientY } = e;
            const { innerHeight } = window;
            // Calculamos el objetivo (-1 a 1)
            targetY.current = ((clientY / innerHeight) - 0.5) * 2;
        };

        // Bucle de animación (60 veces por segundo)
        const animate = () => {
            if (gridRef.current) {
                // AQUÍ ESTÁ LA MAGIA:
                // Bajamos el factor a 0.04 para un movimiento más pesado y suave
                const previousY = currentY.current;
                currentY.current = lerp(currentY.current, targetY.current, 0.04);

                // Calculamos la "velocidad" para añadir una ligera rotación
                const velocity = currentY.current - previousY;

                // Aplicamos los valores suavizados al CSS
                gridRef.current.style.setProperty('--mouse-y', currentY.current);
                gridRef.current.style.setProperty('--velocity', velocity);
            }
            requestRef.current = requestAnimationFrame(animate);
        };

        if (isOpen) {
            // Reset positions for "centered" start
            targetY.current = 0;
            currentY.current = 0;
            if (gridRef.current) {
                gridRef.current.style.setProperty('--mouse-y', 0);
                gridRef.current.style.setProperty('--velocity', 0);
            }

            document.body.style.overflow = 'hidden';
            window.addEventListener('mousemove', handleWindowMouseMove);
            requestRef.current = requestAnimationFrame(animate);
        } else {
            // CLOSING: Keep current parallax position, let clip-path hide images
            document.body.style.overflow = '';
            window.removeEventListener('mousemove', handleWindowMouseMove);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('mousemove', handleWindowMouseMove);
            cancelAnimationFrame(requestRef.current);
        };
    }, [isOpen]);

    return (
        <>
            {/* Layer 1: Background Panel (slides down/up) */}
            <div className={`navigation-bg ${isOpen ? 'open' : ''}`}></div>

            {/* Layer 2: Content (fades/reveals independently) */}
            <div className={`navigation-content ${isOpen ? 'open' : ''}`}>
                <div className="nav-column left">
                    <div className="nav-image-grid" ref={gridRef}>
                        <div className={`grid-item item-1 ${getHighlightClass('home')}`}>
                            <img src={img1} alt="Helmet" />
                        </div>
                        <div className={`grid-item item-2 ${getHighlightClass('trayectoria')}`}>
                            <img src={img5} alt="Fernando" />
                        </div>
                        <div className={`grid-item item-3 ${getHighlightClass('logros')}`}>
                            <img src={img4} alt="Profile" style={{ transform: 'scaleX(-1)' }} />
                        </div>
                        <div className={`grid-item item-4 ${getHighlightClass('calendario')}`}>
                            <img src={img2} alt="Track" />
                        </div>
                    </div>
                </div>
                <div className="nav-column right" >
                    {/* ... INSIDE RENDER ... */}
                    <div className={`nav-menu ${isOpen ? 'open' : ''}`}>
                        <Link to="/"
                            className={`nav-link ${activeLink === 'home' ? 'active' : ''}`}
                            onMouseEnter={() => setHoveredLink('home')}
                            onMouseLeave={() => setHoveredLink(null)}
                            onClick={() => handleLinkClick('home')}
                        >
                            <RollingText text="HOME" />
                            <svg className="nav-line" width="100%" height="100%" viewBox="0 0 412 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 2h73.539c5.858 0 11.47 2.35 15.58 6.525l8.565 8.7a21.863 21.863 0 0 0 15.58 6.525h72.678c6.045 0 11.82-2.503 15.954-6.914l6.485-6.922A21.865 21.865 0 0 1 224.336 3h76.752a21.864 21.864 0 0 1 16.806 7.88l4.362 5.24A21.864 21.864 0 0 0 339.063 24H412" stroke="currentColor" strokeWidth="6" style={{ strokeDasharray: '433.208' }}></path>
                            </svg>
                        </Link>
                        <Link to="/career"
                            className={`nav-link ${activeLink === 'trayectoria' ? 'active' : ''}`}
                            onMouseEnter={() => setHoveredLink('trayectoria')}
                            onMouseLeave={() => setHoveredLink(null)}
                            onClick={() => handleLinkClick('trayectoria')}
                        >
                            <RollingText text="TRAYECTORIA" />
                            <svg className="nav-line" width="100%" height="100%" viewBox="0 0 412 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 2h73.539c5.858 0 11.47 2.35 15.58 6.525l8.565 8.7a21.863 21.863 0 0 0 15.58 6.525h72.678c6.045 0 11.82-2.503 15.954-6.914l6.485-6.922A21.865 21.865 0 0 1 224.336 3h76.752a21.864 21.864 0 0 1 16.806 7.88l4.362 5.24A21.864 21.864 0 0 0 339.063 24H412" stroke="currentColor" strokeWidth="2.28" style={{ strokeDasharray: '433.208' }}></path>
                            </svg>
                        </Link>
                        <Link to="/honors"
                            className={`nav-link ${activeLink === 'logros' ? 'active' : ''}`}
                            onMouseEnter={() => setHoveredLink('logros')}
                            onMouseLeave={() => setHoveredLink(null)}
                            onClick={() => handleLinkClick('logros')}
                        >
                            <RollingText text="LOGROS" />
                            <svg className="nav-line" width="100%" height="100%" viewBox="0 0 412 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 2h73.539c5.858 0 11.47 2.35 15.58 6.525l8.565 8.7a21.863 21.863 0 0 0 15.58 6.525h72.678c6.045 0 11.82-2.503 15.954-6.914l6.485-6.922A21.865 21.865 0 0 1 224.336 3h76.752a21.864 21.864 0 0 1 16.806 7.88l4.362 5.24A21.864 21.864 0 0 0 339.063 24H412" stroke="currentColor" strokeWidth="4" style={{ strokeDasharray: '433.208' }}></path>
                            </svg>
                        </Link>
                        <Link to="/calendar"
                            className={`nav-link ${activeLink === 'calendario' ? 'active' : ''}`}
                            onMouseEnter={() => setHoveredLink('calendario')}
                            onMouseLeave={() => setHoveredLink(null)}
                            onClick={() => handleLinkClick('calendario')}
                        >
                            <RollingText text="CALENDARIO" />
                            <svg className="nav-line" width="100%" height="100%" viewBox="0 0 412 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 2h73.539c5.858 0 11.47 2.35 15.58 6.525l8.565 8.7a21.863 21.863 0 0 0 15.58 6.525h72.678c6.045 0 11.82-2.503 15.954-6.914l6.485-6.922A21.865 21.865 0 0 1 224.336 3h76.752a21.864 21.864 0 0 1 16.806 7.88l4.362 5.24A21.864 21.864 0 0 0 339.063 24H412" stroke="currentColor" strokeWidth="2.5" style={{ strokeDasharray: '433.208' }}></path>
                            </svg>
                        </Link>
                    </div>

                    <div className="nav-footer-center">
                        <div className="laurel-icon">
                            <img src={laurelHelmet} alt="Laurel Helmet" />
                        </div>
                        <span className="footer-tagline">
                            <span className="reveal-text">ASTON MARTIN F1 TEAM</span>
                            <span className="reveal-block"></span>
                        </span>
                    </div>

                    <div className="nav-footer-bottom">
                        <a href="#" className="business-link">
                            <span className="reveal-text"><RollingText text="BUSINESS ENQUIRIES" /></span>
                            <span className="reveal-block"></span>
                        </a>
                        <div className="social-links">
                            <a href="https://www.tiktok.com/@fernandoalonso" target="_blank" rel="noopener noreferrer">
                                <span className="reveal-text"><RollingText text="TIKTOK" /></span>
                                <span className="reveal-block"></span>
                            </a>
                            <a href="https://www.instagram.com/fernandoalo_oficial/" target="_blank" rel="noopener noreferrer">
                                <span className="reveal-text"><RollingText text="INSTAGRAM" /></span>
                                <span className="reveal-block"></span>
                            </a>
                            <a href="https://www.youtube.com/channel/UCwvrVuFiKDuZl1AUM-pTKKA" target="_blank" rel="noopener noreferrer">
                                <span className="reveal-text"><RollingText text="YOUTUBE" /></span>
                                <span className="reveal-block"></span>
                            </a>
                            <a href="https://x.com/alo_oficial" target="_blank" rel="noopener noreferrer">
                                <span className="reveal-text"><RollingText text="TWITTER" /></span>
                                <span className="reveal-block"></span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`navigation-header ${isOpen ? 'open' : ''}`}>
                <div className="brand-logo">
                    <span className="fname">
                        <span className="text-full">Fernando</span>
                        <span className="text-short">F</span>
                    </span>
                    <span className="lname">
                        <span className="text-full">Alonso14</span>
                        <span className="text-short">A14</span>
                    </span>
                </div>
                <button className={`btn-menu ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 24 24"><g fill="#1a1a1a" fillRule="evenodd" clipRule="evenodd"><path d="M5.47 5.47a.75.75 0 0 1 1.06 0l12 12a.75.75 0 1 1-1.06 1.06l-12-12a.75.75 0 0 1 0-1.06" /><path d="M18.53 5.47a.75.75 0 0 1 0 1.06l-12 12a.75.75 0 0 1-1.06-1.06l12-12a.75.75 0 0 1 1.06 0" /></g></svg>
                    ) : (
                        <>
                            <span className="bar"></span>
                            <span className="bar short"></span>
                        </>
                    )}
                </button>
            </div>
        </>
    );
};

export default Navigation;