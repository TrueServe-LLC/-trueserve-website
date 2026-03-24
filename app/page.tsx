export const dynamic = "force-dynamic";

import Link from "next/link";
import LandingSearch from "@/components/LandingSearch";
import NotificationBell from "@/components/NotificationBell";
import LogoutButton from "@/components/LogoutButton";
import { cookies } from "next/headers";
import EmergencyBanner from "@/components/EmergencyBanner";

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  return (
    <div className="min-h-screen relative font-sans text-slate-300 bg-black selection:bg-primary/30">
      <EmergencyBanner />

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-[100] bg-black/60 backdrop-blur-3xl border-b border-white/10 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center max-w-7xl">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full border-2 border-slate-600 bg-black/60 flex items-center justify-center p-1.5 overflow-hidden shadow-2xl group-hover:scale-110 transition-transform">
              <img src="/logo.png" alt="TrueServe Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-widest text-white uppercase italic">True<span className="text-primary not-italic tracking-[0.02em] font-black">SERVE</span></span>
          </Link>

          <div className="hidden lg:flex items-center gap-12 text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">
            <Link href="/restaurants" className="hover:text-primary transition-colors">ORDER FOOD</Link>
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
              <div className="flex items-center gap-6">
                <Link href="/login" className="hidden md:block text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-colors italic">Sign In</Link>
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

          <div className="relative z-10 max-w-6xl space-y-12 animate-fade-in text-center flex flex-col items-center justify-center glow-blur-primary">
            
            <h1 className="text-6xl md:text-[140px] leading-[0.8] text-white font-black tracking-tighter italic animate-slide-up select-none">
              Cravings meet <br />
              <span className="text-primary not-italic tracking-[-0.03em] drop-shadow-[5px_5px_0px_rgba(255,255,255,0.1)] uppercase">Lightning Speed.</span>
            </h1>

            <div className="w-full max-w-3xl pt-8 relative group">
                {/* Search Bar with Glow */}
                <div className="absolute inset-0 bg-primary/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-1000 -z-10" />
                <LandingSearch />
            </div>

            <p className="max-w-3xl mx-auto text-lg md:text-2xl text-slate-400 font-bold leading-relaxed italic animate-fade-in delay-200">
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
        <section className="py-48 bg-black relative">
          <div className="container mx-auto px-8 max-w-7xl">
            <div className="flex items-center gap-6 text-primary font-black uppercase tracking-[0.6em] text-[10px] mb-20 italic">
                <div className="w-12 h-px bg-primary/40" />
                Network Excellence
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  title: "Order Locally.",
                  img: "/community_section.png",
                  desc: "Support independent gems. Zero commission options ensure local restaurants stay in business.",
                  cta: "Explore Menus",
                  link: "/restaurants"
                },
                {
                  title: "Grow Partners.",
                  img: "/merchant_section.png",
                  desc: "Stop losing margins to big apps. Fair pricing and elite dispatch protocols built for you.",
                  cta: "Partner Hub",
                  link: "/merchant"
                },
                {
                  title: "Drive More.",
                  img: "/diverse_drivers.png",
                  desc: "Join our fleet and earn 20-30% more with optimized routing and reliable local payouts.",
                  cta: "Start Driving",
                  link: "/driver"
                }
              ].map((card, i) => (
                <Link key={i} href={card.link} className="group relative min-h-[550px] bg-[#0a0a0b] rounded-[3.5rem] overflow-hidden border border-white/5 hover:border-primary/40 transition-all flex flex-col justify-end p-12 pb-20 hover:scale-[1.02] active:scale-[0.98] shadow-2xl backdrop-blur-3xl">
                  <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/90 to-transparent z-10" />
                  <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] opacity-20 group-hover:opacity-40 grayscale group-hover:grayscale-0" />
                  <div className="relative z-20 space-y-8">
                    <p className="text-primary font-black text-[10px] uppercase tracking-[0.4em] italic mb-2">Service Node {i+1}</p>
                    <h3 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight italic uppercase h-glow">{card.title}</h3>
                    <p className="text-slate-500 text-sm font-bold italic leading-relaxed max-w-xs">{card.desc}</p>
                    <div className="pt-6">
                      <div className="badge-outline-white inline-flex !text-[10px] !px-8 !py-4 !bg-black/50 backdrop-blur-xl border-white/10 group-hover:border-primary group-hover:bg-primary group-hover:text-black transition-all h-glow">
                         {card.cta} <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="py-32 bg-black border-t border-white/10 px-10">
        <div className="container mx-auto max-w-7xl text-center space-y-20">
          <div className="flex flex-col items-center gap-10">
            <Link href="/" className="flex items-center gap-4 group">
              <img src="/logo.png" alt="TrueServe Logo" className="w-16 h-16 rounded-xl border border-primary/20 group-hover:scale-110 transition-transform shadow-2xl" />
              <span className="text-3xl font-black text-white tracking-widest uppercase italic animate-pulse">True<span className="text-primary not-italic tracking-[0.2em] text-xl ml-2">Serve</span></span>
            </Link>
            
            <div className="flex flex-wrap justify-center gap-x-16 gap-y-10 text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 italic">
              <Link href="/privacy" className="hover:text-white transition-colors">Safety</Link>
              <Link href="/merchant" className="hover:text-primary transition-colors">Merchant Help</Link>
              <Link href="/driver" className="hover:text-primary transition-colors">Driver Guide</Link>
              <Link href="/admin" className="hover:text-primary transition-colors text-slate-800">Internal Login</Link>
            </div>
          </div>
          
          <div className="pt-16 border-t border-white/5 text-slate-700 text-[11px] font-black uppercase tracking-[0.4em] italic">
            © {new Date().getFullYear()} TrueServe LLC. Empowering local communities across South Carolina.
          </div>
        </div>
      </footer>
    </div>
  );
}
