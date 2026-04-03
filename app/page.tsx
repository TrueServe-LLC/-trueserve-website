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

            {/* ─── MOBILE VIEW (LG AND DOWN) ─── */}
            <div className="lg:hidden mobile-empire-root noise-overlay font-barlow text-[#F0EDE8]">
                <div className="max-w-[430px] mx-auto min-h-screen relative flex flex-col z-10 bg-[#0A0A0A]/20">
                    {/* AMBIENT ORBS */}
                    <div className="fixed inset-0 pointer-events-none z-0">
                        <div className="orb w-[260px] h-[260px] top-[-60px] right-[-80px] bg-[#E8A020]/10" />
                        <div className="orb w-[200px] h-[200px] top-[480px] left-[-70px] bg-[#E8A020]/0.06" />
                        <div className="orb w-[160px] h-[160px] bottom-[130px] right-[-50px] bg-[rgba(232,80,20,0.06)]" />
                    </div>

                    {/* ─── MOBILE NAV HEADER ─── */}
                    <nav className="sticky top-0 z-50 flex items-center justify-between px-[18px] py-[18px] bg-[#0A0A0A]/98 backdrop-blur-xl animate-dn">
                        {/* High-Fi Mobile Logo with Gold Background */}
                        <Link href="/" className="flex items-center gap-[9px] group">
                           <div className="w-[36px] h-[36px] p-[4px] rounded-[9px] bg-[#E8A020] flex items-center justify-center overflow-hidden">
                                <img src="/logo.png" alt="TS" className="w-full h-full object-contain" />
                           </div>
                           <span className="font-barlow-cond font-bold text-[21px] tracking-tight text-white leading-none">
                                True<em className="text-[#E8A020] not-italic">Serve</em>
                           </span>
                        </Link>
                        <div className="flex items-center gap-[9px]">
                            <Link href="/restaurants" className="w-[38px] h-[38px] rounded-[10px] bg-[#1C1C1C] border border-white/5 flex items-center justify-center text-[17px] relative">
                                🛒
                                <div className="absolute -top-[5px] -right-[5px] w-[16px] h-[16px] rounded-full bg-[#E8A020] text-black font-barlow-cond text-[10px] font-bold flex items-center justify-center">2</div>
                            </Link>
                            <Link href="/login" className="bg-[#E8A020] text-[#0A0A0A] font-barlow-cond font-bold text-[12px] uppercase tracking-[0.1em] px-[15px] py-[9px] rounded-[9px]">
                                Sign In
                            </Link>
                        </div>
                    </nav>

                    <main className="px-[18px] pt-4 animate-up mb-10">
                        <div className="font-barlow-cond text-[12px] font-semibold tracking-[0.24em] uppercase text-[#E8A020] mb-2.5">
                            Elite Discovery Terminal
                        </div>
                        
                        <h1 className="font-bebas text-[clamp(64px,18vw,80px)] leading-[0.88] mb-3.5 italic">
                            <span className="block text-[#F0EDE8]">CRAVINGS</span>
                            <span className="block text-[#E8A020]">MEET</span>
                            <span className="block text-[#F0EDE8]">LIGHTNING<br />SPEED.</span>
                        </h1>

                        <p className="text-[14px] font-light text-[#5A5550] leading-[1.65] mb-[30px] max-w-[280px]">
                            Syncing with independent kitchens and fair driver protocols in your area.
                        </p>

                        <div className="cat-cards space-y-[14px] pb-10">
                            <Link href="/restaurants" className="block relative min-h-[160px] rounded-[20px] overflow-hidden border border-white/0.06 flex flex-col justify-end">
                                <img src="/merchant_login_bg_restaurant.png" className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-br from-[#1a0800]/80 via-[#2d1200]/60 to-[#1a0800]/80" />
                                <div className="relative z-10 p-5 bg-gradient-to-t from-[#0A0A0A]/95 to-transparent">
                                    <div className="inline-flex items-center gap-[6px] rounded-full px-[10px] py-[3px] bg-[#E8A020]/20 text-[#E8A020] font-barlow-cond text-[10px] font-bold uppercase tracking-[0.12em] mb-[6px]">🔥 Live Hub</div>
                                    <h3 className="font-bebas text-[30px] text-white">Discovery Hub</h3>
                                </div>
                            </Link>

                            <Link href="/merchant/login" className="block relative min-h-[160px] rounded-[20px] overflow-hidden border border-white/0.06 flex flex-col justify-end">
                                <img src="/merchant_login_bg_restaurant.png" className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a]/80 via-[#151528]/60 to-[#0a0a1a]/80" />
                                <div className="relative z-10 p-5 bg-gradient-to-t from-[#0A0A0A]/95 to-transparent">
                                    <div className="inline-flex items-center gap-[6px] rounded-full px-[10px] py-[3px] bg-[#a0a0ff]/20 text-[#a0a0ff] font-barlow-cond text-[10px] font-bold uppercase tracking-[0.12em] mb-[6px]">Partnership</div>
                                    <h3 className="font-bebas text-[30px] text-white">Become a Merchant</h3>
                                </div>
                            </Link>

                            <Link href="/driver/login" className="block relative min-h-[160px] rounded-[20px] overflow-hidden border border-white/0.06 flex flex-col justify-end">
                                <img src="/driver_login_bg_car.png" className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-br from-[#001208]/80 via-[#001f0d]/60 to-[#001208]/80" />
                                <div className="relative z-10 p-5 bg-gradient-to-t from-[#0A0A0A]/95 to-transparent">
                                    <div className="inline-flex items-center gap-[6px] rounded-full px-[10px] py-[3px] bg-[#80e080]/20 text-[#80e080] font-barlow-cond text-[10px] font-bold uppercase tracking-[0.12em] mb-[6px]">Protocol</div>
                                    <h3 className="font-bebas text-[30px] text-white">Become a Driver</h3>
                                </div>
                            </Link>
                        </div>
                    </main>

                    {/* ─── MOBILE BOTTOM NAV ─── */}
                    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[100] bg-[#0C0C0C]/97 backdrop-blur-2xl border-t border-white/5 flex justify-around px-2 pt-2.5 pb-6">
                        <Link href="/" className="flex flex-col items-center gap-1 flex-1 text-[#E8A020]">
                            <span className="text-[21px]">🏠</span>
                            <span className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.1em]">Home</span>
                        </Link>
                        <Link href="/restaurants" className="flex flex-col items-center gap-1 flex-1 text-[#5A5550]">
                            <span className="text-[21px]">🔍</span>
                            <span className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.1em]">Explore</span>
                        </Link>
                        <Link href="/orders" className="flex flex-col items-center gap-1 flex-1 text-[#5A5550]">
                            <span className="text-[21px]">📋</span>
                            <span className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.1em]">Orders</span>
                        </Link>
                        <Link href="/user/settings" className="flex flex-col items-center gap-1 flex-1 text-[#5A5550]">
                            <span className="text-[21px]">👤</span>
                            <span className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.1em]">Profile</span>
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    );
}
