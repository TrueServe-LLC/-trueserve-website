import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import LocationButton from "@/components/LocationButton";
import GoogleMapsMap from "@/components/GoogleMapsMap";
import FavoriteButton from "@/components/FavoriteButton";
import NotificationBell from "@/components/NotificationBell";
import LogoutButton from "@/components/LogoutButton";
import { getFavorites } from "@/app/user/favorite-actions";
import { cookies } from "next/headers";
import { calculateDistance } from "@/lib/utils";
import { redirect } from "next/navigation";
import ModeToggle from "@/components/ModeToggle";
import LandingSearch from "@/components/LandingSearch";

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
    openTime?: string;
    closeTime?: string;
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
        { city: 'Pineville', state: 'NC', zipPrefixes: ['28134'], lat: 35.0833, lng: -80.8872 },
        { city: 'Rock Hill', state: 'SC', zipPrefixes: ['29730', '29732'], lat: 34.9249, lng: -81.0251 },
        { city: 'Mount Airy', state: 'NC', zipPrefixes: ['27030'], lat: 36.4993, lng: -80.6073 },
        { city: 'Greenville', state: 'SC', zipPrefixes: ['29601', '29605', '29607', '29609', '29611', '29617'], lat: 34.8526, lng: -82.3940 },
        { city: 'Simpsonville', state: 'SC', zipPrefixes: ['29680', '29681'], lat: 34.7371, lng: -82.2537 },
        { city: 'Spartanburg', state: 'SC', zipPrefixes: ['29301', '29302', '29303', '29306', '29307'], lat: 34.9496, lng: -81.9320 },
        { city: 'Clemson', state: 'SC', zipPrefixes: ['29631', '29634'], lat: 34.6834, lng: -82.8374 },
        { city: 'Greer', state: 'SC', zipPrefixes: ['29650', '29651'], lat: 34.8956, lng: -82.2189 },
        { city: 'Athens', state: 'GA', zipPrefixes: ['30601', '30605', '30606', '30607'], lat: 33.9519, lng: -83.3576 },
        { city: 'Marietta', state: 'GA', zipPrefixes: ['30008', '30060', '30062', '30064', '30066', '30067', '30068'], lat: 33.9526, lng: -84.5499 },
        { city: 'Evans', state: 'GA', zipPrefixes: ['30809'], lat: 33.5335, lng: -82.1307 },
        { city: 'Davidson', state: 'NC', zipPrefixes: ['28035', '28036'], lat: 35.4993, lng: -80.8487 },
        { city: 'Brevard', state: 'NC', zipPrefixes: ['28712'], lat: 35.2334, lng: -82.7343 },
        { city: 'Fayetteville', state: 'NC', zipPrefixes: ['283'], lat: 35.0527, lng: -78.8784 }
    ];

    let validLocations: any[] = fallbackMocks;

    try {
        const { data: dbLocations } = await supabase.from('ServiceLocation').select('*').eq('isActive', true);
        if (dbLocations && dbLocations.length > 0) {
            validLocations = dbLocations.map(dbLoc => {
                const mockMatch = fallbackMocks.find(m => m.city === dbLoc.city);
                return {
                    lat: mockMatch?.lat || 0,
                    lng: mockMatch?.lng || 0,
                    zipPrefixes: [],
                    ...mockMatch,
                    ...dbLoc
                };
            }).filter(l => l.lat && l.lng); 
            
            for (const mock of fallbackMocks) {
                const exists = validLocations.find(l => l.city === mock.city && l.state === mock.state);
                if (!exists) validLocations.push(mock);
            }
        }
    } catch (e) {}

    let matchedLocation: any = null;
    if (address) {
        const lowerAddr = address.toLowerCase();
        matchedLocation = validLocations.find(loc => lowerAddr.includes(loc.city.toLowerCase()));
    }
    if (!matchedLocation && term) {
        const termClean = term.trim().toLowerCase();
        matchedLocation = validLocations.find(loc => {
            const cityLower = loc.city.toLowerCase();
            return cityLower.includes(termClean) || termClean.includes(cityLower) ||
                (loc.state.toLowerCase() === termClean) ||
                loc.zipPrefixes.some((prefix: string) => termClean.includes(prefix));
        });
    }
    if (!matchedLocation && lat && lng) {
        let minDist = 10000;
        validLocations.forEach(loc => {
            const d = Math.sqrt(Math.pow(loc.lat - lat, 2) + Math.pow(loc.lng - lng, 2));
            if (d < minDist) {
                minDist = d;
                matchedLocation = loc;
            }
        });
    }

    if (!matchedLocation) {
        return {
            restaurants: [],
            locationMeta: {
                name: address || term || "Unknown Location",
                center: (lat && lng) ? [lat, lng] : DEFAULT_CENTER
            }
        };
    }

    const locationMeta = {
        name: address || (term && term.length > 10 ? term : `${matchedLocation.city}, ${matchedLocation.state}`),
        center: (lat && !isNaN(lat) && lng && !isNaN(lng)) 
            ? [lat, lng] as [number, number] 
            : [matchedLocation.lat || DEFAULT_CENTER[0], matchedLocation.lng || DEFAULT_CENTER[1]] as [number, number]
    };

    try {
        const { data: restaurants, error } = await supabase
            .from('Restaurant')
            .select(`
                *,
                MenuItem(name, description),
                Review(rating),
                schedules:MerchantSchedule(*),
                orders:Order(id, status)
            `)
            .match({ city: matchedLocation.city, state: matchedLocation.state })
            .eq('visibility', 'VISIBLE')
            .neq('name', 'Test Restaurant');

        if (error || !restaurants || restaurants.length === 0) return { restaurants: [], locationMeta };

        const mappedRestaurants = restaurants.map((r: any, index: number) => {
            const seed = r.name.length + index;
            const realRatings = (r.Review || []).map((rev: any) => rev.rating);
            const avgRating = realRatings.length > 0
                ? (realRatings.reduce((a: number, b: number) => a + b, 0) / realRatings.length).toFixed(1)
                : (4.0 + (seed % 10) / 10).toFixed(1);

            let tags: string[] = ["Local"];
            const context = `${r.name} ${r.description} ${(r.MenuItem || []).map((m: any) => m.name).join(" ")}`.toLowerCase();
            if (context.includes("pizza")) tags.push("Pizza", "Italian");
            if (context.includes("burger")) tags.push("Burgers", "American");
            if (context.includes("asian") || context.includes("sushi")) tags.push("Asian");
            if (context.includes("mexican") || context.includes("taco")) tags.push("Mexican");
            if (context.includes("coffee") || context.includes("breakfast")) tags.push("Coffee", "Breakfast");
            if (context.includes("dessert") || context.includes("cake")) tags.push("Dessert");

            return {
                id: r.id,
                name: r.name,
                rating: Number(avgRating),
                image: r.imageUrl || `https://images.unsplash.com/photo-${1504674900247 + (seed % 1000)}?q=80&w=800&auto=format&fit=crop`,
                tags: Array.from(new Set(tags)),
                description: r.description,
                coords: [r.lat || (35.2271 + (index * 0.01)), r.lng || (-80.8431 + (index * 0.01))] as [number, number],
                priceLevel: "$".repeat((seed % 3) + 1),
                deliveryFee: seed % 3 === 0 ? "Free" : `$${(seed % 4 + 0.99).toFixed(2)}`,
                prepTime: `${15 + (seed % 15)}-${25 + (seed % 15)} min`,
                deal: (r.isMock || seed % 5 === 0) ? { type: 'PROMO', description: 'Spend $20, Save $5' } : undefined,
                isBusy: !!r.isBusy
            };
        });

        const finalRestaurants = category 
            ? mappedRestaurants.filter((r: any) => r.tags.some((t: string) => t.toLowerCase() === category.toLowerCase()))
            : mappedRestaurants;

        return { restaurants: finalRestaurants, locationMeta };
    } catch (error) {
        return { restaurants: [], locationMeta };
    }
}

export default async function RestaurantFinder({
    searchParams
}: {
    searchParams: Promise<{ location?: string; search?: string; address?: string; lat?: string; lng?: string; category?: string; welcome?: string; mode?: string }>
}) {
    const params = await searchParams;
    const mode = params.mode || "delivery";
    const effectiveAddress = params.address || params.location || params.search;
    const lat = params.lat ? parseFloat(params.lat) : undefined;
    const lng = params.lng ? parseFloat(params.lng) : undefined;
    const category = params.category;

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    let favorites: string[] = [];
    let activeOrders: any[] = [];

    if (userId) {
        favorites = await getFavorites();
        const { data } = await supabase.from('Order').select('*, restaurant:Restaurant(name)').eq('userId', userId).in('status', ['PENDING', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY']);
        if (data) activeOrders = data;
    }

    const { restaurants, locationMeta } = await getRestaurants({ term: effectiveAddress, address: effectiveAddress, lat, lng, category });

    const showLanding = !effectiveAddress && (!lat || !lng);

    if (showLanding) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col relative">
                <nav className="absolute top-0 w-full z-50 p-6 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.png" className="w-10 h-10 rounded-full" alt="TrueServe Logo" />
                        <span className="text-2xl font-black tracking-tighter text-white">True<span className="text-primary">Serve</span></span>
                    </Link>
                </nav>
                <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
                    <h1 className="text-5xl md:text-7xl font-black mb-8">Cravings, meet <span className="text-primary">Speed.</span></h1>
                    <LandingSearch locations={[]} />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-black/60 border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-8 h-8 rounded-full" />
                        <span className="text-xl font-black tracking-tighter text-white">True<span className="text-primary">Serve</span></span>
                    </Link>
                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                    <div className="flex items-center gap-8">
                        <Link href="/driver/login" className="nav-link text-primary border-b border-primary/20 hover:border-primary transition-all pb-1">Sign In</Link>
                        <Link href="/driver" className="btn-standard py-3 px-8 text-[9px]">
                            Fleet Home
                        </Link>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    {userId && <NotificationBell userId={userId} />}
                    <Suspense fallback={<div className="w-10 h-10 bg-white/5 rounded-full animate-pulse"></div>}>
                        <ModeToggle />
                    </Suspense>
                    {!userId ? (
                         <Link href="/login" className="btn-standard py-3 px-8 text-[9px]">Sign In</Link>
                    ) : (
                        <Link href="/user/settings" className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/10 hover:border-primary transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </Link>
                    )}
                </div>
            </nav>

            <main className="container py-12 md:py-24 px-4 md:px-8 pb-40">
                <div className="mb-16 md:mb-24">
                    <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-2">Discovery Hub</h1>
                    <p className="text-slate-500 font-medium italic">Synchronizing local flavors in {locationMeta.name || "your area"}.</p>
                </div>

                {activeOrders.length > 0 && (
                    <div className="mb-12 p-8 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[3rem] flex items-center justify-between shadow-2xl">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-emerald-500 font-black uppercase tracking-widest text-[10px]">Active Protocol</span>
                            </div>
                            <h3 className="text-2xl font-black text-white italic">{activeOrders[0].restaurant?.name} is {activeOrders[0].status.toLowerCase().replace('_', ' ')}</h3>
                        </div>
                        <Link href={`/orders/${activeOrders[0].id}`} className="btn-standard !bg-emerald-500 py-4 px-10 text-[10px]">Track Protocol →</Link>
                    </div>
                )}

                <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0"></div>
                    
                    <div className="flex items-center gap-4 overflow-x-auto pb-12 no-scrollbar scroll-smooth">
                        <Link href="/restaurants" className={`px-8 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border ${!category ? "bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"}`}>All</Link>
                        {["Fast Food", "Burgers", "Chicken", "Pizza", "Sushi", "Sandwiches"].map((cat) => (
                            <Link key={cat} href={`/restaurants?category=${cat}`} className={`px-8 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border ${category === cat ? "bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"}`}>{cat}</Link>
                        ))}
                    </div>

                    {restaurants.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                            {restaurants.map((rest: any) => (
                                <Link key={rest.id} href={`/restaurants/${rest.id}`} className="group flex flex-col active:scale-[0.98] transition-transform">
                                    <div className="h-52 md:h-64 rounded-[2rem] overflow-hidden mb-5 relative border border-white/5 shadow-2xl">
                                        <img src={rest.image} alt={rest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <div className="bg-black/40 backdrop-blur-xl text-white text-[9px] font-black px-4 py-2 rounded-xl border border-white/10 uppercase tracking-widest">{rest.deliveryFee === "Free" ? "FREE DELIVERY" : `${rest.deliveryFee} Fee`}</div>
                                            {rest.deal && <div className="bg-emerald-500 text-black text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-2xl">DEAL</div>}
                                        </div>
                                    </div>
                                    <div className="px-1">
                                        <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors mb-2 tracking-tight">{rest.name}</h3>
                                        <div className="flex items-center gap-3 text-[12px] text-slate-500 font-bold uppercase tracking-widest">
                                            <span className="text-emerald-400">{rest.deliveryFee === "Free" ? "Free Delivery" : rest.deliveryFee}</span>
                                            <span className="opacity-30">•</span>
                                            <span>{rest.prepTime}</span>
                                            <span className="opacity-30">•</span>
                                            <span>{rest.priceLevel}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 flex flex-col items-center text-center">
                            <div className="text-5xl mb-8 opacity-20">🍽️</div>
                            <h3 className="text-2xl font-black text-white mb-2 italic">No local gems found</h3>
                            <p className="text-slate-500 font-medium">Try adjusting your filters or area.</p>
                        </div>
                    )}
                </div>

                <section className="mt-20 w-full flex justify-center">
                    <div className="p-12 md:p-20 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[3rem] md:rounded-[5rem] flex flex-col items-center text-center max-w-5xl w-full shadow-2xl">
                        <h2 className="text-3xl md:text-5xl font-black mb-6 text-white italic tracking-tighter">Built for the Community.</h2>
                        <p className="text-slate-500 text-base md:text-lg mb-12 max-w-3xl">TrueServe isn't just an app. We're a delivery standard designed to help local gems thrive while ensuring our drivers earn what they deserve.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                            {[{ icon: '📊', label: 'Fair Split' }, { icon: '⚡', label: 'Priority' }, { icon: '🏷️', label: '5% Saved' }, { icon: '🎂', label: 'Gifts' }].map((item) => (
                                <div key={item.label} className="p-6 rounded-3xl bg-black/60 border border-white/5 flex flex-col items-center">
                                    <div className="text-3xl mb-4">{item.icon}</div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
