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
        <div className="flex items-center gap-1 p-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
            <button 
                onClick={() => handleToggle("delivery")}
                className={`px-5 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    mode === "delivery" 
                    ? "bg-white text-black shadow-xl scale-105" 
                    : "text-slate-400 hover:text-white"
                }`}
            >
                Delivery
            </button>
            <button 
                onClick={() => handleToggle("pickup")}
                className={`px-5 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    mode === "pickup" 
                    ? "bg-white text-black shadow-xl scale-105" 
                    : "text-slate-400 hover:text-white"
                }`}
            >
                Pickup
            </button>
        </div>
    );
}
