import { supabase } from "@/lib/supabase";
import Link from "next/link";
import LocationButton from "@/components/LocationButton";
import GoogleMapsMap from "@/components/GoogleMapsMap";
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
        address?: string
    }
): Promise<{ restaurants: Restaurant[]; locationMeta: LocationMeta }> {
    const { term, lat, lng, address } = query;

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
        name: address || `${matchedLocation.city}, ${matchedLocation.state}`,
        center: (lat && lng) ? [lat, lng] as [number, number] : [matchedLocation.lat, matchedLocation.lng] as [number, number]
    };

    try {
        const cityFilter = matchedLocation.city;
        const stateFilter = matchedLocation.state;

        const { data: restaurants, error } = await supabase
            .from('Restaurant')
            .select('*')
            .match({ city: cityFilter, state: stateFilter });

        if (error || !restaurants || restaurants.length === 0) {
            throw new Error("No DB data");
        }

        const mappedRestaurants = restaurants.map((r: any, index: number) => {
            const seed = r.name.length + index;
            const mockRating = (4.0 + (seed % 10) / 10).toFixed(1);

            // Infer tags logic (same as before)
            let tags = ["Local", "Great Service"];
            const nameLower = r.name.toLowerCase();
            if (nameLower.includes("pizza") || nameLower.includes("italian")) tags = ["Italian", "Pizza", "Comfort"];
            else if (nameLower.includes("burger") || nameLower.includes("grill")) tags = ["American", "Burgers", "Grill"];
            else if (nameLower.includes("asian") || nameLower.includes("thai") || nameLower.includes("sushi")) tags = ["Asian", "Healthy", "Spicy"];
            else if (nameLower.includes("mexican") || nameLower.includes("taco")) tags = ["Mexican", "Tacos", "Zesty"];
            else if (nameLower.includes("coffee") || nameLower.includes("cafe")) tags = ["Coffee", "Breakfast", "Bakery"];

            return {
                id: r.id,
                name: r.name,
                rating: Number(mockRating),
                image: r.imageUrl || "/restaurant1.jpg",
                tags: tags,
                description: r.description,
                coords: [r.lat || (35.2271 + (index * 0.01)), r.lng || (-80.8431 + (index * 0.01))] as [number, number],
                city: r.city,
                state: r.state
            };
        });

        return { restaurants: mappedRestaurants, locationMeta };

    } catch (error) {
        // Mock Data Fallback
        const allMocks = [
            { id: "1", name: "Carolina BBQ Pit (Mock)", rating: 4.8, image: "/restaurant1.jpg", tags: ["BBQ", "Ribs", "Smoked"], description: "Best BBQ in Charlotte", coords: [35.2271, -80.8431] as [number, number], city: "Charlotte", state: "NC" },
            { id: "2", name: "Queen City Burger (Mock)", rating: 4.5, image: "/restaurant2.jpg", tags: ["Burgers", "American"], description: "Gourmet burgers", coords: [35.2280, -80.8440] as [number, number], city: "Charlotte", state: "NC" },
            { id: "3", name: "North Star Diner (Mock)", rating: 4.9, image: "/restaurant3.jpg", tags: ["Diner", "Breakfast"], description: "Hearty MN breakfast", coords: [45.2611, -93.4566] as [number, number], city: "Ramsey", state: "MN" },
            // Rock Hill Mock
            { id: "4", name: "Old Town Kitchen (Mock)", rating: 4.6, image: "/restaurant3.jpg", tags: ["Southern", "Comfort"], description: "Rock Hill favorites", coords: [34.9249, -81.0251] as [number, number], city: "Rock Hill", state: "SC" },
            // Pineville Mock
            { id: "5", name: "Pineville Pizzeria (Mock)", rating: 4.7, image: "/restaurant2.jpg", tags: ["Pizza", "Italian"], description: "Best slice in town", coords: [35.0833, -80.8872] as [number, number], city: "Pineville", state: "NC" }
        ];

        return {
            restaurants: allMocks.filter(r => r.city.toLowerCase() === matchedLocation.city.toLowerCase()),
            locationMeta
        };
    }
}

import LandingSearch from "@/components/LandingSearch";

export default async function RestaurantFinder({
    searchParams
}: {
    searchParams: Promise<{ location?: string; search?: string; address?: string; lat?: string; lng?: string }>
}) {
    const params = await searchParams;
    const location = params.location || params.search;
    const address = params.address;
    const lat = params.lat ? parseFloat(params.lat) : undefined;
    const lng = params.lng ? parseFloat(params.lng) : undefined;

    // View State: Landing if no inputs provided
    // If ANY input is provided (location, search, or coords), we show results
    const showLanding = !location && !address && (!lat || !lng);

    // Auth & Active Orders Check
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    let restaurants: Restaurant[] = [];
    let locationMeta: LocationMeta = { name: "Unknown", center: [35.2271, -80.8431] };
    let activeOrders: any[] = [];

    if (!showLanding) {
        const data = await getRestaurants({
            term: location,
            address,
            lat,
            lng
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
            <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 px-6 py-4">
                <div className="container flex flex-col md:flex-row gap-4 justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary transition-all shadow-lg" />
                    </Link>
                    <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
                        <form className="join border border-white/10 rounded-full bg-white/5 focus-within:border-primary transition-colors w-full md:w-auto">
                            <LocationButton />
                            <input
                                name="location"
                                defaultValue={location}
                                placeholder="Change location..."
                                className="input input-sm join-item bg-transparent border-none focus:outline-none w-full md:w-64 transition-all text-sm placeholder:text-slate-500"
                                autoComplete="off"
                            />
                        </form>

                        <div className="hidden md:block">
                            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        </div>

                        {!userId ? (
                            <Link href="/login" className="btn btn-primary text-xs py-2 px-4">
                                Login
                            </Link>
                        ) : (
                            <Link href="/user/settings" className="flex items-center gap-2 group">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/50 group-hover:bg-primary group-hover:text-black transition-colors">
                                    U
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            <main className="container py-8 animate-fade-in">
                {/* Active Tracking Banner */}
                {activeOrders.length > 0 && (
                    <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">🚚</div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <h2 className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Order in Progress</h2>
                            </div>
                            <h3 className="text-2xl font-bold mb-1">
                                Your order from {activeOrders[0].restaurant?.name || 'Restaurant'} is {activeOrders[0].status.toLowerCase().replace('_', ' ')}
                            </h3>
                            <Link href={`/orders/${activeOrders[0].id}`} className="btn bg-emerald-500 text-white hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/20 mt-2">
                                Track Delivery
                            </Link>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                        <div>
                            <p className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-2">Delivery to</p>
                            <h1 className="text-4xl font-bold font-black tracking-tight flex items-center gap-2">
                                {locationMeta.name}
                                <span className="text-2xl text-slate-600 font-normal">({restaurants.length} spots)</span>
                            </h1>
                        </div>

                        {/* TrueServe+ Promo Banner */}
                        <Link href="/benefits" className="flex-1 md:max-w-md w-full bg-gradient-to-r from-primary/20 to-secondary/10 border border-primary/30 p-4 rounded-2xl flex items-center justify-between group hover:border-primary/60 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-xl shadow-inner">💎</div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Membership</p>
                                    <h4 className="font-bold text-sm text-white">TrueServe+ Benefits</h4>
                                    <p className="text-[10px] text-slate-400">Save $40+ every month with $0 delivery fees.</p>
                                </div>
                            </div>
                            <div className="bg-primary text-black p-2 rounded-lg group-hover:translate-x-1 transition-transform">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                            </div>
                        </Link>
                    </div>

                    {/* Google Maps Embed */}
                    <div className="w-full h-[350px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative z-0">
                        <GoogleMapsMap
                            center={mapCenter}
                            zoom={13}
                            restaurants={restaurants.map(r => ({ id: r.id, name: r.name, coords: r.coords, image: r.image, tags: r.tags }))}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {restaurants.length === 0 ? (
                        <div className="col-span-4 text-center py-12 text-slate-400">
                            <p className="text-xl">No restaurants found in {location?.toString()}.</p>
                            <p className="text-sm mt-2">Try "Charlotte", "Pineville", or "Rock Hill".</p>
                        </div>
                    ) : (
                        restaurants.map((rest) => (
                            <Link
                                href={`/restaurants/${rest.id}`}
                                key={rest.id}
                                className="card group p-0 overflow-hidden border-0 bg-transparent hover:bg-white/5 transition-all duration-300 block relative"
                            >
                                <div className="h-48 w-full relative overflow-hidden rounded-2xl">
                                    {rest.image ? (
                                        <img
                                            src={rest.image}
                                            alt={rest.name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                                            No Image
                                        </div>
                                    )}

                                    {/* Rating badge */}
                                    <div className="absolute bottom-3 right-3 bg-white/10 backdrop-blur-md border border-white/20 px-2 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 shadow-lg">
                                        <span>★</span> {rest.rating}
                                    </div>

                                    {/* Favorite / Promo badge could go here */}
                                    <div className="absolute top-3 left-3 bg-primary text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-md">
                                        Free Delivery
                                    </div>
                                </div>

                                <div className="pt-3 px-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors leading-tight">
                                            {rest.name}
                                        </h3>
                                        <span className="text-xs font-medium text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full">
                                            15-25 min
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-1 mb-2">
                                        {rest.tags.join(" • ")}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span>$0 Delivery Fee</span>
                                        <span>•</span>
                                        <span className="text-emerald-400 font-medium">Zero Surcharge</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
