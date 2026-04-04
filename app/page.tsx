export const dynamic = "force-dynamic";

import Link from "next/link";
import LandingSearch from "@/components/LandingSearch";
import NotificationBell from "@/components/NotificationBell";
import LogoutButton from "@/components/LogoutButton";
import { cookies } from "next/headers";
import EmergencyBanner from "@/components/EmergencyBanner";
import Logo from "@/components/Logo";
import MobileHomeContent from "@/components/MobileHomeContent";

export default async function Home() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    return (
        <div className="min-h-screen relative bg-black text-[#cbd5e1] selection:bg-[#f59e0b]/30 overflow-x-hidden">
            <EmergencyBanner />

            {/* ─── DESKTOP VIEW (LG and UP) ─── */}
            <div className="hidden lg:block">
                {/* ── NAV ─────────────────────────────────────────────────────────── */}
                <nav className="sticky top-0 z-[100] bg-black/60 backdrop-blur-3xl border-b border-white/5 py-3 px-6">
                    <div className="container mx-auto flex justify-between items-center max-w-7xl">
                        <Logo size="md" />

                        <div className="hidden lg:flex items-center gap-8 text-[13px] font-medium text-slate-400">
                            <Link href="/" className="hover:text-white transition-all">Home</Link>
                            <Link href="/merchant" className="hover:text-white transition-all whitespace-nowrap">For Merchants</Link>
                            <Link href="/driver" className="hover:text-white transition-all whitespace-nowrap">For Drivers</Link>
                        </div>

                        <div className="flex items-center gap-4">
                            {userId ? (
                                <div className="flex items-center gap-4">
                                    <NotificationBell userId={userId} />
                                    <Link href="/user/settings" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#f59e0b] border border-white/10 hover:bg-white/10 transition-all shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </Link>
                                    <LogoutButton />
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link href="/login" className="text-[13px] font-bold text-white hover:bg-white/5 transition-all border border-white/10 rounded-lg px-6 py-2.5">Sign In</Link>
                                    <Link href="/restaurants" className="bg-[#f59e0b] text-black text-[13px] font-bold rounded-lg px-6 py-2.5 hover:bg-[#d97706] transition-all">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>

                <main>
                    {/* ── HERO ────────────────────────────────────────────────────────── */}
                    <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <img
                                src="/hero_food_delivery.png"
                                alt="Food Delivery Background"
                                className="w-full h-full object-cover opacity-40 brightness-[0.4]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
                        </div>

                        <div className="relative z-10 max-w-5xl space-y-8 animate-slide-up flex flex-col items-center">
                            <h1 className="text-6xl md:text-[88px] leading-[1.1] text-white font-bold tracking-tight">
                                Food Delivered<br />
                                <span className="text-[#f59e0b]">The Right Way</span>
                            </h1>

                            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-300 font-medium opacity-90 leading-relaxed">
                                Enter your address to discover restaurants near you — real food, real fast.
                            </p>

                            <div className="w-full max-w-2xl pt-4">
                                <div className="flex items-stretch bg-[#0f1115]/90 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl p-1.5 focus-within:border-[#f59e0b]/50 transition-all">
                                    <input 
                                        type="text" 
                                        placeholder="Enter your delivery address..." 
                                        className="flex-1 bg-transparent px-8 py-5 text-white placeholder:text-slate-500 outline-none text-xl"
                                    />
                                    <button className="bg-[#f59e0b] text-black font-bold px-10 rounded-lg hover:bg-[#d97706] transition-all flex items-center gap-2 whitespace-nowrap text-lg">
                                        Find Food <span>→</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-4 pt-8">
                                {[
                                    "Free delivery on first order",
                                    "Real-time tracking",
                                    "AI-powered support"
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white text-sm font-semibold hover:border-[#f59e0b]/50 hover:bg-[#f59e0b]/5 transition-all">
                                        <span className="text-[#f59e0b]">✓</span> {feature}
                                    </div>
                                ))}
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
            <MobileHomeContent userId={userId} />
        </div>
    );
}
