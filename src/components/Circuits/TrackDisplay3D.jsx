import React, { useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, OrthographicCamera, useTexture } from "@react-three/drei";
import * as THREE from "three";

/**
 * 1. HELPERS DE GEOMETRÍA
 */
function getBoundaryEdges(geom) {
    const g = geom.index ? geom : geom.toNonIndexed();
    const pos = g.attributes.position.array;
    const idx = g.index ? g.index.array : null;

    const precision = 10000;
    const welded = new Int32Array(pos.length / 3);
    const hashmap = new Map();

    for (let i = 0; i < pos.length / 3; i++) {
        const x = Math.round(pos[i * 3 + 0] * precision);
        const y = Math.round(pos[i * 3 + 1] * precision);
        const z = Math.round(pos[i * 3 + 2] * precision);
        const key = `${x}_${y}_${z}`;

        if (!hashmap.has(key)) hashmap.set(key, i);
        welded[i] = hashmap.get(key);
    }

    const edgeCount = new Map();
    const triCount = idx ? idx.length / 3 : pos.length / 9;
    const getV = (i) => welded[idx ? idx[i] : i];

    for (let t = 0; t < triCount; t++) {
        const a = getV(t * 3 + 0);
        const b = getV(t * 3 + 1);
        const c = getV(t * 3 + 2);

        if (a === b || b === c || c === a) continue;

        const edges = [[a, b], [b, c], [c, a]];
        for (const [u, v] of edges) {
            const m = Math.min(u, v);
            const M = Math.max(u, v);
            edgeCount.set(`${m}_${M}`, (edgeCount.get(`${m}_${M}`) || 0) + 1);
        }
    }

    const boundary = [];
    for (const [key, count] of edgeCount.entries()) {
        if (count === 1) boundary.push(key.split("_").map(Number));
    }
    return { boundary, pos };
}

function buildLoopsFromEdges(boundaryPairs) {
    const adj = new Map();
    for (const [a, b] of boundaryPairs) {
        if (!adj.has(a)) adj.set(a, new Set());
        if (!adj.has(b)) adj.set(b, new Set());
        adj.get(a).add(b);
        adj.get(b).add(a);
    }

    const used = new Set();
    const normKey = (u, v) => `${Math.min(u, v)}_${Math.max(u, v)}`;
    const loops = [];

    for (const [start, neighSet] of adj.entries()) {
        for (const next of neighSet) {
            const ek = normKey(start, next);
            if (used.has(ek)) continue;

            const loop = [start];
            let prev = start;
            let cur = next;
            used.add(ek);

            let safety = 0;
            while (safety++ < 10000) {
                loop.push(cur);
                const neighbors = Array.from(adj.get(cur) || []);
                if (neighbors.length === 0) break;

                let candidate = null;
                for (const n of neighbors) {
                    if (n === prev) continue;
                    if (!used.has(normKey(cur, n))) {
                        candidate = n;
                        break;
                    }
                }

                if (candidate == null) {
                    if ((adj.get(cur) || new Set()).has(start)) used.add(normKey(cur, start));
                    break;
                }
                used.add(normKey(cur, candidate));
                prev = cur;
                cur = candidate;
                if (cur === start) break;
            }
            if (loop.length >= 3) loops.push(loop);
        }
    }
    return loops;
}

function loopsToPaths3D(loops, posArray) {
    return loops
        .map((loop) => loop.map((vi) => ({
            x: posArray[vi * 3 + 0],
            y: posArray[vi * 3 + 1],
            z: posArray[vi * 3 + 2],
        })))
        .filter((p) => p.length >= 3);
}

function offsetPaths3D(paths, offsetDistance) {
    return paths.map((path) => {
        const newPath = [];
        const len = path.length;

        let signedArea = 0;
        for (let i = 0; i < len; i++) {
            const curr = path[i];
            const next = path[(i + 1) % len];
            signedArea += (curr.x * next.z - next.x * curr.z);
        }
        const sign = signedArea < 0 ? -1 : 1;

        for (let i = 0; i < len; i++) {
            const prev = path[(i - 1 + len) % len];
            const curr = path[i];
            const next = path[(i + 1) % len];

            let dx1 = curr.x - prev.x, dz1 = curr.z - prev.z;
            const len1 = Math.sqrt(dx1 * dx1 + dz1 * dz1) || 1;
            dx1 /= len1; dz1 /= len1;

            let dx2 = next.x - curr.x, dz2 = next.z - curr.z;
            const len2 = Math.sqrt(dx2 * dx2 + dz2 * dz2) || 1;
            dx2 /= len2; dz2 /= len2;

            let tx = dx1 + dx2, tz = dz1 + dz2;
            const tlen = Math.sqrt(tx * tx + tz * tz) || 1;
            tx /= tlen; tz /= tlen;

            const nx = -tz * sign;
            const nz = tx * sign;

            newPath.push({
                x: curr.x + nx * offsetDistance,
                y: curr.y,
                z: curr.z + nz * offsetDistance
            });
        }
        return newPath;
    });
}

function createWallGeometry(paths3D, backScaleLocal, backOffsetLocal) {
    const verts = [];
    const uvs = [];

    for (const path of paths3D) {
        const len = path.length;

        let totalLength = 0;
        const distances = [0];
        for (let i = 0; i < len; i++) {
            const p1 = path[i];
            const p2 = path[(i + 1) % len];
            const dx = p2.x - p1.x;
            const dz = p2.z - p1.z;
            totalLength += Math.sqrt(dx * dx + dz * dz);
            distances.push(totalLength);
        }

        for (let i = 0; i < len; i++) {
            const p1 = path[i];
            const p2 = path[(i + 1) % len];

            const u1 = distances[i] / totalLength;
            const u2 = distances[i + 1] / totalLength;

            const top1 = { x: p1.x, y: p1.y, z: p1.z };
            const top2 = { x: p2.x, y: p2.y, z: p2.z };

            const bot1 = {
                x: p1.x * backScaleLocal + backOffsetLocal.x,
                y: p1.y * backScaleLocal + backOffsetLocal.y,
                z: p1.z * backScaleLocal + backOffsetLocal.z,
            };
            const bot2 = {
                x: p2.x * backScaleLocal + backOffsetLocal.x,
                y: p2.y * backScaleLocal + backOffsetLocal.y,
                z: p2.z * backScaleLocal + backOffsetLocal.z,
            };

            verts.push(top1.x, top1.y, top1.z, bot1.x, bot1.y, bot1.z, top2.x, top2.y, top2.z);
            uvs.push(u1, 0, u1, 1, u2, 0);

            verts.push(bot1.x, bot1.y, bot1.z, bot2.x, bot2.y, bot2.z, top2.x, top2.y, top2.z);
            uvs.push(u1, 1, u2, 1, u2, 0);
        }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    g.computeVertexNormals();
    return g;
}

/**
 * 2. SHADER PURO Y SUTIL (Sin trampas de Bloom)
 */
/**
 * 2. SHADER CON EL COLOR EXACTO DE PARED (#3c4512)
 */
const LandoShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uTextureMatcap: { value: null }
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec2 vN;

        void main() {
            vUv = uv;
            vec4 p = vec4( position, 1.0 );
            vec3 e = normalize( vec3( modelViewMatrix * vec4( normal, 0.0 ) ) );
            vec3 n = normalize( normalMatrix * normal );
            vec3 r = reflect( e, n );
            float m = 2.0 * sqrt( pow( r.x, 2.0 ) + pow( r.y, 2.0 ) + pow( r.z + 1.0, 2.0 ) );
            vN = r.xy / m + .5;

            gl_Position = projectionMatrix * modelViewMatrix * p;
        }
    `,
    fragmentShader: `
        uniform sampler2D uTextureMatcap;
        uniform float uTime;
        
        varying vec2 vUv;
        varying vec2 vN;

        void main() {
            // 1. EL COLOR DE TU PARED (#3c4512) convertido a RGB normalizado
            vec3 cWall = vec3(0.235, 0.270, 0.070); 
            
            // 2. El color del neón amarillo flúor
            vec3 cYellow = vec3(0.824, 1.0, 0.0); 
            
            // Animación de flujo de las rayitas
            float animationFract = pow(fract(vUv.x * 5.0 - uTime * 0.8), 2.) * 10. - 5.0;
            
            // Borde superior
            float upperOutline = smoothstep(0.05, 0.01, vUv.y);
            upperOutline -= animationFract * upperOutline * 0.3; 
            
            // Borde inferior (finito y sutil)
            float bottomOutline = step(0.975, vUv.y) * 0.5;
            
            // Textura Matcap (reflejos)
            vec3 matcap = texture2D(uTextureMatcap, vN).rgb;
            
            // OPACIDAD DE LA PARED: Ajusta este 0.45 si quieres el cristal más o menos tupido
            float alpha = 0.45; 
            alpha += upperOutline;
            alpha += bottomOutline;
            alpha = clamp(alpha, 0.0, 1.0);
            
            // --- COMPOSICIÓN DEL COLOR ---
            
            // Empezamos pintando todo el cristal con tu color #3c4512
            vec3 color = cWall; 
            
            // Le añadimos un poquito del matcap para que parezca plástico/cristal y no una plasta de color
            color += matcap * 0.15; 
            
            // "Pintamos" las líneas por encima usando la función mix() 
            // Así garantizamos que el amarillo sea puro y no se mezcle con el verde oscuro
            color = mix(color, cYellow, upperOutline);
            color = mix(color, cYellow, bottomOutline);
            
            gl_FragColor = vec4(color, alpha);
        }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    depthWrite: false,
});

const AnimatedMesh = ({ geometry }) => {
    const meshRef = useRef();
    const matcapTex = useTexture("/tracks/lando__matcap-02.webp");

    useEffect(() => {
        if (meshRef.current && matcapTex) {
            meshRef.current.material.uniforms.uTextureMatcap.value = matcapTex;
        }
    }, [matcapTex]);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return <mesh geometry={geometry} material={LandoShaderMaterial.clone()} ref={meshRef} />;
};

export function TrackDisplay3D({ meshName }) {
    const { scene } = useGLTF("/models/tracks-05.glb");
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!scene || !meshName) return;
        const target = scene.getObjectByName(meshName);
        if (!target || !target.isMesh) return;

        target.updateWorldMatrix(true, false);
        const geometry = target.geometry.clone();
        geometry.applyMatrix4(target.matrixWorld);
        geometry.computeBoundingBox();
        geometry.center();

        const size = new THREE.Vector3();
        geometry.boundingBox.getSize(size);
        const scale = (Math.max(size.x, size.y, size.z) > 0) ? 6 / Math.max(size.x, size.y, size.z) : 1;

        // 1. MUCHA MENOS ALTURA (Casi una cinta)
        const gapY = -0.08;
        const backScaleLocal = 1.0;
        const backOffsetLocal = new THREE.Vector3(0, gapY, 0);

        try {
            const { boundary, pos } = getBoundaryEdges(geometry);
            const loops = buildLoopsFromEdges(boundary);
            const basePaths = loopsToPaths3D(loops, pos);
            const outerPaths = offsetPaths3D(basePaths, 0.04);

            const innerWallGeo = createWallGeometry(basePaths, backScaleLocal, backOffsetLocal);
            const outerWallGeo = createWallGeometry(outerPaths, backScaleLocal, backOffsetLocal);

            setData({ innerWallGeo, outerWallGeo, scale });
        } catch (e) {
            console.warn("Geometría fallida:", e);
        }

        return () => geometry.dispose();
    }, [scene, meshName]);

    useEffect(() => {
        return () => {
            if (data) {
                data.innerWallGeo?.dispose();
                data.outerWallGeo?.dispose();
            }
        };
    }, [data]);

    return (
        <Canvas
            style={{ width: "100%", height: "100%", minHeight: "500px" }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.NoToneMapping }}
            dpr={[1, 2]}
        >
            {/* VOLVEMOS A LA CÁMARA ORTOGRÁFICA
                position={[0, 10, 10]}: Esto crea el ángulo "diagonal desde arriba" exacto.
                (10 hacia arriba en Y, 10 hacia atrás en Z).
                zoom={100}: Controla cómo de grande se ve. Súbelo si lo quieres más cerca.
            */}
            <OrthographicCamera
                makeDefault
                position={[0, 11, 3.7]}
                zoom={130}
                near={-100}
                far={100}
            />

            {/* Target al 0,0,0 para que no se descentre ni se vaya abajo del todo */}
            {/* Controles interactivos: 
                Al poner el min y el max con el mismo valor exacto (el de tu cámara),
                bloqueamos el cabeceo vertical al 100%. Solo rotará en horizontal.
            */}
            <OrbitControls
                enableRotate={true}
                enableZoom={false}
                enablePan={false}
                target={[0, 0, 0]}

                /* 1. BLOQUEO VERTICAL (Pitch) */
                // Sigue clavado para que no cabecee y mantenga la perspectiva de la "mesa"
                minPolarAngle={Math.atan2(11, 3.7)}
                maxPolarAngle={Math.atan2(11, 3.7)}

                /* ¡AQUÍ ESTÁ LA MAGIA! 
                   He borrado el minAzimuthAngle y maxAzimuthAngle. 
                   Al no tener límites, ahora tiene rotación horizontal infinita (360º). */

                /* 2. TACTO PREMIUM (Inercia y velocidad) */
                rotateSpeed={0.6} // Lo he subido un pelín para que sea más fácil darle la vuelta entera
                enableDamping={true}
                dampingFactor={0.05}
            />

            {data && (
                // position={[0, -1.5, 0]}: Bajamos el circuito un poco físicamente 
                // para que ocupe la zona inferior de tu pantalla y te deje sitio para las letras arriba. 
                // Y le metemos una micro-rotación si quieres que no sea 100% plano (opcional).
                <group scale={data.scale}>
                    <AnimatedMesh geometry={data.outerWallGeo} />
                    <AnimatedMesh geometry={data.innerWallGeo} />
                </group>
            )}
        </Canvas>
    );
}