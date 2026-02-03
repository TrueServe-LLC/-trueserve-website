import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { calculateDriverPay } from "@/lib/payEngine";
import { acceptOrder } from "../actions";
import DriverMap from "@/components/DriverMap";

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

    // Fetch Available Orders
    const { data: availableOrders } = await supabase
        .from('Order')
        .select(`*, restaurant:Restaurant(name, address)`)
        .is('driverId', null)
        .neq('status', 'DELIVERED')
        .neq('status', 'COMPLETED')
        .order('createdAt', { ascending: false })
        .limit(5);

    // Fetch My Active Orders
    const { data: myOrders } = driver ? await supabase
        .from('Order')
        .select(`*, restaurant:Restaurant(name, address)`)
        .eq('driverId', driver?.id)
        .neq('status', 'DELIVERED')
        .neq('status', 'COMPLETED')
        : { data: [] };

    // Mock calculations if DB is empty/disconnected
    const stats = {
        totalEarnings: driver ? Number((driver as any).totalEarnings) : 452.30,
        balance: driver ? Number((driver as any).balance) : 85.00,
        trips: driver?.orders.length || 12,
        rating: driver ? Number((driver as any).rating) : 4.9,
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <header className="p-6 border-b border-white/5 flex justify-between items-center">
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
            </header>

            <main className="container py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <Link href="/driver/dashboard/earnings" className="card bg-white/5 border-white/10 p-6 flex flex-col justify-between hover:bg-white/10 transition-colors group cursor-pointer text-left">
                        <p className="text-slate-400 text-sm font-semibold uppercase group-hover:text-primary transition-colors">Total Earnings ↗</p>
                        <p className="text-4xl font-bold mt-2">${stats.totalEarnings.toFixed(2)}</p>
                    </Link>
                    <div className="card bg-white/5 border-white/10 p-6 flex flex-col justify-between">
                        <p className="text-slate-400 text-sm font-semibold uppercase">Completed Trips</p>
                        <p className="text-4xl font-bold mt-2">{stats.trips}</p>
                    </div>
                    <Link href="/driver/dashboard/ratings" className="card bg-white/5 border-white/10 p-6 flex flex-col justify-between hover:bg-white/10 transition-colors group cursor-pointer text-left">
                        <p className="text-slate-400 text-sm font-semibold uppercase group-hover:text-yellow-500 transition-colors">Driver Rating ↗</p>
                        <p className="text-4xl font-bold mt-2 text-yellow-500">★ {stats.rating}</p>
                    </Link>
                    <Link href="/driver/dashboard/account" className="card bg-white/5 border-white/10 p-6 flex flex-col justify-between hover:bg-white/10 transition-colors group cursor-pointer text-left">
                        <p className="text-slate-400 text-sm font-semibold uppercase group-hover:text-primary transition-colors">Tier Status ↗</p>
                        <p className="text-4xl font-bold mt-2 text-primary">Gold</p>
                    </Link>
                </div>

                {/* NEW: Order Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Available Orders */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            🔔 Available Orders
                        </h2>
                        {availableOrders && availableOrders.length > 0 ? (
                            availableOrders.map((order: any) => (
                                <div key={order.id} className="card bg-white/5 border-white/10 p-5 flex justify-between items-center group hover:border-primary/50 transition-colors">
                                    <div>
                                        <p className="font-bold text-lg">{order.restaurant?.name || "Restaurant"}</p>
                                        <p className="text-sm text-slate-400">{order.restaurant?.address || "Location Hidden"}</p>
                                        <div className="flex gap-3 mt-2 text-xs font-mono uppercase">
                                            <span className="bg-white/10 px-2 py-1 rounded text-slate-300">{(order.total * 0.2).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} est. pay</span>
                                            <span className="bg-white/10 px-2 py-1 rounded text-slate-300">~{Math.floor(Math.random() * 5) + 2} mi</span>
                                        </div>
                                    </div>
                                    <form action={async () => {
                                        "use server";
                                        await acceptOrder(order.id);
                                    }}>
                                        <button className="btn btn-primary px-6 py-2 shadow-lg shadow-primary/20">Accept</button>
                                    </form>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center border dashed border-white/10 rounded-xl text-slate-500">
                                No orders available right now.
                            </div>
                        )}
                    </div>

                    {/* My Active Deliveries */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            🚀 My Active Deliveries
                        </h2>
                        {myOrders && myOrders.length > 0 ? (
                            myOrders.map((order: any) => (
                                <div key={order.id} className="card bg-emerald-500/10 border-emerald-500/20 p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-emerald-100">{order.restaurant?.name}</h3>
                                        <span className="text-xs font-bold uppercase bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">{order.status}</span>
                                    </div>
                                    <p className="text-sm text-emerald-200/60 mb-4">{order.restaurant?.address}</p>
                                    <div className="flex gap-2">
                                        <button className="flex-1 btn bg-emerald-500 text-black font-bold text-xs py-2">Navigate</button>
                                        <button className="flex-1 btn bg-white/10 text-white font-bold text-xs py-2">Contact</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center border dashed border-white/10 rounded-xl text-slate-500">
                                You have no active deliveries.
                            </div>
                        )}
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
                            <DriverMap />
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
                            <h2 className="text-xl font-bold mb-4">Safety & Tools</h2>
                            <div className="card bg-white/5 border-white/10 p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold flex items-center gap-2">📍 Share Location</p>
                                        <p className="text-xs text-slate-400 mt-1">Send live trip status to contacts.</p>
                                    </div>
                                    <button className="btn btn-sm btn-outline border-white/20 hover:bg-white/10">Share</button>
                                </div>
                                <div className="h-px bg-white/5"></div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-red-400 flex items-center gap-2">🛡️ Emergency</p>
                                        <p className="text-xs text-slate-400 mt-1">Connect with 911 immediately.</p>
                                    </div>
                                    <button className="btn btn-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 font-bold">SOS</button>
                                </div>
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
                                <Link href="/driver/dashboard/earnings" className="w-full btn btn-primary py-3 text-center block">Cash Out (T+0)</Link>
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
