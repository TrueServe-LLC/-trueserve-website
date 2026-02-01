import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import Map from "@/components/Map";
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
            .single();

        if (error || !restaurant) {
            // Fallback checking (preserving existing mock pattern logic if DB fails)
            // But for "Switch" request, better to just return null or handle error.
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
        // Fallback to mock if not found in DB
        const mockRestaurants = [
            {
                id: "1", name: "Bella Italia", address: "123 Pasta Avenue, NY", rating: 4.8, imageUrl: "/restaurant1.jpg", menuItems: [
                    { id: "m1", name: "Margherita Pizza", description: "Fresh basil, mozzarella, and tomato sauce", price: 14.99, imageUrl: "/hero-pizza.png", status: "APPROVED" },
                    { id: "m2", name: "Spaghetti Carbonara", description: "Creamy sauce with guanciale and pecorino", price: 18.50, imageUrl: null, status: "APPROVED" }
                ]
            },
            {
                id: "2", name: "Spice Route", address: "45 Curry Lane, NY", rating: 4.5, imageUrl: "/restaurant2.jpg", menuItems: [
                    { id: "m3", name: "Butter Chicken", description: "Tender chicken in a rich tomato and butter sauce", price: 16.99, imageUrl: "/hero-burger.png", status: "APPROVED" },
                    { id: "m4", name: "Garlic Naan", description: "Freshly baked bread with garlic and butter", price: 3.50, imageUrl: null, status: "APPROVED" }
                ]
            }
        ];
        return mockRestaurants.find(r => r.id === id);
    }
}

export default async function RestaurantMenu({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const restaurant = await getRestaurant(id);

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
                <div className="grid grid-3 gap-12 items-start">
                    {/* Menu Client Side handling Cart & Order */}
                    <div className="col-span-2">
                        <MenuClient
                            restaurantId={restaurant.id}
                            items={restaurant.menuItems.map((item: any) => ({
                                ...item,
                                price: Number(item.price)
                            }))}
                        />
                    </div>

                    {/* Sidebar with Info & Map */}
                    <div className="space-y-8 sticky top-24">
                        <div className="card p-0 overflow-hidden">
                            <div className="p-4 border-b border-white/10">
                                <h3 className="font-bold">Restaurant Location</h3>
                                <p className="text-xs text-slate-400">{restaurant.address}</p>
                            </div>
                            <div className="h-64">
                                <Map center={[40.7128, -74.0060]} zoom={15} />
                            </div>
                        </div>

                        <div className="card p-6 bg-slate-800/50">
                            <h3 className="font-bold mb-4">Hours of Operation</h3>
                            <div className="space-y-2 text-sm text-slate-400">
                                <div className="flex justify-between">
                                    <span>Mon - Fri</span>
                                    <span>10:00 AM - 10:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Sat - Sun</span>
                                    <span>11:00 AM - 11:30 PM</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
