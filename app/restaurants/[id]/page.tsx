import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

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
            // Fallback checking for mocks
            const { getMockRestaurant } = await import('@/lib/mocks');
            const mock = getMockRestaurant(id);
            if (mock) {
                return {
                    ...mock,
                    imageUrl: mock.image,
                    menuItems: mock.menuItems.map((item: any) => ({ ...item, imageUrl: item.image }))
                };
            }
            if (error) console.error("Supabase Error (getRestaurant):", error);
            return null;
        }

        // Filter valid menu items
        if (restaurant.menuItems) {
            restaurant.menuItems = restaurant.menuItems.filter((item: any) => item.status === "APPROVED");
        }

        return restaurant;
    } catch (e) {
        console.warn("DB failed", e);
        console.warn("DB failed or not found, checking mocks", e);
        const { getMockRestaurant } = await import('@/lib/mocks');
        const mock = getMockRestaurant(id);

        if (mock) {
            return {
                ...mock,
                imageUrl: mock.image, // Map for compatibility
                menuItems: mock.menuItems.map(item => ({
                    ...item,
                    imageUrl: item.image // Map for compatibility
                }))
            };
        }
        return null;
    }
}

export default async function RestaurantMenu({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Parallel fetch: get restaurant and system status
    const [restaurant, { isOrderingEnabled }] = await Promise.all([
        getRestaurant(id),
        import('@/lib/system')
    ]);

    const orderingEnabled = await isOrderingEnabled();

    if (!restaurant) {
        notFound();
    }

    return (
        <div className="min-h-screen">
            <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 px-6 py-4">
                <div className="container flex justify-between items-center">
                    <Link href="/restaurants" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <span>&larr;</span> Back to Restaurants
                    </Link>
                    <Link href="/" className="text-2xl font-bold tracking-tighter">
                        True<span className="text-gradient">Serve</span>
                    </Link>
                    <div className="w-24"></div> {/* Spacer for symmetry */}
                </div>
            </nav>

            {/* Hero Section */}
            <div className={`h-48 relative overflow-hidden bg-slate-800`}>
                {restaurant.imageUrl && (
                    <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="w-full h-full object-cover opacity-50"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-8">
                    <div className="container">
                        <h1 className="text-5xl font-bold mb-2">{restaurant.name}</h1>
                        <div className="flex items-center gap-4 text-sm text-slate-300">
                            <span>{restaurant.address}</span>
                            {/* @ts-ignore */}
                            {restaurant.rating && <span className="text-yellow-400">★ {restaurant.rating}</span>}
                        </div>
                    </div>
                </div>
            </div>

            <main className="container py-12 animate-fade-in">
                <MenuClient
                    restaurant={restaurant}
                    items={restaurant.menuItems.map((item: any) => ({
                        ...item,
                        price: Number(item.price)
                    }))}
                    orderingEnabled={orderingEnabled}
                />
            </main>
        </div>
    );
}
