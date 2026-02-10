import React, { useState, useEffect } from "react";
import "./Calendar.css";
import CalendarTable from "../../components/CalendarTable/CalendarTable";
import { TrackDisplay3D } from "../../components/Circuits/TrackDisplay3D";
import { CIRCUIT_MESH_MAP } from "../../components/Circuits/circuitMapping";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { calendarSourceData, LOCATION_TO_KEY } from "../../data/calendarData";

gsap.registerPlugin(ScrollToPlugin);

export default function Calendar() {
    const [selectedCircuit, setSelectedCircuit] = useState(null);
    const visualizerRef = React.useRef(null);
    const hasScrolledRef = React.useRef(false); // Ref to track if we've already done the initial scroll

    useEffect(() => {
        // Find next race
        const today = new Date();
        const currentYear = today.getFullYear();
        const monthMap = {
            "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
            "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
        };

        const nextRace = calendarSourceData.find(race => {
            // race.dates format: "06-08 Mar"
            // We want the END date of the weekend "08 Mar" to see if it has passed
            const parts = race.dates.split(" ");
            if (parts.length < 2) return false;

            const dayRange = parts[0]; // "06-08"
            const monthStr = parts[1]; // "Mar"

            const days = dayRange.split("-");
            const endDay = parseInt(days[days.length - 1], 10);
            const month = monthMap[monthStr];

            // Setup date object for the end of the race weekend
            const raceDate = new Date(currentYear, month, endDay);
            // Add one day to be safe (ensure "today" allows seeing the race on the race day itself)
            raceDate.setHours(23, 59, 59, 999);

            return raceDate >= today;
        });

        if (nextRace) {
            const key = LOCATION_TO_KEY[nextRace.location];
            setSelectedCircuit(key);
            // Note: We intentionally DO NOT scroll automatically on load, as it might be annoying.
            // But if the user requested "the following race... and active", we set the state.
        } else {
            // If season finished, maybe select the last one or first one? Default to first for next year or None.
            // setSelectedCircuit(null);
        }

    }, []);

    const handleCircuitSelect = (key) => {
        setSelectedCircuit(key);
        if (visualizerRef.current) {
            // Scroll to the visualizer with a slower duration (e.g., 1.5 seconds)
            gsap.to(window, {
                duration: 1.5,
                scrollTo: {
                    y: visualizerRef.current,
                    offsetY: window.innerHeight / 2 - visualizerRef.current.offsetHeight / 2
                },
                ease: "power2.inOut"
            });
        }
    };

    return (
        <div className="calendar-page">
            <div className="calendar-hero"></div>
            <div className="track-visualizer" ref={visualizerRef}>
                {selectedCircuit && CIRCUIT_MESH_MAP[selectedCircuit] ? (
                    <TrackDisplay3D meshName={CIRCUIT_MESH_MAP[selectedCircuit]} />
                ) : (
                    <div className="track-placeholder">
                        <p>SELECT A GP TO VIEW TRACK</p>
                    </div>
                )}
            </div>
            <CalendarTable onCircuitSelect={handleCircuitSelect} selectedCircuit={selectedCircuit} />
            <div className="calendar-hero"></div>
        </div>
    );
}
