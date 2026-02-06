import React, { useEffect, useRef } from 'react';
import './Navigation.css';
import img1 from '../../assets/navbar/navbarImg1.jpg';
import img2 from '../../assets/navbar/navbarImg2.webp';
import img3 from '../../assets/navbar/navbarImg3.jpeg';
import img4 from '../../assets/navbar/navbarImg4.avif';
import img5 from '../../assets/navbar/navbarImg5.png';

// Función de ayuda para la interpolación (suavizado matemático)
const lerp = (start, end, factor) => {
    return start + (end - start) * factor;
};

const Navigation = ({ isOpen, toggleMenu }) => {

    const gridRef = useRef(null);

    // Usamos refs para guardar valores sin renderizar de nuevo
    const targetY = useRef(0);  // Dónde está el ratón realmente
    const currentY = useRef(0); // Dónde está la animación ahora mismo
    const requestRef = useRef(null); // Para cancelar la animación

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
            document.body.style.overflow = 'hidden';
            window.addEventListener('mousemove', handleWindowMouseMove);
            // Iniciamos el bucle
            requestRef.current = requestAnimationFrame(animate);
        } else {
            document.body.style.overflow = '';
            window.removeEventListener('mousemove', handleWindowMouseMove);
            cancelAnimationFrame(requestRef.current);
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('mousemove', handleWindowMouseMove);
            cancelAnimationFrame(requestRef.current);
        };
    }, [isOpen]);

    return (
        <>
            <div className={`navigation-overlay ${isOpen ? 'open' : ''}`}>
                <div className="nav-column left">
                    <div className="nav-image-grid" ref={gridRef}>
                        <div className="grid-item item-1">
                            <img src={img4} alt="Helmet" />
                        </div>
                        <div className="grid-item item-2">
                            <img src={img5} alt="Fernando" />
                        </div>
                        <div className="grid-item item-3">
                            <img src={img4} alt="Profile" style={{ transform: 'scaleX(-1)' }} />
                        </div>
                        <div className="grid-item item-4">
                            <img src={img2} alt="Track" />
                        </div>
                    </div>
                </div>
                <div className="nav-column right"></div>
            </div>

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