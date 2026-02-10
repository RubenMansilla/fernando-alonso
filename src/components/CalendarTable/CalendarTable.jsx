import React, { useEffect, useRef, useState } from "react";
import Rive from "@rive-app/react-canvas";
import "./CalendarTable.css";
import { CIRCUIT_COUNTRY } from "../../components/Circuits/circuitMapping";
import { calendarSourceData, LOCATION_TO_KEY, FLAGS } from "../../data/calendarData";
import listTrackBg from "../../assets/placeholder/list-track-bg.svg";

export default function CalendarTable({ onCircuitSelect, selectedCircuit }) {
    const [isHoveringRow, setIsHoveringRow] = useState(false);
    const [hoveredCircuit, setHoveredCircuit] = useState(null); // Track hovered circuit key

    const overlayRef = useRef(null);
    const rafRef = useRef(null);

    // posición objetivo (ratón) y posición actual (inercia)
    const target = useRef({ x: 0, y: 0 });
    const current = useRef({ x: 0, y: 0 });

    const OFFSET_X = 26; // a la derecha del ratón
    const OFFSET_Y = -22; // un poco arriba para que no tape el puntero

    const tick = () => {
        const el = overlayRef.current;
        if (!el) return;

        // inercia suave
        current.current.x += (target.current.x - current.current.x) * 0.15;
        current.current.y += (target.current.y - current.current.y) * 0.15;

        const x = current.current.x;
        const y = current.current.y;

        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        rafRef.current = requestAnimationFrame(tick);
    };


    useEffect(() => {
        if (!isHoveringRow) {
            // al salir del hover, paramos raf (y se ocultará por css)
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            return;
        }

        // arrancar animación si entramos en hover
        if (!rafRef.current) {
            rafRef.current = requestAnimationFrame(tick);
        }

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isHoveringRow]);

    const handleMouseMove = (e) => {
        // solo seguimos el ratón cuando se está haciendo hover en una row
        if (!isHoveringRow) return;
        target.current.x = e.clientX + OFFSET_X;
        target.current.y = e.clientY + OFFSET_Y;
    };

    const [isVisible, setIsVisible] = useState(false);
    const tableRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0, // Trigger as soon as visible
                rootMargin: "0px" // Trigger exactly when entering viewport
            }
        );

        if (tableRef.current) {
            observer.observe(tableRef.current);
        }

        return () => {
            if (tableRef.current) observer.unobserve(tableRef.current);
        };
    }, []);

    return (
        <div
            className={`calendar-table-wrapper ${isVisible ? "is-visible" : ""}`}
            onMouseMove={handleMouseMove}
            ref={tableRef}
        >
            <div
                className="calendar-container"
            >
                <div
                    ref={overlayRef}
                    className={`calendar-hover-overlay ${isHoveringRow ? "is-visible" : ""}`}
                    aria-hidden="true"
                >
                    <div className="hover-circuit-card">
                        <img
                            src={listTrackBg}
                            alt=""
                            className="calendar-hover-overlay-img"
                            draggable="false"
                        />

                        {/* RIVE ANIMATION */}
                        {hoveredCircuit && (
                            <div className="calendar-hover-rive-container">
                                <Rive
                                    key={hoveredCircuit}
                                    src="/rive/circuits.riv"
                                    artboard="circuits"
                                    animations={["color_black", "rotations", hoveredCircuit]}
                                    autoplay={true}
                                />
                            </div>
                        )}

                        {/* TEXTO ENCIMA DEL HUECO */}
                        <span className="hover-circuit-label">CIRCUITO</span>
                    </div>
                </div>


                {/* Header */}
                <div className="calendar-grid calendar-header" role="row">
                    <div className="cell cell-round" role="columnheader">
                        <span className="header-text">RONDA</span>
                    </div>
                    <div className="cell cell-location" role="columnheader">
                        <span className="header-text">UBICACIÓN</span>
                    </div>
                    <div className="cell cell-when" role="columnheader">
                        <span className="header-text">CUANDO</span>
                    </div>
                    <div className="cell cell-laps" role="columnheader">
                        <span className="header-text">VUELTAS</span>
                    </div>
                    <div className="cell cell-distance" role="columnheader">
                        <span className="header-text">DISTANCIA</span>
                    </div>
                </div>

                {/* Rows */}
                <div
                    className="calendar-body"
                    role="rowgroup"
                >
                    {calendarSourceData.map((race, index) => {
                        const key = LOCATION_TO_KEY[race.location];
                        const displayName = key && CIRCUIT_COUNTRY[key] ? CIRCUIT_COUNTRY[key] : race.location;
                        const flagSrc = key && FLAGS[key] ? FLAGS[key] : null;

                        return (
                            <div
                                className={`calendar-grid calendar-row ${selectedCircuit === key ? "active" : ""}`}
                                role="row"
                                key={race.round}
                                style={{ "--row-index": index, cursor: "pointer" }}
                                onClick={() => onCircuitSelect && onCircuitSelect(key)}
                                onMouseEnter={() => {
                                    setIsHoveringRow(true);
                                    setHoveredCircuit(key);
                                }}
                                onMouseLeave={() => {
                                    setIsHoveringRow(false);
                                    setHoveredCircuit(null);
                                }}
                            >
                                <div className="cell cell-round" role="cell">
                                    {race.round}
                                </div>

                                <div className="cell cell-location" role="cell">
                                    {displayName}
                                    {flagSrc && <img src={flagSrc} alt={`${race.location} flag`} className="flag-icon" />}
                                </div>

                                <div className="cell cell-when" role="cell">
                                    {race.dates.toUpperCase()}
                                </div>
                                <div className="cell cell-laps" role="cell">
                                    {race.laps}
                                </div>

                                <div className="cell cell-distance" role="cell">
                                    {race.distance}
                                    <span className="unit">KM</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
