import { getDriverOrRedirect } from "@/lib/driver-auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { calculateDriverPay } from "@/lib/payEngine";
import { acceptOrder, pickupOrder, unassignOrder } from "../actions";

import DriverMap from "@/components/DriverMap";
import { calculateDistance, getNavigationUrl } from "@/lib/utils";
import DriverRealtime from "@/components/DriverRealtime";
import DriverChatButton from "@/components/DriverChatButton";
import DriverCallButton from "@/components/DriverCallButton";
import ActiveOrderNavigation from "@/components/ActiveOrderNavigation";
import CompleteDeliveryForm from "./CompleteDeliveryForm";
import PickupPhotoForm from "./PickupPhotoForm";
import { getCurrentWeather } from "@/lib/weather";
import ModeToggle from "@/components/ModeToggle";
import LogoutButton from "@/components/LogoutButton";
import Logo from "@/components/Logo";

export const dynamic = 'force-dynamic';

export default async function DriverDashboard() {
    const driver = await getDriverOrRedirect();
    const supabase = await createClient();

    // Optimized Geo-Fenced Query: Only fetch orders within a ~0.5 degree range (approx 30-35 miles)
    const lat = driver?.currentLat || 35.2271;
    const lng = driver?.currentLng || -80.8431;
    const range = 0.5; // Roughly 35 miles

    const { data: rawOrders } = await supabase
        .from('Order')
        .select(`*, restaurant:Restaurant(name, address, lat, lng)`)
        .is('driverId', null)
        .neq('status', 'DELIVERED')
        .neq('status', 'COMPLETED')
        .gte('restaurant.lat', lat - range)
        .lte('restaurant.lat', lat + range)
        .gte('restaurant.lng', lng - range)
        .lte('restaurant.lng', lng + range)
        .order('createdAt', { ascending: false })
        .limit(20);

    const weather = await getCurrentWeather(driver?.currentLat || 35.2271, driver?.currentLng || -80.8431);

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
        <div className="min-h-screen bg-black text-white selection:bg-primary/30 font-sans">
            {driver && <DriverRealtime driverId={driver.id} />}

            {/* Standardized Replit-Style Top-Nav */}
            <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-black/60 border-b border-white/5 px-6 py-4 flex justify-between items-center text-sans">
                <div className="flex items-center gap-4">
                    <Logo size="md" />
                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                    <nav className="flex items-center gap-1">
                        <Link href="/restaurants" className="nav-link px-6 text-slate-400">🍴 Order Food</Link>
                        <Link href="/driver/dashboard" className="nav-link px-6 text-emerald-500 bg-emerald-500/5 rounded-full">🛵 Dashboard</Link>
                        <Link href="/driver" className="nav-link px-6 text-slate-400">🏁 Fleet Hub</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <ModeToggle />
                    <LogoutButton />
                </div>
            </nav>

            <main className="container py-12 md:py-24 px-4 md:px-8 pb-40 font-sans">
                {/* Replit-Style Header Title Stack */}
                <div className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto px-2">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl shadow-xl font-sans">🏎️</div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-tight">
                                Fleet Mission Hub
                            </h1>
                            <p className="text-slate-500 text-xs md:text-sm font-black uppercase tracking-widest mt-1">
                                Welcome back, {driver.name.split(' ')[0]}. Grid temp: {weather.temperature}°F
                            </p>
                        </div>
                    </div>
                </div>

                {/* Primary Stats Grid */}
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-stats gap-4 md:gap-8 mb-16">
                    <Link href="/driver/dashboard/earnings" className="group relative overflow-hidden bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.08] active:scale-[0.98] transition-all shadow-xl">
                        <div className="absolute top-0 right-0 p-8 text-5xl opacity-5 group-hover:scale-110 transition-transform">💰</div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Total Earnings</p>
                        <p className="text-3xl md:text-5xl font-black text-white tracking-tighter italic uppercase">${stats.totalEarnings.toFixed(2)}</p>
                    </Link>
                    <div className="group relative overflow-hidden bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
                        <div className="absolute top-0 right-0 p-8 text-5xl opacity-5">🛵</div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Trips</p>
                        <p className="text-3xl md:text-5xl font-black text-white tracking-tighter italic uppercase">{stats.trips}</p>
                    </div>
                    <Link href="/driver/dashboard/ratings" className="group relative overflow-hidden bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.08] transition-all shadow-xl">
                        <div className="absolute top-0 right-0 p-8 text-5xl opacity-5 group-hover:scale-110 transition-transform">⭐</div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Fleet Rating</p>
                        <p className="text-3xl md:text-5xl font-black text-yellow-500 tracking-tighter italic uppercase">★ {stats.rating}</p>
                    </Link>
                    <div className="group relative overflow-hidden bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2.5rem] shadow-xl">
                        <div className="absolute top-0 right-0 p-8 text-5xl opacity-10 font-sans">🏆</div>
                        <p className="text-emerald-500/50 text-[10px] font-black uppercase tracking-[0.2em] mb-3 font-sans">Tier Status</p>
                        <p className="text-3xl md:text-5xl font-black text-emerald-400 tracking-tighter italic uppercase">GOLD</p>
                    </div>
                </div>

                {/* Main Content Enclosure (Replit-Style Card) */}
                <div className="max-w-7xl mx-auto bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl space-y-32">
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 md:gap-24">
                        {/* Feed Column */}
                        <div className="space-y-12">
                            <div>
                                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Localized Feed</h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Optimized for your current operational sector</p>
                            </div>

                            {availableOrders && availableOrders.length > 0 ? (
                                <div className="space-y-6">
                                    {availableOrders.map((order: any, index: number) => {
                                        // Check if this is a stacked opportunity
                                        let isStackedOpportunity = false;
                                        if (myOrders && myOrders.length > 0) {
                                            const activeOrder = myOrders[0];
                                            if (activeOrder.restaurant?.lat && order.restaurant?.lat) {
                                                const distToActivePickup = Number(calculateDistance(
                                                    activeOrder.restaurant.lat, activeOrder.restaurant.lng,
                                                    order.restaurant.lat, order.restaurant.lng
                                                ));
                                                // If the restaurant is within 1 mile of their current pickup
                                                if (distToActivePickup < 1.0) isStackedOpportunity = true;
                                            }
                                        }

                                        return (
                                        <div key={order.id} className={`p-8 border rounded-[2.5rem] flex justify-between items-center group transition-all relative overflow-hidden ${isStackedOpportunity ? 'bg-orange-500/[0.05] border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/50' : index === 0 ? 'bg-emerald-500/[0.03] border-emerald-500/20 shadow-lg' : 'bg-black/40 border-white/10 hover:border-emerald-500/20'}`}>
                                            <div className="flex-1 text-left relative z-10">
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                     <h3 className={`font-black text-xl italic group-hover:text-emerald-500 transition-colors tracking-tight uppercase ${isStackedOpportunity ? 'text-orange-400' : 'text-white'}`}>{order.restaurant?.name || "Restaurant"}</h3>
                                                     {isStackedOpportunity && <span className="bg-orange-500 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap animate-pulse flex items-center gap-1">🔥 Stacked Order Route</span>}
                                                     {!isStackedOpportunity && index === 0 && <span className="bg-emerald-500 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">Priority link</span>}
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-bold mb-6 italic uppercase">{order.restaurant?.address || "Location Hidden"}</p>
                                                <div className="flex flex-wrap gap-3 text-[10px] uppercase font-black">
                                                    <span className="bg-black/40 px-4 py-2 rounded-xl text-emerald-400 border border-white/5 tracking-widest">
                                                        {calculateDriverPay(order.distance || 0, 0, false, weather.multiplier).totalPay.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} yield
                                                    </span>
                                                    <span className={`px-4 py-2 rounded-xl tracking-widest ${order.distance < 3 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-black/40 text-slate-500 border border-white/5'}`}>
                                                        {order.distance} mi
                                                    </span>
                                                </div>
                                            </div>
                                            <form action={async () => {
                                                "use server";
                                                await acceptOrder(order.id);
                                            }} className="ml-6">
                                                <button type="submit" className="badge-emerald py-4 px-10 text-[10px] group-hover:scale-105 transition-transform">Accept</button>
                                            </form>
                                        </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-24 flex flex-col items-center text-center bg-black/20 border border-dashed border-white/10 rounded-[2.5rem]">
                                    <div className="text-6xl mb-8 opacity-10">📡</div>
                                    <h3 className="text-2xl font-black text-white italic mb-2 tracking-tight uppercase">Scanning Mesh...</h3>
                                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic">No operational links found in this sector</p>
                                </div>
                            )}
                        </div>

                        {/* Assignments Column */}
                        <div className="space-y-12">
                            <div>
                                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Active Missions</h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Your assigned operational payloads</p>
                            </div>

                            {myOrders && myOrders.length > 0 ? (
                                <div className="space-y-8">
                                    {myOrders.map((order: any) => {
                                        const isPickedUp = order.status === 'PICKED_UP';
                                        const destinationName = isPickedUp ? order.user?.name : order.restaurant?.name;
                                        const destinationAddress = isPickedUp ? (order.deliveryAddress || "Customer Address") : order.restaurant?.address;
                                        const destLat = isPickedUp ? order.deliveryLat : order.restaurant?.lat;
                                        const destLng = isPickedUp ? order.deliveryLng : order.restaurant?.lng;
                                        const statusLabel = isPickedUp ? "Delivery" : "Pickup";

                                        return (
                                            <div key={order.id} className="space-y-6">
                                                {(order.status === 'READY_FOR_PICKUP' || order.status === 'PICKED_UP') && (
                                                    <ActiveOrderNavigation
                                                        order={order}
                                                        driverLat={driver?.currentLat || 35.2271}
                                                        driverLng={driver?.currentLng || -80.8431}
                                                    />
                                                )}
                                                <div className="p-10 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-10 text-8xl opacity-5 pointer-events-none group-hover:scale-110 transition-transform font-sans">🎯</div>
                                                    
                                                    <div className="flex justify-between items-start mb-8 relative z-10">
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 mb-2">{statusLabel} MISSION</p>
                                                            <h3 className="text-3xl font-black text-white italic tracking-tight uppercase">{destinationName}</h3>
                                                            <p className="text-[11px] text-slate-500 font-medium mt-3 italic uppercase leading-relaxed max-w-xs">{destinationAddress}</p>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-3">
                                                            <span className="bg-emerald-500 text-black text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-tighter animate-pulse">Mesh Active</span>
                                                            {Number(order.tip) > 0 && (
                                                                <span className="text-[10px] font-black text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 tracking-widest uppercase italic">${Number(order.tip).toFixed(2)} Tip Entry</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {isPickedUp && order.deliveryInstructions && (
                                                        <div className="mb-8 p-6 rounded-[1.8rem] bg-orange-500/10 border border-orange-500/20 flex items-start gap-4 transition-all">
                                                            <span className="text-2xl mt-1">📝</span>
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-2">Customer Briefing</p>
                                                                <p className="text-sm text-orange-100 font-medium leading-relaxed italic">{order.deliveryInstructions}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                                        <a
                                                            href={getNavigationUrl(destinationAddress || "", (driver as any)?.navigationApp || 'google', destLat, destLng)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="badge-solid-primary py-5 text-[10px] font-black flex items-center justify-center tracking-widest uppercase italic shadow-lg shadow-primary/20"
                                                        >
                                                            {isPickedUp ? "Nav → Terminal" : "Nav → Sector"}
                                                        </a>

                                                        <div className="flex gap-2">
                                                            {isPickedUp && order.user?.phone && (
                                                                <DriverCallButton orderId={order.id} />
                                                            )}
                                                            <DriverChatButton orderId={order.id} />
                                                        </div>
                                                    </div>

                                                    <div className="mt-8 pt-8 border-t border-emerald-500/10 relative z-10">
                                                        {order.status === 'READY_FOR_PICKUP' && (
                                                            <PickupPhotoForm orderId={order.id} restaurantName={order.restaurant?.name} />
                                                        )}

                                                        {order.status === 'PICKED_UP' && (
                                                            <CompleteDeliveryForm orderId={order.id} />
                                                        )}

                                                        <form action={async () => {
                                                            "use server";
                                                            await unassignOrder(order.id, "Emergency/Vehicle Trouble");
                                                        }} className="mt-6 flex justify-center">
                                                            <button 
                                                                type="submit" 
                                                                className="text-slate-600 text-[9px] font-black uppercase tracking-widest hover:text-red-500 transition-colors italic"
                                                                onClick={() => !confirm("Abort Mission?") && event?.preventDefault()}
                                                            >
                                                                Terminate Mission Connection
                                                            </button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-24 flex flex-col items-center text-center bg-black/20 border border-dashed border-white/10 rounded-[3rem]">
                                    <div className="text-7xl mb-10 grayscale opacity-10">🏎️</div>
                                    <h3 className="text-2xl font-black text-white italic mb-3 tracking-tight uppercase">Base Protocol Ready</h3>
                                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest max-w-[240px] leading-relaxed italic">Accept an active order from the sector feed to begin sync.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Secondary Systems Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-20">
                        <section className="lg:col-span-2 space-y-12">
                             <div>
                                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Ledger & Mesh</h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Historical yield and sector forecasting</p>
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                                <div className="overflow-x-auto font-sans">
                                    <table className="w-full min-w-[600px]">
                                        <thead className="bg-white/5 text-left text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] italic">
                                            <tr>
                                                <th className="p-8">Timeline</th>
                                                <th className="p-8">Dispatch</th>
                                                <th className="p-8">Yield</th>
                                                <th className="p-8 text-right">Settlement</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-xs">
                                            {[1, 2, 3].map((i) => {
                                                const miles = 2.5 * i;
                                                const wait = 12 + i;
                                                const pay = calculateDriverPay(miles, wait, i === 2, 1.2);
                                                return (
                                                    <tr key={i} className="border-t border-white/5 hover:bg-white/[0.03] transition-colors group">
                                                        <td className="p-8 text-slate-500 font-black uppercase italic tracking-widest uppercase tracking-tighter">Sync Log {27 - i}</td>
                                                        <td className="p-8 text-white font-black italic uppercase">{miles} mi link</td>
                                                        <td className="p-8 text-slate-400 font-bold italic uppercase">${pay.timePay.toFixed(2)}</td>
                                                        <td className="p-8 text-right font-black text-emerald-400 group-hover:scale-105 transition-transform origin-right italic uppercase">${pay.totalPay.toFixed(2)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl relative h-[400px]">
                                <DriverMap />
                            </div>
                        </section>

                        <div className="space-y-12">
                            <section>
                                <h2 className="text-xl font-black text-white italic tracking-tighter mb-8 uppercase px-4">Mission Control</h2>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                                    <div className="flex items-center gap-5 mb-10">
                                        <div className="w-4 h-4 bg-emerald-400 rounded-full animate-ping" />
                                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/10">Sector Active</p>
                                    </div>
                                    <div className="space-y-5 mb-10">
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex justify-between italic">Main Sector: <span className="text-white">Downtown Grid</span></p>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex justify-between italic">Hourly Yield: <span className="text-emerald-400">$24.50 est.</span></p>
                                    </div>
                                    <button className="btn-standard w-full py-5 text-[10px] bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white transition-all">Go Offline</button>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl font-black text-white italic tracking-tighter mb-8 uppercase px-4">Rapid Liquidity</h2>
                                <div className="bg-primary/5 border border-primary/20 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary opacity-5 blur-[100px] group-hover:opacity-20 transition-opacity"></div>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-10 italic">T+0 SETTLEMENT READY</p>
                                    <div className="flex justify-between items-end mb-12">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-primary mb-2 italic">Liquid Balance</p>
                                            <p className="text-5xl font-black text-white tracking-tighter italic uppercase underline decoration-primary/20 underline-offset-8">${stats.balance.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <Link href="/driver/dashboard/earnings" className="badge-solid-primary w-full py-6 text-center block text-[10px] shadow-primary/30 uppercase tracking-[0.2em]">Cash Out Funds</Link>
                                    <p className="mt-8 text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] text-center italic">Processing Protocol: $0.50</p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
