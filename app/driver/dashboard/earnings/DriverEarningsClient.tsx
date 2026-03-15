"use client";

import { useState } from "react";
import { createDriverPayout, createDriverStripeAccount } from "../../actions";


interface DriverEarningsClientProps {
    driver: any;
    orders: any[];
}

export default function DriverEarningsClient({ driver, orders }: DriverEarningsClientProps) {
    const [view, setView] = useState<'weekly' | 'daily'>('weekly');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Calculate chart data from real orders (7-day window)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = days.map((day, idx) => {
        const today = new Date();
        const d = new Date();
        d.setDate(today.getDate() - (6 - idx)); // Last 7 days
        const dayName = days[d.getDay()];

        const dayOrders = orders.filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate.toDateString() === d.toDateString();
        });

        const amount = dayOrders.reduce((sum, o) => sum + (Number(o.totalPay) || 0) + (Number(o.tip) || 0), 0);
        return {
            day: dayName,
            amount,
            label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };
    });

    const maxAmount = Math.max(...weeklyData.map(d => d.amount), 10);
    const totalWeek = weeklyData.reduce((acc, curr) => acc + curr.amount, 0);

    const handleCashOut = async () => {
        if (!driver.stripeAccountId) {
            setLoading(true);
            try {
                await createDriverStripeAccount();
            } catch (e) {
                setMessage("Failed to start Stripe connection.");
                setLoading(false);
            }
            return;
        }

        if (!confirm("Are you sure you want to transfer your balance to your bank account?")) return;
        setLoading(true);
        setMessage("");
        try {
            const result = await createDriverPayout();
            if (result.error) setMessage("Error: " + result.error);
            else {
                setMessage("Payout successful! Funds are on the way.");
                setTimeout(() => window.location.reload(), 2000);
            }
        } catch (e: any) {
            setMessage("Payout failed.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-end gap-3 md:gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Earnings</h1>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">Last 7 Days Recap</p>
                </div>
                <div className="text-right w-full md:w-auto">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Current Balance</p>
                    <div className="text-4xl font-black text-emerald-400 flex items-center justify-end gap-2 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        ${Number(driver.balance || 0).toFixed(2)}
                    </div>
                    {message && <p className="text-[10px] text-emerald-400 font-bold mt-2 animate-bounce">{message}</p>}
                    <button
                        onClick={handleCashOut}
                        disabled={loading || (Number(driver.balance) <= 0 && !!driver.stripeAccountId)}
                        className={`w-full md:w-auto btn ${!driver.stripeAccountId ? 'bg-blue-600 hover:bg-blue-700' : 'btn-primary'} h-12 mt-4 font-black text-xs uppercase tracking-widest px-8 shadow-lg shadow-primary/20 transition-all ${loading ? 'opacity-50 animate-pulse' : ''}`}
                    >
                        {loading ? 'Processing...' : (!driver.stripeAccountId ? 'Connect Stripe to Cash Out' : 'Cash Out Now')}
                    </button>
                    {!driver.stripeAccountId && (
                        <p className="text-[9px] text-blue-400 mt-2 font-black uppercase tracking-widest">Secure Identity Verification Required</p>
                    )}

                </div>
            </header>

            {/* Chart Section */}
            <section className="card bg-white/5 border-white/10 p-6 md:p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1 block">Weekly Performance</span>
                        <div className="text-2xl font-black text-white">${totalWeek.toFixed(2)}</div>
                    </div>
                    <div className="flex bg-black/50 p-1 rounded-xl border border-white/5">
                        <button
                            className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${view === 'weekly' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
                            onClick={() => setView('weekly')}
                        >
                            Seven Days
                        </button>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="h-64 flex items-end justify-between gap-3 md:gap-6">
                    {weeklyData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group cursor-pointer relative">
                            {/* Tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 transition-all absolute -top-12 bg-black border border-white/10 text-[10px] px-3 py-1.5 rounded-lg pointer-events-none whitespace-nowrap z-20 font-bold shadow-2xl scale-95 group-hover:scale-100">
                                <span className="text-primary">${d.amount.toFixed(2)}</span>
                                <span className="text-slate-500 ml-2">{d.label}</span>
                            </div>

                            {/* Bar */}
                            <div className="w-full flex flex-col justify-end h-full">
                                <div
                                    className="w-full bg-white/5 rounded-t-xl relative group-hover:bg-white/10 transition-all overflow-hidden border-x border-t border-white/5"
                                    style={{ height: `${(d.amount / maxAmount) * 100}%`, minHeight: '4px' }}
                                >
                                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary/80 to-primary group-hover:from-primary group-hover:to-primary/80 transition-all h-0 group-hover:h-full duration-700 ease-out shadow-[0_0_20px_rgba(255,153,42,0.3)]"></div>
                                </div>
                            </div>

                            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${d.amount > 0 ? 'text-white' : 'text-slate-600'}`}>{d.day}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="card bg-white/5 border-white/10 p-6 md:p-8 flex flex-col justify-between hover:bg-white/10 transition-colors group">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Lifetime</p>
                        <p className="text-3xl font-black text-white group-hover:text-primary transition-colors">${Number(driver.totalEarnings || 0).toFixed(2)}</p>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 mt-6 rounded-full overflow-hidden border border-white/5">
                        <div className="bg-primary shadow-[0_0_10px_rgba(255,153,42,0.5)] w-[85%] h-full"></div>
                    </div>
                </div>
                <div className="card bg-white/5 border-white/10 p-6 md:p-8 flex flex-col justify-between hover:bg-white/10 transition-colors group">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Weekly Trips</p>
                        <p className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors">{orders.filter(o => new Date(o.createdAt) > sevenDaysAgo).length}</p>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 mt-6 rounded-full overflow-hidden border border-white/5">
                        <div className="bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] w-[65%] h-full"></div>
                    </div>
                </div>
                <div className="card bg-white/5 border-white/10 p-6 md:p-8 flex flex-col justify-between hover:bg-white/10 transition-colors group">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Driver Rating</p>
                        <p className="text-3xl font-black text-white group-hover:text-yellow-400 transition-colors">{Number(driver.rating || 5).toFixed(1)} ⭐</p>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 mt-6 rounded-full overflow-hidden border border-white/5">
                        <div className="bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)] w-[98%] h-full"></div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <section className="space-y-6">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-xl font-black uppercase tracking-widest">Recent Activity</h3>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{orders.length} TOTAL FARES</span>
                </div>
                <div className="card bg-white/5 border-white/10 p-0 overflow-hidden divide-y divide-white/10 shadow-2xl">
                    {orders.slice(0, 10).map(tx => (
                        <div key={tx.id} className="p-5 md:p-6 flex justify-between items-center hover:bg-white/[0.04] transition-all group">
                            <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-white/5 transition-transform group-hover:scale-110 ${tx.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                    {tx.status === 'DELIVERED' ? '🏁' : '🚗'}
                                </div>
                                <div>
                                    <p className="font-black text-white group-hover:text-primary transition-colors">Order {tx.id.slice(-6).toUpperCase()}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-emerald-400 text-lg">
                                    +${(Number(tx.totalPay || 0) + Number(tx.tip || 0)).toFixed(2)}
                                </p>
                                {Number(tx.tip) > 0 && (
                                    <p className="text-[9px] text-primary font-black uppercase tracking-widest">+${Number(tx.tip).toFixed(2)} Tip</p>
                                )}
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Completed Fare</p>
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && (
                        <div className="p-20 text-center text-slate-500">
                            <p className="font-black uppercase tracking-tighter text-2xl opacity-10 mb-2">No Transactions</p>
                            <p className="text-xs font-bold">Your earnings activity will appear here once you complete a trip.</p>
                        </div>
                    )}
                    {orders.length > 10 && (
                        <button className="w-full py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white hover:bg-white/5 transition-all outline-none">
                            View Deep History &rarr;
                        </button>
                    )}
                </div>
            </section>
        </div>
    );
}
