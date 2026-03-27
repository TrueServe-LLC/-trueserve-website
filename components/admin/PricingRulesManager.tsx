"use client";

import React, { useState, useEffect, useTransition } from "react";
import { upsertPricingRule, toggleRuleStatus, deletePricingRule } from "@/app/admin/pricing/actions";

const Icons = {
  Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Trash2: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Edit3: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Save: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>,
  X: () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Calculator: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  Zap: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Calendar: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  MapPin: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Layers: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
};

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
  daysOfWeek: number[]; // 0-6
  startTime?: string;
  endTime?: string;
  priority: number;
  isABTest?: boolean;
}

export default function PricingRulesManager({ initialRules }: { initialRules: any[] }) {
  const [rules, setRules] = useState<PricingRule[]>(initialRules);
  const [editingRule, setEditingRule] = useState<Partial<PricingRule> | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Test Calculator State
  const [calcMiles, setCalcMiles] = useState(5.0);
  const [calcWait, setCalcWait] = useState(10);
  const [calcOrdersPerHour, setCalcOrdersPerHour] = useState(2.0);
  const [previewResult, setPreviewResult] = useState<any>(null);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleSave = async () => {
    if (!editingRule?.name) return;
    
    startTransition(async () => {
      try {
        const saved = await upsertPricingRule(editingRule);
        if (editingRule.id) {
          setRules(prev => prev.map(r => r.id === saved.id ? saved : r));
        } else {
          setRules(prev => [saved, ...prev]);
        }
        setEditingRule(null);
      } catch (e) {
        console.error("Save error:", e);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this pricing rule permanently?")) return;
    
    startTransition(async () => {
      await deletePricingRule(id);
      setRules(prev => prev.filter(r => r.id !== id));
    });
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !currentStatus } : r));
    startTransition(async () => {
        try {
            await toggleRuleStatus(id, !currentStatus);
        } catch (e) {
            // Revert on failure
            setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: currentStatus } : r));
        }
    });
  };

  const calculatePreview = () => {
    // Find highest priority active rule that matches "now"
    const now = new Date();
    const currentDay = now.getDay();
    const sorted = [...rules].filter(r => r.isActive).sort((a, b) => b.priority - a.priority);
    
    // Simplified logic: just pick the first active for demo
    const activeRule = sorted[0]; 
    if (!activeRule) {
      setPreviewResult({ error: "No active rules found." });
      return;
    }

    const base = Number(activeRule.basePay);
    const distance = Number(activeRule.perMileRate) * calcMiles;
    const wait = Number(activeRule.waitTimeRate) * calcWait;
    const multiplierAmount = (base + distance + wait) * (Number(activeRule.boostMultiplier) - 1);
    const total = base + distance + multiplierAmount + wait;

    // Membership Economics (Simulator!B4:B20 Fix)
    const monthlyMembership = 9.99; // Standard TrueServe Driver Fee
    const estMonthlyHours = 160;   // 40h/week basis
    const membershipCostPerHour = monthlyMembership / estMonthlyHours;
    
    const estTripHours = (calcMiles / 20) + (calcWait / 60); // Assume 20mph city avg + wait
    const grossHourly = total / estTripHours;
    const netHourlyBeforeGas = grossHourly - (membershipCostPerHour * (1 / calcOrdersPerHour));

    setPreviewResult({
      total: total.toFixed(2),
      base: base.toFixed(2),
      distance: distance.toFixed(2),
      multiplier: activeRule.boostMultiplier,
      ruleName: activeRule.name,
      membershipCostPerHour: membershipCostPerHour.toFixed(2),
      netHourlyBeforeGas: netHourlyBeforeGas.toFixed(2)
    });
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tighter mb-2">Pricing <span className="text-gradient">Engine</span></h2>
          <p className="text-slate-500 font-medium">Dynamic base pay, mileage rates, and surge policies.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="btn btn-outline flex items-center gap-2 border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-[10px] py-3 px-6"
          >
            <Icons.Calculator />
            {isPreviewMode ? "Close Simulator" : "Preview Simulator"}
          </button>
          <button 
            onClick={() => setEditingRule({ 
              name: "New Rule", 
              basePay: 3.50, 
              perMileRate: 0.60, 
              waitTimeRate: 0.25, 
              boostMultiplier: 1.0, 
              priority: 0, 
              isActive: true,
              daysOfWeek: [0,1,2,3,4,5,6]
            })}
            className="btn btn-primary flex items-center gap-2 shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-[10px] py-3 px-6"
          >
            <Icons.Plus />
            Add Rule
          </button>
        </div>
      </div>

      {isPreviewMode && (
        <div className="card p-8 bg-black/60 border-primary/30 backdrop-blur-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12 transition-transform group-hover:rotate-0">
             <Icons.Zap />
          </div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4 block underline decoration-primary/30">Input Parameters</label>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-white mb-2">Distance ({calcMiles} miles)</p>
                  <input type="range" min="1" max="50" value={calcMiles} onChange={e => setCalcMiles(Number(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white mb-2">Wait Time ({calcWait} mins)</p>
                  <input type="range" min="0" max="60" value={calcWait} onChange={e => setCalcWait(Number(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white mb-2">Orders / Hour ({calcOrdersPerHour})</p>
                  <input type="range" min="1" max="5" step="0.5" value={calcOrdersPerHour} onChange={e => setCalcOrdersPerHour(Number(e.target.value))} className="w-full accent-primary" />
                </div>
                <button onClick={calculatePreview} className="w-full btn btn-primary py-3 text-[10px] font-black uppercase tracking-widest mt-4">Run Simulation</button>
              </div>
            </div>
            {previewResult && (
              <div className="md:col-span-2 flex flex-col justify-center items-center text-center p-8 bg-white/5 rounded-[2rem] border border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Estimated Driver Payout</span>
                <p className="text-6xl font-black tracking-tighter text-white mb-4">${previewResult.total}</p>
                <div className="grid grid-cols-3 gap-8 text-left w-full max-w-md bg-black/40 p-6 rounded-2xl border border-white/5">
                  <div>
                    <span className="text-[8px] font-black uppercase text-slate-500 block">Base Pay</span>
                    <span className="text-sm font-bold text-white">${previewResult.base}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase text-slate-500 block flex items-center gap-1">
                      Mileage 
                      <span className="text-amber-500" title="Management Review: B13+B14 possibly overstates pay after Mile 2.">⚠</span>
                    </span>
                    <span className="text-sm font-bold text-white">${previewResult.distance}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase text-slate-500 block">Surge</span>
                    <span className="text-sm font-bold text-white">{previewResult.multiplier}x</span>
                  </div>
                </div>

                {/* Economics Logic Row (Simulator!B4:B20 Fix) */}
                <div className="grid grid-cols-2 gap-8 text-left w-full max-w-md mt-6 bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10">
                  <div>
                    <span className="text-[8px] font-black uppercase text-emerald-500 block">Net Hourly (Pre-Gas)</span>
                    <span className="text-xl font-black text-emerald-400">${previewResult.netHourlyBeforeGas}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase text-slate-500 block">Membership/Trip</span>
                    <span className="text-sm font-bold text-slate-400">${(9.99 / 160 / calcOrdersPerHour).toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 mt-6 font-medium italic">Applied Rule: <span className="text-white font-bold">{previewResult.ruleName}</span></p>
              </div>
            )}
            {!previewResult && (
              <div className="md:col-span-2 flex items-center justify-center opacity-30 select-none">
                <p className="font-black uppercase tracking-[0.3em] text-slate-700 text-sm">Simulation Pending</p>
              </div>
            )}
          </div>
        </div>
      )}

      {editingRule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-full max-w-4xl bg-slate-900/90 border border-white/10 rounded-[3rem] p-12 relative shadow-2xl overflow-y-auto max-h-[90vh]">
             <button onClick={() => setEditingRule(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
               <Icons.X />
             </button>
             
             <h3 className="text-3xl font-black tracking-tighter mb-8">Configure Rule Parameters</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {/* Basic Details */}
               <div className="space-y-6">
                 <div>
                   <label className="label-text">Rule Name</label>
                   <input 
                    value={editingRule.name} 
                    onChange={e => setEditingRule({...editingRule, name: e.target.value})} 
                    className="input w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 text-lg font-bold" 
                   />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="label-text">Base Pay ($)</label>
                    <input 
                      type="number" step="0.5" 
                      value={editingRule.basePay} 
                      onChange={e => setEditingRule({...editingRule, basePay: Number(e.target.value)})} 
                      className="input w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 font-bold" 
                    />
                   </div>
                   <div>
                    <label className="label-text">Surge Multiplier (x)</label>
                    <input 
                      type="number" step="0.1" 
                      value={editingRule.boostMultiplier} 
                      onChange={e => setEditingRule({...editingRule, boostMultiplier: Number(e.target.value)})} 
                      className="input w-full bg-primary/10 border-primary/30 text-primary rounded-xl px-4 py-3 font-black" 
                    />
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="label-text">Per Mile ($)</label>
                    <input 
                      type="number" step="0.05" 
                      value={editingRule.perMileRate} 
                      onChange={e => setEditingRule({...editingRule, perMileRate: Number(e.target.value)})} 
                      className="input w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 font-bold" 
                    />
                   </div>
                   <div>
                    <label className="label-text">Priority Score</label>
                    <input 
                      type="number" 
                      value={editingRule.priority} 
                      onChange={e => setEditingRule({...editingRule, priority: Number(e.target.value)})} 
                      className="input w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 font-bold" 
                    />
                   </div>
                 </div>
               </div>

               {/* Scheduling & Geo */}
               <div className="space-y-6">
                 <div>
                   <label className="label-text flex items-center gap-2"><Icons.MapPin /> Target Zone (UUID)</label>
                   <input 
                    placeholder="Global"
                    value={editingRule.zoneId} 
                    onChange={e => setEditingRule({...editingRule, zoneId: e.target.value})} 
                    className="input w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 font-medium text-xs font-mono" 
                   />
                 </div>

                 <div>
                   <label className="label-text">Day of Week Activation</label>
                   <div className="flex flex-wrap gap-2 mt-2">
                     {days.map((day, idx) => (
                       <button
                         key={day}
                         onClick={() => {
                           const current = editingRule.daysOfWeek || [];
                           if (current.includes(idx)) {
                             setEditingRule({...editingRule, daysOfWeek: current.filter(d => d !== idx)});
                           } else {
                             setEditingRule({...editingRule, daysOfWeek: [...current, idx]});
                           }
                         }}
                         className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${
                           editingRule.daysOfWeek?.includes(idx) ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-white/5 text-slate-500 border border-white/5'
                         }`}
                       >
                         {day}
                       </button>
                     ))}
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-text flex items-center gap-2"><Icons.Calendar /> Effective Date</label>
                      <input 
                        type="date"
                        className="input w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 text-xs" 
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${editingRule.isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-slate-500'}`}>
                          <Icons.Zap />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">Enabled</span>
                        <input type="checkbox" checked={editingRule.isActive} onChange={e => setEditingRule({...editingRule, isActive: e.target.checked})} className="hidden" />
                      </label>
                    </div>
                 </div>
               </div>
             </div>

             <div className="mt-12 flex gap-4">
               <button onClick={handleSave} className="flex-1 btn btn-primary py-4 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30">
                 {isPending ? "Syncing..." : "Save Pricing Rule"}
               </button>
               <button onClick={() => setEditingRule(null)} className="btn btn-outline border-white/10 hover:bg-white/5 text-sm font-bold px-12">Cancel</button>
             </div>
           </div>
        </div>
      )}

      {/* Rules List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
        {rules.map((rule) => (
          <div key={rule.id} className={`card p-8 group relative transition-all duration-500 hover:-translate-y-2 border-white/5 hover:border-white/20 overflow-hidden ${rule.isActive ? 'bg-white/[0.03]' : 'bg-black/40 grayscale opacity-60'}`}>
            {/* Surge Indicator */}
            {rule.boostMultiplier > 1 && (
              <>
                <div className="absolute top-0 right-0 bg-primary text-black px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest shadow-lg border-l border-b border-primary/20">
                  Surge Active
                </div>
                <div className="absolute top-0 left-0 p-4">
                   <div className="flex gap-2">
                      <div className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                          Logic Alert: Distance Formula (B13+B14) Pending Review
                      </div>
                      <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                          Numerator: Inputs!B8 Fixed Cost
                      </div>
                   </div>
                </div>
              </>
            )}

            <div className="flex justify-between items-start mb-10">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5">
                {rule.boostMultiplier > 1 ? "🚀" : "⚖️"}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setEditingRule(rule)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  <Icons.Edit3 />
                </button>
                <button 
                  onClick={() => handleDelete(rule.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-500 hover:text-red-400"
                >
                  <Icons.Trash2 />
                </button>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-xl font-bold text-white mb-2 leading-tight">{rule.name}</h4>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/5">Priority {rule.priority}</span>
                <span className="text-slate-700 mx-1">•</span>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">{rule.zoneId || "Global Zone"}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Base Pay</p>
                <p className="text-xl font-black text-white">${Number(rule.basePay).toFixed(2)}</p>
              </div>
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                <p className="text-[8px] font-black uppercase text-primary mb-1">Surge</p>
                <p className="text-xl font-black text-primary">{rule.boostMultiplier}x</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-8">
               {days.map((day, idx) => (
                 <span key={day} className={`text-[8px] font-bold w-6 h-6 flex items-center justify-center rounded-full border ${rule.daysOfWeek?.includes(idx) ? 'bg-primary/20 text-primary border-primary/30' : 'bg-transparent text-slate-600 border-white/5'}`}>
                   {day[0]}
                 </span>
               ))}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${rule.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-slate-500 border-white/10'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${rule.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                  <span className="text-[9px] font-black uppercase tracking-widest">{rule.isActive ? 'Live Engine' : 'Disabled'}</span>
                </div>
              </div>
              <button 
                onClick={() => handleToggle(rule.id, rule.isActive)}
                className={`text-[9px] font-black uppercase tracking-[0.2em] py-2 px-4 rounded-xl transition-all ${
                  rule.isActive ? 'hover:bg-red-500/10 text-slate-500 hover:text-red-400' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                }`}
              >
                {rule.isActive ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
