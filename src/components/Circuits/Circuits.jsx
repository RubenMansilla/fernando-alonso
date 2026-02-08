import React, { useState, useMemo } from "react";
import Rive from "@rive-app/react-canvas";
import { TrackDisplay3D } from "./TrackDisplay3D";
import { CIRCUIT_MESH_MAP } from "./circuitMapping";
import "./Circuits.css";

const EXCLUDE = new Set([
  "idle",
  "hover_on",
  "hover_off",
  "rotations",
  "weight_thin",
  "weight_normal",
  "weight_thick",
  "color_black",
  "color_flouro-green",
]);

const CircuitsGrid = () => {
  const allAnimations = [
    "yas-marina", "lusail", "las-vegas", "sao-paulo", "mexico-city", "austin",
    "singapore", "baku", "monza", "zandvoort", "mogyorod", "spa-francorchamps",
    "speilberg", "montreal", "barcelona", "imola", "melbourne", "shanghai",
    "suzuka", "sakhir", "jeddah", "miami", "monaco", "silverstone"
  ];

  const circuits = useMemo(
    () => allAnimations.filter((n) => !EXCLUDE.has(n)),
    []
  );

  const [selected, setSelected] = useState(circuits[0]);

  return (
    <div className="circuits-container">

      {/* --- 3D VIEWER SECTION --- */}
      <div className="track-viewer-panel" style={{
        height: '400px',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto 40px',
        background: '#1a1a1a',
        borderRadius: '24px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        border: '1px solid #333'
      }}>
        <div style={{ flex: 1, width: '100%', position: 'relative' }}>
          {selected && CIRCUIT_MESH_MAP[selected] ? (
            <TrackDisplay3D meshName={CIRCUIT_MESH_MAP[selected]} />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              Start by selecting a circuit
            </div>
          )}
        </div>
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          padding: '8px 24px',
          borderRadius: '30px',
          border: '1px solid #caff00',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ margin: 0, color: '#caff00', textTransform: 'uppercase', fontSize: '1.2rem', letterSpacing: '2px' }}>
            {selected?.replace(/-/g, ' ')}
          </h2>
        </div>
      </div>

      {/* --- GRID --- */}
      <div className="circuits-grid">
        {circuits.map((name) => (
          <div
            key={name}
            className={`circuit-card ${selected === name ? 'selected' : ''}`}
            onClick={() => setSelected(name)}
            style={{
              cursor: 'pointer',
              borderColor: selected === name ? '#caff00' : 'transparent',
              borderWidth: selected === name ? '2px' : '0px',
              borderStyle: 'solid'
            }}
          >
            <div className="rive-wrapper">
              <Rive
                src="/rive/circuits.riv"
                artboard="circuits"
                animations={name}
                autoplay
              />
            </div>
            <span className="circuit-label" style={{ color: selected === name ? '#caff00' : 'inherit' }}>
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CircuitsGrid;
