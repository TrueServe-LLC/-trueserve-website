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
        <>
            <style>{`
                .prep-panel { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 16px 18px; }
                .prep-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
                .prep-title { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: -0.01em; }
                .prep-accuracy { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #f97316; background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.2); padding: 3px 8px; border-radius: 4px; }
                .prep-main { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
                .prep-time-block {
                    width: 66px; height: 66px; background: #0f1210; border: 1px solid #1e2420;
                    border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .prep-time-num { font-size: 27px; font-weight: 700; font-family: 'DM Mono', monospace; color: #fff; line-height: 1; }
                .prep-time-unit { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #555; margin-top: 2px; }
                .prep-ai-title { font-size: 13px; font-weight: 700; color: #f97316; margin-bottom: 3px; }
                .prep-ai-desc { font-size: 11px; color: #555; line-height: 1.5; }
                .prep-tabs { display: flex; gap: 4px; }
                .prep-tab-btn {
                    font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
                    padding: 6px 13px; background: #0f1210; border: 1px solid #1e2420;
                    border-radius: 5px; color: #444; cursor: pointer; font-family: 'DM Sans', sans-serif;
                    transition: all 0.15s;
                }
                .prep-tab-btn.active { background: #f97316; color: #000; border-color: #f97316; }
                .prep-tab-btn:hover:not(.active) { border-color: #333; color: #888; }
            `}</style>
            <div className="prep-panel">
                <div className="prep-hd">
                    <div className="prep-title">Preparation Timing</div>
                    <div className="prep-accuracy">Accuracy: 98%</div>
                </div>
                <div className="prep-main">
                    <div className="prep-time-block">
                        <div className="prep-time-num">{selected}</div>
                        <div className="prep-time-unit">Mins</div>
                    </div>
                    <div>
                        <div className="prep-ai-title">{isAI ? "AI Smart Prediction" : "Manual Override"}</div>
                        <div className="prep-ai-desc">
                            {isAI
                                ? "AI is predicting prep time based on your current order volume."
                                : "You have manually set the prep time. AI prediction is paused."}
                        </div>
                    </div>
                </div>
                <div className="prep-tabs">
                    {PREP_OPTIONS.map((m) => (
                        <button
                            key={m}
                            className={`prep-tab-btn${selected === m ? " active" : ""}`}
                            onClick={() => handleSelect(m)}
                        >
                            {m}m
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
