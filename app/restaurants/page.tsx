import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Map from "@/components/Map";
import LocationButton from "@/components/LocationButton";

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
}

interface LocationMeta {
    name: string;
    center: [number, number];
}

async function getRestaurants(locationInput: string): Promise<{ restaurants: Restaurant[]; locationMeta: LocationMeta }> {
    const term = locationInput.toLowerCase();

    // Define fallbacks (mocks) for demo/offline
    const fallbackMocks = [
        { city: 'Charlotte', state: 'NC', zipPrefixes: ['282', '280', '281'] },
        { city: 'Ramsey', state: 'MN', zipPrefixes: ['553', '550'] }
    ];

    // 1. Fetch Valid Service Locations
    let validLocations: any[] = [];
    try {
        const { data: dbLocations } = await supabase.from('ServiceLocation').select('*').eq('isActive', true);
        if (dbLocations && dbLocations.length > 0) {
            validLocations = [...dbLocations];
            // Ensure essential mocks are present if missing(e.g. partial seed)
            for (const mock of fallbackMocks) {
                const exists = validLocations.find(l => l.city === mock.city && l.state === mock.state);
                if (!exists) validLocations.push(mock);
            }
        } else {
            // Fallback if empty DB
            validLocations = fallbackMocks;
        }
    } catch (e) {
        console.log("Running in Offline/Demo Mode (Database not reachable).");
        validLocations = fallbackMocks;
    }

    // Map counties and states to cities (Mock logic until DB has robust geo-search)
    const countyMap: Record<string, string> = {
        'mecklenburg': 'Charlotte',
        'anoka': 'Ramsey'
    };

    const stateMap: Record<string, string> = {
        'nc': 'Charlotte',
        'north carolina': 'Charlotte',
        'mn': 'Ramsey',
        'minnesota': 'Ramsey'
    };

    // Check if term contains a known county or state
    let mappedCityFromCounty: string | undefined;

    // Check counties
    for (const [county, city] of Object.entries(countyMap)) {
        if (term.includes(county)) {
            mappedCityFromCounty = city;
            break;
        }
    }

    // Check states if no county match
    if (!mappedCityFromCounty) {
        for (const [state, city] of Object.entries(stateMap)) {
            if (term.includes(state)) {
                mappedCityFromCounty = city;
                break;
            }
        }
    }

    console.log(`[Debug] Term: ${term}, MappedCity: ${mappedCityFromCounty}, ValidLocs: ${validLocations.length}`);

    const matchedLocation = validLocations.find(loc => {
        const cityMatch = term.includes(loc.city.toLowerCase());
        const zipMatch = loc.zipPrefixes.some((prefix: string) => term.includes(prefix));

        // Robust check for mapped city
        let countyOrStateMatch = false;
        if (mappedCityFromCounty && loc.city) {
            countyOrStateMatch = mappedCityFromCounty.toLowerCase().trim() === loc.city.toLowerCase().trim();
        }

        return cityMatch || zipMatch || countyOrStateMatch;
    });

    if (matchedLocation) {
        console.log(`[Debug] Match Found: ${matchedLocation.city}`);
    } else {
        console.log(`[Debug] No match found. Checking against:`, validLocations.map(l => l.city));
    }

    // Default metadata if no match found (or show empty state)
    let locationMeta = {
        name: locationInput,
        center: [35.2271, -80.8431] as [number, number] // Default fallback
    };

    if (matchedLocation) {
        // Approximate center based on city
        const cityLower = matchedLocation.city.toLowerCase();
        if (cityLower === 'ramsey') locationMeta.center = [45.2611, -93.4566];
        else if (cityLower === 'charlotte') locationMeta.center = [35.2271, -80.8431];

        locationMeta.name = `${matchedLocation.city}, ${matchedLocation.state}`;
    }

    try {
        if (!matchedLocation) {
            return { restaurants: [], locationMeta };
        }

        // Case-insensitive query for restaurants
        const { data: restaurants, error } = await supabase
            .from('Restaurant')
            .select('*')
            .ilike('city', matchedLocation.city)
            .ilike('state', matchedLocation.state);

        if (error || !restaurants || restaurants.length === 0) {
            throw new Error("No DB data or empty search");
        }

        const mappedRestaurants = restaurants.map((r: any, index: number) => ({
            id: r.id,
            name: r.name,
            rating: 4.8,
            image: r.imageUrl || "/restaurant1.jpg",
            tags: ["Italian", "Pizza", "Pasta"],
            description: r.description,
            coords: [r.lat || (40.7128 + (index * 0.01)), r.lng || (-74.0060 + (index * 0.01))] as [number, number]
        }));

        return { restaurants: mappedRestaurants, locationMeta };

    } catch (error) {
        // Suppress verbose DB error for cleaner logs (Supabase often pauses free tier)
        console.log("Supabase query failed or empty, using mocks/fallbacks.");

        const allMocks = [
            // Charlotte Mock
            { id: "1", name: "Carolina BBQ Pit (Mock)", rating: 4.8, image: "/restaurant1.jpg", tags: ["BBQ", "Ribs", "Smoked"], description: "Best BBQ in Charlotte", coords: [35.2271, -80.8431] as [number, number], city: "Charlotte", state: "NC" },
            { id: "2", name: "Queen City Burger (Mock)", rating: 4.5, image: "/restaurant2.jpg", tags: ["Burgers", "American"], description: "Gourmet burgers", coords: [35.2280, -80.8440] as [number, number], city: "Charlotte", state: "NC" },
            // Ramsey Mock
            { id: "3", name: "North Star Diner (Mock)", rating: 4.9, image: "/restaurant3.jpg", tags: ["Diner", "Breakfast"], description: "Hearty MN breakfast", coords: [45.2611, -93.4566] as [number, number], city: "Ramsey", state: "MN" },
        ];

        if (matchedLocation) {
            // Case-insensitive filtering for mocks
            const targetCity = matchedLocation.city.toLowerCase().trim();
            return {
                restaurants: allMocks.filter(r => r.city.toLowerCase() === targetCity),
                locationMeta
            };
        }

        // Return empty if no match found in mocks either
        return { restaurants: [], locationMeta };
    }
}

import { cookies } from "next/headers";

// ... existing imports

export default async function RestaurantFinder({ searchParams }: { searchParams: { location?: string } }) {
    const location = searchParams?.location || "Charlotte, NC";
    const { restaurants, locationMeta } = await getRestaurants(location);

    // Auth & Active Orders Check
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    let activeOrders: any[] = [];

    if (userId) {
        const { data } = await supabase
            .from('Order')
            .select('*, restaurant:Restaurant(name)')
            .eq('userId', userId)
            .in('status', ['PENDING', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'])
            .order('createdAt', { ascending: false });

        if (data) activeOrders = data;
    }

    const mapCenter = locationMeta.center;

    return (
        <div className="min-h-screen">
            <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 px-6 py-4">
                <div className="container flex flex-col md:flex-row gap-4 justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary transition-all shadow-lg" />
                        <span className="text-2xl font-black tracking-tighter">
                            True<span className="text-gradient">Serve</span>
                        </span>
                    </Link>
                    <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
                        <form className="join border border-white/10 rounded-full bg-white/5 focus-within:border-primary transition-colors w-full md:w-auto">
                            <LocationButton />
                            <input
                                name="location"
                                defaultValue={location}
                                placeholder="City, County, State or Zip"
                                className="input input-sm join-item bg-transparent border-none focus:outline-none w-full md:w-32 focus:md:w-48 transition-all text-sm placeholder:text-slate-500"
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
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/50">
                                    U
                                </div>
                            </div>
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
                            <p className="text-slate-400 mb-4 text-sm">Estimated arrival: 25 mins</p>
                            <Link href={`/orders/${activeOrders[0].id}`} className="btn bg-emerald-500 text-white hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/20">
                                Track Delivery
                            </Link>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold font-black tracking-tight">{locationMeta.name}</h1>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <div className="text-[10px] leading-tight">
                                <p className="font-bold text-primary uppercase tracking-tighter">Membership Active</p>
                                <p className="text-slate-400 font-medium">$0 Delivery + $1.49 Service</p>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                            <div className="text-[10px] leading-tight">
                                <p className="font-bold text-slate-400 uppercase tracking-tighter">Real-time Tracking</p>
                                <p className="text-slate-500 font-medium">Live Map + Precise ETA</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transparency Notice */}
                <div className="mb-8 p-3 bg-accent/5 border border-accent/10 rounded-2xl flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <span className="text-xl">🛡️</span>
                        <p className="text-xs text-slate-400">
                            <strong>Zero Surcharge Guarantee:</strong> No busy area fees, no small order fees. Ever.
                        </p>
                    </div>
                    <Link href="/" className="text-[10px] font-bold text-accent uppercase underline tracking-widest hover:text-white transition-colors">See Pricing Details</Link>
                </div>

                <div className="mb-8">
                    <Map
                        center={mapCenter}
                        zoom={13}
                        restaurants={restaurants.map(r => ({ id: r.id, name: r.name, coords: r.coords }))}
                    />
                </div>



                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {restaurants.length === 0 ? (
                        <div className="col-span-4 text-center py-12 text-slate-400">
                            <p className="text-xl">No restaurants found in {location}.</p>
                            <p className="text-sm mt-2">Try a different location or check back later!</p>
                        </div>
                    ) : (
                        restaurants.map((rest) => (
                            <div key={rest.id} className="card group hover:scale-[1.02] transition-transform duration-300 p-0 overflow-hidden">
                                <div className="h-40 bg-slate-700 relative">
                                    {/* Use Next.js Image component for optimization if possible, but standard img for external URLs or dynamic paths */}
                                    {rest.image && (
                                        <img
                                            src={rest.image}
                                            alt={rest.name}
                                            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors leading-tight">{rest.name}</h3>
                                            <p className="text-[10px] text-slate-300 line-clamp-1">{rest.description}</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-400">
                                        ★ {rest.rating}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {rest.tags.map(tag => (
                                            <span key={tag} className="text-xs bg-white/5 px-2 py-1 rounded text-slate-400">{tag}</span>
                                        ))}
                                    </div>
                                    <Link href={`/restaurants/${rest.id}`} className="w-full btn btn-primary text-sm py-2 block text-center">
                                        Order Now
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
