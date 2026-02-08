import { useMemo } from "react";
import Rive from "@rive-app/react-canvas";
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

// (Puedes ajustar esta lista si quieres incluir/excluir alguno más)
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

  return (
    <div className="circuits-grid">
      {circuits.map((name) => (
        <div key={name} className="circuit-card">
          <div className="rive-wrapper">
            <Rive
              src="/rive/circuits.riv"
              artboard="circuits"
              animations={name}   // 👈 clave: cada celda muestra SU circuito
              autoplay
              fit="contain"
              align="center"
            />
          </div>
          <span className="circuit-label">{name}</span>
        </div>
      ))}
    </div>
  );
};

export default CircuitsGrid;
