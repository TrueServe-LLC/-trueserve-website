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

        // Compute open/closed status from operating hours
        const openTime = (restaurant.openTime || "08:00:00").slice(0, 5);
        const closeTime = (restaurant.closeTime || "22:00:00").slice(0, 5);
        const currentHHMM = now.toTimeString().slice(0, 5);
        restaurant.isOpen = restaurant.isMock ? true : (currentHHMM >= openTime && currentHHMM <= closeTime);
        restaurant.openTimeDisplay = openTime;
        restaurant.closeTimeDisplay = closeTime;

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

                        {/* ── COVER PHOTO BANNER ── */}
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            height: 220,
                            borderRadius: 16,
                            overflow: 'hidden',
                            marginBottom: 0,
                            background: '#141a18',
                        }}>
                            {restaurant.imageUrl ? (
                                <img
                                    src={restaurant.imageUrl}
                                    alt={restaurant.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                                />
                            ) : (
                                /* Placeholder shown until a real photo is uploaded */
                                <div style={{
                                    width: '100%', height: '100%',
                                    background: 'linear-gradient(135deg, #1a2420 0%, #0f1a14 50%, #141a18 100%)',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center', gap: 10,
                                }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: 14,
                                        border: '2px dashed rgba(249,115,22,0.35)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 22, color: 'rgba(249,115,22,0.5)',
                                    }}>📷</div>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                                        Add cover photo in merchant dashboard
                                    </p>
                                </div>
                            )}
                            {/* Gradient overlay — always shown */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.55) 100%)',
                            }} />
                            {/* Restaurant name overlay */}
                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                padding: '16px 20px',
                                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12,
                            }}>
                                <div>
                                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 3 }}>
                                        {restaurant.cuisineType || 'Restaurant'}
                                    </div>
                                    <h2 style={{ margin: 0, fontSize: 'clamp(22px,5vw,34px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.01em', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
                                        {restaurant.name}
                                    </h2>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                    <span style={{ fontSize: 13, color: '#fbbf24' }}>★</span>
                                    <span style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>{restaurant.rating || '4.9'}</span>
                                    {restaurant.isOpen
                                        ? <span style={{ fontSize: 10, fontWeight: 800, color: '#4dca80', background: 'rgba(77,202,128,0.15)', border: '1px solid rgba(77,202,128,0.3)', padding: '3px 8px', borderRadius: 20, letterSpacing: '0.1em' }}>OPEN</span>
                                        : <span style={{ fontSize: 10, fontWeight: 800, color: '#f87171', background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', padding: '3px 8px', borderRadius: 20, letterSpacing: '0.1em' }}>CLOSED</span>
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="menu-hd" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: 0 }}>
                            <div>
                                <Link href="/restaurants" className="back" style={{ marginBottom: '8px' }}>
                                    ← Restaurants
                                </Link>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                                    {restaurant.address} · Prep time {restaurant.prepTime}
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flexShrink: 0, flexWrap: 'wrap' }}>
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
                            isOpen={restaurant.isOpen}
                            openTimeDisplay={restaurant.openTimeDisplay}
                            closeTimeDisplay={restaurant.closeTimeDisplay}
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
                        isOpen={restaurant.isOpen}
                        openTimeDisplay={restaurant.openTimeDisplay}
                        closeTimeDisplay={restaurant.closeTimeDisplay}
                        initialAddress={address}
                        initialLat={typeof lat === 'string' ? parseFloat(lat) : undefined}
                        initialLng={typeof lng === 'string' ? parseFloat(lng) : undefined}
                    />
                </main>
            )}
        </div>
    );
}
