// TrackDisplay3D.jsx
import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import { Selection } from "@react-three/postprocessing";
import ClipperLib from "clipper-lib";

/**
 * ---------- HELPERS (Boundary -> Loops -> Paths XZ) ----------
 */

// 1) Boundary edges: aristas que aparecen 1 sola vez en la triangulación (contorno real)
function getBoundaryEdges(geom) {
    const g = geom.index ? geom : geom.toNonIndexed();
    const pos = g.attributes.position.array;
    const idx = g.index ? g.index.array : null;

    const edgeCount = new Map();
    const triCount = idx ? idx.length / 3 : pos.length / 9;
    const getV = (i) => (idx ? idx[i] : i);

    for (let t = 0; t < triCount; t++) {
        const a = getV(t * 3 + 0);
        const b = getV(t * 3 + 1);
        const c = getV(t * 3 + 2);

        const edges = [
            [a, b],
            [b, c],
            [c, a],
        ];

        for (const [u, v] of edges) {
            const m = Math.min(u, v);
            const M = Math.max(u, v);
            const key = `${m}_${M}`;
            edgeCount.set(key, (edgeCount.get(key) || 0) + 1);
        }
    }

    const boundary = [];
    for (const [key, count] of edgeCount.entries()) {
        if (count === 1) {
            const [a, b] = key.split("_").map(Number);
            boundary.push([a, b]);
        }
    }

    return { boundary, pos };
}

// 2) Construye loops cerrados a partir de boundary edges
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

            while (true) {
                loop.push(cur);
                const neighbors = Array.from(adj.get(cur) || []);
                if (neighbors.length === 0) break;

                let candidate = null;
                for (const n of neighbors) {
                    if (n === prev) continue;
                    const k = normKey(cur, n);
                    if (!used.has(k)) {
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

// 3) Convierte loops (indices) a paths XZ (float) sin offset
function loopsToPathsXZ(loops, posArray) {
    return loops
        .map((loop) =>
            loop.map((vi) => ({
                x: posArray[vi * 3 + 0],
                z: posArray[vi * 3 + 2],
            }))
        )
        .filter((p) => p.length >= 3);
}

// 4) Offset robusto con Clipper en XZ
function offsetPathsXZ(pathsXZ, offsetDistance, miterLimit = 2) {
    const SCALE = 1e6;

    const input = pathsXZ.map((path) =>
        path.map((pt) => ({ X: Math.round(pt.x * SCALE), Y: Math.round(pt.z * SCALE) }))
    );

    const cleaned = input
        .map((p) => ClipperLib.Clipper.CleanPolygon(p, 2))
        .filter((p) => p && p.length >= 3);

    const co = new ClipperLib.ClipperOffset(miterLimit, 0.25 * SCALE);
    co.AddPaths(cleaned, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);

    const solution = new ClipperLib.Paths();
    co.Execute(solution, offsetDistance * SCALE);

    return solution
        .filter((p) => p.length >= 3)
        .map((p) => p.map((pt) => ({ x: pt.X / SCALE, z: pt.Y / SCALE })));
}

// 5) LineSegments desde paths XZ (y fijo a 0)
function makeLineFromPaths(pathsXZ, material) {
    const positions = [];
    for (const path of pathsXZ) {
        for (let i = 0; i < path.length; i++) {
            const a = path[i];
            const b = path[(i + 1) % path.length];
            positions.push(a.x, 0, a.z, b.x, 0, b.z);
        }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return new THREE.LineSegments(g, material);
}

// 6) Muro entre front path (y=0) y back transformado (scale+offset local)
function makeWallBetweenPaths(pathsXZ, wallMat, backScaleLocal, backOffsetLocal) {
    const verts = [];

    for (const path of pathsXZ) {
        for (let i = 0; i < path.length; i++) {
            const p1 = path[i];
            const p2 = path[(i + 1) % path.length];

            const top1 = { x: p1.x, y: 0, z: p1.z };
            const top2 = { x: p2.x, y: 0, z: p2.z };

            const bot1 = {
                x: p1.x * backScaleLocal + backOffsetLocal.x,
                y: backOffsetLocal.y,
                z: p1.z * backScaleLocal + backOffsetLocal.z,
            };
            const bot2 = {
                x: p2.x * backScaleLocal + backOffsetLocal.x,
                y: backOffsetLocal.y,
                z: p2.z * backScaleLocal + backOffsetLocal.z,
            };

            verts.push(top1.x, top1.y, top1.z, bot1.x, bot1.y, bot1.z, top2.x, top2.y, top2.z);
            verts.push(bot1.x, bot1.y, bot1.z, bot2.x, bot2.y, bot2.z, top2.x, top2.y, top2.z);
        }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    g.computeVertexNormals();
    return new THREE.Mesh(g, wallMat);
}

export function TrackDisplay3D({ meshName }) {
    const { scene } = useGLTF("/models/tracks-05.glb");
    const [element, setElement] = useState(null);

    useEffect(() => {
        if (!scene || !meshName) return;

        const target = scene.getObjectByName(meshName);
        if (!target || !target.isMesh) {
            console.warn(`Mesh ${meshName} not found`);
            setElement(null);
            return;
        }

        // --- Geometría base en world, centrada ---
        target.updateWorldMatrix(true, false);
        const geometry = target.geometry.clone();
        geometry.applyMatrix4(target.matrixWorld);
        geometry.computeBoundingBox();
        geometry.center();

        const box = geometry.boundingBox;
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = maxDim > 0 ? 6 / maxDim : 1;

        // Back transform (LOCAL)
        const gapY = 0.05;
        const backScaleLocal = 1.02;
        const backOffsetLocal = new THREE.Vector3(0.01, gapY, 0.01);

        // --- Sacar contorno REAL (boundary) y construir paths ---
        let loops = [];
        let basePaths = [];
        try {
            const { boundary, pos } = getBoundaryEdges(geometry);
            loops = buildLoopsFromEdges(boundary);
            basePaths = loopsToPathsXZ(loops, pos);
        } catch (e) {
            console.warn("Boundary extraction failed:", e);
            setElement(null);
            return;
        }

        // ---------------- MATERIALES ----------------
        // Inner
        const innerCoreMat = new THREE.LineBasicMaterial({
            color: new THREE.Color("#00056dff"),
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: true,
            toneMapped: false,
        });

        const innerGlowMat = new THREE.LineBasicMaterial({
            color: new THREE.Color("#ff0000ff"),
            transparent: true,
            opacity: 0.18,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false,
            toneMapped: false,
        });

        const innerStrokeMat = new THREE.LineBasicMaterial({
            color: new THREE.Color("#caff00"),
            transparent: true,
            opacity: 0.22,
            blending: THREE.NormalBlending, // ✅ evita sumas “doble línea”
            depthWrite: false,
            depthTest: true,
            toneMapped: false,
        });

        const innerWallMat = new THREE.MeshBasicMaterial({
            color: "#caff00",
            transparent: false,
            opacity: 1,
            side: THREE.DoubleSide,
            depthWrite: true,
            depthTest: true,
        });
        // evita z-fighting con líneas
        innerWallMat.polygonOffset = true;
        innerWallMat.polygonOffsetFactor = 1;
        innerWallMat.polygonOffsetUnits = 1;

        // Outer
        const outerLineMat = new THREE.LineBasicMaterial({
            color: new THREE.Color("#caff00"),
            transparent: true,
            opacity: 0.16,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: true,
            toneMapped: false,
        });

        const outerWallMat = new THREE.MeshBasicMaterial({
            color: "#caff00",
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide,
            depthWrite: false,
            depthTest: true,
        });

        // ---------------- INNER (CREADO DESDE CERO COMO EL OUTER) ----------------
        const innerCore = makeLineFromPaths(basePaths, innerCoreMat);
        innerCore.scale.setScalar(scale);

        const innerGlow = makeLineFromPaths(basePaths, innerGlowMat);
        innerGlow.scale.setScalar(scale);

        const innerFrontStroke = makeLineFromPaths(basePaths, innerStrokeMat);
        innerFrontStroke.scale.setScalar(scale);

        // Back: mismo contorno pero transform del back (scale+offset) aplicados al OBJETO (no a puntos)
        const innerBackStroke = makeLineFromPaths(basePaths, innerStrokeMat.clone());
        innerBackStroke.scale.setScalar(scale * backScaleLocal);
        innerBackStroke.position.set(
            backOffsetLocal.x * scale,
            backOffsetLocal.y * scale,
            backOffsetLocal.z * scale
        );
        innerBackStroke.material.opacity = 0.14;

        // Wall inner: conecta front paths con back transformado (en LOCAL, luego escalamos todo)
        const innerWall = makeWallBetweenPaths(basePaths, innerWallMat, backScaleLocal, backOffsetLocal);
        innerWall.scale.setScalar(scale);

        // ---------------- OUTER (OFFSET DE ESE MISMO CONTORNO) ----------------
        const outerOffset = 0.03; // ajusta 0.02–0.06
        let outerPaths = [];
        try {
            outerPaths = offsetPathsXZ(basePaths, outerOffset);
        } catch (e) {
            console.warn("Clipper offset failed (outer):", e);
            outerPaths = [];
        }

        let outerFrontLine = null;
        let outerBackLine = null;
        let outerWall = null;

        if (outerPaths && outerPaths.length) {
            outerFrontLine = makeLineFromPaths(outerPaths, outerLineMat);
            outerFrontLine.scale.setScalar(scale);

            outerBackLine = makeLineFromPaths(outerPaths, outerLineMat.clone());
            outerBackLine.scale.setScalar(scale * backScaleLocal);
            outerBackLine.position.copy(innerBackStroke.position);
            outerBackLine.material.opacity = 0.11;

            outerWall = makeWallBetweenPaths(outerPaths, outerWallMat, backScaleLocal, backOffsetLocal);
            outerWall.scale.setScalar(scale);
        }

        // ---------------- RENDER ----------------
        setElement(
            <group>
                {/* OUTER */}
                {outerWall && <primitive object={outerWall} />}
                {outerBackLine && <primitive object={outerBackLine} />}
                {outerFrontLine && <primitive object={outerFrontLine} />}

                {/* INNER */}
                <primitive object={innerWall} />
                <primitive object={innerBackStroke} />
                <primitive object={innerFrontStroke} />

                <primitive object={innerGlow} />
                <primitive object={innerCore} />
            </group>
        );

        // ---------------- CLEANUP ----------------
        return () => {
            geometry.dispose?.();

            innerCore.geometry?.dispose?.();
            innerGlow.geometry?.dispose?.();
            innerFrontStroke.geometry?.dispose?.();
            innerBackStroke.geometry?.dispose?.();
            innerWall.geometry?.dispose?.();

            outerFrontLine?.geometry?.dispose?.();
            outerBackLine?.geometry?.dispose?.();
            outerWall?.geometry?.dispose?.();

            innerCoreMat.dispose?.();
            innerGlowMat.dispose?.();
            innerStrokeMat.dispose?.();
            innerBackStroke.material?.dispose?.(); // clone
            innerWallMat.dispose?.();

            outerLineMat.dispose?.();
            outerBackLine?.material?.dispose?.(); // clone
            outerWallMat.dispose?.();
        };
    }, [scene, meshName]);

    return (
        <Canvas
            style={{ width: "100%", height: "100%" }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            dpr={[1, 2]}
        >
            <Selection>


                <OrthographicCamera makeDefault position={[6, 6, 6]} zoom={120} near={-100} far={100} />

                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={0.6} />

                {element}

                <OrbitControls
                    autoRotate
                    autoRotateSpeed={0.25}
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={0.2}
                    maxPolarAngle={Math.PI / 2}
                />

                <EffectComposer multisampling={0}>
                    <Vignette eskil={false} offset={0.2} darkness={0.7} />
                </EffectComposer>
            </Selection>
        </Canvas>
    );
}
