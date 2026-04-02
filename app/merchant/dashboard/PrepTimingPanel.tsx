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
                .prep-panel { background: #0f1219; padding: 18px 20px; }
                .prep-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
                .prep-title { font-size: 14px; font-weight: 700; color: #ccc; }
                .prep-accuracy { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #e8a230; background: #1a1200; border: 1px solid #3a2800; padding: 3px 8px; }
                .prep-main { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
                .prep-time-block {
                    width: 72px; height: 72px; background: #0c0e13; border: 1px solid #2a2f3a;
                    display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .prep-time-num { font-size: 28px; font-weight: 700; font-family: 'DM Mono', monospace; color: #fff; line-height: 1; }
                .prep-time-unit { font-size: 9px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #555; margin-top: 2px; }
                .prep-ai-title { font-size: 13px; font-weight: 700; color: #ccc; margin-bottom: 3px; }
                .prep-ai-desc { font-size: 11px; color: #444; line-height: 1.5; }
                .prep-tabs { display: flex; gap: 4px; }
                .prep-tab-btn {
                    font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
                    padding: 7px 14px; background: #0c0e13; border: 1px solid #2a2f3a;
                    color: #444; cursor: pointer; font-family: 'DM Sans', sans-serif;
                }
                .prep-tab-btn.active { background: #e8a230; color: #000; border-color: #e8a230; }
                .prep-tab-btn:hover:not(.active) { border-color: #444; color: #aaa; }
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
