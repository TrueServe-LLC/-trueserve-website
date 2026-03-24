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
        <div className="flex items-center gap-2 p-1 bg-white/[0.03] rounded-full border border-white/10 shadow-lg">
            <button 
                onClick={() => handleToggle("delivery")}
                className={`badge px-6 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    mode === "delivery" 
                    ? "badge-solid-primary" 
                    : "text-slate-500 hover:text-white"
                }`}
            >
                <div className={`w-1.5 h-1.5 rounded-full ${mode === 'delivery' ? 'bg-white' : 'bg-slate-700'}`}></div>
                Delivery
            </button>
            <button 
                onClick={() => handleToggle("pickup")}
                className={`badge px-6 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    mode === "pickup" 
                    ? "badge-solid-primary" 
                    : "text-slate-500 hover:text-white"
                }`}
            >
                <div className={`w-1.5 h-1.5 rounded-full ${mode === 'pickup' ? 'bg-white' : 'bg-slate-700'}`}></div>
                Pickup
            </button>
        </div>
    );
}
