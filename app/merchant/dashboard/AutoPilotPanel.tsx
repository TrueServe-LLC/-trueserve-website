"use client";

import { useState } from "react";
import { updateAutoPilotSettings } from "../actions";

interface AutoPilotPanelProps {
    restaurantId: string;
    autoPilotEnabled: boolean;
    capacityThreshold: number;
}

export default function AutoPilotPanel({ restaurantId, autoPilotEnabled, capacityThreshold }: AutoPilotPanelProps) {
    const [enabled, setEnabled] = useState(autoPilotEnabled);
    const [threshold, setThreshold] = useState(capacityThreshold);

    const handleToggle = async () => {
        const next = !enabled;
        setEnabled(next);
        await updateAutoPilotSettings(restaurantId, next, threshold);
    };

    return (
        <>
            <style>{`
                .ap-panel { background: #0f1219; padding: 18px 20px; }
                .ap-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
                .ap-title-row { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #ccc; }
                .ap-icon {
                    width: 24px; height: 24px; background: #131720; border: 1px solid #2a2f3a;
                    display: flex; align-items: center; justify-content: center;
                }
                .ap-toggle {
                    width: 40px; height: 22px; background: #2a2f3a; border-radius: 2px;
                    position: relative; cursor: pointer; border: none; padding: 0; flex-shrink: 0;
                    transition: background 0.15s;
                }
                .ap-toggle.on { background: rgba(232,162,48,0.25); border: 1px solid #e8a230; }
                .ap-knob {
                    width: 18px; height: 18px; background: #555; border-radius: 1px;
                    position: absolute; top: 2px; left: 2px; transition: left 0.15s, background 0.15s;
                }
                .ap-toggle.on .ap-knob { left: 19px; background: #e8a230; }
                .ap-desc { font-size: 12px; color: #444; line-height: 1.55; margin-bottom: 14px; }
                .ap-threshold-row {
                    display: flex; align-items: center; justify-content: space-between;
                    padding-top: 12px; border-top: 1px solid #1c1f28;
                }
                .ap-threshold-label { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #555; }
                .ap-threshold-val { font-size: 14px; font-weight: 700; color: #e8a230; font-family: 'DM Mono', monospace; }
            `}</style>
            <div className="ap-panel">
                <div className="ap-hd">
                    <div className="ap-title-row">
                        <div className="ap-icon">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                <circle cx="6.5" cy="6.5" r="5" stroke="#888" strokeWidth="1.2"/>
                                <path d="M6.5 4v3l2 1" stroke="#888" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        AI Auto-Pilot
                    </div>
                    <button className={`ap-toggle${enabled ? " on" : ""}`} onClick={handleToggle} aria-label="Toggle AI Auto-Pilot">
                        <div className="ap-knob"></div>
                    </button>
                </div>
                <div className="ap-desc">
                    When enabled, TrueServe AI monitors your kitchen load. If pending orders exceed your capacity, it initiates a 15-minute &ldquo;Smart Pause&rdquo; to let your team catch up.
                </div>
                <div className="ap-threshold-row">
                    <div className="ap-threshold-label">Capacity Threshold</div>
                    <div className="ap-threshold-val">{threshold} Orders</div>
                </div>
            </div>
        </>
    );
}
