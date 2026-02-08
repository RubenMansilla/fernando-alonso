import { Suspense, useMemo, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import CircuitsGrid from "./Circuits/Circuits"; // Reutilizamos el grid de Rive existente
import "./Circuits/Circuits.css"; // Estilos compartidos
import { View } from "@react-three/drei";


// --- Componente para una sola Malla 3D ---
function SingleMeshViewer({ scene, meshName, isSolid }) {
    const [element, setElement] = useState(null);

    useEffect(() => {
        if (!scene) return;

        // 1. Buscar el objeto original en la escena
        const target = scene.getObjectByName(meshName);
        if (!target || !target.isMesh) {
            // console.warn(`Mesh ${meshName} no encontrada o no es un Mesh actual.`);
            return;
        }

        // 2. Extraer SOLAMENTE la geometría (clonada para no dañar el original)
        // Ignoramos la posición/rotación del nodo original para evitar problemas de offset.
        // Asumimos que la forma del circuito está en la geometría o en la transformación local.
        const geometry = target.geometry.clone();

        // 3. Aplicar la matriz de mundo del objeto a la geometría para "hornear" la forma real
        // Esto es útil si la malla estaba rotada/escalada en la escena principal.
        target.updateWorldMatrix(true, false);
        geometry.applyMatrix4(target.matrixWorld);

        // 4. Centrar la geometría en (0,0,0)
        geometry.computeBoundingBox();
        geometry.center();

        // 5. Calcular escala de normalización
        const box = geometry.boundingBox;
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        // console.log(`Mesh: ${meshName}`, { size, maxDim });

        // Escala para que mida aprox 3 unidades
        const scale = maxDim > 0 ? 3 / maxDim : 1;

        if (isSolid) {
            const mesh = new THREE.Mesh(
                geometry,
                new THREE.MeshStandardMaterial({
                    color: "#caff00",
                    side: THREE.DoubleSide
                })
            );
            mesh.scale.setScalar(scale);
            setElement(<primitive object={mesh} />);
        } else {
            // WIREFRAME
            const thresholdAngle = 1; // 1 grado para detectar bordes suaves
            const edges = new THREE.EdgesGeometry(geometry, thresholdAngle);
            const line = new THREE.LineSegments(
                edges,
                new THREE.LineBasicMaterial({ color: "#caff00" })
            );
            line.scale.setScalar(scale);
            setElement(<primitive object={line} />);
        }

    }, [scene, meshName, isSolid]);

    return element;
}

// --- Componente Celda para View ---
// Usamos View para renderizar en un target del DOM pero compartiendo un solo contexto WebGL
function ViewCell({ name, scene, isSolid }) {
    return (
        <div key={name} className="circuit-card">
            {/* El div que actúa como tracking target para View */}
            <div className="rive-wrapper" style={{ background: '#333', position: 'relative' }}>
                <View className="view-canvas" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    {/* VISTA SUPERIOR (Y-UP) */}
                    <perspectiveCamera makeDefault position={[0, 4, 0]} fov={50} />
                    <Suspense fallback={null}>
                        <SingleMeshViewer scene={scene} meshName={name} isSolid={isSolid} />
                    </Suspense>
                    {/* SIN ROTACIÓN AUTOMÁTICA para ver bien la forma */}
                    <OrbitControls enableZoom={true} enableRotate={true} />
                </View>
            </div>
            <span className="circuit-label" style={{ color: '#caff00' }}>
                {name}
            </span>
        </div>
    );
}

// --- Componente Principal de Debug ---
function MeshGrid({ url }) {
    const { scene } = useGLTF(url);
    const [meshNames, setMeshNames] = useState([]);
    const [isSolid, setIsSolid] = useState(false); // Estado para toggle

    useEffect(() => {
        if (scene) {
            const keys = [];
            scene.traverse((obj) => {
                if (obj.isMesh) {
                    keys.push(obj.name);
                }
            });
            // Ordenar alfabéticamente
            keys.sort();

            // MOSTRAR TODOS LOS MODELOS (Usuario pidió "muestra todos")
            setMeshNames(keys);
            console.log("Mallas mostradas:", keys.length);
        }
    }, [scene]);

    // Filtramos solo las primeras 16 mallas si el usuario solo quiere ver esas,
    // o mostramos todas gracias a <View> (soporta ilimitados views en teoría, aunque baja el fps).
    // El usuario dijo "muestra solos los 8 primeros que son los que me faltan por mapear".
    // Pero con View, podemos mostrar todos sin problema de contexto.

    return (
        <div
            style={{ display: 'flex', gap: '20px', padding: '20px', background: '#222', minHeight: '100vh', position: 'relative' }}
        >
            {/* CANVAS COMPARTIDO GLOBAL - Debe estar en el root del componente contenedor */}
            {/* eventSource apunta al contenedor para que los eventos del ratón funcionen correctamente en los Views */}
            <Canvas
                className="canvas-overlay"
                style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}
                eventSource={document.getElementById('root')}
            >
                {/* View.Port renderiza todos los Views registrados aquí */}
                <View.Port />
            </Canvas>

            {/* Columna Izquierda: Circuitos Rive Conocidos */}
            <div style={{ flex: 1, borderRight: '1px solid #444', zIndex: 1 }}>
                <h2 style={{ color: 'white', textAlign: 'center' }}>Rive Animations (Known)</h2>
                <CircuitsGrid />
            </div>

            {/* Columna Derecha: Mallas 3D Desconocidas */}
            <div style={{ flex: 1, zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <h2 style={{ color: 'white', display: 'inline-block', marginRight: 20 }}>3D Meshes (All Visible due to View)</h2>
                    <button
                        onClick={() => setIsSolid(!isSolid)}
                        style={{ padding: '8px 16px', background: '#caff00', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {isSolid ? "Show Wireframe" : "Show Solid (Debug)"}
                    </button>
                    <p style={{ color: '#888', fontSize: 12 }}>Using View to share 1 WebGL Context</p>
                </div>

                <div className="circuits-grid">
                    {meshNames.map((name) => (
                        <ViewCell key={name} name={name} scene={scene} isSolid={isSolid} />
                    ))}
                </div>
            </div>

        </div>
    );
}

export default function TrackMapper() {
    return (
        <Suspense fallback={<div style={{ color: 'white' }}>Loading GLB...</div>}>
            <MeshGrid url="/models/tracks-05.glb" />
        </Suspense>
    );
}
