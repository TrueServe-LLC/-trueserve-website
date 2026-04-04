export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getFavorites } from "@/app/user/favorite-actions";
import FavoriteButton from "@/components/FavoriteButton";
import NotificationBell from "@/components/NotificationBell";

import MenuClient from "./MenuClient";

async function getRestaurant(id: string) {
    try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        const query = supabase
            .from('Restaurant')
            .select(`
                *,
                menuItems:MenuItem(*),
                schedules:MerchantSchedule(*),
                orders:Order(id, status)
            `)
            .eq('visibility', 'VISIBLE');

        const { data: restaurant, error } = isUuid 
            ? await query.eq('id', id).single() 
            : await query.eq('slug', id).single();

        if (error || !restaurant) {
            if (error) console.error("Supabase Error (getRestaurant):", error);
            return null;
        }

        // Filter valid menu items (only APPROVED and unavailable handled in client but filtering here for performance)
        restaurant.menuItems = (restaurant.menuItems || []).filter((item: any) => 
            item.status === "APPROVED" && (item.isAvailable !== false)
        );

        // Smart Status Resolution
        const now = new Date();
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
    } catch (e) {
        console.warn("DB failed", e);
        return null;
    }
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

    // Parallel fetch: get restaurant and system status
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
        <main id="view-menu" className={`active ${isEmbedded ? 'bg-transparent' : ''}`}>
            <div className="menu-hd">
                <div>
                    {!isEmbedded && (
                        <Link href="/restaurants" className="back" style={{ marginBottom: '6px' }}>
                            ← Restaurants
                        </Link>
                    )}
                    <h2>{restaurant.name}</h2>
                    <p>{restaurant.address} · {restaurant.cuisineType || 'Caribbean'} · Open until 8 PM</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flexShrink: 0 }}>
                    <span className="stars">★★★★★</span>
                    <span style={{ fontWeight: 900, fontSize: '14px' }}>{restaurant.rating || '4.9'}</span>
                    {restaurant.cuisineType && <span className="pill">{restaurant.cuisineType}</span>}
                    {userId && (
                        <FavoriteButton
                            restaurantId={id}
                            initialIsFavorited={initialIsFavorited}
                        />
                    )}
                </div>
            </div>

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
        </main>
    );
}
