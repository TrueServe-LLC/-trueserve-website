"use client";

import React, { useState, useTransition } from "react";
import { upsertPricingRule, toggleRuleStatus, deletePricingRule } from "@/app/admin/pricing/actions";

interface PricingRule {
    id: string;
    name: string;
    basePay: number;
    perMileRate: number;
    waitTimeRate: number;
    boostMultiplier: number;
    serviceFree: number;
    isActive: boolean;
    startDate: string;
    endDate?: string;
    zoneId?: string;
    daysOfWeek: number[];
    startTime?: string;
    endTime?: string;
    priority: number;
    isABTest?: boolean;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function PricingRulesManager({ initialRules }: { initialRules: any[] }) {
    const [rules, setRules] = useState<PricingRule[]>(initialRules);
    const [editingRule, setEditingRule] = useState<Partial<PricingRule> | null>(null);
    const [showSim, setShowSim] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Simulator state
    const [simMiles, setSimMiles] = useState(5);
    const [simWait, setSimWait] = useState(10);
    const [simOph, setSimOph] = useState(2);
    const [simResult, setSimResult] = useState<any>(null);

    const handleSave = async () => {
        if (!editingRule?.name) return;
        startTransition(async () => {
            try {
                const saved = await upsertPricingRule(editingRule);
                if (editingRule.id) setRules(prev => prev.map(r => r.id === saved.id ? saved : r));
                else setRules(prev => [saved, ...prev]);
                setEditingRule(null);
            } catch (e) { console.error(e); }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this pricing rule?")) return;
        startTransition(async () => {
            await deletePricingRule(id);
            setRules(prev => prev.filter(r => r.id !== id));
        });
    };

    const handleToggle = async (id: string, current: boolean) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !current } : r));
        startTransition(async () => {
            try { await toggleRuleStatus(id, !current); }
            catch { setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: current } : r)); }
        });
    };

    const runSim = () => {
        const active = [...rules].filter(r => r.isActive).sort((a, b) => b.priority - a.priority)[0];
        if (!active) { setSimResult({ error: "No active rules." }); return; }
        const base = Number(active.basePay);
        const dist = Number(active.perMileRate) * simMiles;
        const wait = Number(active.waitTimeRate) * simWait;
        const total = base + dist + wait + (base + dist + wait) * (Number(active.boostMultiplier) - 1);
        const tripHours = (simMiles / 20) + (simWait / 60);
        const grossHourly = total / tripHours;
        const netHourly = grossHourly - (9.99 / 160 / simOph);
        setSimResult({ total: total.toFixed(2), base: base.toFixed(2), dist: dist.toFixed(2), multiplier: active.boostMultiplier, rule: active.name, netHourly: netHourly.toFixed(2) });
    };

    return (
        <>
            <style>{`
                .pr-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
                .pr-toolbar-title { font-size: 15px; font-weight: 600; color: #fff; }
                .pr-toolbar-sub { font-size: 12px; color: #555; margin-top: 2px; }
                .pr-btn { font-size: 12px; font-weight: 600; padding: 7px 16px; border-radius: 6px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
                .pr-btn.primary { background: #f97316; color: #000; }
                .pr-btn.primary:hover { background: #fb923c; }
                .pr-btn.outline { background: #1e2420; color: #ccc; border: 1px solid #2e3830; }
                .pr-btn.outline:hover { border-color: #f97316; color: #f97316; }
                .pr-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .pr-sim { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
                .pr-sim-title { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 14px; }
                .pr-sim-body { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                .pr-sim-label { font-size: 12px; color: #777; margin-bottom: 4px; }
                .pr-sim-label span { color: #f97316; font-weight: 600; }
                .pr-sim-range { width: 100%; accent-color: #f97316; margin-bottom: 12px; }
                .pr-sim-result { background: #0f1210; border: 1px solid #2e3830; border-radius: 6px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
                .pr-sim-total { font-size: 36px; font-weight: 700; color: #fff; }
                .pr-sim-row { display: flex; justify-content: space-between; font-size: 12px; color: #777; }
                .pr-sim-row span { color: #ccc; }

                .pr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
                .pr-card { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 16px; position: relative; }
                .pr-card.inactive { opacity: 0.5; }
                .pr-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
                .pr-card-name { font-size: 14px; font-weight: 600; color: #fff; }
                .pr-card-meta { font-size: 11px; color: #555; margin-top: 2px; }
                .pr-card-actions { display: flex; gap: 6px; }
                .pr-card-icon-btn { background: none; border: none; color: #555; cursor: pointer; padding: 4px; border-radius: 4px; font-size: 14px; line-height: 1; }
                .pr-card-icon-btn:hover { color: #f97316; background: rgba(249,115,22,0.1); }
                .pr-card-icon-btn.del:hover { color: #f87171; background: rgba(248,113,113,0.1); }
                .pr-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
                .pr-stat { background: #0f1210; border: 1px solid #1e2420; border-radius: 6px; padding: 10px; }
                .pr-stat-label { font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
                .pr-stat-value { font-size: 18px; font-weight: 600; color: #fff; }
                .pr-stat-value.orange { color: #f97316; }
                .pr-days { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
                .pr-day { width: 24px; height: 24px; border-radius: 50%; font-size: 10px; font-weight: 600; display: flex; align-items: center; justify-content: center; border: 1px solid #2e3830; color: #555; }
                .pr-day.active { background: rgba(249,115,22,0.15); color: #f97316; border-color: rgba(249,115,22,0.3); }
                .pr-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #1e2420; }
                .pr-status { display: flex; align-items: center; gap: 6px; font-size: 11px; }
                .pr-dot { width: 6px; height: 6px; border-radius: 50%; }
                .pr-dot.live { background: #34d399; }
                .pr-dot.off { background: #444; }
                .pr-toggle-btn { font-size: 11px; padding: 4px 10px; border-radius: 4px; border: 1px solid #2e3830; background: #1e2420; color: #aaa; cursor: pointer; }
                .pr-toggle-btn:hover { border-color: #f97316; color: #f97316; }
                .pr-surge-badge { position: absolute; top: 10px; right: 10px; background: #f97316; color: #000; font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.06em; }
                .pr-empty { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 40px; text-align: center; color: #555; font-size: 13px; }

                .pr-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
                .pr-modal { background: #0f1210; border: 1px solid #2e3830; border-radius: 10px; padding: 28px; width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto; position: relative; }
                .pr-modal-title { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 20px; }
                .pr-modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: #555; cursor: pointer; font-size: 18px; }
                .pr-modal-close:hover { color: #fff; }
                .pr-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .pr-modal-field { margin-bottom: 14px; }
                .pr-modal-label { font-size: 12px; color: #777; margin-bottom: 5px; display: block; }
                .pr-modal-input { width: 100%; background: #0a0c09; border: 1px solid #2e3830; color: #fff; font-size: 13px; padding: 8px 12px; border-radius: 6px; outline: none; box-sizing: border-box; }
                .pr-modal-input:focus { border-color: #f97316; }
                .pr-days-grid { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
                .pr-day-btn { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; border: 1px solid #2e3830; background: #1e2420; color: #555; cursor: pointer; }
                .pr-day-btn.selected { background: rgba(249,115,22,0.15); color: #f97316; border-color: rgba(249,115,22,0.3); }
                .pr-modal-footer { display: flex; gap: 10px; margin-top: 20px; }
                @media (max-width: 900px) { .pr-grid { grid-template-columns: repeat(2, 1fr); } .pr-sim-body { grid-template-columns: 1fr; } }
                @media (max-width: 600px) { .pr-grid { grid-template-columns: 1fr; } .pr-modal-grid { grid-template-columns: 1fr; } }
            `}</style>

            {/* Toolbar */}
            <div className="pr-toolbar">
                <div>
                    <div className="pr-toolbar-title">Pricing Engine</div>
                    <div className="pr-toolbar-sub">Dynamic base pay, mileage rates, and surge policies</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="pr-btn outline" onClick={() => setShowSim(!showSim)}>
                        🧮 {showSim ? "Hide Simulator" : "Payout Simulator"}
                    </button>
                    <button className="pr-btn primary" onClick={() => setEditingRule({
                        name: "New Rule", basePay: 3.50, perMileRate: 0.60,
                        waitTimeRate: 0.25, boostMultiplier: 1.0, priority: 0,
                        isActive: true, daysOfWeek: [0,1,2,3,4,5,6]
                    })}>
                        + Add Rule
                    </button>
                </div>
            </div>

            {/* Simulator */}
            {showSim && (
                <div className="pr-sim">
                    <div className="pr-sim-title">Payout Simulator</div>
                    <div className="pr-sim-body">
                        <div>
                            <div className="pr-sim-label">Distance: <span>{simMiles} mi</span></div>
                            <input type="range" min="1" max="50" value={simMiles} onChange={e => setSimMiles(Number(e.target.value))} className="pr-sim-range" />
                            <div className="pr-sim-label">Wait Time: <span>{simWait} min</span></div>
                            <input type="range" min="0" max="60" value={simWait} onChange={e => setSimWait(Number(e.target.value))} className="pr-sim-range" />
                            <div className="pr-sim-label">Orders / Hour: <span>{simOph}</span></div>
                            <input type="range" min="1" max="5" step="0.5" value={simOph} onChange={e => setSimOph(Number(e.target.value))} className="pr-sim-range" />
                            <button className="pr-btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={runSim}>
                                Run Simulation
                            </button>
                        </div>
                        <div>
                            {simResult && !simResult.error && (
                                <div className="pr-sim-result">
                                    <div style={{ fontSize: 12, color: '#f97316', fontWeight: 600 }}>Estimated Payout</div>
                                    <div className="pr-sim-total">${simResult.total}</div>
                                    <div className="pr-sim-row">Base Pay <span>${simResult.dist}</span></div>
                                    <div className="pr-sim-row">Mileage <span>${simResult.dist}</span></div>
                                    <div className="pr-sim-row">Surge <span>{simResult.multiplier}x</span></div>
                                    <div style={{ borderTop: '1px solid #2e3830', paddingTop: 10, marginTop: 4 }}>
                                        <div className="pr-sim-row">Net Hourly (pre-gas) <span style={{ color: '#34d399' }}>${simResult.netHourly}/hr</span></div>
                                        <div style={{ fontSize: 11, color: '#444', marginTop: 6 }}>Rule: {simResult.rule}</div>
                                    </div>
                                </div>
                            )}
                            {simResult?.error && <div style={{ color: '#f87171', fontSize: 13 }}>{simResult.error}</div>}
                            {!simResult && <div style={{ color: '#333', fontSize: 13, paddingTop: 20 }}>Run simulation to see payout estimate</div>}
                        </div>
                    </div>
                </div>
            )}

            {/* Rules Grid */}
            {rules.length === 0 ? (
                <div className="pr-empty">
                    No pricing rules yet. Click "Add Rule" to create your first one.
                </div>
            ) : (
                <div className="pr-grid">
                    {rules.map((rule) => (
                        <div key={rule.id} className={`pr-card ${!rule.isActive ? 'inactive' : ''}`}>
                            {rule.boostMultiplier > 1 && <div className="pr-surge-badge">⚡ Surge</div>}
                            <div className="pr-card-header">
                                <div>
                                    <div className="pr-card-name">{rule.name}</div>
                                    <div className="pr-card-meta">Priority {rule.priority} · {rule.zoneId || 'Global'}</div>
                                </div>
                                <div className="pr-card-actions">
                                    <button className="pr-card-icon-btn" onClick={() => setEditingRule(rule)} title="Edit">✏️</button>
                                    <button className="pr-card-icon-btn del" onClick={() => handleDelete(rule.id)} title="Delete">🗑</button>
                                </div>
                            </div>
                            <div className="pr-stats">
                                <div className="pr-stat">
                                    <div className="pr-stat-label">Base Pay</div>
                                    <div className="pr-stat-value">${Number(rule.basePay).toFixed(2)}</div>
                                </div>
                                <div className="pr-stat">
                                    <div className="pr-stat-label">Surge</div>
                                    <div className="pr-stat-value orange">{rule.boostMultiplier}x</div>
                                </div>
                                <div className="pr-stat">
                                    <div className="pr-stat-label">Per Mile</div>
                                    <div className="pr-stat-value">${Number(rule.perMileRate).toFixed(2)}</div>
                                </div>
                                <div className="pr-stat">
                                    <div className="pr-stat-label">Wait Rate</div>
                                    <div className="pr-stat-value">${Number(rule.waitTimeRate).toFixed(2)}/min</div>
                                </div>
                            </div>
                            <div className="pr-days">
                                {DAYS.map((d, i) => (
                                    <div key={d} className={`pr-day ${rule.daysOfWeek?.includes(i) ? 'active' : ''}`}>{d[0]}</div>
                                ))}
                            </div>
                            <div className="pr-footer">
                                <div className="pr-status">
                                    <div className={`pr-dot ${rule.isActive ? 'live' : 'off'}`} />
                                    <span style={{ fontSize: 11, color: rule.isActive ? '#34d399' : '#555' }}>
                                        {rule.isActive ? 'Live' : 'Disabled'}
                                    </span>
                                </div>
                                <button className="pr-toggle-btn" onClick={() => handleToggle(rule.id, rule.isActive)}>
                                    {rule.isActive ? 'Disable' : 'Enable'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingRule && (
                <div className="pr-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditingRule(null); }}>
                    <div className="pr-modal">
                        <button className="pr-modal-close" onClick={() => setEditingRule(null)}>✕</button>
                        <div className="pr-modal-title">{editingRule.id ? 'Edit Rule' : 'New Pricing Rule'}</div>

                        <div className="pr-modal-grid">
                            <div>
                                <div className="pr-modal-field">
                                    <label className="pr-modal-label">Rule Name</label>
                                    <input className="pr-modal-input" value={editingRule.name || ''} onChange={e => setEditingRule({...editingRule, name: e.target.value})} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <div className="pr-modal-field">
                                        <label className="pr-modal-label">Base Pay ($)</label>
                                        <input className="pr-modal-input" type="number" step="0.5" value={editingRule.basePay || 0} onChange={e => setEditingRule({...editingRule, basePay: Number(e.target.value)})} />
                                    </div>
                                    <div className="pr-modal-field">
                                        <label className="pr-modal-label">Per Mile ($)</label>
                                        <input className="pr-modal-input" type="number" step="0.05" value={editingRule.perMileRate || 0} onChange={e => setEditingRule({...editingRule, perMileRate: Number(e.target.value)})} />
                                    </div>
                                    <div className="pr-modal-field">
                                        <label className="pr-modal-label">Wait Time ($/min)</label>
                                        <input className="pr-modal-input" type="number" step="0.05" value={editingRule.waitTimeRate || 0} onChange={e => setEditingRule({...editingRule, waitTimeRate: Number(e.target.value)})} />
                                    </div>
                                    <div className="pr-modal-field">
                                        <label className="pr-modal-label">Surge Multiplier</label>
                                        <input className="pr-modal-input" type="number" step="0.1" value={editingRule.boostMultiplier || 1} onChange={e => setEditingRule({...editingRule, boostMultiplier: Number(e.target.value)})} style={{ color: '#f97316' }} />
                                    </div>
                                    <div className="pr-modal-field">
                                        <label className="pr-modal-label">Priority</label>
                                        <input className="pr-modal-input" type="number" value={editingRule.priority || 0} onChange={e => setEditingRule({...editingRule, priority: Number(e.target.value)})} />
                                    </div>
                                    <div className="pr-modal-field">
                                        <label className="pr-modal-label">Zone ID (optional)</label>
                                        <input className="pr-modal-input" placeholder="Global" value={editingRule.zoneId || ''} onChange={e => setEditingRule({...editingRule, zoneId: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="pr-modal-field">
                                    <label className="pr-modal-label">Active Days</label>
                                    <div className="pr-days-grid">
                                        {DAYS.map((d, i) => (
                                            <button
                                                key={d}
                                                type="button"
                                                className={`pr-day-btn ${editingRule.daysOfWeek?.includes(i) ? 'selected' : ''}`}
                                                onClick={() => {
                                                    const curr = editingRule.daysOfWeek || [];
                                                    setEditingRule({...editingRule, daysOfWeek: curr.includes(i) ? curr.filter(x => x !== i) : [...curr, i]});
                                                }}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <div className="pr-modal-field">
                                        <label className="pr-modal-label">Start Time</label>
                                        <input className="pr-modal-input" type="time" value={editingRule.startTime || ''} onChange={e => setEditingRule({...editingRule, startTime: e.target.value})} />
                                    </div>
                                    <div className="pr-modal-field">
                                        <label className="pr-modal-label">End Time</label>
                                        <input className="pr-modal-input" type="time" value={editingRule.endTime || ''} onChange={e => setEditingRule({...editingRule, endTime: e.target.value})} />
                                    </div>
                                    <div className="pr-modal-field">
                                        <label className="pr-modal-label">Effective Date</label>
                                        <input className="pr-modal-input" type="date" value={editingRule.startDate || ''} onChange={e => setEditingRule({...editingRule, startDate: e.target.value})} />
                                    </div>
                                    <div className="pr-modal-field">
                                        <label className="pr-modal-label">End Date</label>
                                        <input className="pr-modal-input" type="date" value={editingRule.endDate || ''} onChange={e => setEditingRule({...editingRule, endDate: e.target.value})} />
                                    </div>
                                </div>
                                <div className="pr-modal-field" style={{ marginTop: 8 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={!!editingRule.isActive} onChange={e => setEditingRule({...editingRule, isActive: e.target.checked})} />
                                        <span style={{ fontSize: 13, color: '#ccc' }}>Rule Active</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="pr-modal-footer">
                            <button className="pr-btn primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave} disabled={isPending}>
                                {isPending ? "Saving..." : "Save Rule"}
                            </button>
                            <button className="pr-btn outline" onClick={() => setEditingRule(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
