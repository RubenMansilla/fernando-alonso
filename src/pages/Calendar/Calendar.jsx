import React, { useEffect, useMemo, useRef, useState } from "react";
import Rive from "@rive-app/react-canvas";
import "./Calendar.css";
import { CIRCUIT_COUNTRY } from "../../components/Circuits/circuitMapping";

// ✅ Hover SVG overlay
import listTrackBg from "../../assets/placeholder/list-track-bg.svg";

// Import flags
import flagAbuDabi from "../../assets/flags/flag-Abu-Dabi.svg";
import flagAustralia from "../../assets/flags/flag-Australia.svg";
import flagAustria from "../../assets/flags/flag-Austria.svg";
import flagAzerbaijan from "../../assets/flags/flag-Azerbaijan.svg";
import flagBahrain from "../../assets/flags/flag-Bahrain.svg";
import flagBelgium from "../../assets/flags/flag-Belgium.svg";
import flagBrazil from "../../assets/flags/flag-Brazil.png";
import flagCanada from "../../assets/flags/flag-Canada.svg";
import flagChina from "../../assets/flags/flag-China.svg";
import flagHungary from "../../assets/flags/flag-Hungary.svg";
import flagItaly from "../../assets/flags/flag-Italy.svg";
import flagJapan from "../../assets/flags/flag-Japan.svg";
import flagMexico from "../../assets/flags/flag-Mexico.png";
import flagMonaco from "../../assets/flags/flag-Monaco.svg";
import flagNetherlands from "../../assets/flags/flag-Netherlands.svg";
import flagQatar from "../../assets/flags/flag-Qatar.svg";
import flagSaudiArabia from "../../assets/flags/flag-Saudi-Arabia.svg";
import flagSingapore from "../../assets/flags/flag-Singapore.svg";
import flagSpain from "../../assets/flags/flag-Spain.png";
import flagUK from "../../assets/flags/flag-UK.svg";
import flagUSA from "../../assets/flags/flag-USA.svg";

const calendarSourceData = [
    { round: "01", location: "Australia", dates: "06-08 Mar", laps: 58, distance: "306.124" },
    { round: "02", location: "China", dates: "13-15 Mar", laps: 56, distance: "305.256" },
    { round: "03", location: "Japan", dates: "27-29 Mar", laps: 53, distance: "307.771" },
    { round: "04", location: "Bahrain", dates: "10-12 Apr", laps: 57, distance: "308.484" },
    { round: "05", location: "Saudi Arabia", dates: "17-19 Apr", laps: 50, distance: "308.700" },
    { round: "06", location: "Miami", dates: "01-03 May", laps: 57, distance: "308.484" },
    { round: "07", location: "Canada", dates: "22-24 May", laps: 70, distance: "305.270" },
    { round: "08", location: "Monaco", dates: "05-07 Jun", laps: 78, distance: "260.286" },
    { round: "09", location: "Spain", dates: "12-14 Jun", laps: 66, distance: "307.362" },
    { round: "10", location: "Austria", dates: "26-28 Jun", laps: 71, distance: "306.578" },
    { round: "11", location: "United Kingdom", dates: "03-05 Jul", laps: 52, distance: "306.332" },
    { round: "12", location: "Belgium", dates: "17-19 Jul", laps: 44, distance: "308.176" },
    { round: "13", location: "Hungary", dates: "24-26 Jul", laps: 70, distance: "306.670" },
    { round: "14", location: "Netherlands", dates: "21-23 Aug", laps: 72, distance: "306.648" },
    { round: "15", location: "Italy", dates: "04-06 Sep", laps: 53, distance: "307.029" },
    { round: "16", location: "Spain", dates: "11-13 Sep", laps: 57, distance: "312.018" },
    { round: "17", location: "Azerbaijan", dates: "24-26 Sep", laps: 51, distance: "306.153" },
    { round: "18", location: "Singapore", dates: "09-11 Oct", laps: 62, distance: "306.280" },
    { round: "19", location: "United States", dates: "23-25 Oct", laps: 56, distance: "308.728" },
    { round: "20", location: "Mexico", dates: "30-01 Nov", laps: 71, distance: "305.584" },
    { round: "21", location: "Brazil", dates: "06-08 Nov", laps: 71, distance: "305.939" },
    { round: "22", location: "Las Vegas", dates: "19-21 Nov", laps: 50, distance: "310.050" },
    { round: "23", location: "Qatar", dates: "27-29 Nov", laps: 57, distance: "308.883" },
    { round: "24", location: "Abu Dhabi", dates: "04-06 Dec", laps: 58, distance: "306.298" },
];

const LOCATION_TO_KEY = {
    Australia: "melbourne",
    China: "shanghai",
    Japan: "suzuka",
    Bahrain: "sakhir",
    "Saudi Arabia": "jeddah",
    Miami: "miami",
    Canada: "montreal",
    Monaco: "monaco",
    Spain: "barcelona",
    Austria: "speilberg",
    "United Kingdom": "silverstone",
    Belgium: "spa-francorchamps",
    Hungary: "mogyorod",
    Netherlands: "zandvoort",
    Italy: "monza",
    Azerbaijan: "baku",
    Singapore: "singapore",
    "United States": "austin",
    Mexico: "mexico-city",
    Brazil: "sao-paulo",
    "Las Vegas": "las-vegas",
    Qatar: "lusail",
    "Abu Dhabi": "yas-marina",
};

const FLAGS = {
    melbourne: flagAustralia,
    shanghai: flagChina,
    suzuka: flagJapan,
    sakhir: flagBahrain,
    jeddah: flagSaudiArabia,
    miami: flagUSA,
    montreal: flagCanada,
    monaco: flagMonaco,
    barcelona: flagSpain,
    speilberg: flagAustria,
    silverstone: flagUK,
    "spa-francorchamps": flagBelgium,
    mogyorod: flagHungary,
    zandvoort: flagNetherlands,
    monza: flagItaly,
    baku: flagAzerbaijan,
    singapore: flagSingapore,
    austin: flagUSA,
    "mexico-city": flagMexico,
    "sao-paulo": flagBrazil,
    "las-vegas": flagUSA,
    lusail: flagQatar,
    "yas-marina": flagAbuDabi,
};

export default function Calendar() {
    const [isHoveringRow, setIsHoveringRow] = useState(false);
    const [hoveredCircuit, setHoveredCircuit] = useState(null); // Track hovered circuit key

    const overlayRef = useRef(null);
    const rafRef = useRef(null);

    // posición objetivo (ratón) y posición actual (inercia)
    const target = useRef({ x: 0, y: 0 });
    const current = useRef({ x: 0, y: 0 });

    const OFFSET_X = 26; // a la derecha del ratón
    const OFFSET_Y = -22; // un poco arriba para que no tape el puntero

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    const tick = () => {
        const el = overlayRef.current;
        if (!el) return;

        // inercia suave
        current.current.x += (target.current.x - current.current.x) * 0.15;
        current.current.y += (target.current.y - current.current.y) * 0.15;

        const rect = el.getBoundingClientRect();
        const pad = 12;

        // clamp para que no se salga de la pantalla
        const x = clamp(current.current.x, pad, window.innerWidth - rect.width - pad);
        const y = clamp(current.current.y, pad, window.innerHeight - rect.height - pad);

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

    return (
        <div className="calendar-page" onMouseMove={handleMouseMove}>
            <div className="calendar-container">
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
                        ROUND
                    </div>
                    <div className="cell cell-location" role="columnheader">
                        LOCATION
                    </div>
                    <div className="cell cell-when" role="columnheader">
                        WHEN
                    </div>
                    <div className="cell cell-laps" role="columnheader">
                        LAPS
                    </div>
                    <div className="cell cell-distance" role="columnheader">
                        DISTANCE
                    </div>
                </div>

                {/* Rows */}
                <div className="calendar-body" role="rowgroup">
                    {calendarSourceData.map((race) => {
                        const key = LOCATION_TO_KEY[race.location];
                        const displayName = key && CIRCUIT_COUNTRY[key] ? CIRCUIT_COUNTRY[key] : race.location;
                        const flagSrc = key && FLAGS[key] ? FLAGS[key] : null;

                        return (
                            <div
                                className="calendar-grid calendar-row"
                                role="row"
                                key={race.round}
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
