import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { calculateDriverPay } from "@/lib/payEngine";
import { acceptOrder, pickupOrder, completeDelivery } from "../actions";
import DriverMap from "@/components/DriverMap";
import { calculateDistance, getNavigationUrl } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import DriverRealtime from "@/components/DriverRealtime";
import DriverChatButton from "@/components/DriverChatButton";
import ActiveOrderNavigation from "@/components/ActiveOrderNavigation";

export const dynamic = 'force-dynamic';

async function getDriverData() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return null;

    try {
        const { data: driver, error } = await supabase
            .from('Driver')
            .select(`
                *,
                user:User(*),
                orders:Order(*)
            `)
            .eq('userId', user.id)
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
    if (!driver) {
        redirect("/login?role=driver");
    }
    const supabase = await createClient();

    // Fetch Available Orders
    const { data: rawOrders } = await supabase
        .from('Order')
        .select(`*, restaurant:Restaurant(name, address, lat, lng)`)
        .is('driverId', null)
        .neq('status', 'DELIVERED')
        .neq('status', 'COMPLETED')
        .order('createdAt', { ascending: false })
        .limit(20);

    let availableOrders = rawOrders || [];

    if (driver && driver.currentLat && driver.currentLng) {
        availableOrders = availableOrders.map((order: any) => {
            const dist = Number(calculateDistance(
                driver.currentLat,
                driver.currentLng,
                order.restaurant?.lat || 35.2271,
                order.restaurant?.lng || -80.8431
            ));
            return { ...order, distance: dist };
        }).sort((a: any, b: any) => a.distance - b.distance);
    } else {
        availableOrders = availableOrders.map((o: any) => ({ ...o, distance: 2.5 }));
    }

    availableOrders = availableOrders.slice(0, 5);

    // Fetch My Active Orders (with customer info)
    const { data: myOrders } = driver ? await supabase
        .from('Order')
        .select(`
            *,
            restaurant:Restaurant(name, address, lat, lng),
            user:User(id, name, phone)
        `)
        .eq('driverId', driver?.id)
        .neq('status', 'DELIVERED')
        .neq('status', 'COMPLETED')
        : { data: [] };

    const stats = {
        totalEarnings: driver ? Number((driver as any).totalEarnings || 0) : 0,
        balance: driver ? Number((driver as any).balance || 0) : 0,
        trips: driver?.orders?.length || 0,
        rating: driver ? Number((driver as any).rating || 0) : 0,
    };

    return (
        <div className="bg-[#0a0a0a] text-white">
            {driver && <DriverRealtime driverId={driver.id} />}
            <header className="hidden md:flex p-6 border-b border-white/5 justify-between items-center sticky top-0 bg-black/50 backdrop-blur-md z-50">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <img src="/logo.png" alt="TrueServe Driver" className="w-8 h-8 rounded-full border border-white/10 transition-all shadow-lg" />
                    <span className="text-xl font-black tracking-tight">True<span className="text-emerald-400">Serve</span> Driver</span>
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

            <main className="container py-4 md:py-12 px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
                    <Link href="/driver/dashboard/earnings" className="group relative overflow-hidden bg-white/5 border border-white/5 p-5 rounded-2xl md:rounded-3xl hover:bg-white/10 active:scale-95 transition-all">
                        <div className="absolute top-0 right-0 p-3 opacity-5 text-4xl group-hover:scale-110 transition-transform">💰</div>
                        <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Pay</p>
                        <p className="text-2xl md:text-4xl font-black text-white">${stats.totalEarnings.toFixed(2)}</p>
                    </Link>
                    <div className="group relative overflow-hidden bg-white/5 border border-white/5 p-5 rounded-2xl md:rounded-3xl">
                        <div className="absolute top-0 right-0 p-3 opacity-5 text-4xl">🛵</div>
                        <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1">Trips Done</p>
                        <p className="text-2xl md:text-4xl font-black text-white">{stats.trips}</p>
                    </div>
                    <Link href="/driver/dashboard/ratings" className="group relative overflow-hidden bg-white/5 border border-white/5 p-5 rounded-2xl md:rounded-3xl hover:bg-white/10 active:scale-95 transition-all">
                        <div className="absolute top-0 right-0 p-3 opacity-5 text-4xl group-hover:scale-110 transition-transform">⭐</div>
                        <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1">Rating</p>
                        <p className="text-2xl md:text-4xl font-black text-yellow-400">★ {stats.rating}</p>
                    </Link>
                    <Link href="/driver/dashboard/account" className="group relative overflow-hidden bg-white/5 border border-white/5 p-5 rounded-2xl md:rounded-3xl hover:bg-white/10 active:scale-95 transition-all">
                        <div className="absolute top-0 right-0 p-3 opacity-5 text-4xl group-hover:scale-110 transition-transform">🏆</div>
                        <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1">Level</p>
                        <p className="text-2xl md:text-4xl font-black text-primary">Gold</p>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            🔔 Recommended for You
                        </h2>
                        {availableOrders && availableOrders.length > 0 ? (
                            availableOrders.map((order: any, index: number) => (
                                <div key={order.id} className={`card p-5 flex justify-between items-center group transition-all relative overflow-hidden ${index === 0 ? 'bg-gradient-to-r from-emerald-900/40 to-black border-emerald-500/50 shadow-emerald-900/20 shadow-lg' : 'bg-white/5 border-white/10 hover:border-primary/50'}`}>
                                    {index === 0 && (
                                        <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] uppercase font-bold px-2 py-1 rounded-bl">Best Match</div>
                                    )}
                                    <div>
                                        <p className="font-bold text-lg">{order.restaurant?.name || "Restaurant"}</p>
                                        <p className="text-sm text-slate-400">{order.restaurant?.address || "Location Hidden"}</p>
                                        <div className="flex gap-3 mt-2 text-xs font-mono uppercase">
                                            <span className="bg-white/10 px-2 py-1 rounded text-slate-300">{(order.total * 0.2).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} est. pay</span>
                                            <span className={`px-2 py-1 rounded ${order.distance < 3 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-slate-300'}`}>
                                                {order.distance} mi away
                                            </span>
                                        </div>
                                    </div>
                                    <form action={async () => {
                                        "use server";
                                        await acceptOrder(order.id);
                                    }}>
                                        <button type="submit" className="btn btn-primary px-6 py-2 shadow-lg shadow-primary/20">Accept</button>
                                    </form>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center border dashed border-white/10 rounded-xl text-slate-500">
                                No orders available nearby.
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            🚀 My Active Deliveries
                        </h2>
                        {myOrders && myOrders.length > 0 ? (
                            myOrders.map((order: any) => {
                                const isPickedUp = order.status === 'PICKED_UP';
                                const customerName = order.user?.name || "Customer";
                                const destinationName = isPickedUp ? customerName : order.restaurant?.name;
                                const destinationAddress = isPickedUp ? (order.deliveryAddress || "Customer Address") : order.restaurant?.address;
                                const destLat = isPickedUp ? order.deliveryLat : order.restaurant?.lat;
                                const destLng = isPickedUp ? order.deliveryLng : order.restaurant?.lng;
                                const statusLabel = isPickedUp ? "Delivering" : "Pickup";

                                return (
                                    <div key={order.id} className="space-y-4">
                                        {(order.status === 'READY_FOR_PICKUP' || order.status === 'PICKED_UP') && (
                                            <ActiveOrderNavigation
                                                order={order}
                                                driverLat={driver?.currentLat || 35.2271}
                                                driverLng={driver?.currentLng || -80.8431}
                                            />
                                        )}
                                        <div className="card bg-emerald-500/10 border-emerald-500/20 p-5 shadow-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-emerald-100">{destinationName}</h3>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-xs font-bold uppercase bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">{statusLabel}</span>
                                                    {Number(order.tip) > 0 && (
                                                        <span className="text-[10px] font-black text-primary animate-pulse">+$ {Number(order.tip).toFixed(2)} Tip</span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-emerald-200/60 mb-4">{destinationAddress}</p>

                                            {/* Delivery Instructions Badge */}
                                            {isPickedUp && order.deliveryInstructions && (
                                                <div className="mb-4 p-3 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-start gap-3">
                                                    <span className="text-base shrink-0">📝</span>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-orange-400 mb-1">Customer Instruction</p>
                                                        <p className="text-xs text-orange-100 font-medium leading-snug">{order.deliveryInstructions}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-2 mt-4">
                                                <div className="flex gap-2">
                                                    <a
                                                        href={getNavigationUrl(destinationAddress || "", (driver as any)?.navigationApp || 'google', destLat, destLng)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 btn bg-emerald-500 text-black font-bold text-[10px] py-3 flex items-center justify-center uppercase tracking-wider"
                                                    >
                                                        {isPickedUp ? "Navigate to Hub" : "Navigate to Store"}
                                                    </a>

                                                    {isPickedUp && order.user?.phone && (
                                                        <a
                                                            href={`tel:${order.user.phone}`}
                                                            className="btn bg-white/10 text-white px-4 flex items-center justify-center border border-white/10 hover:bg-emerald-500/20 transition-all text-lg"
                                                            title="Call Customer"
                                                        >
                                                            📞
                                                        </a>
                                                    )}

                                                    <DriverChatButton orderId={order.id} />
                                                </div>

                                                {['PENDING', 'PREPARING'].includes(order.status) && (
                                                    <div className="w-full py-3 text-center border dashed border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] rounded">
                                                        Waiting for Restaurant Prep...
                                                    </div>
                                                )}

                                                {order.status === 'READY_FOR_PICKUP' && (
                                                    <form action={async () => {
                                                        "use server";
                                                        await pickupOrder(order.id);
                                                    }}>
                                                        <button type="submit" className="w-full btn btn-primary py-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                                                            Confirm Pickup
                                                        </button>
                                                    </form>
                                                )}

                                                {order.status === 'PICKED_UP' && (
                                                    <form action={async () => {
                                                        "use server";
                                                        await completeDelivery(order.id);
                                                    }}>
                                                        <button type="submit" className="w-full btn bg-emerald-500 text-black py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 transition-colors">
                                                            Complete Delivery
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
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
                                    <p className="text-slate-400 text-sm flex justify-between">Guarantee: <span className="text-emerald-400 font-bold">estimated</span></p>
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
