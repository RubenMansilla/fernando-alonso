import React, { useRef, useState, useEffect } from 'react';

// Asegúrate de que estas rutas sigan siendo correctas en tu proyecto
import videoForwardSrc from '../../assets/video/video-topografia.mp4';
import videoReverseSrc from '../../assets/video/video-topografia-reverse.mp4';

const AnimatedBackground = () => {
    const videoForwardRef = useRef(null);
    const videoReverseRef = useRef(null);
    const [activeVideo, setActiveVideo] = useState('forward');

    // CONFIGURACIÓN DE COLORES
    const desiredBackgroundColor = "#F9F9F4";

    // MANEJO DEL BUCLE (Loop)
    const handleForwardEnded = () => {
        const reverseVideo = videoReverseRef.current;
        const forwardVideo = videoForwardRef.current;
        if (reverseVideo && forwardVideo) {
            reverseVideo.currentTime = 0;
            reverseVideo.play();
            setActiveVideo('reverse');
            forwardVideo.pause();
        }
    };

    const handleReverseEnded = () => {
        const reverseVideo = videoReverseRef.current;
        const forwardVideo = videoForwardRef.current;
        if (forwardVideo && reverseVideo) {
            forwardVideo.currentTime = 0;
            forwardVideo.play();
            setActiveVideo('forward');
            reverseVideo.pause();
        }
    };

    // --- AQUÍ ESTÁ EL CAMBIO DE COLOR ---
    const commonVideoStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',

        // 1. invert(1): Convierte líneas blancas en negras.
        // 2. contrast(1.2): Asegura que el negro sea puro para que el color sea constante.
        filter: 'invert(1) contrast(1.2)',

        // 3. multiply: Elimina lo blanco y deja lo oscuro (las líneas).
        mixBlendMode: 'multiply',

        // 4. opacity 0.15: AQUÍ ESTÁ LA CLAVE DEL COLOR #e9e9df
        // Al poner líneas negras al 15% de opacidad sobre tu fondo beige,
        // se crea visualmente el tono #e9e9df (gris piedra claro).
        // - Si lo quieres más claro: baja a 0.1
        // - Si lo quieres más oscuro: sube a 0.2
        opacity: 0.15,

        transition: 'opacity 0.1s linear',
    };

    const styles = {
        container: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            zIndex: -1,
            overflow: 'hidden',
            backgroundColor: desiredBackgroundColor,
        },
        videoForward: {
            ...commonVideoStyle,
            opacity: activeVideo === 'forward' ? 0.15 : 0, // Usamos la misma opacidad definida arriba
            zIndex: 1,
        },
        videoReverse: {
            ...commonVideoStyle,
            opacity: activeVideo === 'reverse' ? 0.15 : 0,
            zIndex: 1,
        }
    };

    return (
        <div style={styles.container}>
            <video
                ref={videoForwardRef}
                autoPlay
                muted
                playsInline
                preload="auto"
                onEnded={handleForwardEnded}
                style={styles.videoForward}
            >
                <source src={videoForwardSrc} type="video/mp4" />
            </video>

            <video
                ref={videoReverseRef}
                muted
                playsInline
                preload="auto"
                onEnded={handleReverseEnded}
                style={styles.videoReverse}
            >
                <source src={videoReverseSrc} type="video/mp4" />
            </video>
        </div>
    );
};

export default AnimatedBackground;