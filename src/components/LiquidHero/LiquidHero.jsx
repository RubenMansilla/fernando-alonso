import React, { useEffect, useRef } from 'react';
import './LiquidHero.css';
import diffuseImg from '../../assets/diffuse.png';
import cascoImg from '../../assets/casco.webp';
import wireframeImg from '../../assets/cascovacio.png';

const LiquidHero = () => {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const baseImgRef = useRef(null);
    const revealImgRef = useRef(null);
    const wireframeImgRef = useRef(null);
    const maskPathRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        const svg = svgRef.current;
        const baseImg = baseImgRef.current;
        const revealImg = revealImgRef.current;
        const wireframeImg = wireframeImgRef.current;
        const maskPath = maskPathRef.current;

        if (!container || !svg || !baseImg || !revealImg || !wireframeImg || !maskPath) return;

        // ====== CONFIGURACIÓN DE GOTA ======
        const TRAIL_COUNT = 26;
        const BASE_R = 120;
        const LERP_HEAD = 0.6;
        const LERP_TAIL = 0.4;
        // ===================================

        let isActive = false;
        let isAutoMoving = false;
        let autoMoveStartTime = 0;
        let lastUserInteraction = Date.now();
        let inactivityTimer = null;
        let W = 0, H = 0;
        let animationFrameId;

        const trail = Array.from({ length: TRAIL_COUNT }, () => ({ x: W / 2, y: H / 2, r: 0 }));
        let target = { x: W / 2, y: H / 2 };
        let current = { x: W / 2, y: H / 2 };

        const resize = () => {
            if (!container) return;
            // Use window dimensions to ensure full screen coverage if container is constrained
            W = window.innerWidth;
            H = window.innerHeight;
            // Also update container style just in case of flex quirks
            container.style.width = `${W}px`;
            container.style.height = `${H}px`;

            svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

            const baseH = H * 0.92;
            const REVEAL_SCALE = 1.4;
            const revealH = baseH * REVEAL_SCALE;

            function ensureRatio(imgEl, src, cb) {
                const tmp = new Image();
                tmp.onload = () => {
                    const ratio = tmp.naturalWidth / tmp.naturalHeight;
                    cb(ratio);
                };
                tmp.onerror = () => cb(1);
                tmp.src = src;
            }

            ensureRatio(baseImg, diffuseImg, (rBase) => {
                ensureRatio(revealImg, cascoImg, (rReveal) => {
                    const baseW = baseH * rBase;
                    const baseX = (W - baseW) / 2;
                    const baseY = H - baseH;

                    baseImg.setAttribute("x", baseX);
                    baseImg.setAttribute("y", baseY);
                    baseImg.setAttribute("width", baseW);
                    baseImg.setAttribute("height", baseH);
                    baseImg.setAttribute("preserveAspectRatio", "xMidYMid slice");

                    const revealW = revealH * rReveal;
                    const revealX = (W - revealW) / 2;
                    const REVEAL_Y_OFFSET = H * 0.2;
                    const revealY = (H - revealH) + REVEAL_Y_OFFSET;

                    revealImg.setAttribute("x", revealX);
                    revealImg.setAttribute("y", revealY);
                    revealImg.setAttribute("width", revealW);
                    revealImg.setAttribute("height", revealH);
                    revealImg.setAttribute("preserveAspectRatio", "xMidYMid meet");

                    // Wireframe logic (identical position to revealImg)
                    wireframeImg.setAttribute("x", revealX);
                    wireframeImg.setAttribute("y", revealY);
                    wireframeImg.setAttribute("width", revealW);
                    wireframeImg.setAttribute("height", revealH);
                    wireframeImg.setAttribute("preserveAspectRatio", "xMidYMid meet");
                });
            });
        };

        // Initial resize
        resize();
        // Force update after a short delay to ensure DOM is ready
        setTimeout(resize, 100);

        window.addEventListener("resize", resize);

        // Logic functions
        function buildDropletPath() {
            const centers = [];
            const left = [];
            const right = [];

            for (let i = 0; i < TRAIL_COUNT; i++) {
                const p = trail[i];
                if (p.r < 1) continue;

                const pPrev = trail[Math.max(0, i - 1)];
                const pNext = trail[Math.min(TRAIL_COUNT - 1, i + 1)];

                let tx = pNext.x - pPrev.x;
                let ty = pNext.y - pPrev.y;
                const len = Math.hypot(tx, ty) || 1;
                tx /= len; ty /= len;

                const nx = -ty;
                const ny = tx;

                centers.push({ x: p.x, y: p.y, r: p.r, nx, ny, tx, ty });
                left.push({ x: p.x + nx * p.r, y: p.y + ny * p.r });
                right.push({ x: p.x - nx * p.r, y: p.y - ny * p.r });
            }

            if (left.length < 3) return "";

            function smoothSide(pts) {
                let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)} `;
                for (let i = 1; i < pts.length - 1; i++) {
                    const mx = (pts[i].x + pts[i + 1].x) / 2;
                    const my = (pts[i].y + pts[i + 1].y) / 2;
                    d += `Q ${pts[i].x.toFixed(2)} ${pts[i].y.toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)} `;
                }
                d += `T ${pts[pts.length - 1].x.toFixed(2)} ${pts[pts.length - 1].y.toFixed(2)} `;
                return d;
            }

            const head = centers[0];
            const headCap = [];
            for (let s = 0; s <= 10; s++) {
                const a = Math.PI * (s / 10);
                const px = head.x + Math.cos(a) * head.nx * head.r + Math.sin(a) * -head.tx * head.r;
                const py = head.y + Math.cos(a) * head.ny * head.r + Math.sin(a) * -head.ty * head.r;
                headCap.push({ x: px, y: py });
            }

            let d = smoothSide(left);
            const tail = centers[centers.length - 1];
            d += `L ${tail.x.toFixed(2)} ${tail.y.toFixed(2)} `;

            const rightRev = [...right].reverse();
            for (let i = 0; i < rightRev.length - 1; i++) {
                const p1 = rightRev[i], p2 = rightRev[i + 1];
                const mx = (p1.x + p2.x) / 2;
                const my = (p1.y + p2.y) / 2;
                d += `Q ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)} `;
            }
            d += `T ${rightRev[rightRev.length - 1].x.toFixed(2)} ${rightRev[rightRev.length - 1].y.toFixed(2)} `;

            for (const p of headCap) d += `L ${p.x.toFixed(2)} ${p.y.toFixed(2)} `;

            d += "Z";
            return d;
        }

        function isUserActive() {
            return (Date.now() - lastUserInteraction < 3000);
        }

        function animate() {
            const now = Date.now();

            // --- AUTO MOVE LOGIC ---
            if (!isActive && (now - lastUserInteraction > 3000)) {
                if (!isAutoMoving) {
                    isAutoMoving = true;
                    autoMoveStartTime = now;
                    trail.forEach(t => t.r = 0);
                    target.x = W / 2;
                    target.y = H / 2;
                    current.x = target.x;
                    current.y = target.y;
                }
            }

            if (isUserActive()) {
                isAutoMoving = false;
            }

            if (isAutoMoving) {
                const MOVE_DURATION = 1500;
                const PAUSE_DURATION = 3000;
                const TOTAL_CYCLE = (MOVE_DURATION + PAUSE_DURATION) * 2;
                const elapsed = now - autoMoveStartTime;
                const cycleTime = elapsed % TOTAL_CYCLE;

                const phase1End = MOVE_DURATION;
                const phase2End = phase1End + PAUSE_DURATION;
                const phase3End = phase2End + MOVE_DURATION;

                let isMovingPhase = false;
                let isGoingUp = true;
                let p = 0;

                if (cycleTime < phase1End) {
                    isMovingPhase = true;
                    isGoingUp = true;
                    p = cycleTime / MOVE_DURATION;
                } else if (cycleTime < phase2End) {
                    isMovingPhase = false;
                } else if (cycleTime < phase3End) {
                    isMovingPhase = true;
                    isGoingUp = false;
                    p = (cycleTime - phase2End) / MOVE_DURATION;
                } else {
                    isMovingPhase = false;
                }

                if (isMovingPhase) {
                    isActive = true;
                    const autoY = isGoingUp ? (H * (1 - p)) : (H * p);

                    let phase = 0;
                    if (p < 0.30) phase = p / 0.30;
                    else if (p < 0.50) phase = 1 + (p - 0.30) / 0.20;
                    else if (p < 0.70) phase = 2 + (p - 0.50) / 0.20;
                    else phase = 3 + (p - 0.70) / 0.30;

                    const legIndex = Math.floor(phase);
                    const safeLegIndex = Math.min(legIndex, 3);
                    const tLeg = phase - safeLegIndex;
                    const isGoingRight = (safeLegIndex % 2 === 0);
                    const margin = W * 0.05;
                    const availW = W * 0.9;
                    const autoX = margin + availW * (isGoingRight ? tLeg : (1 - tLeg));

                    target.x = autoX;
                    target.y = autoY;

                    const timeInPhase = isGoingUp ? cycleTime : (cycleTime - phase2End);
                    if (timeInPhase < 50) {
                        if (Math.abs(current.y - autoY) > H * 0.1) {
                            current.x = autoX;
                            current.y = autoY;
                            trail.forEach(t => { t.x = autoX; t.y = autoY; t.r = 10; });
                        }
                    }
                } else {
                    isActive = false;
                }
            }

            if (isActive) {
                current.x += (target.x - current.x) * LERP_HEAD;
                current.y += (target.y - current.y) * LERP_HEAD;

                trail[0].x = current.x;
                trail[0].y = current.y;

                for (let i = 1; i < TRAIL_COUNT; i++) {
                    const prev = trail[i - 1];
                    const cur = trail[i];
                    cur.x += (prev.x - cur.x) * LERP_TAIL;
                    cur.y += (prev.y - cur.y) * LERP_TAIL;
                }

                for (let i = 0; i < TRAIL_COUNT; i++) {
                    const t = i / (TRAIL_COUNT - 1);
                    let shape = Math.cos(t * Math.PI / 2);
                    shape = Math.pow(shape, 0.8);
                    let r = BASE_R * shape;
                    if (isAutoMoving) r *= 0.8;
                    trail[i].r = r;
                }
            } else {
                let visible = 0;
                for (const p of trail) {
                    p.r *= 0.94;
                    if (p.r < 0.5) p.r = 0;
                    else visible++;
                }
                if (visible === 0 && !isAutoMoving) isActive = false;
            }

            const dMask = buildDropletPath();
            if (maskPath) maskPath.setAttribute("d", dMask); // null check

            animationFrameId = requestAnimationFrame(animate);
        }

        // Interaction Handler
        const handleMove = (cx, cy) => {
            if (!svg) return;
            const rect = svg.getBoundingClientRect();
            target.x = cx - rect.left;
            target.y = cy - rect.top;

            lastUserInteraction = Date.now();
            isAutoMoving = false;

            if (!isActive) {
                isActive = true;
                current.x = target.x;
                current.y = target.y;
                trail.forEach(t => {
                    t.x = target.x;
                    t.y = target.y;
                    t.r = 10;
                });
            }
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                isActive = false;
            }, 600);
        };

        const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
        const onTouch = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("touchstart", onTouch, { passive: false });
        window.addEventListener("touchmove", onTouch, { passive: false });

        // Start animation loop
        animate();

        // Cleanup
        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("touchstart", onTouch);
            window.removeEventListener("touchmove", onTouch);
            cancelAnimationFrame(animationFrameId);
            clearTimeout(inactivityTimer);
        };

    }, []); // Run once on mount

    return (
        <div className="container" id="container" ref={containerRef}>
            <svg id="stage" xmlns="http://www.w3.org/2000/svg" ref={svgRef}>
                <defs>
                    <filter id="goo-mask" colorInterpolationFilters="sRGB">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="
                            1 0 0 0 0
                            0 1 0 0 0
                            0 0 1 0 0
                            0 0 0 30 -12" result="goo" />

                        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="2" result="noise" />
                        <feDisplacementMap in="goo" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G"
                            result="d" />

                        <feMorphology in="d" operator="dilate" radius="1" result="dd" />

                        <feComponentTransfer in="dd" result="hard">
                            <feFuncA type="table" tableValues="0 0 0 1 1" />
                        </feComponentTransfer>

                        <feMorphology in="hard" operator="erode" radius="1" result="finalMask" />
                    </filter>

                    <mask id="revealMask">
                        <rect x="0" y="0" width="100%" height="100%" fill="black" />
                        <g filter="url(#goo-mask)">
                            <path id="maskPath" fill="white" ref={maskPathRef}></path>
                        </g>
                    </mask>
                    <mask id="wireframeMask">
                        <rect class="wireframe-wipe" x="0" y="-15%" width="100%" height="15%" fill="white" />
                    </mask>
                </defs>

                <image id="baseImg" href={diffuseImg} opacity="1" ref={baseImgRef} />

                <g mask="url(#revealMask)">
                    <rect x="0" y="0" width="100%" height="100%" fill="#e9eae4" opacity="0.35" />
                    <image id="revealImg" href={cascoImg} opacity="1" ref={revealImgRef} />
                </g>
                <image id="wireframeImg" href={wireframeImg} opacity="0.3" mask="url(#wireframeMask)" ref={wireframeImgRef} />
            </svg>
        </div >
    );
};

export default LiquidHero;
