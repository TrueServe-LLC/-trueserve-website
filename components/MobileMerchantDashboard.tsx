'use client';

import Link from 'next/link';

import Logo from './Logo';

export default function MobileMerchantDashboard({ restaurant, pendingOrders, netRevenue }: any) {
    const hasStripe = Boolean(restaurant.stripeAccountId);

    return (
        <div className="lg:hidden noise-overlay font-dm-sans min-h-screen bg-[#0c0e13] flex flex-col">
            
            {/* PORTAL TOP */}
            <div className="flex items-center justify-between px-5 py-6 bg-[#0c0e13] border-b border-[#1c1f28]">
                <div className="flex items-center gap-3">
                    <Logo size="sm" />
                    <div className="bg-[#e8a230]/15 text-[#e8a230] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-[#e8a230]/24">Merchant</div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#3dd68c] animate-blink" />
                    <span className="text-[10px] font-bold text-[#3dd68c] uppercase tracking-widest">Active Hub</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-32">
                {/* PORTAL GREET */}
                <div className="px-5 pt-7 pb-5">
                    <h1 className="font-barlow-cond text-3xl font-extrabold italic uppercase text-white mb-1">Kitchen Terminal</h1>
                    <p className="text-[12px] text-[#555] font-medium uppercase tracking-[.06em]">Control Center Alpha · Pilot Role</p>
                </div>

                {/* MINI STATS */}
                <div className="flex gap-2.5 px-5 mb-5">
                    <div className="flex-1 bg-[#0f1219] border border-[#1c1f28] p-3.5 rounded-[16px]">
                        <div className="text-[9px] font-bold text-[#555] uppercase tracking-widest mb-1.5">Active</div>
                        <div className="text-2xl font-bold text-white font-dm-mono">{pendingOrders.length}</div>
                    </div>
                    <div className="flex-1 bg-[#0f1219] border border-[#1c1f28] p-3.5 rounded-[16px]">
                        <div className="text-[9px] font-bold text-[#555] uppercase tracking-widest mb-1.5">Ready</div>
                        <div className="text-2xl font-bold text-white font-dm-mono">0</div>
                    </div>
                    <div className="flex-1 bg-[#e8a230]/10 border border-[#e8a230]/24 p-3.5 rounded-[16px]">
                        <div className="text-[9px] font-bold text-[#e8a230] uppercase tracking-widest mb-1.5">Payout</div>
                        <div className="text-2xl font-bold text-[#e8a230] font-dm-mono">${netRevenue.toFixed(0)}</div>
                    </div>
                </div>

                {/* STRIPE ROW */}
                {!hasStripe && (
                    <div className="mx-5 mb-6 bg-[#111420] border border-[#2a3060] p-4.5 rounded-[16px] flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#1a1e3a] border border-[#2a3060] rounded-xl flex items-center justify-center shrink-0">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="10" rx="1" stroke="#4a5aaa" strokeWidth="1.5"/><path d="M2 8h14" stroke="#4a5aaa" strokeWidth="1.5"/></svg>
                        </div>
                        <div className="flex-1">
                            <div className="text-[13px] font-bold text-white mb-0.5">Connect Stripe.</div>
                            <div className="text-[11px] text-[#555] leading-tight">Payouts are parked until account is linked.</div>
                        </div>
                        <button className="text-[#e8a230] font-bold text-[12px] whitespace-nowrap">Link →</button>
                    </div>
                )}

                {/* ACTIVE ORDERS */}
                <div className="px-5 mb-7">
                    <div className="flex items-center justify-between mb-3.5">
                        <div className="text-[15px] font-bold text-white">Active Deployments</div>
                        <div className="text-[11px] font-bold text-[#555] uppercase tracking-widest">Live Feed</div>
                    </div>
                    {pendingOrders.length === 0 ? (
                        <div className="bg-[#0f1219] border border-[#1c1f28] rounded-[24px] p-10 text-center">
                            <div className="text-4xl mb-3">🛸</div>
                            <div className="text-[14px] font-bold text-white/40 italic uppercase tracking-widest">Awaiting Transmissions...</div>
                        </div>
                    ) : (
                        pendingOrders.map((o: any, i: number) => (
                             <div key={i} className="bg-[#0f1219] border border-[#1c1f28] p-4.5 rounded-[20px] mb-3 flex items-center justify-between">
                                 <div>
                                     <div className="text-[10px] font-bold text-[#e8a230] uppercase tracking-widest mb-1.5 italic">ORDER #{o.id.slice(-6).toUpperCase()}</div>
                                     <div className="text-[14px] font-bold text-[#ddd]">{o.user?.name || 'Guest User'}</div>
                                     <div className="text-[11px] text-[#555] font-medium mt-1">{o.status} · ${Number(o.total).toFixed(2)}</div>
                                 </div>
                                 <button className="bg-[#e8a230] text-black text-[10px] font-bold uppercase p-2.5 rounded-xl">View Info</button>
                             </div>
                        ))
                    )}
                </div>

                {/* POS GRID */}
                <div className="px-5">
                    <div className="text-[15px] font-bold text-white mb-3.5">POS Configuration</div>
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-[#131720] border border-[#1c1f28] p-5 rounded-[20px] active:scale-95 transition-all">
                            <div className="text-2xl mb-2.5">📋</div>
                            <div className="text-[13px] font-bold text-white mb-1">Edit Menu</div>
                            <div className="text-[10px] text-[#555] leading-tight">Items, Availability, Pricing</div>
                        </div>
                        <div className="bg-[#131720] border border-[#1c1f28] p-5 rounded-[20px] active:scale-95 transition-all">
                            <div className="text-2xl mb-2.5">📈</div>
                            <div className="text-[13px] font-bold text-white mb-1">Operational Data</div>
                            <div className="text-[10px] text-[#555] leading-tight">Sector analytics & growth metrics</div>
                        </div>
                        <div className="bg-[#131720] border border-[#1c1f28] p-5 rounded-[20px] active:scale-95 transition-all">
                            <div className="text-2xl mb-2.5">💬</div>
                            <div className="text-[13px] font-bold text-white mb-1">Mission Support</div>
                            <div className="text-[10px] text-[#555] leading-tight">24/7 Deployment assistance</div>
                        </div>
                        <div className="bg-[#131720] border border-[#1c1f28] p-5 rounded-[20px] active:scale-95 transition-all">
                            <div className="text-2xl mb-2.5">⚙️</div>
                            <div className="text-[13px] font-bold text-white mb-1">Terminal Config</div>
                            <div className="text-[10px] text-[#555] leading-tight">Adjust terminal parameters</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PORTAL TABS */}
            <div className="flex bg-[#0f1219] border-t border-[#1c1f28] pt-2.5 pb-8">
                <div className="flex-1 flex flex-col items-center gap-1 active:opacity-70">
                    <div className="w-5.5 h-5.5 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 8.5l7-6 7 6V17a1 1 0 01-1 1H4a1 1 0 01-1-1z" stroke="#e8a230" strokeWidth="1.5"/><rect x="7.5" y="12" width="2.5" height="4" rx=".5" stroke="#e8a230" strokeWidth="1.2"/></svg>
                    </div>
                    <div className="text-[9px] font-bold tracking-[.08em] uppercase text-[#e8a230]">Dashboard</div>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1 opacity-35">
                    <div className="w-5.5 h-5.5 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <div className="text-[9px] font-bold tracking-[.08em] uppercase text-[#555]">Deployments</div>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1 opacity-35">
                    <div className="w-5.5 h-5.5 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="4" stroke="#888" strokeWidth="1.5"/><path d="M3 19c0-4 3-7 7-7s7 3 7 7" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <div className="text-[9px] font-bold tracking-[.08em] uppercase text-[#555]">Operations</div>
                </div>
            </div>
        </div>
    );
}
