import React, { useRef, useEffect } from 'react';

const Background3D: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // --- 3D MATH HELPERS ---
        const rotateX = (x: number, y: number, z: number, theta: number) => {
            const sin = Math.sin(theta);
            const cos = Math.cos(theta);
            return { x: x, y: y * cos - z * sin, z: y * sin + z * cos };
        };

        const rotateY = (x: number, y: number, z: number, theta: number) => {
            const sin = Math.sin(theta);
            const cos = Math.cos(theta);
            return { x: x * cos + z * sin, y: y, z: -x * sin + z * cos };
        };

        // --- BLOB CONFIG ---
        const blobs = [
            {
                cx: width * 0.8, cy: height * 0.2, r: 250,
                colorStops: ['rgba(59, 130, 246, 0.2)', 'rgba(34, 211, 238, 0.1)'], // blue-500 to cyan-400
                speed: 0.002, offset: 0,
                detail: 16  // lat/lon lines
            },
            {
                cx: width * 0.2, cy: height * 0.8, r: 350,
                colorStops: ['rgba(6, 182, 212, 0.15)', 'rgba(59, 130, 246, 0.1)'],
                speed: -0.0015, offset: 100,
                detail: 20
            }
        ];

        let time = 0;

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw soft gradient background
            const bgGrad = ctx.createLinearGradient(0, 0, width, height);
            bgGrad.addColorStop(0, '#f8fafc'); // Slate-50
            bgGrad.addColorStop(1, '#f1f5f9'); // Slate-100
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, width, height);

            time += 0.01;

            blobs.forEach(blob => {
                const { cx, cy, r, speed, offset, detail } = blob;

                // Draw Blob Mesh
                ctx.beginPath();

                // Generate Mesh
                // We draw lat/lon lines
                for (let lat = 0; lat <= detail; lat++) {
                    const theta = (lat * Math.PI) / detail;
                    const sinTheta = Math.sin(theta);
                    const cosTheta = Math.cos(theta);

                    for (let lon = 0; lon <= detail; lon++) {
                        const phi = (lon * 2 * Math.PI) / detail;
                        const sinPhi = Math.sin(phi);
                        const cosPhi = Math.cos(phi);

                        // Base Sphere Coordinate
                        let x = r * sinTheta * cosPhi;
                        let y = r * sinTheta * sinPhi;
                        let z = r * cosTheta;

                        // Deformation (Noise-ish)
                        const noise = Math.sin(x * 0.01 + time + offset) * Math.cos(y * 0.01 + time) * Math.sin(z * 0.01);
                        const factor = 1 + (noise * 0.2); // +/- 20% surface variation

                        x *= factor;
                        y *= factor;
                        z *= factor;

                        // Rotation
                        const rot1 = rotateX(x, y, z, time * speed * 100);
                        const rot2 = rotateY(rot1.x, rot1.y, rot1.z, time * speed * 150);

                        x = rot2.x + cx;
                        y = rot2.y + cy;
                        // z is depth

                        // Project (Simple weak perspective)
                        // We just draw x,y directly for "orthographic-ish" feel or add perspective div
                        // Let's keep smooth curves. 

                        // Actually, to get wireframe, we need to draw lines between points.
                        // Doing immediate mode line drawing is easiest for "grid" look.

                        // But point generation loop isn't connected.
                        // Let's change approach: Loop logic for lines.
                    }
                }

                // --- DRAWING LINES (LATITUDE RINGS) ---
                for (let lat = 0; lat < detail; lat++) {
                    // Approximate a ring
                    ctx.beginPath();
                    for (let lon = 0; lon <= detail; lon++) { // <= to close loop
                        const theta = (lat * Math.PI) / detail;
                        const phi = (lon * 2 * Math.PI) / detail;

                        // ... vertex calc ...
                        const p = getProjectedPoint(theta, phi, r, cx, cy, time, offset);
                        if (lon === 0) ctx.moveTo(p.x, p.y);
                        else ctx.lineTo(p.x, p.y);
                    }
                    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
                    grad.addColorStop(0, blob.colorStops[0]);
                    grad.addColorStop(1, blob.colorStops[1]);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                // --- DRAWING LINES (LONGITUDE RINGS) ---
                for (let lon = 0; lon < detail; lon++) {
                    ctx.beginPath();
                    for (let lat = 0; lat <= detail; lat++) {
                        const theta = (lat * Math.PI) / detail;
                        const phi = (lon * 2 * Math.PI) / detail;

                        const p = getProjectedPoint(theta, phi, r, cx, cy, time, offset);
                        if (lat === 0) ctx.moveTo(p.x, p.y);
                        else ctx.lineTo(p.x, p.y);
                    }
                    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
                    grad.addColorStop(0, blob.colorStops[0]);
                    grad.addColorStop(1, blob.colorStops[1]);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });

            requestAnimationFrame(render);
        };

        const getProjectedPoint = (theta: number, phi: number, r: number, cx: number, cy: number, time: number, offset: number) => {
            let x = r * Math.sin(theta) * Math.cos(phi);
            let y = r * Math.sin(theta) * Math.sin(phi);
            let z = r * Math.cos(theta);

            // Deform
            const scale = 0.005; // frequency
            const noise = Math.sin(x * scale + time + offset) + Math.cos(y * scale + time);
            const factor = 1 + (noise * 0.15);
            x *= factor;
            y *= factor;
            z *= factor;

            // Rotate
            const r1 = rotateY(x, y, z, time * 0.5);
            const r2 = rotateX(r1.x, r1.y, r1.z, time * 0.3);

            return { x: r2.x + cx, y: r2.y + cy };
        };

        // Handle Resize
        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            // Update blob positions slightly?
            blobs[0].cx = width * 0.8;
            blobs[1].cx = width * 0.2; blobs[1].cy = height * 0.8;
        };
        window.addEventListener('resize', handleResize);

        const animId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
        />
    );
};

export default Background3D;
