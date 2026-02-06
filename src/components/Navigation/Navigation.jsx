import React, { useEffect, useRef } from 'react';
import './Navigation.css';
import casco from '../../assets/cascofer.png';
import fernando from '../../assets/fernando.png';
import background from '../../assets/background.png';

const Navigation = ({ isOpen, toggleMenu }) => {
    const gridRef = useRef(null);

    useEffect(() => {
        // Función interna para manejar el movimiento en toda la ventana
        const handleWindowMouseMove = (e) => {
            if (!gridRef.current) return;

            const { clientY } = e;
            const { innerHeight } = window;

            // Calcula valor entre -1 y 1
            const yPos = ((clientY / innerHeight) - 0.5) * 2;

            gridRef.current.style.setProperty('--mouse-y', yPos);
        };

        if (isOpen) {
            // 1. Bloquear scroll
            document.body.style.overflow = 'hidden';

            // 2. Escuchar movimiento en TODA la ventana (incluido el header)
            window.addEventListener('mousemove', handleWindowMouseMove);
        } else {
            document.body.style.overflow = '';
            // Aseguramos limpieza si se cierra
            window.removeEventListener('mousemove', handleWindowMouseMove);
        }

        // Cleanup al desmontar o cambiar isOpen
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('mousemove', handleWindowMouseMove);
        };
    }, [isOpen]);

    return (
        <>
            {/* Sliding Overlay - YA NO necesita onMouseMove aquí */}
            <div className={`navigation-overlay ${isOpen ? 'open' : ''}`}>
                <div className="nav-column left">
                    <div className="nav-image-grid" ref={gridRef}>
                        <div className="grid-item item-1">
                            <img src={background} alt="Helmet" />
                        </div>
                        <div className="grid-item item-2">
                            <img src={background} alt="Fernando" />
                        </div>
                        <div className="grid-item item-3">
                            <img src={background} alt="Profile" style={{ transform: 'scaleX(-1)' }} />
                        </div>
                        <div className="grid-item item-4">
                            <img src={background} alt="Track" />
                        </div>
                    </div>
                </div>
                <div className="nav-column right">
                    {/* Right content (40%) */}
                </div>
            </div>

            {/* Static Header Elements */}
            <div className={`navigation-header ${isOpen ? 'open' : ''}`}>
                <div className="brand-logo">
                    <span className="fname">Fernando</span>
                    <span className="lname">Alonso14</span>
                </div>
                <button className={`btn-menu ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
                    <span className="bar"></span>
                    <span className="bar short"></span>
                </button>
            </div>
        </>
    );
};

export default Navigation;