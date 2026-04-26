"use client";

import { useState } from "react";
import { updateRestaurantHours } from "../actions";

interface HoursPanelProps {
    restaurantId: string;
    openTime: string | null;
    closeTime: string | null;
}

function to12h(time24: string): string {
    const [hStr, mStr] = time24.replace(':00', '').split(':');
    const h = parseInt(hStr, 10);
    const m = mStr || '00';
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${period}`;
}

function toInputVal(timeStr: string | null, fallback: string): string {
    if (!timeStr) return fallback;
    // stored as "HH:MM:SS" — strip seconds for <input type="time">
    return timeStr.slice(0, 5);
}

export default function HoursPanel({ restaurantId, openTime, closeTime }: HoursPanelProps) {
    const [editing, setEditing] = useState(false);
    const [open, setOpen] = useState(toInputVal(openTime, "08:00"));
    const [close, setClose] = useState(toInputVal(closeTime, "22:00"));
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

    const displayOpen = to12h(toInputVal(openTime, "08:00"));
    const displayClose = to12h(toInputVal(closeTime, "22:00"));

    // Is the restaurant currently open?
    const now = new Date();
    const currentHHMM = now.toTimeString().slice(0, 5);
    const openVal = toInputVal(openTime, "08:00");
    const closeVal = toInputVal(closeTime, "22:00");
    const isOpen = currentHHMM >= openVal && currentHHMM <= closeVal;

    const handleSave = async () => {
        setSaving(true);
        setMsg(null);
        const res = await updateRestaurantHours(restaurantId, open, close);
        setSaving(false);
        if (res?.error) {
            setMsg({ text: res.error, ok: false });
        } else {
            setMsg({ text: "Hours updated!", ok: true });
            setEditing(false);
            setTimeout(() => setMsg(null), 3000);
        }
    };

    return (
        <>
            <style>{`
                .hrs-panel { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 16px 18px; }
                .hrs-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
                .hrs-title { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: -0.01em; }
                .hrs-badge-open { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #4dca80; background: rgba(77,202,128,0.08); border: 1px solid rgba(77,202,128,0.22); padding: 3px 8px; border-radius: 4px; }
                .hrs-badge-closed { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #f87171; background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.22); padding: 3px 8px; border-radius: 4px; }
                .hrs-display { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
                .hrs-time-block { flex: 1; background: #0f1210; border: 1px solid #1e2420; border-radius: 6px; padding: 10px 12px; }
                .hrs-time-label { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #555; margin-bottom: 3px; }
                .hrs-time-val { font-size: 18px; font-weight: 700; color: #fff; font-family: 'DM Mono', monospace; }
                .hrs-sep { font-size: 18px; color: #333; font-weight: 700; }
                .hrs-edit-btn { font-size: 11px; font-weight: 700; color: #f97316; background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.22); border-radius: 5px; padding: 5px 12px; cursor: pointer; white-space: nowrap; }
                .hrs-edit-btn:hover { background: rgba(249,115,22,0.14); }
                .hrs-edit-row { display: flex; align-items: flex-end; gap: 8px; flex-wrap: wrap; }
                .hrs-field { display: flex; flex-direction: column; gap: 4px; }
                .hrs-field label { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #555; }
                .hrs-field input[type="time"] { background: #0f1210; border: 1px solid #f97316; color: #fff; font-size: 13px; border-radius: 5px; padding: 7px 10px; outline: none; font-family: 'DM Mono', monospace; }
                .hrs-save-btn { background: #f97316; color: #000; font-size: 12px; font-weight: 700; border: none; border-radius: 5px; padding: 8px 16px; cursor: pointer; }
                .hrs-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .hrs-cancel-btn { background: none; border: none; color: #555; font-size: 11px; cursor: pointer; padding: 6px 8px; }
                .hrs-cancel-btn:hover { color: #fff; }
                .hrs-msg-ok { font-size: 11px; color: #4dca80; margin-top: 6px; }
                .hrs-msg-err { font-size: 11px; color: #f87171; margin-top: 6px; }
                .hrs-note { font-size: 11px; color: #555; margin-top: 8px; line-height: 1.4; }
            `}</style>

            <div className="hrs-panel">
                <div className="hrs-hd">
                    <div className="hrs-title">Operating Hours</div>
                    {isOpen
                        ? <span className="hrs-badge-open">● Open Now</span>
                        : <span className="hrs-badge-closed">● Closed Now</span>
                    }
                </div>

                {!editing ? (
                    <>
                        <div className="hrs-display">
                            <div className="hrs-time-block">
                                <div className="hrs-time-label">Opens</div>
                                <div className="hrs-time-val">{displayOpen}</div>
                            </div>
                            <div className="hrs-sep">→</div>
                            <div className="hrs-time-block">
                                <div className="hrs-time-label">Closes</div>
                                <div className="hrs-time-val">{displayClose}</div>
                            </div>
                            <button className="hrs-edit-btn" onClick={() => setEditing(true)}>Edit</button>
                        </div>
                        <div className="hrs-note">
                            Customers can't order outside these hours. Use Busy Zones for specific day pauses.
                        </div>
                    </>
                ) : (
                    <>
                        <div className="hrs-edit-row">
                            <div className="hrs-field">
                                <label>Opens</label>
                                <input
                                    type="time"
                                    value={open}
                                    onChange={e => setOpen(e.target.value)}
                                    disabled={saving}
                                />
                            </div>
                            <div className="hrs-field">
                                <label>Closes</label>
                                <input
                                    type="time"
                                    value={close}
                                    onChange={e => setClose(e.target.value)}
                                    disabled={saving}
                                />
                            </div>
                            <button className="hrs-save-btn" onClick={handleSave} disabled={saving}>
                                {saving ? "Saving…" : "Save"}
                            </button>
                            <button className="hrs-cancel-btn" onClick={() => { setEditing(false); setMsg(null); }}>
                                Cancel
                            </button>
                        </div>
                        {msg && (
                            <div className={msg.ok ? "hrs-msg-ok" : "hrs-msg-err"}>{msg.text}</div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
