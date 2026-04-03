import { getDriverOrRedirect } from "@/lib/driver-auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { acceptOrder } from "../actions";
import { getCurrentWeather } from "@/lib/weather";
import LogoutButton from "@/components/LogoutButton";
import PickupPhotoForm from "./PickupPhotoForm";
import CompleteDeliveryForm from "./CompleteDeliveryForm";

export const dynamic = 'force-dynamic';

export default async function DriverDashboard() {
    const driver = await getDriverOrRedirect();
    const isPreview = driver?.id === "preview-driver";

    // Data Hydration
    let availableOrders: any[] = [];
    let myActiveOrders: any[] = [];
    let weather = { temperature: 68, condition: "Clear", multiplier: 1.0 };
    let stats = { totalEarnings: 0, balance: 0, trips: 0, rating: 0 };

    const supabase = await createClient();

    if (isPreview) {
        availableOrders = [
            { id: "p1", restaurant: { name: "Emerald Kitchen", address: "842 Poplar Tent Rd, Concord NC" }, total: 3.84, distance: 1.2, status: "READY_FOR_PICKUP" },
            { id: "p2", restaurant: { name: "Mount Airy BBQ", address: "1220 Rockford St, Mount Airy NC" }, total: 3.56, distance: 0.8, status: "READY_FOR_PICKUP" },
        ];
        myActiveOrders = [
            { 
                id: "active-1", 
                status: "PICKED_UP", 
                deliveryAddress: "420 Main St, Charlotte NC",
                customerName: "Alex Rivera",
                deliveryInstructions: "Leave at front door",
                restaurant: { name: "Sushi Neko" }
            }
        ];
        stats = { totalEarnings: 248.50, balance: 62.00, trips: 27, rating: 4.9 };
    } else {
        weather = await getCurrentWeather(driver?.currentLat || 35.2271, driver?.currentLng || -80.8431);
        
        // Fetch unassigned orders
        const { data: rawAvailable } = await supabase
            .from('Order')
            .select(`*, restaurant:Restaurant(name, address, lat, lng)`)
            .is('driverId', null)
            .neq('status', 'DELIVERED')
            .neq('status', 'CANCELLED')
            .limit(10);
            
        // Fetch driver's active orders
        const { data: rawActive } = await supabase
            .from('Order')
            .select(`*, restaurant:Restaurant(name, address, lat, lng), customer:User(name)`)
            .eq('driverId', driver.id)
            .neq('status', 'DELIVERED')
            .neq('status', 'CANCELLED');

        availableOrders = rawAvailable || [];
        myActiveOrders = rawActive || [];
        stats = {
            totalEarnings: Number(driver?.totalEarnings || 0),
            balance: Number(driver?.balance || 0),
            trips: driver?.orders?.length || 0,
            rating: Number(driver?.rating || 0),
        };
    }

    return (
        <div className="font-sans min-h-screen bg-[#080808] text-white">
            <style dangerouslySetInnerHTML={{ __html: `
                .hero { display: flex; align-items: center; justify-content: space-between; padding: 24px 32px; border-bottom: 1px solid #1c1f28; background: #0c0e13; }
                .hero-left { display: flex; align-items: center; gap: 20px; }
                .hero-icon { width: 56px; height: 56px; background: #131720; border: 1px solid #2a2f3a; display: flex; align-items: center; justify-content: center; border-radius: 14px; font-size: 28px; }
                .hero-title { font-family: 'Barlow Condensed', sans-serif; font-size: 40px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; line-height: 0.9; letter-spacing: -0.02em; }
                .hero-title span { color: #e8a230; }
                .hero-sub { font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #555; margin-top: 6px; }
                .online-badge { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #3dd68c; background: #0d1a12; border: 1px solid #1a3a2a; padding: 10px 20px; border-radius: 8px; }
                .live-dot { width: 7px; height: 7px; background: #3dd68c; border-radius: 50%; box-shadow: 0 0 10px #3dd68c; animation: pulse 2s infinite; }
                @keyframes pulse { 0%,100% { opacity:1; transform: scale(1); } 50% { opacity:0.4; transform: scale(0.8); } }

                .stat-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #1c1f28; border-bottom: 1px solid #1c1f28; }
                .stat-cell { background: #0c0e13; padding: 24px 32px; }
                .stat-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: #444; margin-bottom: 12px; }
                .stat-val { font-size: 36px; font-weight: 800; font-family: 'DM Mono', monospace; color: #fff; line-height: 1; tracking: -0.04em; }
                .stat-val.gold { color: #e8a230; }
                .stat-val.grn { color: #3dd68c; }
                .star { color: #e8a230; font-size: 20px; }

                .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #1c1f28; min-height: calc(100vh - 250px); }
                .panel { background: #080808; padding: 32px; }

                @media (max-width: 1024px) {
                    .stat-bar { grid-template-columns: repeat(2, 1fr); }
                    .main-grid { grid-template-columns: 1fr; }
                    .hero { flex-direction: column; align-items: flex-start; gap: 24px; padding: 24px; }
                }

                .panel-hd { display: flex; items-center; justify-content: space-between; margin-bottom: 32px; }
                .panel-title { font-family: 'Barlow Condensed', sans-serif; font-size: 28px; font-weight: 900; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: 0.05em; line-height: 1; }
                .panel-title span { color: #e8a230; }
                .panel-sub { font-size: 10px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #333; margin-bottom: 24px; display: block; }

                .order-card { background: #0c0e13; border: 1px solid #1c1f28; margin-bottom: 12px; border-radius: 16px; overflow: hidden; transition: all 0.3s; }
                .order-card:hover { border-color: #333; transform: translateY(-2px); }
                .order-card-hd { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #1c1f28; background: #131720; }
                .order-name { font-size: 16px; font-weight: 800; color: #fff; font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase; italic; }
                .order-body { padding: 20px; }
                .yield-tag { font-size: 11px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; color: #3dd68c; background: #0a1e12; border: 1px solid #1a4a2a; padding: 4px 10px; border-radius: 4px; }
                .dist-tag { font-size: 11px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; color: #666; background: #131720; border: 1px solid #2a2f3a; padding: 4px 10px; border-radius: 4px; }
                
                .mission-status { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: #e8a230/10; border: 1px solid #e8a230/30; border-radius: 12px; margin-bottom: 24px; }
                .mission-status span { color: #e8a230; font-size: 11px; font-weight: 900; text-transform: uppercase; tracking: 0.25em; }
            ` }} />
            
            {/* HERO */}
            <div className="hero">
                <div className="hero-left">
                    <div className="hero-icon">🏎️</div>
                    <div>
                        <div className="hero-title">FLEET <span>MISSION</span> HUB</div>
                        <div className="hero-sub">SECURE AUTHENTICATED ACCESS &nbsp;·&nbsp; {weather.temperature}°F GRID TEMP</div>
                    </div>
                </div>
                <div className="online-badge"><span className="live-dot"></span> CONNECTION STABLE</div>
            </div>

            {/* STAT BAR */}
            <div className="stat-bar">
                <div className="stat-cell">
                    <div className="stat-lbl">Daily Yield</div>
                    <div className="stat-val gold">${stats.totalEarnings.toFixed(2)}</div>
                </div>
                <div className="stat-cell">
                    <div className="stat-lbl">Mission Count</div>
                    <div className="stat-val">{stats.trips}</div>
                </div>
                <div className="stat-cell">
                    <div className="stat-lbl">Fleet Rating</div>
                    <div className="flex items-center gap-2"><span className="star">★</span><span className="stat-val">{stats.rating.toFixed(1)}</span></div>
                </div>
                <div className="stat-cell">
                    <div className="stat-lbl">Protocol</div>
                    <div className="stat-val grn uppercase">Online</div>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="main-grid">
                {/* ACTIVE MISSIONS (MISSION CONTROL) */}
                <div className="panel border-r border-[#1c1f28] bg-[#0c0c0e]">
                    <div className="panel-hd">
                        <div className="panel-title">MISSION <span>CONTROL</span></div>
                        <LogoutButton />
                    </div>
                    <span className="panel-sub">Active fulfillment neural links</span>

                    {myActiveOrders.length === 0 ? (
                        <div className="h-[400px] border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-10 text-center">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-3xl mb-6 grayscale opacity-20">📡</div>
                            <p className="bebas text-2xl italic text-white/20 tracking-widest">AWAITING MISSION ASSIGNMENT</p>
                            <p className="barlow-cond text-[10px] font-black uppercase tracking-[0.3em] text-[#222] mt-2 italic">Sector: Charlotte HQ</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {myActiveOrders.map((order) => (
                                <div key={order.id} className="bg-[#111114] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                                    {/* Scanline decoration */}
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-[#e8a230]/20 shadow-[0_0_10px_#e8a230] animate-[scanning_4s_linear_infinite]" />
                                    
                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <div className="mission-status">
                                                <span className="animate-pulse">●</span>
                                                <span>{order.status === 'PICKED_UP' ? 'DELIVERY IN PROGRESS' : 'PICKUP REQUIRED'}</span>
                                            </div>
                                            <h3 className="bebas text-6xl italic text-white leading-none uppercase">{order.restaurant?.name || "RESTAURANT"}</h3>
                                            <p className="barlow-cond text-xs font-black uppercase tracking-[0.4em] text-[#444] mt-3 italic underline decoration-[#e8a230]/30">Payload: Verified Food Delivery</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="barlow-cond text-[10px] font-black tracking-widest text-[#444] uppercase mb-2 italic">Operational ID</p>
                                            <p className="bebas text-3xl italic text-[#e8a230] tracking-wider leading-none">#{order.id.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    {/* Action Phase */}
                                    <div className="bg-black/40 rounded-3xl p-6 border border-white/5 border-t-white/10">
                                        {order.status === 'PICKED_UP' ? (
                                            <div className="space-y-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-xl">📍</div>
                                                    <div>
                                                        <p className="barlow-cond text-[10px] font-black uppercase tracking-widest text-[#444] mb-1 italic">Drop Location</p>
                                                        <p className="font-bold text-white text-lg tracking-tight">{order.deliveryAddress}</p>
                                                        {order.customerName && <p className="text-[#3dd68c] text-[11px] font-black uppercase tracking-[0.2em] mt-1 italic">Recipient: {order.customerName}</p>}
                                                    </div>
                                                </div>
                                                
                                                <div className="pt-4 border-t border-white/5">
                                                    <CompleteDeliveryForm 
                                                        orderId={order.id} 
                                                        customerName={order.customerName || order.customer?.name} 
                                                        deliveryInstructions={order.deliveryInstructions}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 bg-[#e8a230]/10 border border-[#e8a230]/20 rounded-2xl flex items-center justify-center text-xl">🏬</div>
                                                    <div>
                                                        <p className="barlow-cond text-[10px] font-black uppercase tracking-widest text-[#e8a230] mb-1 italic">Origin Station</p>
                                                        <p className="font-bold text-white text-lg tracking-tight">{order.restaurant?.address}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <div className="px-2 py-1 bg-white/5 rounded text-[9px] font-black uppercase tracking-widest text-[#666]">Status: {order.status}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-white/5">
                                                    <PickupPhotoForm orderId={order.id} restaurantName={order.restaurant?.name} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* LOCALIZED FEED (OPPORTUNITIES) */}
                <div className="panel bg-[#080808]">
                    <div className="panel-hd">
                        <div className="panel-title">SECTOR <span>OPPORTUNITIES</span></div>
                    </div>
                    <span className="panel-sub">Unassigned payloads in your operational vicinity</span>

                    <div className="grid grid-cols-1 gap-4">
                        {availableOrders.length === 0 ? (
                            <div className="p-12 border border-white/5 rounded-3xl bg-black/20 text-center">
                                <p className="barlow-cond text-xs font-black text-[#222] uppercase tracking-[0.4em] italic">No active opportunities in this sector</p>
                            </div>
                        ) : (
                            availableOrders.map((order) => (
                                <div key={order.id} className="order-card group">
                                    <div className="order-card-hd">
                                        <div className="order-name italic">{order.restaurant?.name}</div>
                                        <div className="flex items-center gap-1.5 opacity-40"><span className="live-dot"></span> <span className="text-[9px] font-black tracking-widest uppercase">Live</span></div>
                                    </div>
                                    <div className="order-body flex items-center justify-between">
                                        <div>
                                            <p className="text-[11px] font-bold text-[#444] mb-3">{order.restaurant?.address}</p>
                                            <div className="flex gap-2">
                                                <div className="yield-tag">${(order.totalPay || order.total)?.toFixed(2)} YIELD</div>
                                                <div className="dist-tag">{order.distance?.toFixed(1) || "1.2"} MI</div>
                                            </div>
                                        </div>
                                        <form action={async (formData) => {
                                            "use server";
                                            const id = formData.get("orderId") as string;
                                            await acceptOrder(id);
                                        }}>
                                            <input type="hidden" name="orderId" value={order.id} />
                                            <button className="bebas italic text-2xl bg-[#e8a230] text-black px-10 py-3 rounded-xl hover:bg-white transition-all shadow-[0_10px_30px_rgba(232,162,48,0.2)] active:scale-95">ENGAGE</button>
                                        </form>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* QUICK STATS / WALLET */}
                    <div className="mt-12 group cursor-pointer relative overflow-hidden bg-black border border-white/10 rounded-[2.5rem] p-10 active:scale-95 transition-all">
                        <div className="absolute inset-0 bg-[#e8a230]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-start mb-4">
                            <div className="bebas text-3xl italic text-white uppercase tracking-widest">SETTLEMENT <span>BRIDGE</span></div>
                            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-[#e8a230]">⚡</div>
                        </div>
                        <div className="bebas text-7xl italic text-white tracking-tighter leading-none mb-4">
                            <span className="text-3xl text-[#222] mr-2">$</span>{stats.balance.toFixed(2)}
                        </div>
                        <p className="barlow-cond text-[10px] font-black uppercase tracking-[0.4em] text-[#444] italic">Tap to request instant payout to Stripe Link</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
