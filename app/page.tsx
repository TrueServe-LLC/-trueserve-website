export const dynamic = "force-dynamic";

import Link from "next/link";
import LandingSearch from "@/components/LandingSearch";
import { cookies } from "next/headers";
import EmergencyBanner from "@/components/EmergencyBanner";
import Logo from "@/components/Logo";

export default async function Home({
    searchParams
}: {
    searchParams: Promise<{ address?: string; lat?: string; lng?: string; category?: string }>
}) {
    const params = await searchParams;
    const hasAddress = !!params.address;
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

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
        <div className="min-h-screen bg-[#0A0A0A] text-[#F0EDE8] selection:bg-primary/30 overflow-x-hidden">
            <EmergencyBanner />

            {/* MOBILE WRAPPER */}
            <div className="max-w-[430px] mx-auto min-h-screen relative shadow-[0_0_100px_rgba(0,0,0,1)] bg-[#0A0A0A]">
                
                {/* AMBIENT ORBS */}
                <div className="orb w-[280px] h-[280px] top-[-60px] right-[-90px] bg-[#e8a230]/10" />
                <div className="orb w-[200px] h-[200px] top-[500px] left-[-70px] bg-[#e8a230]/5" />
                <div className="orb w-[160px] h-[160px] bottom-[100px] right-[-50px] bg-[#e8a230]/6" />

                {/* STICKY NAV */}
                <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-[#0A0A0A]/95 to-transparent backdrop-blur-xl border-b border-white/5 animate-[fadeDown_0.5s_ease_both]">
                    <div className="flex items-center gap-3">
                        <Logo size="sm" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/cart" className="w-[38px] h-[38px] rounded-xl bg-[#1C1C1C] border border-white/5 flex items-center justify-center relative hover:scale-105 transition-transform">
                            <span className="text-lg">🛒</span>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#e8a230] text-black text-[10px] font-bold rounded-full flex items-center justify-center font-barlow-cond">2</div>
                        </Link>
                        {!userId ? (
                            <Link href="/login" className="bg-[#e8a230] text-black px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider font-barlow-cond hover:opacity-90 active:scale-95 transition-all">
                                Sign In
                            </Link>
                        ) : (
                            <Link href="/user/settings" className="w-[38px] h-[38px] rounded-xl bg-[#1C1C1C] border border-white/5 flex items-center justify-center font-bold">
                                👤
                            </Link>
                        )}
                    </div>
                </nav>

                {/* HERO SECTION */}
                <div className="px-5 pt-4 animate-[fadeUp_0.6s_0.1s_ease_both]">
                    <div className="inline-flex items-center gap-2 bg-[#1C1C1C] border border-white/5 rounded-full px-4 py-1.5 mb-6 hover:bg-[#252525] transition-colors cursor-pointer group">
                        <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-[blink_2s_infinite] shadow-[0_0_8px_#4CAF50]" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#F0EDE8] font-barlow-cond">
                            {params.address ? params.address.split(',')[0] : "Select Delivery Zone"}
                        </span>
                        <span className="text-[#e8a230] text-[10px] group-hover:translate-y-0.5 transition-transform">▼</span>
                    </div>

                    <div className="text-[12px] font-bold uppercase tracking-[0.3em] text-[#e8a230] mb-3 font-barlow-cond italic">The Local Hub · Protocol Alpha</div>
                    
                    <h1 className="text-[clamp(66px,18vw,80px)] leading-[0.88] mb-6 flex flex-col font-bebas">
                        <span className="text-white">REAL FOOD.</span>
                        <span className="text-[#e8a230]">REAL LOCAL.</span>
                    </h1>

                    <p className="text-[13px] font-light text-[#5A5550] leading-relaxed mb-8 max-w-[280px] font-barlow">
                        Skip the industrial chains. Discover the best independent kitchens in your area — delivered at light speed.
                    </p>

                    {/* SEARCH COMPONENT INTEGRATION */}
                    <div className="mb-10 scale-105 origin-left">
                        <LandingSearch initialValue={params.address} />
                    </div>

                    <div className="flex items-center gap-4 mb-10 overflow-x-auto no-scrollbar pb-2">
                        <div className="flex items-center gap-1.5 shrink-0">
                            <strong className="text-[12px] font-bold text-white font-barlow-cond">⚡ 15-25</strong>
                            <span className="text-[11px] text-[#5A5550] font-barlow">MIN AVG</span>
                        </div>
                        <div className="w-1 h-1 bg-[#5A5550] rounded-full shrink-0" />
                        <div className="flex items-center gap-1.5 shrink-0">
                            <strong className="text-[12px] font-bold text-white font-barlow-cond">🏠 LOCAL</strong>
                            <span className="text-[11px] text-[#5A5550] font-barlow">ONLY</span>
                        </div>
                        <div className="w-1 h-1 bg-[#5A5550] rounded-full shrink-0" />
                        <div className="flex items-center gap-1.5 shrink-0">
                            <strong className="text-[12px] font-bold text-white font-barlow-cond">🤝 FAIR</strong>
                            <span className="text-[11px] text-[#5A5550] font-barlow">PARTNERS</span>
                        </div>
                    </div>
                </div>

                {/* TRUE SERVE PLUS BANNER */}
                <div className="mx-5 mb-10 p-6 bg-gradient-to-br from-[#e8a230]/20 to-[#e8a230]/5 border border-[#e8a230]/30 rounded-3xl flex items-center justify-between gap-4 animate-[fadeUp_0.6s_0.15s_ease_both] ring-1 ring-[#e8a230]/10 shadow-[0_20px_40px_-20px_rgba(232,162,48,0.3)]">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#e8a230] mb-1 font-barlow-cond flex items-center gap-2">
                            <span className="w-1 h-1 bg-[#e8a230] rounded-full"></span>
                            Elite Rewards
                        </div>
                        <div className="text-3xl leading-none mb-1 text-white tracking-tight font-bebas">TRUE SERVE<br /><span className="text-[#e8a230]">PLUS</span></div>
                        <div className="text-[11px] font-light text-[#5A5550] font-barlow">Unlimited $0 Delivery & Member Pricing</div>
                    </div>
                    <Link href="/plus" className="bg-[#e8a230] text-black px-4 py-3 text-sm rounded-xl leading-tight text-center hover:scale-105 active:scale-95 transition-all shadow-lg decoration-none font-bebas">
                        SIGN UP<br />NOW!
                    </Link>
                </div>

                {/* HIDDEN SECTIONS - ONLY SHOW IF ADDRESS IS SET */}
                {hasAddress && (
                    <div className="animate-[fadeUp_0.8s_ease_both]">
                        {/* CATEGORIES */}
                        <div className="px-5 mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold uppercase tracking-widest text-white font-barlow-cond">Browse Cuisines</h2>
                            <span className="text-[12px] text-[#e8a230] font-barlow font-bold cursor-pointer hover:underline underline-offset-4">Filters →</span>
                        </div>
                        <div className="flex gap-2.5 px-5 mb-10 overflow-x-auto no-scrollbar scroll-smooth pb-2">
                            {categories.map((cat, i) => {
                                const isActive = params.category === cat.value || (i === 0 && !params.category);
                                return (
                                    <Link 
                                        key={i} 
                                        href={`/?address=${encodeURIComponent(params.address || "")}&category=${cat.value}`}
                                        className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full border shrink-0 cursor-pointer transition-all ${isActive ? 'bg-[#e8a230] border-[#e8a230] shadow-[0_8px_20px_-8px_#e8a230]' : 'bg-[#131313] border-white/5 hover:border-white/10'}`}
                                    >
                                        <span className="text-xl">{cat.emoji}</span>
                                        <span className={`text-[13px] font-bold tracking-wider font-barlow-cond ${isActive ? 'text-black' : 'text-white'}`}>{cat.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* FEATURED SPOTS */}
                        <div className="px-5 mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold uppercase tracking-widest text-white font-barlow-cond">Top Spots Near You</h2>
                        </div>
                        <div className="px-5 space-y-6 mb-24">
                            {[
                                { name: "Smoke & Soul BBQ", time: "18-28", fee: "1.99", dist: "0.4", rating: "4.9", emoji: "🔥", color: "from-[#1a0d00] to-[#2d1600]" },
                                { name: "Mama Dee's Kitchen", time: "20-35", fee: "Free", dist: "0.7", rating: "4.8", emoji: "🍗", color: "from-[#0f0820] to-[#1a1000]" },
                                { name: "Golden Wok House", time: "15-25", fee: "0.99", dist: "1.1", rating: "4.7", emoji: "🍜", color: "from-[#001a0d] to-[#0d1a00]" },
                            ].map((spot, i) => (
                                <Link href="/restaurants" key={i} className="block group animate-[fadeUp_0.6s_ease_both]" style={{ animationDelay: `${0.2 + (i * 0.1)}s` }}>
                                    <div className="bg-[#131313] border border-white/5 rounded-[28px] overflow-hidden group-hover:scale-[1.01] transition-transform shadow-2xl">
                                        <div className={`h-[180px] w-full bg-gradient-to-br ${spot.color} flex items-center justify-center text-7xl relative`}>
                                            {spot.emoji}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent opacity-60" />
                                            <div className="absolute top-5 left-5 flex gap-2">
                                                <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-[11px] font-bold text-[#e8a230] font-barlow-cond">⭐ {spot.rating}</div>
                                            </div>
                                            <div className="absolute top-5 right-5 w-11 h-11 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white/50 group-hover:text-rose-500 transition-all font-bold">🤍</div>
                                        </div>
                                        <div className="p-6 pt-3">
                                            <h3 className="text-3xl font-black uppercase italic tracking-wider text-white mb-2 font-barlow-cond">{spot.name}</h3>
                                            <div className="flex items-center gap-4 text-[12px] text-[#5A5550] font-bold mb-5">
                                                <span className="flex items-center gap-1.5">⏱ {spot.time} MIN</span>
                                                <div className="w-1 h-1 bg-[#5A5550]/40 rounded-full" />
                                                <span className="text-[#e8a230]">{spot.fee === 'Free' ? 'FREE' : `$${spot.fee}`} DELIVERY</span>
                                                <div className="w-1 h-1 bg-[#5A5550]/40 rounded-full" />
                                                <span>{spot.dist} MI</span>
                                            </div>
                                            <div className="flex gap-2.5">
                                                <div className="bg-[#e8a230]/10 text-[#e8a230] px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest font-barlow-cond border border-[#e8a230]/20">LOCAL FAV</div>
                                                <div className="bg-[#1C1C1C] text-[#5A5550] px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest font-barlow-cond">Gourmet</div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {!hasAddress && (
                    <div className="px-5 py-20 flex flex-col items-center text-center opacity-40">
                         <div className="text-4xl mb-4">📍</div>
                         <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5A5550] font-barlow-cond italic">Enter address to reveal local menus</p>
                    </div>
                )}

                {/* BOTTOM MOBILE NAV */}
                <div className="sticky bottom-0 bg-[#0C0C0C]/95 backdrop-blur-2xl border-t border-white/5 px-6 pt-3 pb-8 flex items-center justify-around z-50">
                    {[
                        { icon: "🏠", label: "Home", active: true },
                        { icon: "🔍", label: "Explore" },
                        { icon: "📋", label: "Orders" },
                        { icon: "👤", label: "Profile" },
                    ].map((item, i) => (
                        <div key={i} className={`flex flex-col items-center gap-1 cursor-pointer group`}>
                            <span className="text-[22px] group-hover:scale-110 transition-transform opacity-70 group-hover:opacity-100">{item.icon}</span>
                            <span className={`text-[9px] font-bold uppercase tracking-[0.2em] font-barlow-cond ${item.active ? 'text-[#e8a230]' : 'text-[#5A5550]'}`}>{item.label}</span>
                        </div>
                    ))}
                </div>

            </div>

            {/* DESKTOP FOOTER */}
            <div className="hidden lg:block bg-black py-20 px-10 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-10">
                    <Logo size="xl" />
                    <div className="text-[11px] font-black uppercase tracking-[0.5em] text-[#2a2f3a] italic max-w-2xl leading-relaxed">
                        © {new Date().getFullYear()} TrueServe Platform. <br />
                        Discovery Hub Neural Protocol Active. <br />
                        Supporting Independent Culinary Infrastructure.
                    </div>
                </div>
            </div>
        </div>
    );
}
