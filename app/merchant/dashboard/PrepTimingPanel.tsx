"use client";

import { useState } from "react";
import { updatePrepTime } from "../actions";

interface PrepTimingPanelProps {
    restaurantId: string;
    manualPrepTime: number | null;
    avgPrepTime: number;
}

const PREP_OPTIONS = [10, 15, 20, 25, 30];

export default function PrepTimingPanel({ restaurantId, manualPrepTime, avgPrepTime }: PrepTimingPanelProps) {
    const defaultActive = manualPrepTime ?? avgPrepTime ?? 15;
    const closest = PREP_OPTIONS.reduce((prev, curr) =>
        Math.abs(curr - defaultActive) < Math.abs(prev - defaultActive) ? curr : prev
    );
    const [selected, setSelected] = useState<number>(closest);

    const handleSelect = async (mins: number) => {
        setSelected(mins);
        await updatePrepTime(restaurantId, mins);
    };

    const isAI = !manualPrepTime;

    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 hover:bg-white/[0.04] transition-all relative overflow-hidden group">
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bebas italic text-white uppercase tracking-wider">Timing Telemetry</h3>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 italic">// Prep-Time Calibration</p>
                </div>
                <div className="px-3 py-1 bg-[#3dd68c]/10 border border-[#3dd68c]/30 text-[#3dd68c] font-black text-[9px] uppercase tracking-widest rounded-full italic shadow-[0_0_15px_rgba(61,214,140,0.1)]">
                    Accuracy: 98%
                </div>
            </div>

            <div className="flex items-center gap-8 mb-8">
                <div className="w-24 h-24 bg-black/40 border border-white/10 rounded-2xl flex flex-col items-center justify-center shadow-inner group-hover:border-[#e8a230]/30 transition-colors">
                    <span className="text-4xl font-bebas italic text-[#e8a230] leading-none">{selected}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 mt-1">Mins</span>
                </div>
                
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isAI ? 'bg-blue-400' : 'bg-red-400'} animate-pulse`}></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white italic">
                            {isAI ? "AI Smart Prediction Active" : "Manual Handshake Override"}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px]">
                        {isAI
                            ? "Predictive algos are calculating prep time based on sector load."
                            : "Manual override established. Sector intelligence is held at current baseline."}
                    </p>
                </div>
            </div>

            <div className="flex gap-2">
                {PREP_OPTIONS.map((m) => (
                    <button
                        key={m}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border italic shadow-sm
                            ${selected === m 
                                ? "bg-[#e8a230] text-black border-[#e8a230] shadow-glow shadow-[#e8a230]/10" 
                                : "bg-white/[0.03] text-slate-500 border-white/5 hover:text-white hover:border-white/20"}`}
                        onClick={() => handleSelect(m)}
                    >
                        {m}m
                    </button>
                ))}
            </div>

            <div className="absolute top-0 right-0 p-8 text-6xl opacity-[0.01] font-bebas italic select-none pointer-events-none">CLOCK</div>
        </div>
    );
}

