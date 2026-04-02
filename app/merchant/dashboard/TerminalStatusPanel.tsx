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
        <>
            <style>{`
                .term-panel { background: #0f1219; padding: 18px 20px; border-left: 3px solid #3dd68c; }
                .term-panel.busy { border-left-color: #e24b4a; }
                .term-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
                .term-title { font-size: 14px; font-weight: 700; color: #ccc; }
                .term-live { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #3dd68c; }
                .term-paused { color: #e24b4a; }
                .term-live-dot { width: 6px; height: 6px; background: #3dd68c; border-radius: 50%; animation: term-pulse 2s infinite; }
                .term-paused-dot { background: #e24b4a; }
                @keyframes term-pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
                .term-desc { font-size: 12px; color: #555; line-height: 1.5; margin-bottom: 14px; }
                .term-actions { display: flex; align-items: center; gap: 8px; }
                .term-emergency {
                    font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
                    padding: 9px 18px; background: #e24b4a; border: none; color: #fff;
                    cursor: pointer; flex: 1; text-align: center; font-family: 'DM Sans', sans-serif;
                }
                .term-emergency.resume { background: #22a464; }
                .term-emergency:hover { opacity: 0.9; }
                .term-dur-select {
                    background: #0c0e13; border: 1px solid #2a2f3a; color: #ccc;
                    font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 8px 10px;
                    cursor: pointer; outline: none;
                }
                .term-short-btn {
                    font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
                    padding: 9px 16px; background: transparent; border: 1px solid #2a2f3a;
                    color: #888; cursor: pointer; font-family: 'DM Sans', sans-serif;
                }
                .term-short-btn:hover { border-color: #555; color: #ccc; }
            `}</style>
            <div className={`term-panel${isBusy ? " busy" : ""}`}>
                <div className="term-hd">
                    <div className="term-title">Terminal Status</div>
                    <div className={`term-live${isBusy ? " term-paused" : ""}`}>
                        <span className={`term-live-dot${isBusy ? " term-paused-dot" : ""}`}></span>
                        {isBusy ? "Paused" : "Live"}
                    </div>
                </div>
                <div className="term-desc">
                    {isBusy
                        ? "Orders are currently paused. Customers cannot place new orders until you resume."
                        : "The kitchen is live and accepting orders. Toggle to pause if the kitchen is overwhelmed."}
                </div>
                <div className="term-actions">
                    <button className={`term-emergency${isBusy ? " resume" : ""}`} onClick={handleEmergencyPause}>
                        {isBusy ? "Resume Orders" : "Emergency Pause"}
                    </button>
                    {!isBusy && (
                        <>
                            <select
                                className="term-dur-select"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                aria-label="Pause duration"
                            >
                                <option value="30">30m</option>
                                <option value="15">15m</option>
                                <option value="60">60m</option>
                            </select>
                            <button className="term-short-btn" onClick={handleShortPause}>Short Pause</button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
