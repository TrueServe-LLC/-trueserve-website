"use client";

import { useEffect, useRef } from "react";

interface AnimationProps {
    type: 'merchant' | 'driver';
}

export default function SignupLeftAnimation({ type }: AnimationProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let W: number, H: number;
        let animationFrameId: number;

        const resize = () => {
            W = canvas.width = canvas.offsetWidth;
            H = canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const GOLD = '#f97316';
        const AMBER = '#f97316';
        const GREEN = '#3dd68c';
        let t = 0;

        // ── MERCHANT ANIMATION LOGIC ──
        const drawGrid = () => {
            ctx.strokeStyle = 'rgba(249,115,22,0.04)';
            ctx.lineWidth = 1;
            const size = 52;
            for (let x = 0; x < W; x += size) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
            }
            for (let y = 0; y < H; y += size) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
            }
        };

        const glows = [
            { x: 0.3, y: 0.35, r: 220, color: 'rgba(249,115,22,0.01)' },
            { x: 0.7, y: 0.6,  r: 180, color: 'rgba(249,115,22,0.06)' },
            { x: 0.15, y: 0.7, r: 140, color: 'rgba(200,130,30,0.05)' },
        ];

        const drawGlows = () => {
            glows.forEach(g => {
                const grd = ctx.createRadialGradient(g.x*W, g.y*H, 0, g.x*W, g.y*H, g.r);
                grd.addColorStop(0, g.color);
                grd.addColorStop(1, 'transparent');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(g.x*W, g.y*H, g.r, 0, Math.PI*2);
                ctx.fill();
            });
        };

        const shapesDef = {
            fork: (size: number, alpha: number) => {
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = GOLD; ctx.lineWidth = size * 0.12; ctx.lineCap = 'round';
                ctx.beginPath(); ctx.moveTo(0, size*0.1); ctx.lineTo(0, size); ctx.stroke();
                [-0.22, 0, 0.22].forEach(dx => {
                    ctx.beginPath(); ctx.moveTo(dx*size, -size); ctx.lineTo(dx*size, -size*0.1); ctx.stroke();
                });
                ctx.beginPath(); ctx.moveTo(-0.22*size, -size*0.4); ctx.lineTo(0.22*size, -size*0.4); ctx.stroke();
            },
            plate: (size: number, alpha: number) => {
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = GOLD; ctx.lineWidth = size * 0.08;
                ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI*2); ctx.stroke();
                ctx.beginPath(); ctx.arc(0, 0, size*0.6, 0, Math.PI*2); ctx.stroke();
            },
            bag: (size: number, alpha: number) => {
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = GOLD; ctx.lineWidth = size * 0.1; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
                ctx.strokeRect(-size*0.6, -size*0.3, size*1.2, size*1.1);
                ctx.beginPath(); ctx.moveTo(-size*0.3, -size*0.3); ctx.quadraticCurveTo(-size*0.3, -size*0.9, 0, -size*0.9); ctx.quadraticCurveTo(size*0.3, -size*0.9, size*0.3, -size*0.3); ctx.stroke();
            },
            star: (size: number, alpha: number) => {
                ctx.globalAlpha = alpha;
                ctx.fillStyle = GOLD;
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const a = (i * Math.PI*2/5) - Math.PI/2;
                    const b = a + Math.PI/5;
                    ctx.lineTo(Math.cos(a)*size, Math.sin(a)*size);
                    ctx.lineTo(Math.cos(b)*size*0.4, Math.sin(b)*size*0.4);
                }
                ctx.closePath(); ctx.fill();
            }
        };

        const mParticles = Array.from({length: 18}, (_, i) => ({
            x: Math.random(), y: Math.random(), 
            vy: -(0.00012 + Math.random() * 0.00018), 
            vx: (Math.random() - 0.5) * 0.00006,
            size: 8 + Math.random() * 14, 
            alpha: 0.05 + Math.random() * 0.18,
            rot: Math.random() * Math.PI * 2, 
            rotSpeed: (Math.random() - 0.5) * 0.008,
            shape: (['fork', 'plate', 'bag', 'star'])[i % 4] as keyof typeof shapesDef,
            phase: Math.random() * Math.PI * 2
        }));

        const mSteam = Array.from({length: 25}, () => ({
            x: 0.2 + Math.random() * 0.6, y: 0.35 + Math.random() * 0.45,
            vy: -(0.0003 + Math.random() * 0.0006),
            maxAlpha: 0.04 + Math.random() * 0.08,
            r: 4 + Math.random() * 12, life: 0, 
            maxLife: 0.6 + Math.random() * 0.4, 
            phase: Math.random()
        }));

        // ── DRIVER ANIMATION LOGIC ──
        const CELL = 72;
        const pins = Array.from({length: 8}, () => ({
            x: Math.round((0.1 + Math.random()*0.8) * 10) / 10,
            y: Math.round((0.1 + Math.random()*0.8) * 10) / 10,
            pulse: Math.random() * Math.PI * 2,
            color: Math.random() > 0.5 ? AMBER : GREEN
        }));

        const makeRoute = () => {
            const sx = Math.floor(Math.random() * 10) / 10;
            const sy = Math.floor(Math.random() * 10) / 10;
            const ex = Math.floor(Math.random() * 10) / 10;
            const ey = Math.floor(Math.random() * 10) / 10;
            return {
                sx, sy, ex, ey,
                mid: Math.random() > 0.5 ? {x: ex, y: sy} : {x: sx, y: ey},
                progress: Math.random(),
                speed: 0.0025 + Math.random() * 0.0035,
                color: Math.random() > 0.5 ? AMBER : GREEN,
                alpha: 0.4 + Math.random() * 0.4,
                dotR: 2 + Math.random() * 3,
                trailLen: 0.12 + Math.random() * 0.15
            };
        };
        const dRoutes = Array.from({length: 12}, makeRoute);

        const getPos = (r: any, prog: number) => {
            const half = 0.5;
            if (prog < half) {
                const t = prog / half;
                return { x: r.sx + (r.mid.x - r.sx)*t, y: r.sy + (r.mid.y - r.sy)*t };
            } else {
                const t = (prog - half) / half;
                return { x: r.mid.x + (r.ex - r.mid.x)*t, y: r.mid.y + (r.ey - r.mid.y)*t };
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, W, H);
            
            if (type === 'merchant') {
                ctx.fillStyle = '#0a0c12';
                ctx.fillRect(0, 0, W, H);
                drawGrid();
                drawGlows();

                mSteam.forEach(s => {
                    s.life += 0.004;
                    if (s.life > s.maxLife) {
                        s.life = 0; s.x = 0.2 + Math.random() * 0.6; s.y = 0.35 + Math.random() * 0.45;
                    }
                    const prog = s.life / s.maxLife;
                    const alpha = prog < 0.3 ? (prog/0.3)*s.maxAlpha : prog < 0.7 ? s.maxAlpha : ((1-prog)/0.3)*s.maxAlpha;
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = GOLD;
                    ctx.beginPath();
                    ctx.arc(s.x*W + Math.sin(t*2 + s.phase*6)*8, (s.y - prog*0.2)*H, s.r*(1+prog*0.5), 0, Math.PI*2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                });

                mParticles.forEach(p => {
                    p.x += p.vx + Math.sin(t * 0.8 + p.phase) * 0.0001;
                    p.y += p.vy; p.rot += p.rotSpeed;
                    if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
                    ctx.save(); ctx.translate(p.x * W, p.y * H); ctx.rotate(p.rot);
                    shapesDef[p.shape](p.size, p.alpha);
                    ctx.restore();
                });
            } else {
                // Driver Top-down City Logic
                ctx.fillStyle = '#0e1218';
                ctx.fillRect(0, 0, W, H);

                // City Blocks
                const cols = Math.ceil(W / CELL) + 1;
                const rows = Math.ceil(H / CELL) + 1;
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const bx = (c - 0.5) * CELL + 10;
                        const by = (r - 0.5) * CELL + 10;
                        ctx.fillStyle = '#111820';
                        ctx.fillRect(bx, by, CELL - 20, CELL - 20);
                        ctx.fillStyle = 'rgba(249,115,22,0.06)';
                        for(let wx=0; wx<3; wx++) for(let wy=0; wy<3; wy++) {
                            if(Math.random() > 0.7) ctx.fillRect(bx+8+wx*8, by+8+wy*8, 3, 4);
                        }
                    }
                }

                // Grid lines & dash line
                ctx.strokeStyle = 'rgba(249,115,22,0.05)'; ctx.lineWidth = 1;
                for (let x = 0; x <= W; x += CELL) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
                for (let y = 0; y <= H; y += CELL) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

                dRoutes.forEach(r => {
                    const steps = 25;
                    for (let i = 0; i < steps; i++) {
                        const tp = r.progress - (i / steps) * r.trailLen;
                        if (tp < 0) continue;
                        const pos = getPos(r, tp % 1);
                        ctx.globalAlpha = ((steps - i) / steps) * r.alpha * 0.4;
                        ctx.fillStyle = r.color;
                        ctx.beginPath(); ctx.arc(pos.x*W, pos.y*H, r.dotR * 0.6, 0, Math.PI*2); ctx.fill();
                    }
                    const p = getPos(r, r.progress);
                    ctx.globalAlpha = r.alpha; ctx.fillStyle = r.color;
                    ctx.beginPath(); ctx.arc(p.x*W, p.y*H, r.dotR, 0, Math.PI*2); ctx.fill();
                    r.progress += r.speed; if (r.progress >= 1) { Object.assign(r, makeRoute()); r.progress = 0; }
                });

                pins.forEach(p => {
                    const pulse = Math.sin(t * 2 + p.pulse);
                    ctx.globalAlpha = 0.2 + pulse * 0.1; ctx.strokeStyle = p.color;
                    ctx.beginPath(); ctx.arc(p.x*W, p.y*H, (4 + pulse * 1.5) * 2.5, 0, Math.PI*2); ctx.stroke();
                    ctx.globalAlpha = 0.8; ctx.fillStyle = p.color;
                    ctx.beginPath(); ctx.arc(p.x*W, p.y*H, 4 + pulse * 1.5, 0, Math.PI*2); ctx.fill();
                });
            }

            const cg = ctx.createRadialGradient(W*0.5, H*0.5, 0, W*0.5, H*0.5, W*0.5);
            cg.addColorStop(0, `rgba(249,115,22,${0.03 * (0.6 + Math.sin(t*1.2)*0.2)})`);
            cg.addColorStop(1, 'transparent');
            ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);

            t += 0.016;
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [type]);

    return (
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full" 
            style={{ filter: 'blur(0.5px)' }}
        />
    );
}
