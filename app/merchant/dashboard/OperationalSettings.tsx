"use client";

import { useState } from "react";
import { updatePrepTime, setBusyDuration, toggleBusyMode } from "../actions";

interface OperationalSettingsProps {
    restaurantId: string;
    currentManualPrepTime: number | null;
    avgPrepTime: number;
    isBusy: boolean;
    busyUntil: string | null;
}

export default function OperationalSettings({ 
    restaurantId, 
    currentManualPrepTime, 
    avgPrepTime,
    isBusy,
    busyUntil
}: OperationalSettingsProps) {
    const [manualPrepTime, setManualPrepTime] = useState<number | null>(currentManualPrepTime);
    const [isUpdatingPrep, setIsUpdatingPrep] = useState(false);
    const [busyMinutes, setBusyMinutes] = useState(30);
    const [isSettingBusy, setIsSettingBusy] = useState(false);

    const handlePrepUpdate = async (val: number | null) => {
        setIsUpdatingPrep(true);
        try {
            await updatePrepTime(restaurantId, val);
            setManualPrepTime(val);
        } catch (e) {
            alert("Failed to update prep time.");
        } finally {
            setIsUpdatingPrep(false);
        }
    };

    const handleSetBusy = async () => {
        setIsSettingBusy(true);
        try {
            await setBusyDuration(restaurantId, busyMinutes);
        } catch (e) {
            alert("Failed to set busy duration.");
        } finally {
            setIsSettingBusy(false);
        }
    };

    const handleToggleBusy = async () => {
        await toggleBusyMode(restaurantId, isBusy);
    };

    const busyUntilDate = busyUntil ? new Date(busyUntil) : null;
    const isTemporarilyBusy = isBusy && busyUntilDate && busyUntilDate > new Date();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Prep Time Control */}
            <div className="card bg-primary/5 border-primary/20 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Preparation Timing</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">Accuracy: 98%</span>
                </div>

                <div className="flex items-center gap-6 mb-8">
                    <div className="flex flex-col items-center justify-center w-24 h-24 rounded-3xl bg-white/5 border border-white/5 shadow-inner">
                        <p className="text-3xl font-black text-white">{manualPrepTime || avgPrepTime}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">MINS</p>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-slate-300 mb-1">
                            {manualPrepTime ? "Manual Override Active" : "AI Smart Prediction"}
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {manualPrepTime 
                                ? "You have manually set the prep time. AI prediction is temporarily paused." 
                                : "AI is predicting prep based on your current order volume."}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-2">
                        {[10, 15, 20, 25, 30].map((mins) => (
                            <button
                                key={mins}
                                onClick={() => handlePrepUpdate(mins)}
                                disabled={isUpdatingPrep}
                                className={`flex-1 py-3 rounded-xl border text-xs font-black transition-all ${
                                    manualPrepTime === mins 
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                                    : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                                }`}
                            >
                                {mins}m
                            </button>
                        ))}
                    </div>
                    {manualPrepTime && (
                        <button 
                            onClick={() => handlePrepUpdate(null)}
                            className="w-full py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary transition-colors"
                        >
                            Reset to AI Prediction
                        </button>
                    )}
                </div>
            </div>

            {/* Busy Mode Control */}
            <div className={`card p-6 transition-all border-l-4 ${isBusy ? 'bg-red-500/5 border-red-500/20 border-l-red-500' : 'bg-emerald-500/5 border-emerald-500/20 border-l-emerald-500'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Terminal Status</h3>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full animate-ping ${isBusy ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isBusy ? 'text-red-400' : 'text-emerald-400'}`}>
                            {isBusy ? 'Paused' : 'Live'}
                        </span>
                    </div>
                </div>

                <div className="mb-8">
                    {isTemporarilyBusy ? (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                            <p className="text-xs font-bold text-red-400 mb-1 uppercase tracking-widest">Self-Pause Active</p>
                            <p className="text-sm font-medium text-white">
                                Resuming in <span className="font-black text-lg">{Math.ceil((busyUntilDate!.getTime() - Date.now()) / 60000)}</span> minutes
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                            {isBusy 
                                ? "Orders are currently paused manually. Customers cannot place new orders." 
                                : "The kitchen is live and accepting orders. Toggle to pause if the kitchen is overwhelmed."}
                        </p>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex gap-3">
                        <button 
                            onClick={handleToggleBusy}
                            className={`flex-[2] btn py-4 text-xs font-black uppercase tracking-widest ${isBusy ? 'bg-emerald-500 text-black hover:bg-emerald-600' : 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'}`}
                        >
                            {isBusy ? 'Resume Orders' : 'Emergency Pause'}
                        </button>
                        
                        {!isBusy && (
                            <div className="flex-[3] flex gap-2">
                                <select 
                                    value={busyMinutes}
                                    onChange={(e) => setBusyMinutes(Number(e.target.value))}
                                    className="bg-white/5 border border-white/10 rounded-xl px-3 text-xs font-bold text-white focus:outline-none focus:border-primary/50"
                                >
                                    <option value={15}>15m</option>
                                    <option value={30}>30m</option>
                                    <option value={60}>1h</option>
                                    <option value={120}>2h</option>
                                </select>
                                <button 
                                    onClick={handleSetBusy}
                                    className="flex-1 btn btn-outline border-white/10 hover:bg-white/5 text-[9px] font-black uppercase tracking-[0.1em] px-2"
                                >
                                    Short Pause
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
