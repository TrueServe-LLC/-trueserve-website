import { getDriverOrRedirect } from "@/lib/driver-auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { calculateDriverPay } from "@/lib/payEngine";
import { acceptOrder, pickupOrder, unassignOrder } from "../actions";
import { getCurrentWeather } from "@/lib/weather";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = 'force-dynamic';

export default async function DriverDashboard() {
    const driver = await getDriverOrRedirect();
    const isPreview = driver?.id === "preview-driver";

    // Data Hydration for Pilot Setup
    let availableOrders: any[] = [];
    let myOrders: any[] = [];
    let weather = { temperature: 68, condition: "Clear", multiplier: 1.0 };
    let stats = { totalEarnings: 0, balance: 0, trips: 0, rating: 0 };

    if (isPreview) {
        availableOrders = [
            { id: "p1", restaurant: { name: "Emerald Kitchen", address: "842 Poplar Tent Rd, Concord NC" }, total: 3.84, distance: 1.2, status: "READY_FOR_PICKUP" },
            { id: "p2", restaurant: { name: "Mount Airy BBQ", address: "1220 Rockford St, Mount Airy NC" }, total: 3.56, distance: 0.8, status: "READY_FOR_PICKUP" },
            { id: "p3", restaurant: { name: "Pho Saigon", address: "2200 Union Rd, Charlotte NC" }, total: 5.87, distance: 4.1, status: "PENDING" },
            { id: "p4", restaurant: { name: "Sushi Neko", address: "555 Trade St, Charlotte NC" }, total: 6.71, distance: 5.3, status: "PENDING" },
        ];
        stats = {
            totalEarnings: 248.50,
            balance: 62.00,
            trips: 27,
            rating: 4.9,
        };
    } else {
        const supabase = await createClient();
        weather = await getCurrentWeather(driver?.currentLat || 35.2271, driver?.currentLng || -80.8431);
        
        const { data: rawOrders } = await supabase
            .from('Order')
            .select(`*, restaurant:Restaurant(name, address, lat, lng)`)
            .is('driverId', null)
            .neq('status', 'DELIVERED')
            .limit(10);
            
        availableOrders = rawOrders || [];
        stats = {
            totalEarnings: Number(driver?.totalEarnings || 0),
            balance: Number(driver?.balance || 0),
            trips: driver?.orders?.length || 0,
            rating: Number(driver?.rating || 0),
        };
    }

    return (
        <div className="font-sans">
            <style dangerouslySetInnerHTML={{ __html: `
                .hero { display: flex; align-items: center; justify-content: space-between; padding: 20px 28px; border-bottom: 1px solid #1c1f28; }
                .hero-left { display: flex; align-items: center; gap: 16px; }
                .hero-icon { width: 48px; height: 48px; background: #131720; border: 1px solid #2a2f3a; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .hero-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(24px, 5vw, 36px); font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; line-height: 1; letter-spacing: 0.01em; }
                .hero-title span { color: #e8a230; }
                .hero-sub { font-size: 10px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #444; margin-top: 5px; }
                .online-badge { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #3dd68c; background: #0a1e12; border: 1px solid #1a4a2a; padding: 8px 16px; }
                .live-dot { width: 6px; height: 6px; background: #3dd68c; border-radius: 50%; animation: pulse 2s infinite; }
                @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.4 } }

                .stat-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #1c1f28; border: 1px solid #1c1f28; }
                .stat-cell { background: #0f1219; padding: 16px 22px; }
                .stat-lbl { font-size: 9px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: #444; margin-bottom: 8px; }
                .stat-val { font-size: 30px; font-weight: 700; font-family: 'DM Mono', monospace; color: #fff; line-height: 1; }
                .stat-val.gold { color: #e8a230; }
                .stat-val.grn { color: #3dd68c; font-size: 22px; }
                .star { color: #e8a230; font-size: 18px; }

                .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #1c1f28; border: 1px solid #1c1f28; border-top: none; }
                .panel { background: #0f1219; padding: 20px; }

                @media (max-width: 1024px) {
                    .stat-bar { grid-template-columns: repeat(2, 1fr); }
                    .main-grid { grid-template-columns: 1fr; }
                    .hero { flex-direction: column; align-items: flex-start; gap: 16px; padding: 20px; }
                    .panel { border-right: none !important; border-bottom: 1px solid #1c1f28; }
                }

                @media (max-width: 640px) {
                    .stat-bar { grid-template-columns: 1fr; }
                    .stat-val { font-size: 24px; }
                }
                .panel-title { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: 0.02em; }
                .panel-title span { color: #e8a230; }
                .panel-sub { font-size: 9px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #333; margin-bottom: 16px; }

                .order-card { background: #0c0e13; border: 1px solid #1c1f28; margin-bottom: 6px; }
                .order-card-hd { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid #1c1f28; }
                .order-name { font-size: 13px; font-weight: 700; color: #ccc; }
                .order-body { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; }
                .yield-tag { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #3dd68c; background: #0a1e12; border: 1px solid #1a4a2a; padding: 2px 7px; }
                .dist-tag { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #555; background: #131720; border: 1px solid #1c1f28; padding: 2px 7px; }
                .accept-btn { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 8px 20px; background: #e8a230; border: none; color: #000; cursor: pointer; }

                .mission-live-hd { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #0c0e13; border: 1px solid #1c1f28; margin-bottom: 6px; }
                .mission-live-tag { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #3dd68c; }
                .map-ph { background: #0c0e13; border: 1px solid #1c1f28; height: 180px; display: flex; align-items: center; justify-content: center; margin-bottom: 6px; }
            ` }} />
            
            {/* HERO */}
            <div className="hero">
                <div className="hero-left">
                    <div className="hero-icon text-2xl">🏎️</div>
                    <div>
                        <div className="hero-title">Fleet <span>Mission</span> Hub</div>
                        <div className="hero-sub">Welcome back, {(driver?.name || driver?.user?.name || "Driver").split(" ")[0]} &nbsp;·&nbsp; Grid Temp: {weather.temperature}°F</div>
                    </div>
                </div>
                <div className="online-badge"><span className="live-dot"></span> Online</div>
            </div>

            {/* STAT BAR */}
            <div className="stat-bar">
                <div className="stat-cell">
                    <div className="stat-lbl">Daily Yield</div>
                    <div className="stat-val gold">${stats.totalEarnings.toFixed(2)}</div>
                </div>
                <div className="stat-cell">
                    <div className="stat-lbl">Trips Today</div>
                    <div className="stat-val">{stats.trips}</div>
                    <div className="text-[#3dd68c] text-[10px] font-mono mt-1">+3 vs yesterday</div>
                </div>
                <div className="stat-cell">
                    <div className="stat-lbl">Fleet Rating</div>
                    <div className="flex items-center gap-1.5"><span className="star">★</span><span className="stat-val">{stats.rating.toFixed(1)}</span></div>
                </div>
                <div className="stat-cell">
                    <div className="stat-lbl">Status</div>
                    <div className="stat-val grn">ONLINE</div>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="main-grid">
                {/* LOCALIZED FEED */}
                <div className="panel border-r border-[#1c1f28]">
                    <div className="panel-hd">
                        <div className="panel-title">Localized <span>Feed</span></div>
                    </div>
                    <div className="panel-sub">Optimized for your current operational sector</div>

                    <div className="flex flex-col gap-2">
                        {availableOrders.map((order, i) => (
                            <div key={order.id} className="order-card">
                                <div className="order-card-hd">
                                    <div className="order-name">{order.restaurant?.name || "Restaurant"}</div>
                                    <div className="text-[9px] font-bold bg-[#1a1200] text-[#e8a230] border border-[#3a2800] px-2 py-0.5 uppercase">Live Target</div>
                                </div>
                                <div className="order-body">
                                    <div className="flex flex-col gap-1">
                                        <div className="text-[11px] font-mono text-[#444]">{order.restaurant?.address || "Address"}</div>
                                        <div className="flex gap-2">
                                            <div className="yield-tag">${order.total?.toFixed(2)} Yield</div>
                                            <div className="dist-tag">{order.distance?.toFixed(1)} MI</div>
                                        </div>
                                    </div>
                                    <form action={async (formData) => {
                                        "use server";
                                        const id = formData.get("orderId") as string;
                                        await acceptOrder(id);
                                    }}>
                                        <input type="hidden" name="orderId" value={order.id} />
                                        <button className="accept-btn" type="submit">Accept</button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ACTIVE MISSIONS */}
                <div className="panel">
                    <div className="panel-hd">
                        <div className="panel-title">Active <span>Missions</span></div>
                    </div>
                    <div className="panel-sub">Your assigned operational payloads</div>

                    <div className="mission-live-hd">
                        <div className="mission-live-tag"><span className="live-dot"></span> Live Navigation</div>
                        <div className="text-[10px] font-bold text-[#555] uppercase tracking-widest">ETA: <span className="text-[#e8a230] font-mono">Calculating...</span></div>
                    </div>

                    <div className="map-ph">
                        <div className="text-[9px] font-bold text-[#2a2f3a] uppercase tracking-[4px]">Awaiting Target Engagement</div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="bg-[#131720] border border-[#2a2f3a] p-4">
                            <div className="flex justify-between items-center mb-6">
                                <div className="font-barlow text-lg font-black italic uppercase text-white">Rapid Liquidity</div>
                                <div className="px-2 py-0.5 bg-[#1a1a1a] text-[#555] text-[9px] font-bold uppercase border border-[#222]">Settlement Ready</div>
                            </div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-[#e8a230] mb-1">Liquid Balance</div>
                            <div className="text-4xl font-mono font-bold text-white leading-none mb-6">${stats.balance.toFixed(2)}</div>
                            <button className="w-full bg-[#3dd68c] text-black text-xs font-black uppercase tracking-widest py-3">Cash Out Funds</button>
                            <p className="text-center text-[9px] font-bold text-[#222] mt-2 uppercase tracking-widest">Protocol Sync: Active</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
