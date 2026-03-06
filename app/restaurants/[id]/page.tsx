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
        const { data: restaurant, error } = await supabase
            .from('Restaurant')
            .select(`
                *,
                menuItems:MenuItem(*)
            `)
            .eq('id', id)
            .eq('visibility', 'VISIBLE')
            .single();

        if (error || !restaurant) {
            if (error) console.error("Supabase Error (getRestaurant):", error);
            return null;
        }

        // Filter valid menu items
        restaurant.menuItems = (restaurant.menuItems || []).filter((item: any) => item.status === "APPROVED");

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
    searchParams: Promise<{ address?: string; lat?: string; lng?: string }>
}) {
    const { id } = await params;
    const { address, lat, lng } = await searchParams;

    // Parallel fetch: get restaurant and system status
    const [restaurant, { isOrderingEnabled }] = await Promise.all([
        getRestaurant(id),
        import('@/lib/system')
    ]);

    const orderingEnabled = await isOrderingEnabled();

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    let initialIsFavorited = false;

    if (userId) {
        const favs = await getFavorites();
        initialIsFavorited = favs.includes(id);
    }

    if (!restaurant) {
        notFound();
    }

    return (
        <div className="min-h-screen">
            {/* Desktop Navbar */}
            <nav className="hidden md:flex sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 px-6 py-4">
                <div className="container flex justify-between items-center">
                    <Link href="/restaurants" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <span>&larr;</span> Back to Restaurants
                    </Link>
                    <Link href="/" className="text-2xl font-bold tracking-tighter">
                        True<span className="text-gradient">Serve</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {userId && <NotificationBell userId={userId} />}
                        {userId ? (
                            <Link href="/user/settings" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 hover:border-primary transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            </Link>
                        ) : (
                            <Link href="/login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Login</Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Header Over Image & Desktop Hero Content */}
            <div className={`h-64 relative overflow-hidden bg-slate-900 rounded-b-[2.5rem] md:rounded-b-none`}>
                <div className="md:hidden absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pt-8">
                    <Link href="/restaurants" className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                    </Link>
                    {userId ? (
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/10">
                            <FavoriteButton
                                restaurantId={id}
                                initialIsFavorited={initialIsFavorited}
                            />
                        </div>
                    ) : (
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white/50 border border-white/10">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        </div>
                    )}
                </div>

                {restaurant.imageUrl && (
                    <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="w-full h-full object-cover opacity-80"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t md:from-slate-900 md:to-transparent from-black/80 via-black/20 to-transparent" />

                {/* Desktop Info Overlay */}
                <div className="hidden md:block absolute bottom-0 left-0 w-full p-8">
                    <div className="container">
                        <div className="flex items-center gap-6">
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">{restaurant.name}</h1>
                            {userId && (
                                <FavoriteButton
                                    restaurantId={id}
                                    initialIsFavorited={initialIsFavorited}
                                    className="scale-110 mb-2"
                                />
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-300">
                            <span>{restaurant.address}</span>
                            {/* @ts-ignore */}
                            {restaurant.rating && <span className="text-secondary font-bold">★ {restaurant.rating}</span>}
                        </div>
                    </div>
                </div>
            </div>

            <main className="container py-8 md:py-12 animate-fade-in">
                <MenuClient
                    userId={userId}
                    restaurant={restaurant}
                    items={restaurant.menuItems.map((item: any) => ({
                        ...item,
                        price: Number(item.price)
                    }))}
                    orderingEnabled={orderingEnabled}
                    initialAddress={address}
                    initialLat={lat ? parseFloat(lat) : undefined}
                    initialLng={lng ? parseFloat(lng) : undefined}
                />
            </main>
        </div>
    );
}
