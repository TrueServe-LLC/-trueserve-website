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
    websiteUrl?: string; // Marketing URL (GHL, WordPress, etc.)
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
        matchedLocation = validLocations.find(loc => {
            const city = loc.city?.toLowerCase() || "";
            return city && lowerAddr.includes(city);
        });
    }
    if (!matchedLocation && term) {
        const termClean = term.trim().toLowerCase();
        matchedLocation = validLocations.find(loc => {
            const cityLower = loc.city?.toLowerCase() || "";
            const stateLower = loc.state?.toLowerCase() || "";
            return (cityLower && (cityLower.includes(termClean) || termClean.includes(cityLower))) ||
                (stateLower && stateLower === termClean) ||
                (loc.zipPrefixes && loc.zipPrefixes.some((prefix: string) => termClean.includes(prefix)));
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
            const seed = ((r.name || "").length || 1) + index;
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
                isBusy: !!r.isBusy,
                websiteUrl: r.websiteUrl
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
    
    return (
        <div className="min-h-screen bg-black text-slate-300 selection:bg-primary/30">
            {/* ── NAV ─────────────────────────────────────────────────────────── */}
            <nav className="sticky top-0 z-[100] bg-black/60 backdrop-blur-3xl border-b border-white/10 py-4 px-6">
                <div className="container mx-auto flex justify-between items-center max-w-7xl">
                    <Link href="/" className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl border border-white/10 bg-black/60 flex items-center justify-center p-1.5 overflow-hidden shadow-2xl group-hover:scale-110 transition-transform">
                            <img src="/logo.png" alt="TrueServe Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xl font-serif font-black tracking-tighter text-white uppercase italic leading-none">True<span className="text-primary not-italic tracking-tighter text-lg ml-0.5 whitespace-nowrap">SERVE</span></span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                        <Link href="/restaurants" className="text-white border-b border-primary/40 pb-1">MARKETPLACE</Link>
                        <Link href="/merchant" className="hover:text-primary transition-colors whitespace-nowrap">FOR MERCHANTS</Link>
                        <Link href="/driver" className="hover:text-primary transition-colors whitespace-nowrap">DRIVER HUB</Link>
                    </div>

                    <div className="flex items-center gap-6">
                        {userId ? (
                            <div className="flex items-center gap-4">
                                <NotificationBell userId={userId} />
                                <Link href="/user/settings" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10 hover:bg-white/10 transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </Link>
                                <LogoutButton />
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 font-black italic uppercase tracking-widest text-[10px]">
                                <Link href="/login" className="hidden md:block text-slate-400 hover:text-white transition-all px-5 py-2">Sign In</Link>
                                <Link href="/login" className="badge-solid-primary !px-8 !py-3 !text-[10px] h-glow">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="relative flex flex-col items-center">
                {/* ── HERO HEADER ─────────────────────────────────────────────── */}
                <section className="w-full pt-24 pb-16 flex flex-col items-center justify-center px-6 text-center overflow-hidden border-b border-white/5 bg-[#0a0a0b]">
                    <div className="relative z-10 max-w-6xl space-y-10 animate-fade-in flex flex-col items-center glow-blur-primary">
                        <div className="flex items-center justify-center gap-5 text-primary text-[10px] font-black uppercase tracking-[0.6em] italic animate-fade-in-down">
                            <div className="w-16 h-[1.5px] bg-gradient-to-r from-transparent via-primary/60 to-primary/80 rounded-full" />
                            Protocol Active
                             <div className="w-16 h-[1.5px] bg-gradient-to-l from-transparent via-primary/60 to-primary/80 rounded-full" />
                        </div>
                        
                        <div className="flex flex-col items-center">
                            <h1 className="text-6xl md:text-[120px] leading-[0.8] text-white font-black tracking-tighter italic animate-slide-up select-none h-glow uppercase font-serif pb-4">
                                Discovery
                            </h1>
                             <h1 className="text-6xl md:text-[120px] leading-[0.8] text-primary font-black tracking-[-0.03em] drop-shadow-[5px_58px_0px_rgba(255,255,255,0.05)] uppercase italic font-serif">
                                HUB.
                            </h1>
                        </div>

                        <p className="max-w-xl mx-auto text-xs md:text-[11px] text-slate-500 font-bold uppercase tracking-[0.3em] leading-relaxed italic animate-fade-in delay-200">
                            {showLanding 
                                ? "Enter your delivery address to sync with the best independent flavors in your community." 
                                : `Displaying elite local menus for ${locationMeta.name || "your area"}.`}
                        </p>

                        {showLanding && (
                            <div className="w-full max-w-4xl pt-8 flex justify-center">
                                <LandingSearch />
                            </div>
                        )}
                    </div>
                </section>

                <div className="w-full max-w-7xl px-4 md:px-8 py-20 space-y-24">
                    {/* Active Order Banner */}
                    {activeOrders.length > 0 && (
                        <div className="p-8 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-[2rem] flex flex-col md:flex-row items-center justify-between shadow-2xl backdrop-blur-3xl animate-fade-in">
                            <div className="text-center md:text-left mb-6 md:mb-0">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                    <span className="w-2 h-2 rounded-sm bg-emerald-500 animate-pulse"></span>
                                    <span className="text-emerald-500 font-black uppercase tracking-widest text-[10px] italic">Active Mission Protocol</span>
                                </div>
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">Order #{activeOrders[0].id.slice(0,8)} • {(activeOrders[0].status || 'PENDING').replace('_', ' ')}</h3>
                                <p className="text-slate-500 text-sm font-bold italic mt-1">{activeOrders[0].restaurant?.name}</p>
                            </div>
                            <Link href={`/orders/${activeOrders[0].id}`} className="badge-solid-primary !bg-emerald-500 !py-4 !px-12 !text-[11px] shadow-emerald-500/20">Track Status →</Link>
                        </div>
                    )}

                    {/* Filters Hub */}
                    {!showLanding && (
                        <div className="space-y-12">
                            <div className="flex flex-col items-center text-center gap-10">
                                <div className="flex items-center flex-wrap justify-center gap-3">
                                    <Link href="/restaurants" className={`${!category ? "bg-primary text-black" : "bg-white/[0.03] border border-white/10 text-slate-500 hover:text-white"} px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all`}>General</Link>
                                    {["Fast Food", "Burgers", "Chicken", "Pizza", "Sushi", "Sandwiches", "Caribbean", "Mexican", "Korean"].map((cat) => (
                                        <Link key={cat} href={`/restaurants?category=${cat}`} className={`${category === cat ? "bg-primary text-black" : "bg-white/[0.03] border border-white/10 text-slate-500 hover:text-white"} px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all`}>{cat}</Link>
                                    ))}
                                </div>
                            </div>

                            {/* Results Status Bar */}
                            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        {restaurants.length} RESTAURANTS NEAR YOU
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">SORT</span>
                                     <button className="flex items-center gap-2 bg-white/[0.05] border border-white/10 px-4 py-2 rounded-lg text-[10px] font-black text-white hover:bg-white/10 transition-all">
                                         Top Rated
                                         <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                     </button>
                                </div>
                            </div>

                            {/* Grid Content */}
                            {restaurants.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
                                    {restaurants.map((rest: any) => (
                                        <Link key={rest.id} href={`/restaurants/${rest.id}`} className="group relative flex flex-col bg-[#0d0d0e] border border-white/[0.03] rounded-3xl overflow-hidden hover:border-white/10 transition-all duration-300">
                                            <div className="aspect-[4/3] relative overflow-hidden">
                                                <img src={rest.image} alt={rest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                
                                                {/* Float Badges */}
                                                <div className="absolute top-4 left-4">
                                                    <div className="bg-black/80 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 border border-white/10 rounded-md uppercase tracking-wider">
                                                        {rest.deliveryFee === "Free" ? "FREE" : rest.deliveryFee} FEE
                                                    </div>
                                                </div>
                                                <div className="absolute top-4 right-4">
                                                    <div className="bg-black/60 backdrop-blur-md text-emerald-400 text-[9px] font-black px-3 py-1.5 border border-emerald-500/20 rounded-md uppercase tracking-wider flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        Open
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 space-y-4">
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors tracking-tight uppercase">{rest.name}</h3>
                                                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">
                                                        <span className="text-emerald-500">{rest.prepTime}</span>
                                                        <span className="opacity-20">•</span>
                                                        <span>{rest.priceLevel}</span>
                                                        <span className="opacity-20">•</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-primary text-[11px]">★</span>
                                                            <span className="text-slate-300">{rest.rating}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                                                    <div className="text-[9px] font-black uppercase text-white tracking-[0.3em] flex items-center gap-2 group-hover:text-primary transition-colors">
                                                        Open Menu <span>→</span>
                                                    </div>
                                                    <FavoriteButton 
                                                        restaurantId={rest.id} 
                                                        initialIsFavorited={favorites.includes(rest.id)} 
                                                        className="w-9 h-9 !p-0 flex items-center justify-center text-slate-600 hover:text-rose-500 hover:border-rose-500/20" 
                                                    />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-40 flex flex-col items-center text-center space-y-6">
                                    <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-5xl opacity-40 grayscale group-hover:grayscale-0 transition-all">🏗️</div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black text-white italic uppercase tracking-widest">Gems Pending.</h3>
                                        <p className="text-slate-500 font-bold italic text-base">We haven't synched restaurant protocols in {locationMeta.name} yet.</p>
                                    </div>
                                    <Link href="/restaurants" className="badge-outline-white !px-12 !py-4">Broaden Search</Link>
                                </div>
                            )}
                        </div>
                    )}

                    {!(!showLanding && restaurants.length > 0) && showLanding && (
                        <div className="w-full max-w-7xl pt-40 px-0">
                             <div className="grid grid-cols-1 md:grid-cols-4 border-t border-b border-white/5 divide-y md:divide-y-0 md:divide-x divide-white/5">
                                {[
                                    { icon: '🗺️', label: 'Local Only', desc: 'No global chains' },
                                    { icon: '⚡', label: 'Priority Hub', desc: 'Fastest dispatch' },
                                    { icon: '💎', label: 'Elite Menu', desc: 'Curated flavors' },
                                    { icon: '🖤', label: 'Fair Split', desc: 'Supporting local' }
                                ].map((item) => (
                                    <div key={item.label} className="p-16 flex flex-col items-center justify-center text-center group hover:bg-white/[0.01] transition-all bg-black">
                                        <div className="text-xl mb-6 filter grayscale group-hover:grayscale-0 transition-all scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{item.icon}</div>
                                        <p className="text-[11px] font-black uppercase text-white tracking-[0.4em] mb-3 italic">{item.label}</p>
                                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em]">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── FOOTER ──────────────────────────────────────────────────────── */}
                <footer className="w-full py-16 bg-black px-10 text-center">
                     <div className="flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-[0.5em] text-slate-800 italic">
                         <div className="w-6 h-6 rounded-full border border-white/5 flex items-center justify-center grayscale opacity-30">
                             <svg className="w-3 h-3 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                         </div>
                         TrueServe Discovery Protocol • {new Date().getFullYear()}
                     </div>
                </footer>
            </main>
        </div>
    );
}
