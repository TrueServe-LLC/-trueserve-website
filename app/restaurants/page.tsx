import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import NotificationBell from "@/components/NotificationBell";
import LogoutButton from "@/components/LogoutButton";
import { getFavorites } from "@/app/user/favorite-actions";
import { cookies } from "next/headers";
import LandingSearch from "@/components/LandingSearch";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

interface Restaurant {
    id: string;
    name: string;
    rating: number;
    image: string;
    tags: string[];
    description: string;
    coords: [number, number];
    city?: string;
    distance?: string;
    address?: string;
    deliveryFee?: string;
    prepTime?: string;
    priceLevel?: string;
    deal?: { type: string; description: string };
    isBusy?: boolean;
}

interface LocationMeta {
    name: string;
    center: [number, number];
}

async function getRestaurants(
    query: {
        term?: string;
        lat?: number;
        lng?: number;
        address?: string;
        category?: string;
    }
): Promise<{ restaurants: Restaurant[]; locationMeta: LocationMeta }> {
    const { term, lat, lng, address, category } = query;
    const DEFAULT_CENTER: [number, number] = [35.2271, -80.8431]; 

    const fallbackMocks = [
        { city: 'Charlotte', state: 'NC', zipPrefixes: ['282', '280', '281'], lat: 35.2271, lng: -80.8431 },
        { city: 'Athens', state: 'GA', zipPrefixes: ['30601', '30605', '30606', '30607'], lat: 33.9519, lng: -83.3576 },
        { city: 'Atlanta', state: 'GA', zipPrefixes: ['30301'], lat: 33.7490, lng: -84.3880 },
    ];

    let matchedLocation: any = fallbackMocks[0];
    if (address) {
        matchedLocation = { city: address.split(',')[0], lat: 33.7490, lng: -84.3880 };
    }

    try {
        const { data: restaurants, error } = await supabase
            .from('Restaurant')
            .select(`*, MenuItem(name), Review(rating)`)
            .eq('visibility', 'VISIBLE')
            .limit(20);

        if (error || !restaurants) return { restaurants: [], locationMeta: { name: address || "Your Area", center: DEFAULT_CENTER } };

        const mapped = restaurants.map((r: any, index: number) => ({
            id: r.id,
            name: r.name,
            rating: 4.5 + (index % 5) / 10,
            image: r.imageUrl || null,
            tags: ["Local", "Gourmet"],
            description: r.description,
            coords: [r.lat || 33.7, r.lng || -84.3] as [number, number],
            priceLevel: "$$",
            deliveryFee: index % 2 === 0 ? "Free" : "1.99",
            prepTime: "15-25",
            isBusy: !!r.isBusy
        }));

        const filtered = category && category !== "Trending"
            ? mapped.filter(r => r.name.toLowerCase().includes(category.toLowerCase()) || category === "Trending")
            : mapped;

        return { 
            restaurants: filtered, 
            locationMeta: { name: address || "Your Area", center: DEFAULT_CENTER } 
        };
    } catch (e) {
        return { restaurants: [], locationMeta: { name: address || "Your Area", center: DEFAULT_CENTER } };
    }
}

export default async function RestaurantFinder({
    searchParams
}: {
    searchParams: Promise<{ location?: string; search?: string; address?: string; lat?: string; lng?: string; category?: string }>
}) {
    const params = await searchParams;
    const effectiveAddress = params.address || params.location || params.search;
    const category = params.category || "Trending";

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    let favorites: string[] = [];
    if (userId) favorites = await getFavorites();

    const { restaurants, locationMeta } = await getRestaurants({ term: effectiveAddress, address: effectiveAddress, category });

    const categories = [
        { emoji: "🔥", label: "Trending", value: "Trending" },
        { emoji: "🍗", label: "Soul Food", value: "Soul Food" },
        { emoji: "🥩", label: "BBQ", value: "BBQ" },
        { emoji: "🍜", label: "Asian", value: "Asian" },
        { emoji: "🌮", label: "Latin", value: "Latin" },
        { emoji: "🥗", label: "Healthy", value: "Healthy" },
        { emoji: "🍰", label: "Desserts", value: "Dessert" },
        { emoji: "🍳", label: "Breakfast", value: "Breakfast" },
        { emoji: "🍗", label: "Wings", value: "Wings" },
        { emoji: "🦞", label: "Seafood", value: "Seafood" },
        { emoji: "🌿", label: "Vegan", value: "Vegan" },
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F0EDE8]">
            {/* MOBILE WRAPPER */}
            <div className="max-w-[430px] mx-auto min-h-screen relative shadow-[0_0_100px_rgba(0,0,0,1)] bg-[#0A0A0A] pb-24">
                
                {/* AMBIENT ORBS */}
                <div className="orb w-[280px] h-[280px] top-[-60px] left-[-90px] bg-[#e8a230]/5" />
                <div className="orb w-[200px] h-[200px] top-[400px] right-[-70px] bg-[#e8a230]/5" />

                {/* NAV */}
                <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-4 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5">
                    <Logo size="sm" />
                    <div className="flex items-center gap-3">
                        {userId ? (
                            <div className="flex items-center gap-3">
                                <NotificationBell userId={userId} />
                                <Link href="/user/settings" className="w-[38px] h-[38px] rounded-xl bg-[#1C1C1C] border border-white/5 flex items-center justify-center font-bold">👤</Link>
                            </div>
                        ) : (
                            <Link href="/login" className="bg-[#e8a230] text-black px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider font-barlow-cond">Sign In</Link>
                        )}
                    </div>
                </nav>

                {/* HEADER */}
                <div className="px-5 pt-6 mb-8">
                    <div className="inline-flex items-center gap-2 bg-[#1C1C1C] border border-white/5 rounded-full px-4 py-1.5 mb-4">
                        <div className="w-2 h-2 bg-[#e8a230] rounded-full animate-pulse shadow-[0_0_8px_#e8a230]" />
                        <span className="text-[11px] font-bold uppercase tracking-widest font-barlow-cond">{locationMeta.name}</span>
                    </div>
                    <h1 className="text-5xl font-bebas text-white leading-none uppercase">Discovery<br /><span className="text-[#e8a230]">HUB</span></h1>
                </div>

                {/* CATEGORY SCROLL */}
                <div className="flex gap-2.5 px-5 mb-8 overflow-x-auto no-scrollbar scroll-smooth">
                    {categories.map((cat, i) => {
                        const isActive = category === cat.value;
                        return (
                            <Link 
                                key={i} 
                                href={`/restaurants?address=${encodeURIComponent(effectiveAddress || "")}&category=${cat.value}`}
                                className={`flex items-center gap-2.5 px-5 py-3 rounded-full border shrink-0 transition-all ${isActive ? 'bg-[#e8a230] border-[#e8a230] text-black' : 'bg-[#131313] border-white/5 text-white'}`}
                            >
                                <span className="text-lg">{cat.emoji}</span>
                                <span className={`text-[12px] font-bold tracking-wider font-barlow-cond`}>{cat.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* RESTAURANT LIST */}
                <div className="px-5 space-y-6">
                    <div className="flex items-center justify-between opacity-50 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-barlow-cond">{restaurants.length} Results Found</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-barlow-cond">Sort: Top Rated ▼</span>
                    </div>
                    
                    {restaurants.map((rest, i) => (
                        <Link href={`/restaurants/${rest.id}`} key={i} className="block group animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="bg-[#131313] border border-white/5 rounded-[24px] overflow-hidden group-hover:scale-[1.01] transition-transform">
                                <div className="h-[140px] w-full bg-[#1C1C1C] flex items-center justify-center text-5xl relative">
                                    {rest.name[0]}
                                    <div className="absolute top-4 left-4">
                                        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[9px] font-bold text-[#e8a230] font-barlow-cond">⭐ {rest.rating}</div>
                                    </div>
                                    <FavoriteButton restaurantId={rest.id} initialIsFavorited={favorites.includes(rest.id)} className="absolute top-4 right-4 !bg-black/40 !border-white/10" />
                                </div>
                                <div className="p-5">
                                    <h3 className="text-2xl font-black uppercase italic tracking-wider text-white mb-1 font-barlow-cond">{rest.name}</h3>
                                    <div className="flex items-center gap-3 text-[11px] text-[#5A5550] font-medium mb-3">
                                        <span>⏱ {rest.prepTime} MIN</span>
                                        <div className="w-1 h-1 bg-[#5A5550]/30 rounded-full" />
                                        <span className="text-[#e8a230] font-bold">{rest.deliveryFee === 'Free' ? 'FREE' : `$${rest.deliveryFee}`} DELIVERY</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {rest.tags.map(tag => (
                                            <div key={tag} className="bg-[#1C1C1C] text-[#5A5550] px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest font-barlow-cond">{tag}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* BOTTOM MOBILE NAV */}
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#0C0C0C]/95 backdrop-blur-2xl border-t border-white/5 px-6 pt-3 pb-8 flex items-center justify-around z-50">
                    <Link href="/" className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100"><span className="text-xl">🏠</span><span className="text-[9px] font-bold uppercase tracking-widest font-barlow-cond">Home</span></Link>
                    <Link href="/restaurants" className="flex flex-col items-center gap-1 text-[#e8a230]"><span className="text-xl">🔍</span><span className="text-[9px] font-bold uppercase tracking-widest font-barlow-cond">Explore</span></Link>
                    <Link href="/orders" className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100"><span className="text-xl">📋</span><span className="text-[9px] font-bold uppercase tracking-widest font-barlow-cond">Orders</span></Link>
                    <Link href="/user/settings" className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100"><span className="text-xl">👤</span><span className="text-[9px] font-bold uppercase tracking-widest font-barlow-cond">Profile</span></Link>
                </div>
            </div>
        </div>
    );
}
