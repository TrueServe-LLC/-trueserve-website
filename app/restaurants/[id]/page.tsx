export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getFavorites } from "@/app/user/favorite-actions";
import FavoriteButton from "@/components/FavoriteButton";

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

        const slugify = (value: string) =>
            value
                .toLowerCase()
                .replace(/['’]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");

        let restaurant: any = null;
        let error: any = null;

        if (isUuid) {
            const res = await query.eq('id', id).single();
            restaurant = res.data;
            error = res.error;
        } else {
            // Some environments don't have a `Restaurant.slug` column yet.
            // For those, fall back to slugifying the restaurant name.
            const lookup = await supabase
                .from('Restaurant')
                .select('id, name')
                .eq('visibility', 'VISIBLE')
                .limit(500);

            if (lookup.error) {
                error = lookup.error;
            } else {
                const match = (lookup.data || []).find((r: any) => slugify(String(r.name || "")) === id);
                if (match?.id) {
                    const res = await query.eq('id', match.id).single();
                    restaurant = res.data;
                    error = res.error;
                } else {
                    restaurant = null;
                    error = null;
                }
            }
        }

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
        <div className={isEmbedded ? '' : 'food-app-shell'}>
            {!isEmbedded && (
                <main className="food-app-main">
                    <div id="view-menu" className="active menu-page">
                        <div className="menu-hd">
                            <div>
                                <Link href="/restaurants" className="back" style={{ marginBottom: '8px' }}>
                                    ← Restaurants
                                </Link>
                                <div className="food-eyebrow">Restaurant Menu</div>
                                <h2>{restaurant.name}</h2>
                                <p>{restaurant.address} · {restaurant.cuisineType || 'Comfort Food'} · Prep time {restaurant.prepTime}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flexShrink: 0, flexWrap: 'wrap' }}>
                                <span className="stars">★★★★★</span>
                                <span style={{ fontWeight: 900, fontSize: '14px' }}>{restaurant.rating || '4.9'}</span>
                                {restaurant.cuisineType && <span className="food-chip">{restaurant.cuisineType}</span>}
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
                    </div>
                </main>
            )}

            {isEmbedded && (
                <main id="view-menu" className="active">
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
            )}
        </div>
    );
}
