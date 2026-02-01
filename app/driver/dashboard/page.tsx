import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { calculateDriverPay } from "@/lib/payEngine";

async function getDriverData() {
    try {
        // Mocking a driver for demo - in real app use session
        const { data: driver, error } = await supabase
            .from('Driver')
            .select(`
                *,
                user:User(*),
                orders:Order(*)
            `)
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error("Supabase Error (getDriverData):", error.message);
            return null;
        }
        return driver;
    } catch (e) {
        return null;
    }
}

export default async function DriverDashboard() {
    const driver = await getDriverData();

    // Mock calculations if DB is empty/disconnected
    const stats = {
        totalEarnings: driver ? Number((driver as any).totalEarnings) : 452.30,
        balance: driver ? Number((driver as any).balance) : 85.00,
        trips: driver?.orders.length || 12,
        rating: driver ? Number((driver as any).rating) : 4.9,
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <nav className="p-6 border-b border-white/5 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold tracking-tighter">
                    True<span className="text-gradient">Serve</span> Driver
                </Link>
                <div className="flex gap-4 items-center">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Current Balance</p>
                        <p className="text-emerald-400 font-bold">${stats.balance.toFixed(2)}</p>
                    </div>
                    <button className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg text-sm font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                        Withdraw
                    </button>
                </div>
            </nav>

            <main className="container py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="card bg-white/5 border-white/10 p-6 flex flex-col justify-between">
                        <p className="text-slate-400 text-sm font-semibold uppercase">Total Earnings</p>
                        <p className="text-4xl font-bold mt-2">${stats.totalEarnings.toFixed(2)}</p>
                    </div>
                    <div className="card bg-white/5 border-white/10 p-6 flex flex-col justify-between">
                        <p className="text-slate-400 text-sm font-semibold uppercase">Completed Trips</p>
                        <p className="text-4xl font-bold mt-2">{stats.trips}</p>
                    </div>
                    <div className="card bg-white/5 border-white/10 p-6 flex flex-col justify-between">
                        <p className="text-slate-400 text-sm font-semibold uppercase">Driver Rating</p>
                        <p className="text-4xl font-bold mt-2 text-yellow-500">★ {stats.rating}</p>
                    </div>
                    <div className="card bg-white/5 border-white/10 p-6 flex flex-col justify-between">
                        <p className="text-slate-400 text-sm font-semibold uppercase">Tier Status</p>
                        <p className="text-4xl font-bold mt-2 text-primary">Gold</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">Transparent Pay Breakdown</h2>
                                    <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mt-1">Mileage-Based Delivery Service</p>
                                </div>
                                <div className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-slate-400">
                                    Base Rate: <span className="text-emerald-400">$3.00/order</span>
                                </div>
                            </div>
                            <div className="card bg-white/5 border-white/10 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-white/5 text-left text-xs text-slate-500 uppercase font-bold">
                                        <tr>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">Miles</th>
                                            <th className="p-4">Time</th>
                                            <th className="p-4">Batch</th>
                                            <th className="p-4">Peak</th>
                                            <th className="p-4 text-right">Payout</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {[1, 2, 3].map((i) => {
                                            const miles = 2.5 * i;
                                            const wait = 12 + i;
                                            const pay = calculateDriverPay(miles, wait, i === 2, 1.2);
                                            return (
                                                <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="p-4 text-slate-400">Jan {27 - i}</td>
                                                    <td className="p-4 font-semibold">{miles} mi</td>
                                                    <td className="p-4">${pay.timePay.toFixed(2)}</td>
                                                    <td className="p-4 text-blue-400">${pay.batchBonus.toFixed(2)}</td>
                                                    <td className="p-4 text-primary">{pay.peakMultiplier}x</td>
                                                    <td className="p-4 text-right font-bold text-emerald-400">${pay.totalPay.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4">Earnings Forecast Heatmap</h2>
                            <div className="card h-[200px] bg-slate-900 border-white/10 relative overflow-hidden flex items-center justify-center group">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000')] opacity-20 grayscale group-hover:grayscale-0 transition-all duration-700 scale-110"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>

                                {/* Mock Heat Circles */}
                                <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-red-500/30 blur-3xl animate-pulse"></div>
                                <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-orange-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                                <div className="relative text-center p-6">
                                    <div className="flex items-center gap-2 justify-center mb-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-red-400">High Demand: Lower East Side</span>
                                    </div>
                                    <p className="text-sm text-slate-400 max-w-xs mx-auto mb-6">Heatmap projects 1.5x boosts in this zone for the next 45 minutes.</p>
                                    <button className="btn btn-primary text-xs py-2 px-6">Explore Zone</button>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-bold mb-4">Live Activity</h2>
                            <div className="card bg-emerald-500/5 border-emerald-500/20 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                                    <p className="text-emerald-400 text-sm font-bold uppercase">Online</p>
                                </div>
                                <div className="space-y-3 mb-6">
                                    <p className="text-slate-400 text-sm flex justify-between">Zone: <span className="text-white font-semibold">Manhattan</span></p>
                                    <p className="text-slate-400 text-sm flex justify-between">Guarantee: <span className="text-emerald-400 font-bold">$20/hr active</span></p>
                                </div>
                                <button className="w-full btn bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">Go Offline</button>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-4">Instant Payouts</h2>
                            <div className="card bg-primary/5 border-primary/20 p-6">
                                <p className="text-sm text-slate-400 mb-4">Get your earnings delivered to your debit card instantly.</p>
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-xs font-bold uppercase text-slate-500 tracking-widest">Available</p>
                                    <p className="text-3xl font-bold text-white">${stats.balance.toFixed(2)}</p>
                                </div>
                                <button className="w-full btn btn-primary py-3">Cash Out (T+0)</button>
                                <div className="mt-4 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                                    <span>Fixed Processing Fee</span>
                                    <span>$0.50</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
