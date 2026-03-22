"use client";

import { createMockOrder, approveAllPendingDrivers, clearAllMockData } from "@/app/admin/qa-actions";
import { useState } from "react";

export default function QAToolbox({ restaurants }: { restaurants: any[] }) {
    const [loading, setLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleCreateOrder = async (restaurantId: string) => {
        setLoading("create_order");
        const res = await createMockOrder(restaurantId);
        setLoading(null);
        if (res.success) setMessage({ text: `Mock order ${res.orderId?.slice(-6).toUpperCase()} created!`, type: 'success' });
        else setMessage({ text: res.error || "Failed to create order.", type: 'error' });
    };

    const handleApproveDrivers = async () => {
        setLoading("approve_drivers");
        const res = await approveAllPendingDrivers();
        setLoading(null);
        if (res.success) setMessage({ text: `Approved ${res.count} drivers!`, type: 'success' });
        else setMessage({ text: res.error || "Failed to approve drivers.", type: 'error' });
    };

    const handleClearMock = async () => {
        if (!confirm("Are you sure? This will delete all mock restaurants.")) return;
        setLoading("clear_mock");
        const res = await clearAllMockData();
        setLoading(null);
        if (res.success) setMessage({ text: "Mock data cleared!", type: 'success' });
        else setMessage({ text: res.error || "Failed to clear mock data.", type: 'error' });
    };

    return (
        <section className="mb-16 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black flex items-center gap-2">
                    🛠️ QA Toolbox
                    <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-primary/20">Pilot Debugging Ready</span>
                </h2>
                {message && (
                    <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${
                        message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                        {message.text}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Mock Order Tool */}
                <div className="card p-6 border-white/5 bg-white/[0.02] hover:border-primary/30 transition-all">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Instant Order Generator</h3>
                    <div className="space-y-4">
                        <select 
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-sm font-bold focus:border-primary outline-none transition-all"
                            onChange={(e) => handleCreateOrder(e.target.value)}
                            disabled={loading === "create_order"}
                            defaultValue=""
                        >
                            <option value="" disabled>Select a Restaurant...</option>
                            {restaurants.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-slate-500 font-medium">Injects a $25.50 PENDING order into the system for real-time dashboard testing.</p>
                    </div>
                </div>

                {/* Driver Approval Tool */}
                <div className="card p-6 border-white/5 bg-white/[0.02] hover:border-primary/30 transition-all flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Batch Driver Approval</h3>
                        <p className="text-[10px] text-slate-500 font-medium mb-6">Instantly approves ALL drivers currently in PENDING status. Skip document verification for UAT.</p>
                    </div>
                    <button 
                        onClick={handleApproveDrivers}
                        disabled={!!loading}
                        className="btn btn-primary w-full text-[10px] font-black uppercase tracking-widest py-3 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {loading === "approve_drivers" ? "Approving..." : "Approve All Pending"}
                    </button>
                </div>

                {/* Data Cleanup Tool */}
                <div className="card p-6 border-white/5 bg-white/[0.02] hover:border-primary/30 transition-all flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-red-400/80 mb-4">Pilot Environment Cleanup</h3>
                        <p className="text-[10px] text-slate-500 font-medium mb-6">Removes all mock restaurants and associated test data before the official pilot start.</p>
                    </div>
                    <button 
                        onClick={handleClearMock}
                        disabled={!!loading}
                        className="btn btn-outline w-full text-[10px] font-black uppercase tracking-widest py-3 border-red-500/20 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                    >
                        {loading === "clear_mock" ? "Purging..." : "Wipe Mock Data"}
                    </button>
                </div>
            </div>
        </section>
    );
}
