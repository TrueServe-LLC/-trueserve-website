import { supabase } from "@/lib/supabase";
import Link from "next/link";
import LocationButton from "@/components/LocationButton";
import GoogleMapsMap from "@/components/GoogleMapsMap";
import FavoriteButton from "@/components/FavoriteButton";
import NotificationBell from "@/components/NotificationBell";
import { getFavorites } from "@/app/user/favorite-actions";
import { cookies } from "next/headers";
import { calculateDistance } from "@/lib/utils";

interface Restaurant {
    id: string;
    name: string;
    rating: number;
    image: string;
    tags: string[];
    description: string;
    coords: [number, number];
    city?: string;
    state?: string;
    distance?: string;
    address?: string;
}

// ... (in getRestaurants function)


interface LocationMeta {
    name: string;
    center: [number, number];
}

// Enhanced getRestaurants to handle coordinates and string search
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

    // Default Fallback ID
    const DEFAULT_CENTER: [number, number] = [35.2271, -80.8431]; // Charlotte Uptown

    // 1. If we have precise coordinates, use them to find the closest service city
    let matchedLocation: any = null;
    let searchCity = "";

    // Define fallbacks (mocks) for demo/offline
    const fallbackMocks = [
        { city: 'Charlotte', state: 'NC', zipPrefixes: ['282', '280', '281'], lat: 35.2271, lng: -80.8431 },
        { city: 'Pineville', state: 'NC', zipPrefixes: ['28134'], lat: 35.0833, lng: -80.8872 },
        { city: 'Rock Hill', state: 'SC', zipPrefixes: ['29730', '29732'], lat: 34.9249, lng: -81.0251 }
    ];

    let validLocations: any[] = fallbackMocks;

    // Try fetching from DB
    try {
        const { data: dbLocations } = await supabase.from('ServiceLocation').select('*').eq('isActive', true);
        if (dbLocations && dbLocations.length > 0) {
            validLocations = [...dbLocations];
            // Merge mocks if not present (for demo continuity)
            for (const mock of fallbackMocks) {
                const exists = validLocations.find(l => l.city === mock.city && l.state === mock.state);
                if (!exists) validLocations.push(mock);
            }
        }
    } catch (e) {
        console.log("Running in Offline/Demo Mode (Database not reachable).");
    }

    // Logic to determine "matchedLocation" based on inputs
    if (address) {
        // Try to extract city from address string if possible
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

    // If still no match but we have coords, find closest (simple euclidean for now)
    if (!matchedLocation && lat && lng) {
        let minDist = 10000;
        validLocations.forEach(loc => {
            const d = Math.sqrt(Math.pow(loc.lat - lat, 2) + Math.pow(loc.lng - lng, 2));
            if (d < minDist) {
                minDist = d;
                matchedLocation = loc;
            }
        });
        // If distance is too far (approx > 0.5 degrees ~ 30 miles), maybe don't match?
        // For constraints of this app, we'll be generous.
    }

    if (!matchedLocation) {
        // Default to Charlotte if nothing matches but we need to show something (or return empty)
        // Returning empty allows the UI to show "No restaurants found"
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
        center: (lat && lng) ? [lat, lng] as [number, number] : [matchedLocation.lat, matchedLocation.lng] as [number, number]
    };

    try {
        const cityFilter = matchedLocation.city;
        const stateFilter = matchedLocation.state;

        const { data: restaurants, error } = await supabase
            .from('Restaurant')
            .select('*')
            .match({ city: cityFilter, state: stateFilter })
            .eq('visibility', 'VISIBLE')
            .neq('name', 'Test Restaurant');

        if (error || !restaurants || restaurants.length === 0) {
            throw new Error("No DB data");
        }

        const mappedRestaurants = restaurants.map((r: any, index: number) => {
            const seed = r.name.length + index;
            const mockRating = (4.0 + (seed % 10) / 10).toFixed(1);

            // Infer tags logic (expanded to match UI categories)
            let tags = ["Local", "Great Service"];
            const nameLower = r.name.toLowerCase();
            if (nameLower.includes("pizza") || nameLower.includes("italian")) tags = ["Italian", "Pizza", "Comfort"];
            else if (nameLower.includes("burger") || nameLower.includes("grill") || nameLower.includes("shake")) tags = ["American", "Burgers", "Grill"];
            else if (nameLower.includes("asian") || nameLower.includes("thai") || nameLower.includes("sushi") || nameLower.includes("ramen") || nameLower.includes("chinese")) tags = ["Asian", "Healthy", "Spicy"];
            else if (nameLower.includes("mexican") || nameLower.includes("taco") || nameLower.includes("burrito") || nameLower.includes("cantina")) tags = ["Mexican", "Tacos", "Zesty"];
            else if (nameLower.includes("coffee") || nameLower.includes("cafe") || nameLower.includes("starbucks") || nameLower.includes("espresso")) tags = ["Coffee", "Breakfast", "Bakery"];
            else if (nameLower.includes("dessert") || nameLower.includes("cake") || nameLower.includes("ice cream") || nameLower.includes("sweet") || nameLower.includes("bakery")) tags = ["Dessert", "Sweet", "Bakery"];
            else if (nameLower.includes("steak") || nameLower.includes("chophouse")) tags = ["Steak", "Grill", "Premium"];
            else if (nameLower.includes("bbq") || nameLower.includes("barbecue") || nameLower.includes("smokehouse")) tags = ["BBQ", "Smoked", "American"];
            else if (nameLower.includes("salad") || nameLower.includes("bowl") || nameLower.includes("healthy") || nameLower.includes("vegan")) tags = ["Healthy", "Fresh", "Vegan"];

            return {
                id: r.id,
                name: r.name,
                rating: Number(mockRating),
                image: r.imageUrl || "/restaurant1.jpg",
                tags: tags,
                description: r.description,
                coords: [r.lat || (35.2271 + (index * 0.01)), r.lng || (-80.8431 + (index * 0.01))] as [number, number],
                city: r.city,
                state: r.state,
                address: r.address || `${r.city}, ${r.state}`
            };
        });

        let finalRestaurants = mappedRestaurants;
        if (category) {
            const catLower = category.toLowerCase();
            finalRestaurants = mappedRestaurants.filter((r: any) =>
                r.tags.some((t: string) => t.toLowerCase() === catLower)
            );
        }

        return { restaurants: finalRestaurants, locationMeta };

    } catch (error) {
        // Mock Data Fallback
        const { MOCK_RESTAURANTS } = await import('@/lib/mocks');
        const allMocks = MOCK_RESTAURANTS.map(r => ({
            ...r,
            rating: Number(r.rating),
            coords: [r.lat, r.lng] as [number, number]
        }));

        let filteredMocks = allMocks.filter(r => r.city.toLowerCase() === matchedLocation.city.toLowerCase());

        if (category) {
            const catLower = category.toLowerCase();
            filteredMocks = filteredMocks.filter(r =>
                r.tags.some(t => t.toLowerCase() === catLower)
            );
        }

        return {
            restaurants: filteredMocks,
            locationMeta
        };
    }
}

import LandingSearch from "@/components/LandingSearch";

export default async function RestaurantFinder({
    searchParams
}: {
    searchParams: Promise<{ location?: string; search?: string; address?: string; lat?: string; lng?: string; category?: string }>
}) {
    const params = await searchParams;
    const location = params.location || params.search || params.address;
    const address = params.address || location;
    const lat = params.lat ? parseFloat(params.lat) : undefined;
    const lng = params.lng ? parseFloat(params.lng) : undefined;
    const category = params.category;

    // View State: Landing if no inputs provided
    // If ANY input is provided (location, search, or coords), we show results
    const showLanding = !location && !address && (!lat || !lng);

    // Auth & Active Orders Check
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    let restaurants: Restaurant[] = [];
    let locationMeta: LocationMeta = { name: "Unknown", center: [35.2271, -80.8431] };
    let activeOrders: any[] = [];
    let pastRestaurants: any[] = [];
    let favorites: string[] = [];

    if (userId) {
        favorites = await getFavorites();

        // Fetch Order Again data
        const { data: pastOrders } = await supabase
            .from('Order')
            .select('restaurantId, restaurant:Restaurant(id, name, imageUrl, rating)')
            .eq('userId', userId)
            .eq('status', 'DELIVERED')
            .order('createdAt', { ascending: false })
            .limit(20);

        if (pastOrders) {
            const seen = new Set();
            pastRestaurants = pastOrders
                .map((o: any) => o.restaurant)
                .filter((r: any) => {
                    if (!r || seen.has(r.id)) return false;
                    seen.add(r.id);
                    return true;
                })
                .slice(0, 5);
        }
    }

    const serviceLocations = await (async () => {
        const fallbackMocks = [
            { city: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431 },
            { city: 'Pineville', state: 'NC', lat: 35.0833, lng: -80.8872 },
            { city: 'Rock Hill', state: 'SC', lat: 34.9249, lng: -81.0251 }
        ];
        try {
            const { data: dbLocs } = await supabase.from('ServiceLocation').select('city, state, lat, lng').eq('isActive', true);
            return dbLocs && dbLocs.length > 0 ? dbLocs : fallbackMocks;
        } catch {
            return fallbackMocks;
        }
    })();

    if (!showLanding) {
        const data = await getRestaurants({
            term: location,
            address,
            lat,
            lng,
            category
        });
        restaurants = data.restaurants;
        locationMeta = data.locationMeta;

        if (userId) {
            const { data } = await supabase
                .from('Order')
                .select('*, restaurant:Restaurant(name)')
                .eq('userId', userId)
                .in('status', ['PENDING', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'])
                .order('createdAt', { ascending: false });

            if (data) activeOrders = data;
        }
    }

    const mapCenter = locationMeta.center;

    // --- LANDING VIEW ---
    if (showLanding) {
        return (
            <div className="min-h-screen relative overflow-hidden bg-black text-white flex flex-col">
                <nav className="absolute top-0 w-full z-50 p-6 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary transition-all shadow-lg" />
                        <span className="text-2xl font-black tracking-tighter">
                            True<span className="text-gradient">Serve</span>
                        </span>
                    </Link>
                    {!userId ? (
                        <Link href="/login" className="btn btn-primary text-xs py-2 px-4">Login</Link>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/50">U</div>
                    )}
                </nav>

                <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 text-center">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 filter blur-sm -z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent -z-10" />

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-slate-500">
                        Cravings, meet <span className="text-primary">Speed.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl">
                        The fastest delivery in Charlotte, Pineville, and beyond. Zero hidden fees, precise tracking, and purely local.
                    </p>

                    <LandingSearch locations={
                        // We fetch these quickly here for the landing page props
                        // In a real app, optimize this data fetching
                        await (async () => {
                            const fallbackMocks = [
                                { city: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431 },
                                { city: 'Pineville', state: 'NC', lat: 35.0833, lng: -80.8872 },
                                { city: 'Rock Hill', state: 'SC', lat: 34.9249, lng: -81.0251 }
                            ];
                            try {
                                const { data: dbLocs } = await supabase.from('ServiceLocation').select('city, state, lat, lng').eq('isActive', true);
                                return dbLocs && dbLocs.length > 0 ? dbLocs : fallbackMocks;
                            } catch {
                                return fallbackMocks;
                            }
                        })()
                    } />
                </main>
            </div>
        );
    }

    // --- RESULTS VIEW ---
    return (
        <div className="min-h-screen">
            <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-black/60 border-b border-white/5 px-4 md:px-6 py-3 md:py-4">
                <div className="container flex justify-between items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 group-hover:border-primary transition-all shadow-lg" />
                        <span className="text-lg md:text-2xl font-black tracking-tighter text-white">True<span className="text-primary">Serve</span></span>
                    </Link>

                    {/* Desktop Search */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-8">
                        <LandingSearch
                            locations={serviceLocations}
                            initialValue={location}
                            isCompact={true}
                        />
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="hidden lg:block">
                            <Link href="/" className="text-sm font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Home</Link>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                            {userId && <NotificationBell userId={userId} />}
                            <div className="flex items-center gap-3">
                                {!userId ? (
                                    <Link href="/login" className="btn btn-primary text-[10px] md:text-xs py-1.5 px-4 md:px-6 rounded-full font-black uppercase tracking-widest">Login</Link>
                                ) : (
                                    <Link href="/user/settings" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 hover:border-primary transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Mobile Search */}
                <div className="container mt-3 md:hidden px-2">
                    <LandingSearch
                        locations={serviceLocations}
                        initialValue={location}
                        isCompact={true}
                    />
                </div>
            </nav>

            <main className="container py-6 md:py-8 px-4 animate-fade-in pb-32">
                {/* Active Tracking Banner */}
                {activeOrders.length > 0 && (
                    <div className="mb-6 md:mb-8 p-5 md:p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-7xl md:text-9xl group-hover:scale-110 transition-transform">🚚</div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <h2 className="text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px]">Active Order</h2>
                            </div>
                            <h3 className="text-xl md:text-2xl font-black mb-1 text-white">
                                {activeOrders[0].restaurant?.name || 'Restaurant'} is {activeOrders[0].status.toLowerCase().replace('_', ' ')}
                            </h3>
                            <Link href={`/orders/${activeOrders[0].id}`} className="btn btn-sm md:btn-md bg-emerald-500 text-black font-black uppercase tracking-widest border-none shadow-lg shadow-emerald-500/20 mt-3 rounded-xl px-6">
                                Track Live
                            </Link>
                        </div>
                    </div>
                )}

                {/* Order Again Carousel */}
                {userId && pastRestaurants.length > 0 && (
                    <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-slate-500">Order Again</h2>
                            <Link href="/orders" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest flex items-center gap-1">
                                Past Orders <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                            </Link>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
                            {pastRestaurants.map((res: any) => (
                                <Link
                                    key={res.id}
                                    href={`/restaurants/${res.id}`}
                                    className="flex flex-col gap-2 min-w-[140px] md:min-w-[180px] group"
                                >
                                    <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden relative border border-white/5 shadow-lg group-hover:shadow-primary/5 group-hover:border-primary/20 transition-all duration-300">
                                        <img
                                            src={res.imageUrl || "/restaurant1.jpg"}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                            alt={res.name}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                        <div className="absolute inset-0 p-3 flex flex-col justify-end">
                                            <div className="flex justify-between items-end gap-2">
                                                <div className="min-w-0">
                                                    <h3 className="text-white text-[11px] md:text-xs font-black truncate drop-shadow-md">{res.name}</h3>
                                                </div>
                                                <div className="shrink-0 bg-primary/20 backdrop-blur-md border border-primary/20 px-1.5 py-0.5 rounded-lg text-primary text-[9px] font-black shadow-lg">
                                                    ★ {res.rating || '4.5'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-4 md:gap-6 mb-8">
                    <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 py-2">
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] mb-1">Delivering to</p>
                            <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-white flex items-baseline gap-3">
                                {locationMeta.name}
                                <span className="text-sm text-slate-500 font-bold">({restaurants.length} spots)</span>
                            </h1>
                        </div>

                        {/* TrueServe+ Promo Banner */}
                        <Link href="/benefits" className="flex-1 lg:max-w-md w-full bg-gradient-to-r from-primary/10 to-secondary/5 border border-white/5 p-3 md:p-4 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl shadow-inner border border-primary/20">💎</div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Member Benefits</p>
                                    <h4 className="font-bold text-xs md:text-sm text-white">Join TrueServe+</h4>
                                    <p className="text-[10px] text-slate-500">Free delivery & 5% member savings.</p>
                                </div>
                            </div>
                            <div className="bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-black transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                            </div>
                        </Link>
                    </div>

                    {/* Google Maps Embed - Responsive Height */}
                    <div className="w-full h-[250px] md:h-[400px] rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative z-0">
                        <GoogleMapsMap
                            center={mapCenter}
                            zoom={13}
                            restaurants={restaurants.map(r => ({ id: r.id, name: r.name, coords: r.coords, image: r.image, tags: r.tags }))}
                        />
                    </div>
                </div>

                {/* Food Categories / Tags Selection */}
                <div className="flex items-center gap-3 overflow-x-auto pb-6 -mx-1 px-1 no-scrollbar scroll-smooth">
                    <Link
                        href={`/restaurants?${new URLSearchParams({
                            ...(params.address ? { address: params.address } : {}),
                            ...(params.lat ? { lat: params.lat } : {}),
                            ...(params.lng ? { lng: params.lng } : {}),
                            ...(params.location ? { location: params.location } : {}),
                            ...(params.search ? { search: params.search } : {})
                        }).toString()}`}
                        className={`px-5 md:px-7 py-3 rounded-2xl whitespace-nowrap text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-2
                            ${!category
                                ? "bg-primary text-black border-primary shadow-xl shadow-primary/20 scale-105"
                                : "bg-white/5 text-slate-400 border-white/5 hover:border-white/10 hover:text-white"}`}
                    >
                        ✨ SHOW ALL
                    </Link>
                    {[
                        { name: "Pizza", icon: "🍕" },
                        { name: "Burgers", icon: "🍔" },
                        { name: "Asian", icon: "🥢" },
                        { name: "Mexican", icon: "🌮" },
                        { name: "Italian", icon: "🍝" },
                        { name: "Coffee", icon: "☕" },
                        { name: "Dessert", icon: "🍦" },
                        { name: "Healthy", icon: "🥗" },
                        { name: "Steak", icon: "🥩" },
                        { name: "BBQ", icon: "🍖" }
                    ].map((cat) => (
                        <Link
                            key={cat.name}
                            href={`/restaurants?${new URLSearchParams({
                                ...(params.address ? { address: params.address } : {}),
                                ...(params.lat ? { lat: params.lat } : {}),
                                ...(params.lng ? { lng: params.lng } : {}),
                                ...(params.location ? { location: params.location } : {}),
                                ...(params.search ? { search: params.search } : {}),
                                category: cat.name
                            }).toString()}`}
                            className={`px-5 md:px-7 py-3 rounded-2xl whitespace-nowrap text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-2
                                ${category === cat.name
                                    ? "bg-primary text-black border-primary shadow-xl shadow-primary/20 scale-105"
                                    : "bg-white/5 text-slate-400 border-white/5 hover:border-white/10 hover:text-white"}`}
                        >
                            <span>{cat.icon}</span> {cat.name}
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                    {restaurants.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <div className="text-4xl mb-4">🔍</div>
                            <p className="text-xl font-bold text-white">No spots found in {location?.toString()}.</p>
                            <p className="text-sm text-slate-500 mt-2">Try searching "Charlotte" or "Pineville".</p>
                            <button onClick={() => window.location.href = '/restaurants'} className="btn btn-primary btn-sm mt-6 rounded-full px-8 uppercase font-black tracking-widest text-[10px]">Show All Cities</button>
                        </div>
                    ) : (
                        restaurants.map((rest) => (
                            <Link
                                href={`/restaurants/${rest.id}?lat=${lat || locationMeta.center[0]}&lng=${lng || locationMeta.center[1]}&address=${encodeURIComponent(address || '')}`}
                                key={rest.id}
                                className="group flex flex-col bg-white/5 rounded-3xl border border-white/5 overflow-hidden hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 active:scale-[0.98]"
                            >
                                <div className="h-44 md:h-48 w-full relative overflow-hidden">
                                    <img
                                        src={rest.image || "/restaurant1.jpg"}
                                        alt={rest.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                                    />

                                    {/* Glass Overlay Badges */}
                                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                        <div className="bg-black/40 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/10 shadow-xl">
                                            $0 Delivery
                                        </div>
                                    </div>

                                    <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                                        {userId && (
                                            <FavoriteButton
                                                restaurantId={rest.id}
                                                initialIsFavorited={favorites.includes(rest.id)}
                                            />
                                        )}
                                    </div>

                                    <div className="absolute bottom-3 right-3 bg-white text-black px-2 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-2xl">
                                        <span className="text-primary font-bold">★</span> {rest.rating}
                                    </div>
                                </div>

                                <div className="p-4 md:p-5">
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors leading-tight tracking-tight">
                                            {rest.name}
                                        </h3>
                                        <span className="text-[10px] font-black uppercase bg-white/5 text-slate-400 px-2 py-1 rounded-lg border border-white/5 tracking-tighter">
                                            20-30m
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold mb-1 line-clamp-1">
                                        {rest.address}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-medium mb-4 line-clamp-1">
                                        {rest.tags.join(" • ")}
                                    </p>
                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-0.5">Fees</span>
                                            <span className="text-xs font-bold text-emerald-400">$0.00</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-0.5">Rating</span>
                                            <span className="text-xs font-bold text-white uppercase tracking-tighter">Excellent</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                <section className="w-full flex justify-center mt-20">
                    <div className="p-8 md:p-16 bg-white/5 border border-white/10 rounded-[2.5rem] md:rounded-[4rem] flex flex-col items-center text-center max-w-5xl w-full relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10" />
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -z-10" />

                        <h2 className="text-2xl md:text-4xl font-black mb-4 tracking-tighter text-white text-center">Built for the Community.</h2>
                        <p className="text-sm md:text-lg text-slate-400 leading-relaxed mb-10 max-w-2xl text-center font-medium mx-auto">
                            TrueServe isn't just an app. We're a delivery standard designed to help local gems thrive while ensuring our drivers earn what they deserve. Experience the difference of a fair marketplace.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-2 w-full max-w-3xl mx-auto">
                            {[
                                { icon: '📊', label: 'Fair Split' },
                                { icon: '⚡', label: 'Priority' },
                                { icon: '🏷️', label: '5% Saved' },
                                { icon: '🎂', label: 'Gifts' }
                            ].map((item, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-primary/30 transition-colors flex flex-col items-center">
                                    <div className="text-2xl mb-2">{item.icon}</div>
                                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
