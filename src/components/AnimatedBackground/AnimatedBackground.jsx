import React, { useRef, useState, useEffect } from 'react';

// Asegúrate de que estas rutas sigan siendo correctas en tu proyecto
import videoForwardSrc from '../../assets/video/video-topografia.mp4';
import videoReverseSrc from '../../assets/video/video-topografia-reverse.mp4';

const AnimatedBackground = ({
    backgroundColor = "#F9F9F4",
    containerPosition = "fixed",
    videoOpacity = 0.15,
    videoFilter = "invert(1) contrast(1.2)",
    videoMixBlendMode = "multiply",
    zIndex = -1,
    className = ""
}) => {
    const videoForwardRef = useRef(null);
    const videoReverseRef = useRef(null);
    const [activeVideo, setActiveVideo] = useState('forward');

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

        // 1. invert(1): Convierte líneas blancas en negras. (Configurable)
        // 2. contrast(1.2): Asegura que el negro sea puro. (Configurable)
        filter: videoFilter,

        // 3. multiply: Elimina lo blanco y deja lo oscuro. (Configurable)
        mixBlendMode: videoMixBlendMode,

        // 4. opacity: Configurable
        opacity: videoOpacity,

        transition: 'opacity 0.1s linear',
    };

    const styles = {
        container: {
            position: containerPosition,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%', // Changed from 100vh to 100% to fill container if absolute
            minHeight: '100vh', // Ensure at least full screen height
            zIndex: zIndex,
            overflow: 'hidden',
            backgroundColor: backgroundColor,
        },
        wrapper: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
        },
        videoForward: {
            ...commonVideoStyle,
            opacity: activeVideo === 'forward' ? videoOpacity : 0,
            zIndex: 1,
        },
        videoReverse: {
            ...commonVideoStyle,
            opacity: activeVideo === 'reverse' ? videoOpacity : 0,
            zIndex: 1,
        }
    };

    return (
        <div style={styles.container} className={`animated-bg ${className}`}>
            <div className="bg-video-wrapper" style={styles.wrapper}>
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
        </div>
    );
};

export default AnimatedBackground;