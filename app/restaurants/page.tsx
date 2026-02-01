import { supabase } from "@/lib/supabase";
import Link from "next/link";
import LocationButton from "@/components/LocationButton";
import { cookies } from "next/headers";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
    loading: () => <div className="h-[400px] w-full bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-500">Loading Map...</div>
});

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
    if (!locationInput) return { restaurants: [], locationMeta: { name: "", center: [0, 0] } };

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

    const matchedLocation = validLocations.find(loc => {
        const termClean = term.trim().toLowerCase();
        const cityMatch = loc.city.toLowerCase().includes(termClean);
        const stateMatch = loc.state.toLowerCase() === termClean || loc.state.toLowerCase().includes(termClean); // Allow "NC" or "North Carolina" if validLocations had full names, but currently 'state' is likely 'NC'
        const zipMatch = loc.zipPrefixes.some((prefix: string) => termClean.includes(prefix));

        return cityMatch || stateMatch || zipMatch;
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
    const { location } = await searchParams;

    // View State: Landing vs Results
    const showLanding = !location;

    // Auth & Active Orders Check
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    let restaurants: Restaurant[] = [];
    let locationMeta: LocationMeta = { name: "Unknown", center: [35.2271, -80.8431] };
    let activeOrders: any[] = [];

    if (!showLanding) {
        const data = await getRestaurants(location!);
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

                    <form action="/restaurants" className="w-full max-w-xl relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex items-center bg-black border border-white/10 rounded-full p-2 pr-2 shadow-2xl">
                            <span className="pl-4 pr-2 text-2xl">📍</span>
                            <input
                                name="location"
                                required
                                placeholder="Enter delivery address (e.g. Pineville, NC)"
                                className="flex-1 bg-transparent border-none focus:outline-none text-lg px-2 h-12 text-white placeholder-slate-500"
                                autoComplete="off"
                            />
                            <button type="submit" className="btn btn-primary rounded-full px-8 py-3 text-lg font-bold hover:scale-105 transition-transform">
                                Find Food
                            </button>
                        </div>
                        <div className="mt-4 flex gap-2 justify-center text-sm text-slate-500">
                            <span>Examples:</span>
                            <Link href="/restaurants?location=Charlotte" className="text-slate-400 hover:text-white underline">Charlotte</Link>
                            <Link href="/restaurants?location=Pineville" className="text-slate-400 hover:text-white underline">Pineville</Link>
                        </div>
                    </form>
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
                                className="input input-sm join-item bg-transparent border-none focus:outline-none w-full md:w-48 transition-all text-sm placeholder:text-slate-500"
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
                    <div>
                        <p className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-2">Delivery to</p>
                        <h1 className="text-4xl font-bold font-black tracking-tight flex items-center gap-2">
                            {locationMeta.name}
                            <span className="text-2xl text-slate-600 font-normal">({restaurants.length} spots)</span>
                        </h1>
                    </div>

                    {/* Google Maps Embed */}
                    <div className="w-full">
                        <LeafletMap
                            center={mapCenter}
                            zoom={13}
                            restaurants={restaurants.map(r => ({ id: r.id, name: r.name, coords: r.coords }))}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {restaurants.length === 0 ? (
                        <div className="col-span-4 text-center py-12 text-slate-400">
                            <p className="text-xl">No restaurants found in {location?.toString()}.</p>
                            <p className="text-sm mt-2">Try "Charlotte" or "Pineville".</p>
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
