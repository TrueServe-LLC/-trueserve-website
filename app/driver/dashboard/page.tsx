import { getDriverOrRedirect } from "@/lib/driver-auth";
import { createClient } from "@/lib/supabase/server";
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
            <div className="driver-body">
                {/* HERO */}
                <div className="hero !py-12 sm:!py-16 !bg-transparent border-none">
                    <div className="hero-left !gap-6 sm:!gap-10">
                        <div className="hero-icon !w-16 !h-16 sm:!w-20 sm:!h-20 !text-4xl sm:!text-5xl !rounded-3xl !bg-white/5 !border-[#e8a230]/20">🏎️</div>
                        <div className="flex-1">
                            <div className="hero-title !text-5xl sm:!text-8xl !font-black italic text-white uppercase leading-[0.8] mb-4">FLEET <span className="text-[#e8a230]">MISSION</span> HUB</div>
                            <div className="hero-sub !text-[10px] sm:!text-[12px] !font-black !tracking-[0.4em] !text-[#444] uppercase flex items-center gap-4 italic">
                                SECURE AUTHENTICATED ACCESS
                                <span className="w-1.5 h-1.5 rounded-full bg-white/10"></span>
                                {weather.temperature}°F GRID TEMP
                            </div>
                        </div>
                    </div>
                </div>

                {/* STAT BAR */}
                <div className="stat-bar">
                    <div className="stat-cell">
                        <div className="stat-lbl">Daily Yield</div>
                        <div className="stat-val gold">${stats.totalEarnings.toFixed(0)}</div>
                    </div>
                    <div className="stat-cell">
                        <div className="stat-lbl">Missions</div>
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
                        <div className="panel-hd flex justify-between items-center mb-10">
                            <div className="panel-title text-4xl sm:text-6xl !mb-0 font-barlow-cond font-black italic uppercase italic tracking-tighter">MISSION <span className="text-[#e8a230]">CONTROL</span></div>
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center opacity-30 text-white italic text-[10px] font-black tracking-widest">DS-01</div>
                        </div>
                        <span className="panel-sub !text-[9px] !tracking-[0.5em] !font-black !text-[#222] italic !mb-12 block uppercase">Active fulfillment neural links</span>

                        {myActiveOrders.length === 0 ? (
                            <div className="h-[300px] sm:h-[400px] border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-10 text-center">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-3xl mb-6 grayscale opacity-20">📡</div>
                                <p className="bebas text-2xl italic text-white/20 tracking-widest uppercase">Awaiting Assignment</p>
                                <p className="barlow-cond text-[10px] font-black uppercase tracking-[0.3em] text-[#222] mt-2 italic">Sector: active</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {myActiveOrders.map((order) => (
                                    <div key={order.id} className="bg-[#111114] border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-[#e8a230]/20 shadow-[0_0_10px_#e8a230] animate-[scanning_4s_linear_infinite]" />
                                        
                                        <div className="flex justify-between items-start gap-4 mb-8">
                                            <div className="flex-1">
                                                <div className="mission-status !mb-2">
                                                    <span className="animate-pulse">●</span>
                                                    <span>{order.status === 'PICKED_UP' ? 'Delivery Mission' : 'Pickup Mission'}</span>
                                                </div>
                                                <h3 className="bebas text-3xl sm:text-5xl italic text-white leading-tight uppercase">{order.restaurant?.name || "RESTAURANT"}</h3>
                                            </div>
                                            <div className="text-right">
                                                <div className="bebas text-lg sm:text-xl italic text-white/20 tracking-widest leading-none mb-1">UNIT-ID</div>
                                                <p className="bebas text-xl sm:text-2xl italic text-[#e8a230] tracking-wider leading-none">#{order.id.slice(-6).toUpperCase()}</p>
                                            </div>
                                        </div>

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

                    <div className="panel bg-[#080808]">
                        <div className="panel-hd">
                            <div className="panel-title">SECTOR <span>OPPORTUNITIES</span></div>
                        </div>
                        <span className="panel-sub">Unassigned payloads in your operational vicinity</span>

                        <div className="grid grid-cols-1 gap-4">
                            {availableOrders.length === 0 ? (
                                <div className="p-8 sm:p-12 border border-white/5 rounded-3xl bg-black/20 text-center">
                                    <p className="barlow-cond text-xs font-black text-[#222] uppercase tracking-[0.4em] italic">No active opportunities in this sector</p>
                                </div>
                            ) : (
                                availableOrders.map((order) => (
                                    <div key={order.id} className="order-card group !mb-6 !rounded-[1.5rem] !bg-[#0c0c0e] hover:!border-[#e8a230]/40 transition-all duration-300">
                                        <div className="order-card-hd !bg-transparent !border-white/5 !px-6 !py-5">
                                            <div className="order-name !bebas !text-2xl !italic !tracking-wide">{order.restaurant?.name}</div>
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#3dd68c]/10 rounded-full border border-[#3dd68c]/20">
                                                <span className="w-1 h-1 rounded-full bg-[#3dd68c] animate-pulse"></span>
                                                <span className="text-[8px] font-black tracking-widest uppercase text-[#3dd68c]">Live Grid</span>
                                            </div>
                                        </div>
                                        <div className="order-body !px-6 !pb-6">
                                            <div className="flex flex-col gap-4">
                                                <p className="barlow-cond text-[10px] font-black text-[#333] uppercase tracking-widest italic">{order.restaurant?.address}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex gap-2">
                                                        <div className="yield-tag !px-4 !py-1.5 !text-[10px] !font-black !border-[#3dd68c]/30 !text-[#3dd68c] !bg-[#3dd68c]/5 italic">${(order.totalPay || order.total)?.toFixed(2)} YIELD</div>
                                                        <div className="dist-tag !px-4 !py-1.5 !text-[10px] !font-black !border-white/10 !text-white/40 !bg-white/5 italic">{order.distance?.toFixed(1) || "1.2"} MI</div>
                                                    </div>
                                                    <form action={async (formData) => {
                                                        "use server";
                                                        const id = formData.get("orderId") as string;
                                                        await acceptOrder(id);
                                                    }}>
                                                        <input type="hidden" name="orderId" value={order.id} />
                                                        <button className="bebas italic text-xl bg-[#e8a230] text-black px-8 py-2.5 rounded-xl hover:bg-white transition-all shadow-[0_10px_30px_rgba(232,162,48,0.2)] active:scale-95 uppercase tracking-wide">ENGAGE</button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-8 sm:mt-12 group cursor-pointer relative overflow-hidden bg-black/40 border border-white/5 rounded-[2rem] p-8 sm:p-10 active:scale-95 transition-all">
                            <div className="absolute inset-0 bg-[#e8a230]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex justify-between items-start mb-10 sm:mb-12">
                                <div>
                                    <div className="bebas text-2xl sm:text-4xl italic text-white/90 uppercase tracking-widest leading-none">SETTLEMENT <span className="text-[#e8a230]">BRIDGE</span></div>
                                    <p className="barlow-cond text-[9px] font-black uppercase tracking-[0.4em] text-[#222] mt-2 italic">Sector: instant liquidity</p>
                                </div>
                                <div className="w-12 h-12 bg-[#e8a230]/10 border border-[#e8a230]/20 rounded-2xl flex items-center justify-center text-[#e8a230] text-xl shadow-[0_0_20px_rgba(232,162,48,0.1)]">⚡</div>
                            </div>
                            <div className="flex items-baseline gap-2 mb-10 sm:mb-12">
                                <span className="bebas text-2xl sm:text-3xl text-[#222] italic leading-none">$</span>
                                <span className="bebas text-6xl sm:text-9xl italic text-white tracking-tighter leading-none">{stats.balance.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-white/5 pt-8 flex items-center justify-between">
                                <p className="barlow-cond text-[10px] font-black uppercase tracking-[0.3em] text-[#333] italic flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#e8a230] animate-pulse"></span>
                                    Tap to request instant payout
                                </p>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e8a230] italic opacity-40">TR-001</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
