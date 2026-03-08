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
            .select('*, MenuItem(name, description), Review(rating)')
            .match({ city: cityFilter, state: stateFilter })
            .eq('visibility', 'VISIBLE')
            .neq('name', 'Test Restaurant');

        if (error || !restaurants || restaurants.length === 0) {
            // No mock fallback for pilot launch
            return { restaurants: [], locationMeta };
        }

        // Logic to transition to production: Filter out mock restaurants from DB
        const realRestaurants = restaurants.filter((r: any) => !r.isMock);

        const mappedRestaurants = realRestaurants.map((r: any, index: number) => {
            const seed = r.name.length + index;

            // Data-Driven Ratings (Aggregate from Reviews)
            const realRatings = (r.Review || []).map((rev: any) => rev.rating);
            const avgRating = realRatings.length > 0
                ? (realRatings.reduce((a: number, b: number) => a + b, 0) / realRatings.length).toFixed(1)
                : (4.0 + (seed % 10) / 10).toFixed(1);

            // Smart Tag Inference - Check name, description, and menu items
            const rName = r.name.toLowerCase();
            const rDesc = (r.description || "").toLowerCase();
            const menuNames = (r.MenuItem || []).map((m: any) => m.name.toLowerCase()).join(" ");

            const context = `${rName} ${rDesc} ${menuNames}`;

            let tags: string[] = ["Local"];

            if (context.includes("pizza") || context.includes("italian") || context.includes("pasta")) tags.push("Italian", "Pizza");
            if (context.includes("burger") || context.includes("grill") || context.includes("shake") || context.includes("fry")) tags.push("American", "Burgers");
            if (context.includes("asian") || context.includes("thai") || context.includes("sushi") || context.includes("ramen") || context.includes("chinese") || context.includes("🥢")) tags.push("Asian");
            if (context.includes("mexican") || context.includes("taco") || context.includes("burrito") || context.includes("cantina") || context.includes("quesadilla")) tags.push("Mexican", "Tacos");
            if (context.includes("coffee") || context.includes("cafe") || context.includes("espresso") || context.includes("latte") || context.includes("breakfast")) tags.push("Coffee", "Breakfast");
            if (context.includes("dessert") || context.includes("cake") || context.includes("ice cream") || context.includes("sweet") || context.includes("bakery") || context.includes("cookie")) tags.push("Dessert", "Sweet");
            if (context.includes("steak") || context.includes("chophouse") || context.includes("ribeye")) tags.push("Steak", "Premium");
            if (context.includes("bbq") || context.includes("barbecue") || context.includes("smokehouse") || context.includes("brisket")) tags.push("BBQ", "American");
            if (context.includes("salad") || context.includes("bowl") || context.includes("healthy") || context.includes("vegan") || context.includes("fresh")) tags.push("Healthy", "Fresh");

            // Dynamic 'Late Night' tag
            const closeTime = r.closeTime || '22:00:00';
            const closeHour = parseInt(closeTime.split(':')[0]);
            if (closeHour >= 22 || closeHour < 4) tags.push("Late Night");

            // Deduplicate and fallback
            const finalTags = Array.from(new Set(tags));
            if (finalTags.length === 1) finalTags.push("Great Service");

            // Smart Image Selection
            let displayImage = r.imageUrl || "/restaurant1.jpg";
            if (!r.imageUrl) {
                if (finalTags.includes("Pizza")) displayImage = "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop";
                else if (finalTags.includes("Burgers")) displayImage = "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=800&auto=format&fit=crop";
                else if (finalTags.includes("Asian")) displayImage = "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=800&auto=format&fit=crop";
                else if (finalTags.includes("Mexican")) displayImage = "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop";
                else if (finalTags.includes("Italian")) displayImage = "https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=800&auto=format&fit=crop";
                else if (finalTags.includes("Steak")) displayImage = "https://images.unsplash.com/photo-1546241072-48010ad28c2c?q=80&w=800&auto=format&fit=crop";
                else if (finalTags.includes("Coffee")) displayImage = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop";
                else if (finalTags.includes("Dessert")) displayImage = "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800&auto=format&fit=crop";
                else if (finalTags.includes("Healthy")) displayImage = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop";
                else {
                    // Random premium food image if no tag match
                    displayImage = `https://images.unsplash.com/photo-${1504674900247 + (seed % 1000)}?q=80&w=800&auto=format&fit=crop`;
                }
            }

            return {
                id: r.id,
                name: r.name,
                rating: Number(avgRating),
                reviewCount: realRatings.length,
                image: displayImage,
                tags: finalTags,
                description: r.description,
                coords: [r.lat || (35.2271 + (index * 0.01)), r.lng || (-80.8431 + (index * 0.01))] as [number, number],
                city: r.city,
                state: r.state,
                address: r.address || `${r.city}, ${r.state}`,
                deliveryFee: seed % 3 === 0 ? "Free" : `$${(seed % 4 + 0.99).toFixed(2)}`,
                prepTime: `${15 + (seed % 20)}-${25 + (seed % 20)} min`,
                priceLevel: "$".repeat((seed % 3) + 1),
                openTime: r.openTime,
                closeTime: r.closeTime,
                deal: (r.isMock || seed % 5 === 0) ? { type: 'PROMO', description: seed % 2 === 0 ? 'Spend $20, Save $5' : 'Buy 1 Get 1 Free' } : undefined
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
        console.error("getRestaurants DB Error:", error);
        return {
            restaurants: [],
            locationMeta
        };
    }
}

import LandingSearch from "@/components/LandingSearch";

export default async function RestaurantFinder({
    searchParams
}: {
    searchParams: Promise<{ location?: string; search?: string; address?: string; lat?: string; lng?: string; category?: string; welcome?: string }>
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

    let userSavedAddress = "";
    let userName = "";

    if (userId) {
        const { data: userData } = await supabase.from('User').select('address, name').eq('id', userId).maybeSingle();
        if (userData?.address && !address && !location) {
            userSavedAddress = userData.address;
        }
        if (userData?.name) {
            userName = userData.name.split(" ")[0];
        }
    }

    const effectiveAddress = address || location || userSavedAddress;

    const { restaurants: fetchedRest, locationMeta: meta } = await getRestaurants({
        term: effectiveAddress, // Use effectiveAddress as the primary search term
        address: effectiveAddress, // Also pass as address for more specific matching if needed
        lat,
        lng,
        category
    });

    let restaurants: Restaurant[] = fetchedRest;
    let locationMeta: LocationMeta = meta;
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
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Sign In</Link>
                    </div>
                </nav>

                <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 text-center">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 filter blur-sm -z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent -z-10" />

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-slate-500 leading-relaxed py-4">
                        Cravings, meet <span className="text-primary">Speed.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl">
                        The fastest delivery around. Zero hidden fees, precise tracking, and purely local.
                    </p>

                    <LandingSearch locations={serviceLocations} />
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
                        {/* Desktop Logo */}
                        <img src="/logo.png" alt="TrueServe Logo" className="hidden md:block w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 group-hover:border-primary transition-all shadow-lg" />
                        <span className="hidden md:block text-lg md:text-2xl font-black tracking-tighter text-white">True<span className="text-primary">Serve</span></span>

                        {/* Mobile Profile Image */}
                        {userId ? (
                            <div className="md:hidden w-10 h-10 rounded-full bg-slate-800 border border-white/10 shadow-lg overflow-hidden shrink-0">
                                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userName || 'User'}`} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <img src="/logo.png" alt="TrueServe Logo" className="md:hidden w-10 h-10 rounded-full border border-white/10 group-hover:border-primary transition-all shadow-lg" />
                        )}
                    </Link>

                    {/* Mobile Location Pill */}
                    <div className="md:hidden mt-1 flex flex-1 items-center justify-center">
                        <Link href="/restaurants" className="flex items-center gap-1.5 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
                            <svg className="w-3.5 h-3.5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span className="text-xs font-bold text-slate-300 truncate max-w-[120px]">{locationMeta.name || "Set Location"}</span>
                        </Link>
                    </div>

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
                                    <Link href="/login" className="btn btn-primary text-[10px] md:text-xs py-1.5 px-4 md:px-6 rounded-full font-black uppercase tracking-widest">Sign In</Link>
                                ) : (
                                    <Link href="/user/settings" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 hover:border-primary transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Mobile Search -> Moved to Main Content */}
            </nav>

            <main className="container py-6 md:py-8 px-4 animate-fade-in pb-40">
                {/* Mobile Welcome Header */}
                <div className="md:hidden flex flex-col gap-1 mb-6">
                    <h2 className="text-sm font-bold text-slate-400">Welcome,</h2>
                    <h1 className="text-2xl font-black text-secondary">{userName || 'Guest'}</h1>
                </div>

                {/* Mobile Promotional Banner */}
                <div className="md:hidden w-full bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2rem] p-6 mb-6 relative overflow-hidden border border-white/5 shadow-2xl">
                    <div className="relative z-10 w-3/4 md:w-2/3">
                        <h3 className="text-xl font-black text-white leading-tight mb-5">
                            50% Discount<br />on selected Restaurant
                        </h3>
                        <Link href="/restaurants" className="inline-block bg-secondary text-black text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-lg shadow-secondary/20 hover:scale-105 transition-transform">
                            Order Now
                        </Link>
                    </div>
                    {/* Decorative element mimicking food/image */}
                    <div className="absolute -right-10 -top-10 bottom-0 w-48 h-48 bg-primary/30 blur-2xl rounded-full"></div>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden mb-8">
                    <LandingSearch
                        locations={serviceLocations}
                        initialValue={location}
                        isCompact={true}
                    />
                </div>

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
                    <div className="mb-16 md:mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-slate-500">Order Again</h2>
                            <Link href="/orders" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest flex items-center gap-1">
                                Past Orders <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                            </Link>
                        </div>
                        <div className="flex gap-6 md:gap-8 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 scroll-smooth">
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
                                            <div className="flex justify-between items-end gap-2 w-full">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-white text-[11px] md:text-xs font-black truncate drop-shadow-md w-full">{res.name}</h3>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-6 md:gap-10 mb-20 md:mb-32">
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
                    <div className="w-full h-[250px] md:h-[400px] rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative z-0 bg-slate-900/50 flex items-center justify-center">
                        <GoogleMapsMap
                            center={mapCenter}
                            zoom={13}
                            restaurants={restaurants.map(r => ({ id: r.id, name: r.name, coords: r.coords, image: r.image, tags: r.tags }))}
                        />
                    </div>
                </div>

                {/* Section Divider */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-16 md:mb-24"></div>

                {/* Food Categories / Tags Selection */}
                <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-4 md:gap-3 overflow-x-auto pb-4 px-1 no-scrollbar scroll-smooth">
                        {/* Show All Option */}
                        <Link
                            href={`/restaurants?${new URLSearchParams({
                                ...(params.address ? { address: params.address } : {}),
                                ...(params.lat ? { lat: params.lat } : {}),
                                ...(params.lng ? { lng: params.lng } : {}),
                                ...(params.location ? { location: params.location } : {}),
                                ...(params.search ? { search: params.search } : {})
                            }).toString()}`}
                            className={`flex flex-row items-center justify-center gap-2 px-5 py-2.5 rounded-full border transition-all whitespace-nowrap font-bold text-sm shrink-0
                                ${!category
                                    ? "bg-white text-black border-transparent shadow-lg"
                                    : "bg-slate-800 text-white border-white/10 hover:bg-slate-700 hover:border-white/20"}`}
                        >
                            <span className="text-lg">✨</span>
                            <span>All</span>
                        </Link>

                        {[
                            { name: "Fast Food", icon: "🍟" },
                            { name: "Burgers", icon: "🍔" },
                            { name: "Chicken", icon: "🍗" },
                            { name: "Pizza", icon: "🍕" },
                            { name: "Sushi", icon: "🍣" },
                            { name: "Sandwiches", icon: "🥪" },
                            { name: "Deals", icon: "🉐" },
                            { name: "Breakfast", icon: "🍳" },
                            { name: "Desserts", icon: "🍮" },
                            { name: "Mexican", icon: "🌮" },
                            { name: "Asian", icon: "🥢" },
                            { name: "Italian", icon: "🍝" },
                            { name: "Coffee", icon: "☕" },
                            { name: "Low Delivery", icon: "💰" },
                            { name: "Seafood", icon: "🦐" }
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
                                className={`flex flex-row items-center justify-center gap-2 px-5 py-2.5 rounded-full border transition-all whitespace-nowrap font-bold text-sm shrink-0
                                    ${category === cat.name
                                        ? "bg-white text-black border-transparent shadow-lg"
                                        : "bg-slate-800 text-white border-white/10 hover:bg-slate-700 hover:border-white/20"}`}
                            >
                                <span className="text-lg leading-none">{cat.icon}</span>
                                <span>{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Membership Welcome Banner */}
                {params.welcome === 'member' && (
                    <div className="mb-12 p-8 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 animate-in zoom-in-95 duration-700 shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]">
                        <div className="flex items-center gap-8 text-center md:text-left">
                            <div className="w-20 h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl animate-pulse">✨</div>
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2 tracking-tight italic">Welcome to the Inner Circle.</h2>
                                <p className="text-slate-400 max-w-md font-medium text-lg leading-relaxed">Your TrueServe Membership is now active. Enjoy priority dispatch and exclusive community discounts.</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                            <div className="px-6 py-3 bg-white/5 text-primary border border-primary/20 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-center backdrop-blur-md">Membership: Active</div>
                        </div>
                    </div>
                )}

                <div className="h-6"></div>

                {/* Dynamic Filters Bar - DoorDash Style */}
                <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar mb-14 border-b border-white/5 pt-4">
                    {[
                        { label: 'Deals', icon: '🏷️' },
                        { label: 'Under 30 min', icon: '🕒' }
                    ].map((filter: any) => (
                        <button key={filter.label} className="flex items-center gap-2 whitespace-nowrap px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/40 text-[13px] font-bold text-slate-200 transition-all shrink-0">
                            {filter.icon && <span>{filter.icon}</span>}
                            <span>{filter.label}</span>
                            {filter.hasArrow && (
                                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>

                {/* Featured Collections Style Carousels (DoorDash Style) */}
                {restaurants.length > 0 && !category && (
                    <div className="space-y-24 mb-24">
                        {/* Deals Carousel */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-end justify-between mb-8 px-1">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Offers for You</h2>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Local deals and priority discounts</p>
                                </div>
                                <Link href="#" className="bg-white/5 hover:bg-white/10 text-primary px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.15em] border border-primary/20 transition-all">
                                    Find Deals
                                </Link>
                            </div>
                            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 font-black">
                                {restaurants.filter(r => r.deal).slice(0, 8).map((rest) => (
                                    <Link key={rest.id} href={`/restaurants/${rest.id}?lat=${lat || locationMeta.center[0]}&lng=${lng || locationMeta.center[1]}&address=${encodeURIComponent(address || '')}`} className="min-w-[300px] md:min-w-[350px] group">
                                        <div className="h-44 md:h-48 w-full rounded-[2rem] overflow-hidden mb-4 relative border border-white/5">
                                            <img src={rest.image} alt={rest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <div className="bg-primary text-black px-4 py-2 rounded-xl text-xs font-black shadow-2xl inline-block mb-2 max-w-full truncate">
                                                    {rest.deal?.description}
                                                </div>
                                                <h3 className="text-white text-[15px] md:text-lg font-black truncate w-full">{rest.name}</h3>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Fastest Carousel */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex flex-col gap-1 mb-8 px-1">
                                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Fastest</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Speedy delivery from nearby gems</p>
                            </div>
                            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4">
                                {restaurants.filter(r => parseInt(r.prepTime || "30") <= 25).slice(0, 6).map((rest) => (
                                    <Link key={rest.id} href={`/restaurants/${rest.id}?lat=${lat || locationMeta.center[0]}&lng=${lng || locationMeta.center[1]}&address=${encodeURIComponent(address || '')}`} className="min-w-[280px] md:min-w-[320px] group flex flex-col">
                                        <div className="h-40 md:h-44 w-full rounded-2xl overflow-hidden mb-3 relative shrink-0">
                                            <img src={rest.image} alt={rest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-white border border-white/10">
                                                {rest.prepTime}
                                            </div>
                                        </div>
                                        <div className="px-1 w-full">
                                            <h3 className="text-white font-black text-sm mb-1 group-hover:text-primary transition-colors truncate w-full">{rest.name}</h3>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold w-full">
                                                <span className="text-slate-500 truncate">{rest.priceLevel}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="h-16"></div>

                <div className="mb-12 px-1 border-t border-white/5 pt-16 flex items-center justify-between">
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">All Spots</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
                    {restaurants.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <div className="text-4xl mb-4">🔍</div>
                            <p className="text-xl font-bold text-white">No spots found in {location?.toString()}.</p>
                            <Link href="/restaurants" className="btn btn-primary btn-sm mt-6 rounded-full px-8 uppercase font-black tracking-widest text-[10px] inline-flex items-center">
                                Show All Cities
                            </Link>
                        </div>
                    ) : (
                        restaurants.map((rest) => (
                            <Link
                                href={`/restaurants/${rest.id}?lat=${lat || locationMeta.center[0]}&lng=${lng || locationMeta.center[1]}&address=${encodeURIComponent(address || '')}`}
                                key={rest.id}
                                className="group flex flex-col transition-all duration-300 active:scale-[0.98]"
                            >
                                <div className="h-48 md:h-56 w-full relative overflow-hidden rounded-2xl mb-4">
                                    <img
                                        src={rest.image || "/restaurant1.jpg"}
                                        alt={rest.name}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />

                                    {/* Glass Overlay Badges */}
                                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                        <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border border-white/10 shadow-xl">
                                            {rest.deliveryFee === "Free" ? "FREE DELIVERY" : `${rest.deliveryFee} Fee`}
                                        </div>
                                        {rest.deal && (
                                            <div className="bg-primary backdrop-blur-md text-black text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border border-primary/20 shadow-xl">
                                                Deal
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                                        {userId && (
                                            <FavoriteButton
                                                restaurantId={rest.id}
                                                initialIsFavorited={favorites.includes(rest.id)}
                                            />
                                        )}
                                    </div>

                                </div>

                                <div className="px-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-base font-black text-white group-hover:text-primary transition-colors leading-tight tracking-wide">
                                            {rest.name}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-2 text-[12px] text-slate-400 font-bold mb-1">
                                        <span className="text-emerald-400">{rest.deliveryFee === "Free" ? "Free Delivery" : rest.deliveryFee}</span>
                                        <span>•</span>
                                        <span>{rest.prepTime}</span>
                                    </div>

                                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                                        {rest.priceLevel} • {rest.tags.join(" • ")}
                                    </p>
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
            </main >
        </div >
    );
}
