"use client";

import { useState } from "react";
import { toggleBusyMode, setBusyDuration } from "../actions";

interface TerminalStatusPanelProps {
    restaurantId: string;
    isBusy: boolean;
    busyUntil: string | null;
}

export default function TerminalStatusPanel({ restaurantId, isBusy: initialBusy, busyUntil }: TerminalStatusPanelProps) {
    const [isBusy, setIsBusy] = useState(initialBusy);
    const [duration, setDuration] = useState("30");

    const handleEmergencyPause = async () => {
        await toggleBusyMode(restaurantId, isBusy);
        setIsBusy(!isBusy);
    };

    const handleShortPause = async () => {
        await setBusyDuration(restaurantId, parseInt(duration));
        setIsBusy(true);
    };

    return (
        <div className={`relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 hover:bg-white/[0.04] transition-all group min-h-[240px]`}>
            {/* Status Sidebar Indicator */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500 ${isBusy ? 'bg-red-500 shadow-[2px_0_15px_rgba(239,68,68,0.3)]' : 'bg-[#3dd68c] shadow-[2px_0_15px_rgba(61,214,140,0.3)]'}`}></div>

            <div className="flex justify-between items-center mb-6 pl-2">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bebas italic text-white uppercase tracking-wider">Operational Handshake</h3>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 italic">// Terminal Link Status</p>
                </div>
                <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border ${isBusy ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-[#3dd68c]/10 border-[#3dd68c]/30 text-[#3dd68c]'} transition-colors duration-500`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isBusy ? 'bg-red-500' : 'bg-[#3dd68c]'} animate-pulse`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest italic">{isBusy ? "Protocol: Paused" : "Status: Live"}</span>
                </div>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[420px] mb-8 pl-2">
                {isBusy
                    ? "Inbound order encryption is currently suspended. Perimeter simulation suggests resuming protocols once kitchen bandwidth stabilizes."
                    : "Terminal uplink is active. Synchronized with the Perimeter Fleet. Toggle emergency broadcast to suspend traffic during peak load."}
            </p>

            <div className="flex flex-wrap items-center gap-4 pl-2">
                <button 
                    className={`flex-1 min-w-[160px] py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all italic shadow-lg
                        ${isBusy 
                            ? "bg-[#3dd68c] text-black hover:scale-[1.02] shadow-[#3dd68c]/10" 
                            : "bg-red-500 text-white hover:scale-[1.02] shadow-red-500/10"}`} 
                    onClick={handleEmergencyPause}
                >
                    {isBusy ? "Resume Uplink Protocols" : "Emergency Pause Broadcast"}
                </button>

                {!isBusy && (
                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-1">
                        <select
                            className="bg-transparent border-none text-[10px] font-black text-white px-4 py-2 outline-none cursor-pointer uppercase tracking-widest italic"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            aria-label="Pause duration"
                        >
                            <option value="30">30m Cycle</option>
                            <option value="15">15m Cycle</option>
                            <option value="60">60m Cycle</option>
                        </select>
                        <button 
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all italic"
                            onClick={handleShortPause}
                        >
                            Execute
                        </button>
                    </div>
                )}
            </div>

            <div className="absolute top-0 right-0 p-8 text-6xl opacity-[0.01] font-bebas italic select-none pointer-events-none">NODE</div>
        </div>
    );
}

