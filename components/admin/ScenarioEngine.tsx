
'use client';

import React, { useState, useMemo } from 'react';

/**
 * Scenario Engine - Financial Forecaster v2
 * Based on East Coast Scaling Model (Inputs!B8 Fix)
 */

export default function ScenarioEngine() {
    // Inputs (v2 Alignment)
    const [avgOrderValue, setAvgOrderValue] = useState(35.00);
    const [avgMarginPerOrder, setAvgMarginPerOrder] = useState(4.50); // Net of driver pay
    const [fixedMonthlyCost, setFixedMonthlyCost] = useState(12500); // Inputs!B8
    const [currentDailyOrders, setCurrentDailyOrders] = useState(25);

    const calculations = useMemo(() => {
        // BREAK-EVEN LOGIC (v2 CORRECTED)
        // Numerator = Inputs!B8 (Fixed Monthly Cost)
        // Denominator = Margin per delivery
        const monthlyBreakEvenOrders = fixedMonthlyCost / avgMarginPerOrder;
        const dailyBreakEvenOrders = monthlyBreakEvenOrders / 30.42; // Days per month

        const dailyRevenue = currentDailyOrders * avgOrderValue;
        const dailyProfit = (currentDailyOrders * avgMarginPerOrder) - (fixedMonthlyCost / 30.42);
        
        const efficiencyScore = (currentDailyOrders / dailyBreakEvenOrders) * 100;

        return {
            monthlyBreakEvenOrders: Math.ceil(monthlyBreakEvenOrders),
            dailyBreakEvenOrders: Math.ceil(dailyBreakEvenOrders),
            dailyRevenue,
            dailyProfit,
            efficiencyScore: efficiencyScore.toFixed(1)
        };
    }, [avgOrderValue, avgMarginPerOrder, fixedMonthlyCost, currentDailyOrders]);

    return (
        <section className="mt-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">Scenario <span className="text-primary not-italic">Engine</span></h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-2">v2.1 Profitability Projection Logic</p>
                </div>
                <div className="flex gap-2">
                   <div className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                       <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                       Logic Alert: Distance B13+B14 Pending Review
                   </div>
                   <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                       Numerator: Inputs!B8 Fixed Cost
                   </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Inputs Pane */}
                <div className="card bg-white/5 border-white/5 p-8 flex flex-col gap-8">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest decoration-primary/30 underline">Simulation Inputs</label>
                    
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs font-bold text-white mb-2">Fixed Monthly Cost ($)</p>
                            <input 
                                type="number" 
                                value={fixedMonthlyCost} 
                                onChange={e => setFixedMonthlyCost(Number(e.target.value))} 
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold"
                            />
                            <p className="text-[9px] text-slate-500 mt-2 font-medium">Mapped to <span className="text-white">Inputs!B8</span> (Ops, Payroll, Insurance)</p>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-white mb-2">Net Margin per Order ($)</p>
                            <input 
                                type="number" 
                                step="0.50"
                                value={avgMarginPerOrder} 
                                onChange={e => setAvgMarginPerOrder(Number(e.target.value))} 
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold"
                            />
                        </div>

                        <div>
                            <p className="text-xs font-bold text-white mb-2">Current Orders / Day</p>
                            <input 
                                type="range" 
                                min="0" max="1000"
                                value={currentDailyOrders} 
                                onChange={e => setCurrentDailyOrders(Number(e.target.value))} 
                                className="w-full accent-primary"
                            />
                            <div className="flex justify-between text-[10px] font-black text-slate-500 mt-1 uppercase tracking-tighter">
                                <span>0</span>
                                <span>{currentDailyOrders} orders / day</span>
                                <span>1000</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scenario Results (K16:K20 Alignment) */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                        <div className="bg-primary/5 border border-primary/20 rounded-[3rem] p-10 flex flex-col justify-center text-center">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">Break-Even Velocity</h4>
                            <p className="text-7xl font-black tracking-tighter text-white mb-2">{calculations.dailyBreakEvenOrders}</p>
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Orders Required per Day</p>
                            <div className="mt-8 pt-8 border-t border-white/5">
                                <p className="text-sm font-bold text-white mb-1">{calculations.monthlyBreakEvenOrders} Total / Month</p>
                                <p className="text-[10px] font-medium text-slate-500 italic">To cover all North Carolina fixed overhead.</p>
                            </div>
                        </div>

                        <div className="bg-black/40 border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8 border-b border-white/5 pb-4">Scaling Efficiency</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Daily Target</span>
                                        <span className="font-bold text-white">{calculations.efficiencyScore}% Met</span>
                                    </div>
                                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${Number(calculations.efficiencyScore) >= 100 ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-primary'}`} 
                                            style={{ width: `${Math.min(100, Number(calculations.efficiencyScore))}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5 mt-8">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter mb-1">Current Daily Profit</p>
                                        <p className={`text-3xl font-black tracking-tighter ${calculations.dailyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {calculations.dailyProfit >= 0 ? '+' : ''}${Math.abs(calculations.dailyProfit).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter mb-1">Annual Run-Rate</p>
                                        <p className="text-lg font-bold text-white">${(calculations.dailyProfit * 365).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Benchmark vs DoorDash (C4:D6 Alignment) */}
            <div className="mt-20">
                <div className="flex items-center gap-4 mb-8">
                    <h3 className="text-xl font-black tracking-widest uppercase text-white">Competitive Benchmark</h3>
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Proxy: AOV as GOV Basis</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="card bg-black/40 border-white/5 p-0 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Benchmark Metric</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-red-400">DoorDash (EST)</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-primary">TrueServe</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <tr>
                                    <td className="px-6 py-5">
                                        <p className="text-xs font-bold text-white">GOV Proxy (AOV)</p>
                                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Gross Order Value</p>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-slate-300">$38.50</td>
                                    <td className="px-6 py-5 text-sm font-bold text-white">${avgOrderValue.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-5">
                                        <p className="text-xs font-bold text-white">Contribution Margin</p>
                                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Net of Direct Variable Costs</p>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-slate-300">~6.5%</td>
                                    <td className="px-6 py-5 text-sm font-bold text-white">
                                        {((avgMarginPerOrder / avgOrderValue) * 100).toFixed(1)}%
                                    </td>
                                </tr>
                                <tr className="bg-primary/5">
                                    <td className="px-6 py-5">
                                        <p className="text-xs font-bold text-white">EBITDA (Scale Proxy)</p>
                                        <p className="text-[9px] text-primary uppercase font-black tracking-tighter">Corrected: Fixed Cost Inc.</p>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-slate-300">-$2.10</td>
                                    <td className="px-6 py-5 text-sm font-bold text-primary">
                                        {calculations.dailyProfit >= 0 ? '+' : ''}${(calculations.dailyProfit / currentDailyOrders).toFixed(2)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                <span className="text-primary">💡</span> The "Apples-to-Apples" Fix
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                We've reworked the benchmark to use your actual **Average Order Value (AOV)** as the proxy for DoorDash's GOV. This ensures the denominators match exactly.
                            </p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                <span className="text-primary">📈</span> EBITDA vs. Contribution
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Unlike previous misleading models that repeated Contribution Margin, our corrected EBITDA row now accounts for your **Inputs!B8 Fixed Monthly Costs**. This shows your true profitability at-scale.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
