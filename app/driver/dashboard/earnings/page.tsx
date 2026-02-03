"use client";

import { useState } from "react";

export default function DriverEarnings() {
    const [view, setView] = useState<'weekly' | 'daily'>('weekly');

    // Mock Data
    const weeklyData = [
        { day: 'Mon', amount: 142.50, hours: 5.2 },
        { day: 'Tue', amount: 98.20, hours: 3.8 },
        { day: 'Wed', amount: 210.00, hours: 7.5 },
        { day: 'Thu', amount: 165.40, hours: 6.0 },
        { day: 'Fri', amount: 320.80, hours: 9.2 },
        { day: 'Sat', amount: 410.50, hours: 10.5 },
        { day: 'Sun', amount: 280.00, hours: 8.0 },
    ];

    const maxAmount = Math.max(...weeklyData.map(d => d.amount));
    const totalWeek = weeklyData.reduce((acc, curr) => acc + curr.amount, 0);

    const transactions = [
        { id: 'tx_1', type: 'payout', amount: 852.40, status: 'Completed', date: 'Feb 2, 2:00 AM' },
        { id: 'ord_1', type: 'order', amount: 14.50, tip: 5.00, date: 'Feb 1, 8:42 PM', restaurant: "Mario's Pizza" },
        { id: 'ord_2', type: 'order', amount: 9.20, tip: 3.00, date: 'Feb 1, 7:15 PM', restaurant: "Burger King" },
        { id: 'ord_3', type: 'order', amount: 22.00, tip: 12.00, date: 'Feb 1, 6:30 PM', restaurant: "Sushi 101" },
    ];

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Earnings</h1>
                    <p className="text-slate-400">Feb 27 - Mar 5</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold uppercase text-slate-500 tracking-wider">Current Balance</p>
                    <div className="text-4xl font-bold text-emerald-400 flex items-center justify-end gap-2">
                        $1,627.40
                    </div>
                    <button className="btn btn-primary btn-sm mt-2 font-bold px-6">Cash Out Now</button>
                    <p className="text-[10px] text-slate-500 mt-1">Instant transfer fee: $0.50</p>
                </div>
            </header>

            {/* Chart Section */}
            <section className="card bg-white/5 border-white/10 p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <span className="text-xs font-bold uppercase text-slate-500">Weekly Total</span>
                        <div className="text-2xl font-bold text-white">${totalWeek.toFixed(2)}</div>
                    </div>
                    <div className="flex bg-black/50 p-1 rounded-lg">
                        <button
                            className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${view === 'weekly' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setView('weekly')}
                        >
                            Weekly
                        </button>
                        <button
                            className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${view === 'daily' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setView('daily')}
                        >
                            Daily
                        </button>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="h-64 flex items-end justify-between gap-2 md:gap-4">
                    {weeklyData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                            {/* Tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-12 bg-slate-800 text-xs px-2 py-1 rounded border border-white/10 pointer-events-none whitespace-nowrap z-10">
                                ${d.amount.toFixed(2)} ({d.hours}h)
                            </div>

                            {/* Bar */}
                            <div
                                className="w-full bg-primary/20 rounded-t-lg relative group-hover:bg-primary/40 transition-all overflow-hidden"
                                style={{ height: `${(d.amount / maxAmount) * 100}%` }}
                            >
                                <div className="absolute bottom-0 left-0 w-full bg-primary/50 group-hover:bg-primary transition-all h-0 group-hover:h-full duration-500 ease-out"></div>
                            </div>

                            <span className="text-xs text-slate-500 font-bold">{d.day}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-white/5 border-white/10 p-6 flex flex-col justify-between">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Net Fare</p>
                    <p className="text-2xl font-bold text-white mt-1">$840.50</p>
                    <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
                        <div className="bg-blue-500 w-[60%] h-full"></div>
                    </div>
                </div>
                <div className="card bg-white/5 border-white/10 p-6 flex flex-col justify-between">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Tips (100%)</p>
                    <p className="text-2xl font-bold text-white mt-1">$625.00</p>
                    <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 w-[80%] h-full"></div>
                    </div>
                </div>
                <div className="card bg-white/5 border-white/10 p-6 flex flex-col justify-between">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Promotions</p>
                    <p className="text-2xl font-bold text-white mt-1">$161.90</p>
                    <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
                        <div className="bg-yellow-500 w-[20%] h-full"></div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <section className="space-y-4">
                <h3 className="text-xl font-bold px-1">Recent Activity</h3>
                <div className="card bg-white/5 border-white/10 p-0 overflow-hidden divide-y divide-white/5">
                    {transactions.map(tx => (
                        <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${tx.type === 'payout' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                    {tx.type === 'payout' ? '🏦' : '🚗'}
                                </div>
                                <div>
                                    <p className="font-bold text-white">{tx.type === 'payout' ? 'Weekly Payout' : (tx as any).restaurant}</p>
                                    <p className="text-xs text-slate-500">{tx.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${tx.type === 'payout' ? 'text-white' : 'text-emerald-400'}`}>
                                    {tx.type === 'payout' ? '-' : '+'}${tx.amount.toFixed(2)}
                                </p>
                                {tx.type === 'order' && (
                                    <p className="text-[10px] text-slate-500">Tip: ${(tx as any).tip.toFixed(2)}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    <button className="w-full py-4 text-xs font-bold uppercase text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
                        View All History
                    </button>
                </div>
            </section>
        </div>
    );
}
