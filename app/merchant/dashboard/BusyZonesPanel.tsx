"use client";

import { useState } from "react";
import { upsertBusyZone, deleteBusyZone } from "../actions";

interface BusyZonesPanelProps {
    restaurantId: string;
    schedules: any[];
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function BusyZonesPanel({ restaurantId, schedules: initialSchedules }: BusyZonesPanelProps) {
    const [schedules, setSchedules] = useState(initialSchedules);
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const data = {
            dayOfWeek: parseInt(fd.get("dayOfWeek") as string),
            startTime: fd.get("startTime") as string,
            endTime: fd.get("endTime") as string,
            extraPrepTime: parseInt(fd.get("extraPrepTime") as string),
            action: fd.get("action") as string
        };
        await upsertBusyZone(restaurantId, data);
        setIsAdding(false);
    };

    const handleDelete = async (id: string) => {
        await deleteBusyZone(id);
        setSchedules(schedules.filter((s) => s.id !== id));
    };

    return (
        <>
            <style>{`
                .bz-panel { background: #0f1219; padding: 18px 20px; }
                .bz-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
                .bz-title { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: 0.02em; }
                .bz-add-btn {
                    font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
                    color: #f97316; background: transparent; border: 1px solid #3a2800;
                    padding: 5px 12px; cursor: pointer; font-family: 'DM Sans', sans-serif;
                }
                .bz-add-btn:hover { background: #1a1200; }
                .bz-desc { font-size: 12px; color: #444; margin-bottom: 16px; line-height: 1.5; }
                .bz-empty {
                    background: #0c0e13; border: 1px solid #1c1f28; padding: 24px;
                    text-align: center; font-size: 11px; font-weight: 600;
                    letter-spacing: 0.1em; text-transform: uppercase; color: #2a2f3a;
                }
                .bz-zone-list { display: flex; flex-direction: column; gap: 8px; }
                .bz-zone-item {
                    background: #0c0e13; border: 1px solid #1c1f28; padding: 10px 14px;
                    display: flex; align-items: center; justify-content: space-between;
                }
                .bz-zone-info { font-size: 12px; color: #ccc; }
                .bz-zone-day { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #f97316; margin-bottom: 2px; }
                .bz-zone-del {
                    background: none; border: 1px solid #2a2f3a; color: #555;
                    width: 24px; height: 24px; cursor: pointer; font-size: 12px;
                    display: flex; align-items: center; justify-content: center;
                }
                .bz-zone-del:hover { border-color: #e24b4a; color: #e24b4a; }

                /* Add zone modal */
                .bz-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.8); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
                .bz-modal { background: #0f1219; border: 1px solid #2a2f3a; padding: 28px; width: 100%; max-width: 420px; position: relative; }
                .bz-modal-title { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; margin-bottom: 20px; }
                .bz-field { margin-bottom: 14px; }
                .bz-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; font-style: italic; text-transform: uppercase; color: #555; display: block; margin-bottom: 6px; }
                .bz-input, .bz-select {
                    width: 100%; background: #0c0e13; border: 1px solid #2a2f3a; color: #ccc;
                    font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 8px 10px; outline: none;
                }
                .bz-input:focus, .bz-select:focus { border-color: #f97316; }
                .bz-actions { display: flex; gap: 8px; margin-top: 20px; }
                .bz-cancel {
                    font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
                    padding: 9px 18px; background: transparent; border: 1px solid #2a2f3a; color: #888;
                    cursor: pointer; font-family: 'DM Sans', sans-serif;
                }
                .bz-submit {
                    font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
                    padding: 9px 18px; background: #f97316; border: none; color: #000;
                    cursor: pointer; flex: 1; font-family: 'DM Sans', sans-serif;
                }
            `}</style>

            <div className="bz-panel">
                <div className="bz-hd">
                    <div className="bz-title">Recurring Busy Zones</div>
                    <button className="bz-add-btn" onClick={() => setIsAdding(true)}>+ Add Zone</button>
                </div>
                <div className="bz-desc">Proactively manage known rush hours (e.g. Friday nights).</div>

                {schedules.length === 0 ? (
                    <div className="bz-empty">No scheduled busy zones yet.</div>
                ) : (
                    <div className="bz-zone-list">
                        {schedules.map((zone) => (
                            <div key={zone.id} className="bz-zone-item">
                                <div>
                                    <div className="bz-zone-day">{DAYS[zone.dayOfWeek]}s</div>
                                    <div className="bz-zone-info">{zone.startTime?.slice(0, 5)} – {zone.endTime?.slice(0, 5)}</div>
                                </div>
                                <button className="bz-zone-del" onClick={() => handleDelete(zone.id)} aria-label="Delete zone">✕</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isAdding && (
                <div className="bz-modal-bg" onClick={() => setIsAdding(false)}>
                    <div className="bz-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="bz-modal-title">Create Busy Zone</div>
                        <form onSubmit={handleAdd}>
                            <div className="bz-field">
                                <label className="bz-label" htmlFor="bz-day">Repeat On</label>
                                <select id="bz-day" name="dayOfWeek" className="bz-select">
                                    {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                                </select>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div className="bz-field">
                                    <label className="bz-label" htmlFor="bz-start">Start Time</label>
                                    <input id="bz-start" type="time" name="startTime" defaultValue="18:00" className="bz-input" />
                                </div>
                                <div className="bz-field">
                                    <label className="bz-label" htmlFor="bz-end">End Time</label>
                                    <input id="bz-end" type="time" name="endTime" defaultValue="20:00" className="bz-input" />
                                </div>
                            </div>
                            <div className="bz-field">
                                <label className="bz-label" htmlFor="bz-prep">Extra Prep Time (mins)</label>
                                <input id="bz-prep" type="number" name="extraPrepTime" defaultValue="15" className="bz-input" />
                            </div>
                            <input type="hidden" name="action" value="BUFFER" />
                            <div className="bz-actions">
                                <button type="button" className="bz-cancel" onClick={() => setIsAdding(false)}>Cancel</button>
                                <button type="submit" className="bz-submit">Create Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
