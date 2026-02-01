import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Map from "@/components/Map";
import LocationButton from "@/components/LocationButton";
import { cookies } from "next/headers";

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
        { city: 'Pineville', state: 'NC', zipPrefixes: ['28134'] },
        { city: 'Ramsey', state: 'MN', zipPrefixes: ['553', '550'] }
    ];

    // 1. Fetch Valid Service Locations
    let validLocations: any[] = [];
    try {
        const { data: dbLocations } = await supabase.from('ServiceLocation').select('*').eq('isActive', true);
        if (dbLocations && dbLocations.length > 0) {
            validLocations = [...dbLocations];
            for (const mock of fallbackMocks) {
                const exists = validLocations.find(l => l.city === mock.city && l.state === mock.state);
                if (!exists) validLocations.push(mock);
            }
        } else {
            validLocations = fallbackMocks;
        }
    } catch (e) {
        console.log("Running in Offline/Demo Mode (Database not reachable).");
        validLocations = fallbackMocks;
    }

    // Map counties and states to cities
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

    let mappedCityFromCounty: string | undefined;

    for (const [county, city] of Object.entries(countyMap)) {
        if (term.includes(county)) {
            mappedCityFromCounty = city;
            break;
        }
    }

    if (!mappedCityFromCounty) {
        for (const [state, city] of Object.entries(stateMap)) {
            if (term.includes(state)) {
                mappedCityFromCounty = city;
                break;
            }
        }
    }

    const matchedLocation = validLocations.find(loc => {
        const cityMatch = term.includes(loc.city.toLowerCase());
        const zipMatch = loc.zipPrefixes.some((prefix: string) => term.includes(prefix));

        let countyOrStateMatch = false;
        if (mappedCityFromCounty && loc.city) {
            countyOrStateMatch = mappedCityFromCounty.toLowerCase().trim() === loc.city.toLowerCase().trim();
        }

        return cityMatch || zipMatch || countyOrStateMatch;
    });

    // Default metadata
    let locationMeta = {
        name: locationInput,
        center: [35.2271, -80.8431] as [number, number]
    };

    if (matchedLocation) {
        const cityLower = matchedLocation.city.toLowerCase();
        if (cityLower === 'ramsey') locationMeta.center = [45.2611, -93.4566];
        else if (cityLower === 'pineville') locationMeta.center = [35.0833, -80.8872];
        else if (cityLower === 'charlotte') locationMeta.center = [35.2271, -80.8431];

        locationMeta.name = `${matchedLocation.city}, ${matchedLocation.state}`;
    }

    try {
        if (!matchedLocation) {
            return { restaurants: [], locationMeta };
        }

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
        // Mock Data Fallback
        const allMocks = [
            // Charlotte Mock
            { id: "1", name: "Carolina BBQ Pit (Mock)", rating: 4.8, image: "/restaurant1.jpg", tags: ["BBQ", "Ribs", "Smoked"], description: "Best BBQ in Charlotte", coords: [35.2271, -80.8431] as [number, number], city: "Charlotte", state: "NC" },
            { id: "2", name: "Queen City Burger (Mock)", rating: 4.5, image: "/restaurant2.jpg", tags: ["Burgers", "American"], description: "Gourmet burgers", coords: [35.2280, -80.8440] as [number, number], city: "Charlotte", state: "NC" },
            // Pineville Mock
            { id: "4", name: "Pineville Tavern (Mock)", rating: 4.7, image: "/restaurant1.jpg", tags: ["American", "Steak", "Pub"], description: "Local favorite tavern.", coords: [35.0833, -80.8872] as [number, number], city: "Pineville", state: "NC" },
            { id: "5", name: "Global Fusion (Mock)", rating: 4.6, image: "/restaurant2.jpg", tags: ["Fusion", "Asian"], description: "World flavors.", coords: [35.0850, -80.8900] as [number, number], city: "Pineville", state: "NC" },
            // Ramsey Mock
            { id: "3", name: "North Star Diner (Mock)", rating: 4.9, image: "/restaurant3.jpg", tags: ["Diner", "Breakfast"], description: "Hearty MN breakfast", coords: [45.2611, -93.4566] as [number, number], city: "Ramsey", state: "MN" },
        ];

        if (matchedLocation) {
            const targetCity = matchedLocation.city.toLowerCase().trim();
            return {
                restaurants: allMocks.filter(r => r.city.toLowerCase() === targetCity),
                locationMeta
            };
        }
        return { restaurants: [], locationMeta };
    }
}

export default async function RestaurantFinder({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
    const { location: locationParam } = await searchParams;
    const location = locationParam || "Charlotte, NC";
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
                        <div className="flex p-1 bg-white/5 rounded-full border border-white/10 relative">
                            <Link
                                href="/restaurants?location=Charlotte, NC"
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${location.toLowerCase().includes('charlotte') ? 'bg-primary text-black shadow-lg text-shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Charlotte
                            </Link>
                            <Link
                                href="/restaurants?location=Pineville, NC"
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${location.toLowerCase().includes('pineville') ? 'bg-primary text-black shadow-lg text-shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Pineville
                            </Link>
                        </div>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {restaurants.length === 0 ? (
                        <div className="col-span-4 text-center py-12 text-slate-400">
                            <p className="text-xl">No restaurants found in {location}.</p>
                            <p className="text-sm mt-2">Try a different location or check back later!</p>
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
