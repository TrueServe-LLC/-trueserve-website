"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ModeToggle() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentMode = searchParams.get("mode") || "delivery";
    const [mode, setMode] = useState(currentMode);

    useEffect(() => {
        setMode(currentMode);
    }, [currentMode]);

    const handleToggle = (newMode: string) => {
        if (newMode === mode) return;
        setMode(newMode);
        
        const params = new URLSearchParams(searchParams.toString());
        params.set("mode", newMode);
        router.push(`/restaurants?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl">
            <button 
                onClick={() => handleToggle("delivery")}
                className={`px-6 py-2 glass-pill text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-500 ${
                    mode === "delivery" 
                    ? "bg-white text-black shadow-primary/20" 
                    : "bg-transparent text-slate-400 hover:text-white border-transparent"
                }`}
            >
                Delivery
            </button>
            <button 
                onClick={() => handleToggle("pickup")}
                className={`px-6 py-2 glass-pill text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-500 ${
                    mode === "pickup" 
                    ? "bg-white text-black shadow-primary/20" 
                    : "bg-transparent text-slate-400 hover:text-white border-transparent"
                }`}
            >
                Pickup
            </button>
        </div>
    );
}
