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
                .term-panel { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 16px 18px; border-left: 3px solid #3dd68c; }
                .term-panel.busy { border-left-color: #e24b4a; background: rgba(226,75,74,0.04); border-color: rgba(226,75,74,0.2); }
                .term-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
                .term-title { font-size: 13px; font-weight: 700; color: #ccc; }
                .term-live { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #3dd68c; }
                .term-paused { color: #e24b4a; }
                .term-live-dot { width: 6px; height: 6px; background: #3dd68c; border-radius: 50%; animation: term-pulse 2s infinite; }
                .term-paused-dot { background: #e24b4a; }
                @keyframes term-pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
                .term-desc { font-size: 11px; color: #555; line-height: 1.5; margin-bottom: 14px; }
                .term-actions { display: flex; align-items: center; gap: 8px; }
                .term-emergency {
                    font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
                    padding: 8px 16px; background: rgba(226,75,74,0.15); border: 1px solid rgba(226,75,74,0.3); color: #e24b4a;
                    border-radius: 6px; cursor: pointer; flex: 1; text-align: center; font-family: 'DM Sans', sans-serif;
                    transition: all 0.15s;
                }
                .term-emergency.resume { background: rgba(61,214,140,0.12); border-color: rgba(61,214,140,0.25); color: #3dd68c; }
                .term-emergency:hover { opacity: 0.85; }
                .term-dur-select {
                    background: #0f1210; border: 1px solid #1e2420; color: #888; border-radius: 5px;
                    font-family: 'DM Sans', sans-serif; font-size: 11px; padding: 7px 8px;
                    cursor: pointer; outline: none;
                }
                .term-short-btn {
                    font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
                    padding: 8px 14px; background: transparent; border: 1px solid #1e2420;
                    border-radius: 6px; color: #555; cursor: pointer; font-family: 'DM Sans', sans-serif;
                    transition: all 0.15s;
                }
                .term-short-btn:hover { border-color: #333; color: #888; }
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
