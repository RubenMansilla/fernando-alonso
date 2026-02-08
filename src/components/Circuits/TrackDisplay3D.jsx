import React, { useState, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette, Outline } from "@react-three/postprocessing";
import { Selection, Select } from "@react-three/postprocessing";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";







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

        // --- Geometría en world y centrada ---
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
        const gapY = 0.07;
        const outerScale = 1.06;   // cuánto “rodean” por fuera (1.03 - 1.09)
        const outerAlpha = 0.18;    // fuerza del aro exterior (0.10 - 0.28)
        const outerGlowAlpha = 0.08; // halo
        const yFront = 0;
        const yBack = gapY * scale;

        // Bordes
        const edges = new THREE.EdgesGeometry(geometry, 1);

        const hitMesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
        );
        hitMesh.scale.setScalar(scale);

        // --- Materiales neon (aditivo) ---
        const coreMat = new THREE.LineBasicMaterial({
            color: new THREE.Color("#eaff4a"),
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: true,
            toneMapped: false,
        });

        const glowMat = new THREE.LineBasicMaterial({
            color: new THREE.Color("#caff00"),
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false, // para que el halo no se corte
            toneMapped: false,
        });

        const wallMat = new THREE.LineBasicMaterial({
            color: "#caff00",
            transparent: true,
            opacity: 0.06,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: true,     // <-- CLAVE (antes lo tenías false)
            toneMapped: false,
        });


        // --- Capas: core + glow (varias) + “pared” vertical ---
        const core = new THREE.LineSegments(edges, coreMat);
        core.scale.setScalar(scale);

        // Halos: copias ligeramente escaladas
        const glow1 = new THREE.LineSegments(edges, glowMat);
        glow1.scale.setScalar(scale * 1.01);

        const glow2 = new THREE.LineSegments(edges, glowMat);
        glow2.scale.setScalar(scale * 1.02);
        glow2.material.opacity = 0.18;

        const glow3 = new THREE.LineSegments(edges, glowMat);
        glow3.scale.setScalar(scale * 1.035);
        glow3.material.opacity = 0.12;




        // --- BACKPLATE (segunda silueta para dar 3D) ---
        const backCoreMat = new THREE.LineBasicMaterial({
            color: new THREE.Color("#eaff4a"),     // un pelín más verdoso/oscuro
            transparent: true,
            opacity: 0.55,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: true,
            toneMapped: false,
        });

        // core trasero
        const backCore = new THREE.LineSegments(edges, backCoreMat);
        backCore.scale.setScalar(scale * 1.02);      // un poquito más grande
        backCore.position.y = gapY * scale;         // un poquito más abajo
        backCore.position.x = 0.01 * scale;          // opcional: micro desplazamiento
        backCore.position.z = 0.01 * scale;          // opcional: micro desplazamiento


        // ---------------- PARED SÓLIDA ENTRE FRONT Y BACK ----------------
        // thickness en unidades LOCALES (luego escalas todo con scale)
        const thicknessLocal = gapY;

        // ✅ “volumen” del circuito: top/bottom + laterales en el períme


        // ---- DOUBLE STROKE (micro capas) ----
        // escalas pequeñas para simular doble línea exterior sin deformaciones raras
        const strokeScales = [1.006, 1.012]; // prueba 1.004-1.02
        const strokeMats = strokeScales.map((_, idx) =>
            new THREE.LineBasicMaterial({
                color: new THREE.Color("#caff00"),
                transparent: true,
                opacity: idx === 0 ? 0.35 : 0.18,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                depthTest: true,
                toneMapped: false,
            })
        );

        // FRONT strokes
        const frontStroke1 = new THREE.LineSegments(edges, strokeMats[0]);
        frontStroke1.scale.setScalar(scale * strokeScales[0]);
        frontStroke1.position.y = yFront;

        const frontStroke2 = new THREE.LineSegments(edges, strokeMats[1]);
        frontStroke2.scale.setScalar(scale * strokeScales[1]);
        frontStroke2.position.y = yFront;

        // BACK strokes
        const backStroke1 = new THREE.LineSegments(edges, strokeMats[0].clone());
        backStroke1.scale.setScalar(scale * 1.02 * strokeScales[0]);
        backStroke1.position.y = yBack;
        backStroke1.position.x = 0.01 * scale;
        backStroke1.position.z = 0.01 * scale;

        const backStroke2 = new THREE.LineSegments(edges, strokeMats[1].clone());
        backStroke2.scale.setScalar(scale * 1.02 * strokeScales[1]);
        backStroke2.position.copy(backStroke1.position);

        // -------- HIT MESH FRONT (outline arriba) --------
        const hitMeshFront = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0,
                depthWrite: false,
            })
        );
        hitMeshFront.scale.setScalar(scale);
        hitMeshFront.position.y = 0; // misma altura que el front

        // -------- HIT MESH BACK (outline abajo) --------
        const hitMeshBack = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0,
                depthWrite: false,
            })
        );
        hitMeshBack.scale.setScalar(scale * 1.02); // igual que backCore
        hitMeshBack.position.y = yBack; // misma altura que backCore/backStack

        const makeThickEdges = (edgesGeom, color, linewidth, opacity) => {
            // edgesGeom es EdgesGeometry (BufferGeometry)
            const pos = edgesGeom.attributes.position.array;
            const points = [];
            for (let i = 0; i < pos.length; i += 3) {
                points.push(pos[i], pos[i + 1], pos[i + 2]);
            }

            const g = new LineGeometry();
            g.setPositions(points);

            const m = new LineMaterial({
                color: new THREE.Color(color),
                linewidth, // en "world units" relativas a resolution (se ve como px)
                transparent: true,
                opacity,
                depthTest: true,
                depthWrite: false,
            });

            // IMPORTANT: resolution para que el grosor funcione
            m.resolution.set(window.innerWidth, window.innerHeight);

            const line = new Line2(g, m);
            line.computeLineDistances();
            return line;
        };



        // Grupo final (ligera inclinación si quieres)
        setElement(
            <group>
                {/* BACK (outline + doble stroke + líneas) */}
                <Select enabled>
                    <primitive object={hitMeshBack} />
                </Select>

                {/* doble capa exterior BACK */}
                <primitive object={backStroke2} />
                <primitive object={backStroke1} />

                <primitive object={backCore} />



                {/* FRONT (outline + doble stroke + líneas) */}
                <Select enabled>
                    <primitive object={hitMeshFront} />
                </Select>

                {/* doble capa exterior FRONT */}
                <primitive object={frontStroke2} />
                <primitive object={frontStroke1} />


                <primitive object={glow3} />
                <primitive object={glow2} />
                <primitive object={glow1} />
                <primitive object={core} />
            </group>
        );


        // Cleanup (evita leaks si cambias meshName)
        return () => {
            geometry.dispose?.();
            edges.dispose?.();
            coreMat.dispose?.();
            glowMat.dispose?.();
            wallMat.dispose?.();
            backCoreMat.dispose?.();
            strokeMats.forEach(m => m.dispose?.());

        };
    }, [scene, meshName]);

    return (
        <Canvas
            gl={{
                antialias: true,
                alpha: false,
                powerPreference: "high-performance",
            }}
            dpr={[1, 2]}
        >
            <Selection>
                {/* Fondo + atmósfera */}
                <color attach="background" args={["#0b0f0c"]} />
                <fog attach="fog" args={["#0b0f0c", 6, 18]} />

                {/* Cámara ORTHO */}
                <OrthographicCamera makeDefault position={[6, 6, 6]} zoom={120} />

                {/* Luz */}
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={0.6} />

                {element}

                <OrbitControls
                    autoRotate
                    autoRotateSpeed={0.25}
                    enableZoom
                    enablePan={false}
                    minPolarAngle={0.2}
                    maxPolarAngle={Math.PI / 2}
                />

                {/* POST */}
                <EffectComposer multisampling={0}>
                    <Outline
                        blur
                        edgeStrength={6.0}
                        visibleEdgeColor={0xcaff00}
                        hiddenEdgeColor={0x0b0f0c}
                        width={1800}
                    />
                    <Bloom
                        intensity={2.2}
                        luminanceThreshold={0.0}
                        luminanceSmoothing={0.2}
                        mipmapBlur
                    />
                    <Vignette eskil={false} offset={0.2} darkness={0.7} />
                </EffectComposer>
            </Selection>
        </Canvas>
    );

}
