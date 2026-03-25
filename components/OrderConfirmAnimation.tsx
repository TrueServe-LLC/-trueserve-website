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
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
            style={{ background: "#09090b" }}
        >
            {/* Radial gold glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(245,158,11,0.08) 0%, transparent 70%)"
                }}
            />

            {/* Top text */}
            <div
                className="relative z-10 text-center mb-14 transition-all duration-700"
                style={{
                    opacity: phase === "exit" ? 0 : 1,
                    transform: phase === "enter" ? "translateY(10px)" : "translateY(0)",
                    transition: "opacity 0.5s, transform 0.6s"
                }}
            >
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-amber-500/70 mb-3 italic">
                    Order Confirmed
                </p>
                <h2
                    className="text-4xl md:text-5xl font-serif italic text-white tracking-tight leading-tight"
                    style={{ textShadow: "0 0 40px rgba(245,158,11,0.2)" }}
                >
                    On its way from<br />
                    <span className="text-amber-400 not-italic font-black">{restaurantName}.</span>
                </h2>
                <p className="mt-5 text-slate-500 text-sm font-bold tracking-widest italic">
                    Loading your tracking{dots}
                </p>
            </div>

            {/* Road + Vehicle scene */}
            <div className="relative w-full max-w-2xl z-10 select-none" style={{ height: 160 }}>
                {/* Road */}
                <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{ height: 64, background: "linear-gradient(180deg,#1a1a1e 0%,#111115 100%)", borderTop: "2px solid rgba(245,158,11,0.15)" }}
                >
                    {/* Road center dashes — animated scroll */}
                    <div className="absolute inset-0 overflow-hidden flex items-center" style={{ top: "50%", transform: "translateY(-50%)" }}>
                        <div
                            className="flex gap-6"
                            style={{
                                animation: phase === "drive" ? "road-scroll 0.5s linear infinite" : "none",
                                whiteSpace: "nowrap"
                            }}
                        >
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} style={{ width: 40, height: 3, background: "rgba(245,158,11,0.25)", borderRadius: 2, flexShrink: 0 }} />
                            ))}
                        </div>
                    </div>
                    {/* Road edge shimmer */}
                    <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent)" }} />
                </div>

                {/* Vehicle — TrueServe branded scooter/car SVG */}
                <div
                    className="absolute"
                    style={{
                        bottom: 52,
                        left: "50%",
                        transform: "translateX(-50%)",
                        transition: phase === "enter" ? "left 0s" : phase === "drive" ? "none" : "left 0.8s ease-in, opacity 0.8s ease-in",
                        opacity: phase === "exit" ? 0 : 1,
                        animation: phase === "drive" ? "vehicle-rock 0.4s ease-in-out infinite" : "none",
                    }}
                >
                    {/* Vehicle body */}
                    <svg width="160" height="80" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Exhaust puffs */}
                        {phase === "drive" && (
                            <g style={{ animation: "exhaust 0.6s ease-out infinite" }}>
                                <circle cx="8" cy="54" r="4" fill="rgba(255,255,255,0.06)" />
                                <circle cx="2" cy="52" r="2.5" fill="rgba(255,255,255,0.04)" />
                            </g>
                        )}

                        {/* Wheels */}
                        <circle cx="38" cy="62" r="13" fill="#1a1a1e" stroke="#f59e0b" strokeWidth="3" />
                        <circle cx="38" cy="62" r="5" fill="#f59e0b" opacity="0.6" />
                        <circle cx="122" cy="62" r="13" fill="#1a1a1e" stroke="#f59e0b" strokeWidth="3" />
                        <circle cx="122" cy="62" r="5" fill="#f59e0b" opacity="0.6" />

                        {/* Car body */}
                        <rect x="20" y="35" width="120" height="30" rx="6" fill="#1c1c22" />
                        <rect x="20" y="35" width="120" height="30" rx="6" stroke="rgba(245,158,11,0.3)" strokeWidth="1.5" />

                        {/* Cabin */}
                        <path d="M42 35 L55 14 L105 14 L118 35 Z" fill="#16161b" stroke="rgba(245,158,11,0.2)" strokeWidth="1.5" />

                        {/* Windows */}
                        <path d="M58 32 L65 16 L95 16 L102 32 Z" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.25)" strokeWidth="1" />

                        {/* Headlight */}
                        <rect x="134" y="42" width="8" height="8" rx="2" fill="#f59e0b" opacity="0.9" />
                        <rect x="134" y="42" width="8" height="8" rx="2" fill="#f59e0b" style={{ filter: "blur(4px)" }} opacity="0.5" />

                        {/* Taillight */}
                        <rect x="18" y="44" width="5" height="6" rx="1.5" fill="#ef4444" opacity="0.8" />

                        {/* TrueServe logo on door */}
                        <text x="65" y="53" fontFamily="serif" fontSize="9" fontStyle="italic" fontWeight="900" fill="#f59e0b" opacity="0.8">TrueServe</text>

                        {/* Speed lines when driving */}
                        {phase === "drive" && (
                            <g opacity="0.3" style={{ animation: "speed-lines 0.3s linear infinite" }}>
                                <line x1="0" y1="30" x2="-20" y2="30" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                                <line x1="0" y1="40" x2="-30" y2="40" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
                                <line x1="0" y1="50" x2="-15" y2="50" stroke="#f59e0b" strokeWidth="0.8" strokeLinecap="round" />
                            </g>
                        )}
                    </svg>
                </div>

                {/* Headlight beam on road */}
                {phase === "drive" && (
                    <div
                        className="absolute"
                        style={{
                            bottom: 36,
                            left: "calc(50% + 74px)",
                            width: 80,
                            height: 20,
                            background: "linear-gradient(90deg, rgba(245,158,11,0.12), transparent)",
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
                    {/* Buildings */}
                    <rect x="50" y="30" width="30" height="50" fill="rgba(245,158,11,0.04)" />
                    <rect x="90" y="10" width="20" height="70" fill="rgba(245,158,11,0.03)" />
                    <rect x="120" y="40" width="40" height="40" fill="rgba(245,158,11,0.05)" />
                    <rect x="170" y="20" width="25" height="60" fill="rgba(245,158,11,0.03)" />
                    <rect x="250" y="35" width="35" height="45" fill="rgba(245,158,11,0.04)" />
                    <rect x="295" y="15" width="18" height="65" fill="rgba(245,158,11,0.03)" />
                    <rect x="400" y="25" width="50" height="55" fill="rgba(245,158,11,0.05)" />
                    <rect x="460" y="5" width="22" height="75" fill="rgba(245,158,11,0.03)" />
                    <rect x="550" y="30" width="30" height="50" fill="rgba(245,158,11,0.04)" />
                    <rect x="590" y="10" width="20" height="70" fill="rgba(245,158,11,0.03)" />
                    <rect x="700" y="20" width="45" height="60" fill="rgba(245,158,11,0.05)" />
                    <rect x="755" y="40" width="30" height="40" fill="rgba(245,158,11,0.03)" />
                    <rect x="850" y="15" width="25" height="65" fill="rgba(245,158,11,0.04)" />
                    <rect x="900" y="35" width="40" height="45" fill="rgba(245,158,11,0.03)" />
                    <rect x="1000" y="10" width="22" height="70" fill="rgba(245,158,11,0.04)" />
                    <rect x="1050" y="30" width="35" height="50" fill="rgba(245,158,11,0.03)" />
                    <rect x="1100" y="20" width="30" height="60" fill="rgba(245,158,11,0.05)" />
                    <rect x="1150" y="40" width="20" height="40" fill="rgba(245,158,11,0.03)" />
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
                    25%      { transform: translateX(-50%) translateY(-1.5px) rotate(0.3deg); }
                    75%      { transform: translateX(-50%) translateY(1px) rotate(-0.2deg); }
                }
                @keyframes exhaust {
                    0%   { transform: translateX(0) scale(1); opacity: 0.4; }
                    100% { transform: translateX(-20px) scale(2); opacity: 0; }
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
                    from { opacity: 0.3; transform: translateX(0); }
                    to   { opacity: 0; transform: translateX(-10px); }
                }
            `}</style>
        </div>
    );
}
