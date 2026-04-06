export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getFavorites } from "@/app/user/favorite-actions";
import FavoriteButton from "@/components/FavoriteButton";
import NotificationBell from "@/components/NotificationBell";

import MenuClient from "./MenuClient";

import { supabaseAdmin } from "@/lib/supabase-admin";

async function getRestaurant(id: string) {
    try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        const query = supabaseAdmin
            .from('Restaurant')
            .select(`
                *,
                menuItems:MenuItem(*),
                schedules:MerchantSchedule(*),
                orders:Order(id, status)
            `);

        const { data: restaurant, error } = isUuid 
            ? await query.eq('id', id).single() 
            : await query.eq('slug', id).single();

        if (error || !restaurant) {
            console.error(`[getRestaurant] Node lookup failed for '${id}':`, error);
            // Fallback: If not found by slug, try ID (in case slug looks like UUID or vice-versa)
            if (!isUuid) {
               const { data: fallback } = await supabaseAdmin.from('Restaurant').select('*, menuItems:MenuItem(*), schedules:MerchantSchedule(*), orders:Order(id, status)').eq('id', id).maybeSingle();
               if (fallback) return finalizeRestaurantData(fallback);
            }
            return null;
        }

        return finalizeRestaurantData(restaurant);
    } catch (e) {
        console.error("[getRestaurant] Fatal terminal exception:", e);
        return null;
    }
}

function finalizeRestaurantData(restaurant: any) {
    const now = new Date();
    // Filter valid menu items (only APPROVED and available)
    restaurant.menuItems = (restaurant.menuItems || []).filter((item: any) => 
        item.status === "APPROVED" && (item.isAvailable !== false)
    );

    // Smart Status Resolution
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 8);
    const seed = restaurant.name.length;
    
    let isBusy = !!restaurant.isBusy;
    let extraBuffer = 0;

    if (restaurant.busyUntil && new Date(restaurant.busyUntil) > now) isBusy = true;

    if (restaurant.schedules) {
        for (const s of restaurant.schedules) {
            if (s.isEnabled && s.dayOfWeek === currentDay && currentTime >= s.startTime && currentTime <= s.endTime) {
                if (s.action === 'PAUSE') isBusy = true;
                if (s.action === 'BUFFER') extraBuffer += s.extraPrepTime;
            }
        }
    }

    const pendingOrders = (restaurant.orders || []).filter((o: any) => o.status === 'PENDING' || o.status === 'PREPARING').length;
    if (restaurant.autoPilotEnabled && pendingOrders >= (restaurant.capacityThreshold || 10)) isBusy = true;

    let basePrep = restaurant.manualPrepTime || (15 + (seed % 10));
    if (!restaurant.manualPrepTime) basePrep += Math.floor(pendingOrders * 1.5);
    
    restaurant.isBusy = restaurant.isMock ? false : isBusy;
    restaurant.prepTime = `${basePrep + extraBuffer}-${basePrep + extraBuffer + 10} min`;

    return restaurant;
}


export default async function RestaurantMenu({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ address?: string; lat?: string; lng?: string; embed?: string }>
}) {
    const { id } = await params;
    const { address, lat, lng, embed } = await searchParams;
    const isEmbedded = embed === 'true';

    const [restaurant, { isOrderingEnabled }] = await Promise.all([
        getRestaurant(id),
        import('@/lib/system')
    ]);

    const orderingEnabled = await isOrderingEnabled();

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    let initialIsFavorited = false;
    let truePointsBalance = 0;

    if (userId) {
        const favs = await getFavorites();
        initialIsFavorited = favs.includes(id);

        const { data: userData } = await supabase.from('User').select('truePointsBalance').eq('id', userId).single();
        if (userData) {
            truePointsBalance = userData.truePointsBalance || 0;
        }
    }

    if (!restaurant) {
        notFound();
    }

    return (
        <main className={`min-h-screen ${isEmbedded ? 'bg-transparent p-0' : 'bg-[#0c0e13] px-6 lg:px-20 pb-20'}`}>
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-10 pt-16 pb-12 transition-all ${isEmbedded ? 'hidden' : 'animate-fade-in'}`}>
                <div className="space-y-4">
                    {!isEmbedded && (
                        <Link href="/restaurants" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-[#e8a230] transition-colors italic">
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Grid
                        </Link>
                    )}
                    
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-[#3dd68c] animate-pulse shadow-[0_0_10px_#3dd68c]"></div>
                            <h1 className="text-6xl md:text-8xl font-bebas italic text-white uppercase leading-[0.85] tracking-tighter shadow-glow-text">
                                {restaurant.name}<span className="text-[#e8a230]">.</span>
                            </h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 italic">
                                // Sector: {restaurant.address.split(',')[0]} · {restaurant.cuisineType || 'Caribbean Premium'}
                            </p>
                            <div className="flex items-center gap-3 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full backdrop-blur-xl">
                                <span className="text-yellow-400 text-xs">★</span>
                                <span className="text-[10px] font-black text-white italic">{restaurant.rating || '4.9'} <span className="opacity-40 ml-1">Rating</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="px-8 py-4 bg-white/[0.02] border border-white/5 rounded-[2rem] flex flex-col items-center hover:border-[#e8a230]/20 transition-all cursor-crosshair">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 italic mb-1">Fulfillment Cycle</span>
                        <span className="text-3xl font-bebas italic text-white tracking-widest">{restaurant.prepTime.split(' ')[0]} <span className="text-[10px] opacity-40 ml-1">MIN</span></span>
                    </div>
                    {userId && (
                        <FavoriteButton
                            restaurantId={id}
                            initialIsFavorited={initialIsFavorited}
                        />
                    )}
                </div>
            </div>

            <div className={isEmbedded ? '' : 'pt-4'}>
                <MenuClient
                    userId={userId}
                    truePointsBalance={truePointsBalance}
                    restaurant={restaurant}
                    items={restaurant.menuItems.map((item: any) => ({
                        ...item,
                        price: Number(item.price)
                    }))}
                    orderingEnabled={orderingEnabled}
                    initialAddress={address}
                    initialLat={typeof lat === 'string' ? parseFloat(lat) : undefined}
                    initialLng={typeof lng === 'string' ? parseFloat(lng) : undefined}
                />
            </div>
        </main>
    );
}

