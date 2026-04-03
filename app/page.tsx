export const dynamic = "force-dynamic";

import Link from "next/link";
import LandingSearch from "@/components/LandingSearch";
import NotificationBell from "@/components/NotificationBell";
import LogoutButton from "@/components/LogoutButton";
import { cookies } from "next/headers";
import EmergencyBanner from "@/components/EmergencyBanner";
import Logo from "@/components/Logo";

export default async function Home() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    return (
        <div className="min-h-screen relative bg-black text-[#cbd5e1] selection:bg-[#f59e0b]/30 overflow-x-hidden">
            <EmergencyBanner />

            {/* ─── DESKTOP VIEW (LG and UP) ─── */}
            <div className="hidden lg:block">
                {/* ── NAV ─────────────────────────────────────────────────────────── */}
                <nav className="sticky top-0 z-[100] bg-black/60 backdrop-blur-3xl border-b border-white/10 py-4 px-6">
                    <div className="container mx-auto flex justify-between items-center max-w-7xl">
                        <Logo size="lg" />

                        <div className="hidden lg:flex items-center gap-12 text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">
                            <Link href="/restaurants" className="hover:text-[#f59e0b] transition-all">ORDER FOOD</Link>
                            <Link href="/merchant" className="hover:text-[#f59e0b] transition-all whitespace-nowrap">FOR MERCHANTS</Link>
                            <Link href="/driver" className="hover:text-[#f59e0b] transition-all whitespace-nowrap">DRIVER HUB</Link>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4">
                                <Link 
                                    href="https://www.instagram.com/trueserve_delivery/" 
                                    target="_blank" 
                                    className="hidden lg:flex w-10 h-10 rounded-full bg-white/5 items-center justify-center text-slate-400 hover:text-[#f59e0b] hover:bg-white/10 transition-all border border-white/5 hover:scale-110"
                                    title="Instagram"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                    </svg>
                                </Link>
                                <Link 
                                    href="https://www.facebook.com/share/1EHeS1jdoq/?mibextid=wwXIfr" 
                                    target="_blank" 
                                    className="hidden lg:flex w-10 h-10 rounded-full bg-white/5 items-center justify-center text-slate-400 hover:text-[#f59e0b] hover:bg-white/10 transition-all border border-white/5 hover:scale-110"
                                    title="Facebook"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
                                    </svg>
                                </Link>
                            </div>
                            {userId ? (
                                <div className="flex items-center gap-4">
                                    <NotificationBell userId={userId} />
                                    <Link href="/user/settings" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#f59e0b] border border-white/10 hover:bg-white/10 transition-all shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </Link>
                                    <LogoutButton />
                                </div>
                            ) : (
                                <div className="flex items-center gap-6">
                                    <Link href="/login" className="hidden md:block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all border border-white/10 rounded-full px-5 py-2 hover:bg-white/5 italic">Sign In</Link>
                                    <Link href="/restaurants" className="badge-solid-primary !px-10 !py-3 !text-[11px] h-glow">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>

                <main>
                    {/* ── HERO ────────────────────────────────────────────────────────── */}
                    <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <img
                                src="/hero_food_delivery.png"
                                alt="Fine Dining"
                                className="w-full h-full object-cover opacity-30 brightness-50 blur-3xl scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black" />
                        </div>

                        <div className="relative z-10 max-w-6xl space-y-12 animate-slide-up text-center flex flex-col items-center justify-center">
                            <h1 className="text-5xl md:text-[115px] leading-[0.8] text-white font-serif italic select-none font-black tracking-tighter">
                                Cravings meet <br />
                                <span className="text-[#f59e0b] not-italic tracking-[-0.03em] drop-shadow-[5px_5px_0px_rgba(255,255,255,0.1)] uppercase italic">Lightning Speed.</span>
                            </h1>

                            <p className="max-w-3xl mx-auto text-lg md:text-2xl text-slate-400 font-bold leading-relaxed italic opacity-80">
                                Experience the future of local food delivery. Zero platform fees, fair driver pay, and the best local flavors delivered to your door.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-12">
                                <Link href="/restaurants" className="badge-solid-primary !px-16 !py-6 !text-sm">
                                    Browse Restaurants
                                </Link>
                                <Link href="/merchant" className="badge-outline-white !px-16 !py-6 !text-sm h-glow">
                                    For Businesses
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* ── PLATFORM FEATURES ───────────────────────────────────────────── */}
                    <section className="py-32 bg-[#0a0a0b] w-full flex flex-col items-center">
                        <div className="w-full max-w-7xl px-8 flex flex-col items-center text-center">
                            <div className="flex items-center justify-center gap-10 text-[#f59e0b] font-black uppercase tracking-[1em] text-[9px] mb-24 opacity-80 select-none w-full">
                                <div className="flex-1 h-px bg-[#f59e0b]/20 max-w-[80px]" />
                                <span className="shrink-0 px-4">Platform Features</span>
                                <div className="flex-1 h-px bg-[#f59e0b]/20 max-w-[80px]" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                                {[
                                    { title: "Order Locally.", img: "/community_section.png", desc: "Support independent gems. Zero platform fees ensure local restaurants stay in business.", cta: "Explore Menus", link: "/restaurants" },
                                    { title: "Grow Partners.", img: "/merchant_section.png", desc: "Stop losing margins to big apps. Fair pricing and elite dispatch built for you.", cta: "Partner Hub", link: "/merchant" },
                                    { title: "Drive More.", img: "/diverse_drivers.png", desc: "Join our fleet and earn 20-30% more with optimized routing and reliable local payouts.", cta: "Start Driving", link: "/driver" }
                                ].map((card, i) => (
                                    <Link key={i} href={card.link} className={`reveal group relative min-h-[600px] bg-black overflow-hidden border border-white/5 transition-all duration-700 flex flex-col justify-end p-12 hover:bg-white/[0.02] active:scale-[0.98] shadow-2xl`}>
                                        <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2.5s] opacity-20 group-hover:opacity-45 brightness-50" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                        <div className="relative z-10 space-y-6 flex flex-col items-center text-center">
                                            <h3 className="text-4xl md:text-6xl font-black text-white leading-[0.85] italic uppercase font-serif tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                                {card.title}
                                            </h3>
                                            <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity italic">
                                                {card.desc}
                                            </p>
                                            <div className="pt-6">
                                                <div className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white border border-white/20 rounded-md px-8 py-4 backdrop-blur-sm bg-black/40 group-hover:border-[#f59e0b] group-hover:text-[#f59e0b] transition-all duration-500 italic">
                                                    {card.cta} <span className="group-hover:translate-x-2 transition-transform duration-500">→</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="py-32 bg-black border-t border-white/10 px-10">
                    <div className="container mx-auto max-w-7xl text-center space-y-20">
                        <div className="flex flex-col items-center gap-10">
                            <Logo size="xl" />
                            <div className="flex flex-wrap justify-center gap-x-16 gap-y-10 text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 italic">
                                <Link href="/privacy" className="hover:text-white transition-colors">Safety</Link>
                                <Link href="/merchant" className="hover:text-[#f59e0b] transition-colors">Merchant Help</Link>
                                <Link href="/driver" className="hover:text-[#f59e0b] transition-colors">Driver Guide</Link>
                                <Link href="https://www.instagram.com/trueserve_delivery/" target="_blank" className="text-slate-500 hover:text-[#f59e0b] transition-all">IG</Link>
                                <Link href="https://www.facebook.com/share/1EHeS1jdoq/?mibextid=wwXIfr" target="_blank" className="text-slate-500 hover:text-[#f59e0b] transition-all">FB</Link>
                            </div>
                        </div>
                        <div className="pt-16 border-t border-white/5 text-slate-700 text-[11px] font-black uppercase tracking-[0.4em] italic">
                            © {new Date().getFullYear()} TrueServe Platform. <br />
                            Supporting Independent Culinary Infrastructure.
                        </div>
                    </div>
                </footer>
            </div>

            {/* ─── HI-FI MOBILE APP VIEW (LG AND DOWN) ─── */}
            <div className="lg:hidden mobile-empire-root noise-overlay font-barlow text-[#F0EDE8] pb-32">
                <div className="max-w-[430px] mx-auto min-h-screen relative flex flex-col z-10 bg-[#0A0A0A]">
                    
                    {/* AMBIENT LIGHTING */}
                    <div className="fixed inset-0 pointer-events-none z-0">
                        <div className="orb w-[300px] h-[300px] top-[-100px] right-[-100px] bg-[#E8A020]/15" />
                        <div className="orb w-[250px] h-[250px] top-[40%] left-[-80px] bg-[rgba(232,162,48,0.08)]" />
                    </div>

                    {/* ── APP HEADER ── */}
                    <nav className="sticky top-0 z-[60] bg-[#0A0A0A]/85 backdrop-blur-2xl border-b border-white/5 px-5 py-4 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="font-barlow-cond text-[9px] font-black uppercase tracking-[0.3em] text-[#555] italic">OPERATIONAL SECTOR</span>
                            <div className="flex items-center gap-1.5 cursor-pointer group">
                                <span className="font-bold text-[14px] text-white group-hover:text-[#E8A020] transition-colors italic">Charlotte, NC HQ</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#E8A020] rotate-90"><path d="M9 5l7 7-7 7"/></svg>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/user/settings/info" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative shadow-inner">
                                <span className="text-lg">👤</span>
                                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#E8A020] rounded-full border-2 border-[#0A0A0A] animate-pulse" />
                            </Link>
                        </div>
                    </nav>

                    <main className="relative z-10">
                        {/* ── SEARCH TERMINAL ── */}
                        <section className="px-5 pt-6 animate-up">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#444] group-focus-within:text-[#E8A020] transition-colors"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Search mission targets..." 
                                    className="w-full h-15 bg-[#141417] border border-white/5 rounded-2xl pl-13 pr-5 text-[15px] font-medium text-white placeholder:text-[#333] focus:outline-none focus:ring-2 focus:ring-[#E8A020]/20 focus:border-[#E8A020]/40 transition-all shadow-inner"
                                />
                                <div className="absolute inset-y-0 right-3 flex items-center">
                                    <button className="w-9 h-9 bg-[#E8A020] rounded-xl flex items-center justify-center shadow-[0_5px_15px_rgba(232,160,32,0.3)] active:scale-90 transition-all">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6m2-6h6m2 8h6"/></svg>
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* ── CATEGORY PULSE ── */}
                        <section className="mt-8 animate-up" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-center justify-between px-5 mb-4">
                                <h2 className="font-bebas text-2xl italic tracking-widest text-[#555] uppercase">Sector Categories</h2>
                                <span className="font-barlow-cond text-[10px] font-black text-[#E8A020] uppercase tracking-widest italic">View Hub →</span>
                            </div>
                            <div className="flex gap-3 overflow-x-auto px-5 pb-4 scrollbar-hide">
                                {[
                                    { label: 'BURGERS', icon: '🍔', color: '#FF4D00' },
                                    { label: 'PIZZA', icon: '🍕', color: '#E8A020' },
                                    { label: 'SUSHI', icon: '🍣', color: '#FF0055' },
                                    { label: 'TACOS', icon: '🌮', color: '#32D74B' },
                                    { label: 'VEGAN', icon: '🥗', color: '#00D2FF' },
                                ].map((cat, i) => (
                                    <Link key={i} href={`/restaurants?category=${cat.label.toLowerCase()}`} className="flex flex-col items-center gap-2 group shrink-0">
                                        <div className="w-18 h-18 bg-[#141417] border border-white/5 rounded-3xl flex items-center justify-center text-3xl shadow-lg relative overflow-hidden group-active:scale-90 transition-all">
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ background: cat.color }} />
                                            {cat.icon}
                                        </div>
                                        <span className="font-barlow-cond text-[9px] font-black uppercase tracking-[0.2em] text-[#444] group-hover:text-white transition-colors">{cat.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* ── ELITE PROMOTIONS ── */}
                        <section className="mt-6 animate-up" style={{ animationDelay: '0.2s' }}>
                            <div className="flex gap-4 overflow-x-auto px-5 pb-6 scrollbar-hide">
                                {[
                                    { title: 'FREE DELIVERY', sub: 'Sector Alpha Rewards', img: '/community_section.png', color: 'from-[#E8A020]/40' },
                                    { title: '40% HARVEST', sub: 'Merchant Integration', img: '/merchant_section.png', color: 'from-[#00D2FF]/40' },
                                ].map((promo, i) => (
                                    <div key={i} className="relative w-[300px] h-[160px] rounded-[2.5rem] overflow-hidden shrink-0 border border-white/5 shadow-2xl group cursor-pointer active:scale-[0.98] transition-all">
                                        <img src={promo.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4s] grayscale opacity-50" />
                                        <div className={`absolute inset-0 bg-gradient-to-tr ${promo.color} via-black/80 to-black/95`} />
                                        <div className="absolute inset-0 p-7 flex flex-col justify-end">
                                            <p className="font-barlow-cond text-[10px] font-black uppercase tracking-[0.3em] text-[#E8A020] mb-1 italic animate-blink">{promo.sub}</p>
                                            <h3 className="font-bebas text-4xl italic text-white leading-none uppercase tracking-wider">{promo.title}</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ── NEARBY MISSION TARGETS ── */}
                        <section className="mt-4 px-5 animate-up" style={{ animationDelay: '0.3s' }}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-bebas text-3xl italic tracking-wider text-white uppercase">Elite Mission Partners</h2>
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#E8A020]" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 pb-12">
                                {[
                                    { name: 'LUXE KITCHEN', rating: '4.9', time: '15-20 MIN', img: '/merchant_login_bg_restaurant.png', tags: ['PREMIUM', 'BURGER'] },
                                    { name: 'NEO SUSHI', rating: '5.0', time: '20-30 MIN', img: '/merchant_login_bg_restaurant.png', tags: ['ELITE', 'JAPANESE'] },
                                    { name: 'CRISP N CO', rating: '4.7', time: '10-15 MIN', img: '/hero_food_delivery.png', tags: ['RAPID', 'DESSERT'] },
                                ].map((shop, i) => (
                                    <Link key={i} href="/restaurants" className="group relative bg-[#0c0c0e] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl active:scale-[0.98] transition-all">
                                        <div className="relative h-[220px] overflow-hidden">
                                            <img src={shop.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[5s] brightness-75" />
                                            <div className="absolute top-5 right-5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-2 flex items-center gap-1.5">
                                                <span className="text-[#E8A020] text-xs">★</span>
                                                <span className="font-bold text-[13px] text-white">{shop.rating}</span>
                                            </div>
                                            <div className="absolute bottom-5 left-5 flex gap-2">
                                                {shop.tags.map((tag, j) => (
                                                    <span key={j} className="bg-[#E8A020] text-black font-barlow-cond text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-7">
                                            <div className="flex justify-between items-center mb-1">
                                                <h3 className="font-bebas text-4xl italic text-white tracking-widest uppercase">{shop.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-[#E8A020] animate-pulse" />
                                                    <span className="font-barlow-cond text-[11px] font-black uppercase tracking-widest text-[#444] italic">ACTIVE HUB</span>
                                                </div>
                                            </div>
                                            <p className="font-barlow-cond text-[11px] font-black uppercase tracking-[0.1em] text-[#555] italic">Sector ETA: <span className="text-white">{shop.time}</span> &nbsp;·&nbsp; Deployment Fee: <span className="text-[#32D74B]">$0.00</span></p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}
