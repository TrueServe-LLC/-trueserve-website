
import Link from "next/link";
import Map from "@/components/Map";

import { prisma } from "@/lib/prisma";

// We adapt the DB model to the UI for now since we don't have ratings/tags in DB yet
async function getRestaurants(locationInput: string) {
    const term = locationInput.toLowerCase();

    // 1. Fetch Valid Service Locations
    let validLocations: any[] = [];
    try {
        // @ts-ignore - Schema update pending DB fix
        validLocations = await prisma.serviceLocation.findMany({ where: { isActive: true } });
    } catch (e) {
        console.warn("DB failed to fetch locations, using fallback mocks");
        validLocations = [
            { city: 'Charlotte', state: 'NC', zipPrefixes: ['282', '280', '281'] },
            { city: 'Ramsey', state: 'MN', zipPrefixes: ['553', '550'] }
        ];
    }

    // Smart matcher strictly against valid locations
    const matchedLocation = validLocations.find(loc => {
        const cityMatch = term.includes(loc.city.toLowerCase());
        const stateMatch = term.includes(loc.state.toLowerCase());
        const zipMatch = loc.zipPrefixes.some((prefix: string) => term.includes(prefix));

        // Match if (City AND State) OR (City only if unique enough logic.. simplifying directly to City check for now) OR Zip
        return cityMatch || zipMatch;
    });

    try {
        if (!matchedLocation) {
            // Return empty with a specific flag or just empty let the UI handle "No results"
            // But to be helpful, we return empty list which UI translates to "Area not served"
            return [];
        }

        const where = {
            city: matchedLocation.city,
            state: matchedLocation.state
        };

        // @ts-ignore - Schema update pending DB fix
        const restaurants = await prisma.restaurant.findMany({ where });

        if (restaurants.length === 0) throw new Error("No DB data or empty search");

        return restaurants.map((r: any, index: number) => ({
            id: r.id,
            name: r.name,
            rating: 4.8,
            image: r.imageUrl || "/restaurant1.jpg",
            tags: ["Italian", "Pizza", "Pasta"],
            description: r.description,
            coords: [r.lat || (40.7128 + (index * 0.01)), r.lng || (-74.0060 + (index * 0.01))] as [number, number]
        }));
    } catch (error) {
        console.warn("Database connection fallback/empty:", error);

        const allMocks = [
            // Charlotte Mock
            { id: "1", name: "Carolina BBQ Pit (Mock)", rating: 4.8, image: "/restaurant1.jpg", tags: ["BBQ", "Ribs", "Smoked"], description: "Best BBQ in Charlotte", coords: [35.2271, -80.8431] as [number, number], city: "Charlotte", state: "NC" },
            { id: "2", name: "Queen City Burger (Mock)", rating: 4.5, image: "/restaurant2.jpg", tags: ["Burgers", "American"], description: "Gourmet burgers", coords: [35.2280, -80.8440] as [number, number], city: "Charlotte", state: "NC" },
            // Ramsey Mock
            { id: "3", name: "North Star Diner (Mock)", rating: 4.9, image: "/restaurant3.jpg", tags: ["Diner", "Breakfast"], description: "Hearty MN breakfast", coords: [45.2611, -93.4566] as [number, number], city: "Ramsey", state: "MN" },
        ];

        if (matchedLocation) {
            return allMocks.filter(r => r.city === matchedLocation.city);
        }

        return [];
    }
}

export default async function RestaurantFinder({ searchParams }: { searchParams: { location?: string } }) {
    const location = searchParams?.location || "Charlotte, NC";
    const restaurants = await getRestaurants(location);
    const term = location.toLowerCase();

    // Determine map center based on matched location
    let mapCenter: [number, number] = [35.2271, -80.8431]; // Default Charlotte
    if (term.includes("ramsey") || term.includes("mn") || term.includes("553")) {
        mapCenter = [45.2611, -93.4566];
    } else if (term.includes("charlotte") || term.includes("nc") || term.includes("282")) {
        mapCenter = [35.2271, -80.8431];
    }

    return (
        <div className="min-h-screen">
            <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 px-6 py-4">
                <div className="container flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary transition-all shadow-lg" />
                        <span className="text-2xl font-black tracking-tighter">
                            True<span className="text-gradient">Serve</span>
                        </span>
                    </Link>
                    <div className="flex gap-4 items-center">
                        {/* Location Input Form */}
                        <form className="join border border-white/10 rounded-full bg-white/5 focus-within:border-primary transition-colors">
                            <button className="btn btn-sm btn-ghost join-item border-none hover:bg-transparent pointer-events-none px-3">📍</button>
                            <input
                                name="location"
                                defaultValue={location}
                                placeholder="City, State or Zip"
                                className="input input-sm join-item bg-transparent border-none focus:outline-none w-32 focus:w-48 transition-all text-sm placeholder:text-slate-500"
                                autoComplete="off"
                            />
                        </form>

                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <input
                            type="text"
                            placeholder="Search for food..."
                            className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary w-64"
                        />
                    </div>
                </div>
            </nav>

            <main className="container py-8 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h1 className="text-4xl font-bold font-black tracking-tight">Popular in {location}</h1>
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

                {/* Loyalty & Rewards Banner */}
                <div className="mb-12 card border-secondary/20 bg-secondary/5 flex flex-col md:flex-row items-center justify-between gap-6 p-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">Loyalty & Rewards Hub</h3>
                            <span className="bg-secondary text-[#0a0f1a] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Active</span>
                        </div>
                        <p className="text-sm text-slate-400 max-w-2xl">
                            Earn 5 points for every $1 spent. Plus, use <strong>card-linked offers</strong> from partner banks for instant cash back.
                        </p>
                    </div>
                    <div className="flex gap-4 items-center shrink-0">
                        <div className="flex -space-x-2">
                            <div className="h-8 w-12 bg-white/10 rounded-md border border-white/10 flex items-center justify-center text-[8px] text-slate-400 backdrop-blur-sm">Bank L</div>
                            <div className="h-8 w-12 bg-white/10 rounded-md border border-white/10 flex items-center justify-center text-[8px] text-slate-400 backdrop-blur-sm">Bank S</div>
                            <div className="h-8 w-12 bg-white/10 rounded-md border border-white/10 flex items-center justify-center text-[8px] text-slate-400 backdrop-blur-sm">Bank V</div>
                        </div>
                        <button className="btn btn-primary text-xs py-2 px-6">Visit Rewards Store</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
