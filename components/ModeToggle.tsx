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
        <div className="flex items-center gap-2 p-1.5 bg-white/[0.03] rounded-2xl border border-white/5 shadow-2xl backdrop-blur-3xl">
            <button 
                onClick={() => handleToggle("delivery")}
                className={`relative px-8 py-3 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-500 rounded-xl ${
                    mode === "delivery" 
                    ? "bg-primary text-black shadow-lg shadow-primary/20" 
                    : "text-slate-500 hover:text-white"
                }`}
            >
                Delivery
            </button>
            <button 
                onClick={() => handleToggle("pickup")}
                className={`relative px-8 py-3 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-500 rounded-xl ${
                    mode === "pickup" 
                    ? "bg-primary text-black shadow-lg shadow-primary/20" 
                    : "text-slate-500 hover:text-white"
                }`}
            >
                Pickup
            </button>
        </div>
    );
}
