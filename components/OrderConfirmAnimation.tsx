"use client";
import { useEffect, useState } from "react";

interface OrderConfirmAnimationProps {
    restaurantName: string;
    onComplete: () => void;
}

export default function OrderConfirmAnimation({ restaurantName, onComplete }: OrderConfirmAnimationProps) {
    const [phase, setPhase] = useState<"enter" | "drive" | "exit">("enter");
    const [dots, setDots] = useState(".");

    // Animate ellipsis
    useEffect(() => {
        const d = setInterval(() => setDots(p => p.length >= 3 ? "." : p + "."), 500);
        return () => clearInterval(d);
    }, []);

    // Phase timeline
    useEffect(() => {
        const t1 = setTimeout(() => setPhase("drive"), 500);
        const t2 = setTimeout(() => setPhase("exit"), 3200);
        const t3 = setTimeout(() => onComplete(), 4000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onComplete]);

    return (
        <div
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden px-4"
            style={{ background: "#09090b" }}
        >
            {/* Radial teal/gold glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 80% 55% at 50% 65%, rgba(42,143,143,0.10) 0%, rgba(245,166,35,0.05) 55%, transparent 75%)"
                }}
            />

            {/* Top text */}
            <div
                className="relative z-10 text-center mb-10 sm:mb-14 w-full max-w-sm sm:max-w-none"
                style={{
                    opacity: phase === "exit" ? 0 : 1,
                    transform: phase === "enter" ? "translateY(10px)" : "translateY(0)",
                    transition: "opacity 0.5s, transform 0.6s"
                }}
            >
                <div className="inline-flex items-center gap-2 mb-4">
                    <span
                        style={{
                            background: "#f5a623",
                            color: "#09090b",
                            fontWeight: 900,
                            fontSize: 11,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            borderRadius: 9999,
                            padding: "6px 20px",
                            border: "2px solid #f5a623",
                            display: "inline-block",
                        }}
                    >
                        ✓&nbsp;&nbsp;Order Confirmed
                    </span>
                </div>
                <h2
                    className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-white tracking-tight leading-tight"
                    style={{ textShadow: "0 0 40px rgba(245,158,11,0.2)" }}
                >
                    On its way from<br />
                    <span className="text-amber-400 not-italic font-black">{restaurantName}.</span>
                </h2>
                <p className="mt-4 text-slate-500 text-sm font-bold tracking-widest italic">
                    Loading your tracking{dots}
                </p>
            </div>

            {/* Road + Vehicle scene — fully responsive */}
            <div className="relative w-full max-w-2xl z-10 select-none" style={{ height: 160 }}>

                {/* Road surface */}
                <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{ height: 64, background: "linear-gradient(180deg,#1a1a1e 0%,#111115 100%)", borderTop: "2px solid rgba(42,143,143,0.2)" }}
                >
                    {/* Lane dashes */}
                    <div className="absolute inset-0 overflow-hidden flex items-center" style={{ top: "50%", transform: "translateY(-50%)" }}>
                        <div
                            className="flex gap-6"
                            style={{
                                animation: phase === "drive" ? "road-scroll 0.5s linear infinite" : "none",
                                whiteSpace: "nowrap"
                            }}
                        >
                            {Array.from({ length: 24 }).map((_, i) => (
                                <div key={i} style={{ width: 40, height: 3, background: "rgba(245,166,35,0.22)", borderRadius: 2, flexShrink: 0 }} />
                            ))}
                        </div>
                    </div>
                    {/* Road edge shimmer */}
                    <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(42,143,143,0.25), transparent)" }} />
                </div>

                {/* Vehicle — 🚗 emoji-style SVG, responsive width */}
                <div
                    className="absolute"
                    style={{
                        bottom: 28,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "min(220px, 55vw)",
                        opacity: phase === "exit" ? 0 : 1,
                        animation: phase === "drive" ? "vehicle-rock 0.4s ease-in-out infinite" : "none",
                        transition: phase === "exit" ? "opacity 0.8s ease-in" : undefined,
                    }}
                >
                    {/*
                     * Car viewBox: 0 0 220 110
                     * Anatomy:
                     *  - Two big wheels: cx=52,cy=88,r=19 and cx=168,cy=88,r=19
                     *  - Body + cabin as one continuous smooth path (true 🚗 silhouette)
                     *  - Windows inside the cabin area
                     *  - Headlight, taillight, bumpers
                     *  - Logo badge on door
                     */}
                    <svg
                        width="100%"
                        viewBox="0 0 220 110"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        style={{ display: "block" }}
                    >
                        <defs>
                            <clipPath id="logo-clip-car">
                                <circle cx="110" cy="75" r="13" />
                            </clipPath>
                            {/* Headlight glow filter */}
                            <filter id="hl-glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* === WHEELS (drawn first / behind body) === */}
                        {/* Rear wheel */}
                        <circle cx="52"  cy="88" r="19" fill="#1a1a1e" stroke="#f5a623" strokeWidth="4.5" />
                        <circle cx="52"  cy="88" r="8"  fill="#f5a623" opacity="0.75" />
                        <circle cx="52"  cy="88" r="3.5" fill="#1a1a1e" />
                        {/* Front wheel */}
                        <circle cx="168" cy="88" r="19" fill="#1a1a1e" stroke="#f5a623" strokeWidth="4.5" />
                        <circle cx="168" cy="88" r="8"  fill="#f5a623" opacity="0.75" />
                        <circle cx="168" cy="88" r="3.5" fill="#1a1a1e" />

                        {/*
                         * === CAR BODY + CABIN — single smooth emoji-style path ===
                         *
                         * Reading left→right (rear→front):
                         *  Start at bottom-left (rear bumper)
                         *  Up the rear, curve into the rear roof pillar
                         *  Arch smoothly over the roof (bubble dome)
                         *  Windshield slope down to hood
                         *  Along the hood to the front
                         *  Down to the bumper
                         *  Back along the underside
                         *
                         * The path is intentionally one piece so it looks like
                         * the classic 🚗 silhouette — one smooth fat shape.
                         */}
                        <path
                            d="
                                M 18 88
                                L 18 74
                                Q 18 64  26 58
                                L 52  38
                                Q 64  18  82  16
                                L 138  16
                                Q 158  16  170 36
                                L 192  58
                                Q 200 64  200 74
                                L 200 88
                                Z
                            "
                            fill="#2a8f8f"
                        />
                        {/* Darker underbelly strip for depth */}
                        <path
                            d="
                                M 18 88
                                L 18 78
                                Q 18 72  25 70
                                L 195 70
                                Q 200 70  200 76
                                L 200 88
                                Z
                            "
                            fill="#1f6e6e"
                        />
                        {/* Subtle highlight along the top of the body */}
                        <path
                            d="M 28 60 Q 60 22 110 17 Q 155 13 185 52"
                            stroke="rgba(255,255,255,0.10)"
                            strokeWidth="2.5"
                            fill="none"
                            strokeLinecap="round"
                        />

                        {/* === WINDOWS === */}
                        {/* Rear window */}
                        <path
                            d="M 46 54 L 58 30 Q 64 22 75 22 L 93 22 L 93 54 Z"
                            fill="rgba(200,240,240,0.13)"
                            stroke="rgba(200,240,240,0.30)"
                            strokeWidth="1.2"
                        />
                        {/* Front / windshield */}
                        <path
                            d="M 100 54 L 100 22 L 134 22 Q 148 22 158 32 L 174 54 Z"
                            fill="rgba(200,240,240,0.10)"
                            stroke="rgba(200,240,240,0.28)"
                            strokeWidth="1.2"
                        />
                        {/* Window divider (B-pillar) */}
                        <line x1="97" y1="22" x2="97" y2="54" stroke="rgba(42,143,143,0.8)" strokeWidth="3" strokeLinecap="round" />

                        {/* === LOGO BADGE ON DOOR === */}
                        <circle cx="110" cy="75" r="15" fill="#f5a623" opacity="0.12" />
                        <circle cx="110" cy="75" r="14" stroke="#f5a623" strokeWidth="1.2" strokeOpacity="0.4" fill="none" />
                        <image
                            href="/logo.png"
                            x="96" y="61"
                            width="28" height="28"
                            clipPath="url(#logo-clip-car)"
                            preserveAspectRatio="xMidYMid slice"
                        />

                        {/* === HEADLIGHT (front-right) === */}
                        <ellipse cx="196" cy="68" rx="6" ry="5" fill="#f5a623" opacity="0.95" filter="url(#hl-glow)" />
                        <ellipse cx="196" cy="68" rx="7" ry="6" fill="none" stroke="#f5a623" strokeWidth="1" strokeOpacity="0.5" />

                        {/* === TAILLIGHT (rear-left) === */}
                        <ellipse cx="20" cy="69" rx="4" ry="5.5" fill="#ef4444" opacity="0.9" />
                        <ellipse cx="20" cy="69" rx="4" ry="5.5" fill="#ef4444" opacity="0.25" style={{ filter: "blur(3px)" }} />

                        {/* === BUMPERS === */}
                        {/* Front */}
                        <rect x="192" y="80" width="14" height="5" rx="2.5" fill="#1f6e6e" stroke="#f5a623" strokeWidth="0.8" strokeOpacity="0.35" />
                        {/* Rear */}
                        <rect x="14"  y="80" width="12" height="5" rx="2.5" fill="#1f6e6e" stroke="#ef4444" strokeWidth="0.8" strokeOpacity="0.25" />

                        {/* === EXHAUST PUFFS === */}
                        {phase === "drive" && (
                            <g style={{ animation: "exhaust 0.7s ease-out infinite" }}>
                                <circle cx="12" cy="76" r="5" fill="rgba(255,255,255,0.07)" />
                                <circle cx="4"  cy="73" r="3" fill="rgba(255,255,255,0.04)" />
                            </g>
                        )}

                        {/* === SPEED LINES === */}
                        {phase === "drive" && (
                            <g opacity="0.38" style={{ animation: "speed-lines 0.3s linear infinite" }}>
                                <line x1="16" y1="38" x2="-14" y2="38" stroke="#f5a623" strokeWidth="2.2" strokeLinecap="round" />
                                <line x1="16" y1="52" x2="-22" y2="52" stroke="#f5a623" strokeWidth="1.4" strokeLinecap="round" />
                                <line x1="16" y1="64" x2="-10" y2="64" stroke="#f5a623" strokeWidth="1"   strokeLinecap="round" />
                            </g>
                        )}
                    </svg>
                </div>

                {/* Headlight beam on road */}
                {phase === "drive" && (
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            bottom: 18,
                            left: "calc(50% + min(100px, 25vw))",
                            width: "min(100px, 25vw)",
                            height: 20,
                            background: "linear-gradient(90deg, rgba(245,166,35,0.15), transparent)",
                            borderRadius: "0 50% 50% 0",
                            transform: "skewX(-10deg)"
                        }}
                    />
                )}
            </div>

            {/* City skyline silhouette */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 80 }}>
                <svg width="100%" height="80" preserveAspectRatio="none" viewBox="0 0 1200 80" fill="none" xmlns="http://www.w3.org/2000/svg"
                    style={{ animation: phase === "drive" ? "cityscape-scroll 4s linear infinite" : "none" }}>
                    <rect x="50"   y="30" width="30" height="50" fill="rgba(42,143,143,0.05)" />
                    <rect x="90"   y="10" width="20" height="70" fill="rgba(42,143,143,0.04)" />
                    <rect x="120"  y="40" width="40" height="40" fill="rgba(245,166,35,0.04)" />
                    <rect x="170"  y="20" width="25" height="60" fill="rgba(42,143,143,0.03)" />
                    <rect x="250"  y="35" width="35" height="45" fill="rgba(245,166,35,0.04)" />
                    <rect x="295"  y="15" width="18" height="65" fill="rgba(42,143,143,0.03)" />
                    <rect x="400"  y="25" width="50" height="55" fill="rgba(245,166,35,0.05)" />
                    <rect x="460"  y="5"  width="22" height="75" fill="rgba(42,143,143,0.03)" />
                    <rect x="550"  y="30" width="30" height="50" fill="rgba(245,166,35,0.04)" />
                    <rect x="590"  y="10" width="20" height="70" fill="rgba(42,143,143,0.03)" />
                    <rect x="700"  y="20" width="45" height="60" fill="rgba(245,166,35,0.05)" />
                    <rect x="755"  y="40" width="30" height="40" fill="rgba(42,143,143,0.03)" />
                    <rect x="850"  y="15" width="25" height="65" fill="rgba(245,166,35,0.04)" />
                    <rect x="900"  y="35" width="40" height="45" fill="rgba(42,143,143,0.03)" />
                    <rect x="1000" y="10" width="22" height="70" fill="rgba(245,166,35,0.04)" />
                    <rect x="1050" y="30" width="35" height="50" fill="rgba(42,143,143,0.03)" />
                    <rect x="1100" y="20" width="30" height="60" fill="rgba(245,166,35,0.05)" />
                    <rect x="1150" y="40" width="20" height="40" fill="rgba(42,143,143,0.03)" />
                </svg>
            </div>

            {/* Particle sparks */}
            {phase === "drive" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 rounded-full bg-amber-400"
                            style={{
                                top: `${48 + Math.sin(i * 1.3) * 8}%`,
                                left: `${35 + i * 6}%`,
                                animation: `spark-${i % 3} 0.8s ease-out infinite`,
                                animationDelay: `${i * 0.13}s`,
                                opacity: 0.5
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Progress bar at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
                <div
                    className="h-full bg-amber-500"
                    style={{
                        transition: "width 3.5s linear",
                        width: phase === "enter" ? "0%" : phase === "drive" ? "90%" : "100%"
                    }}
                />
            </div>

            {/* CSS Keyframes */}
            <style>{`
                @keyframes road-scroll {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-64px); }
                }
                @keyframes vehicle-rock {
                    0%, 100% { transform: translateX(-50%) translateY(0) rotate(0deg); }
                    25%      { transform: translateX(-50%) translateY(-1.5px) rotate(0.4deg); }
                    75%      { transform: translateX(-50%) translateY(1px) rotate(-0.3deg); }
                }
                @keyframes exhaust {
                    0%   { transform: translateX(0) scale(1); opacity: 0.4; }
                    100% { transform: translateX(-22px) scale(2.2); opacity: 0; }
                }
                @keyframes cityscape-scroll {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-200px); }
                }
                @keyframes spark-0 {
                    0%   { transform: translate(0,0) scale(1); opacity: 0.5; }
                    100% { transform: translate(-8px, -12px) scale(0); opacity: 0; }
                }
                @keyframes spark-1 {
                    0%   { transform: translate(0,0) scale(1); opacity: 0.4; }
                    100% { transform: translate(-4px, -16px) scale(0); opacity: 0; }
                }
                @keyframes spark-2 {
                    0%   { transform: translate(0,0) scale(1); opacity: 0.5; }
                    100% { transform: translate(-12px, -8px) scale(0); opacity: 0; }
                }
                @keyframes speed-lines {
                    from { opacity: 0.38; transform: translateX(0); }
                    to   { opacity: 0;    transform: translateX(-12px); }
                }
            `}</style>
        </div>
    );
}
