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
            <span className="text-2xl font-serif font-black tracking-tighter text-white uppercase italic leading-none">True<span className="text-primary not-italic tracking-tighter text-xl ml-0.5">SERVE</span></span>
          </Link>

          <div className="hidden lg:flex items-center gap-12 text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">
            <Link href="/restaurants" className="hover:text-primary transition-colors">ORDER FOOD</Link>
            <Link href="/merchant" className="hover:text-primary transition-colors whitespace-nowrap">FOR MERCHANTS</Link>
            <Link href="/driver" className="hover:text-primary transition-colors whitespace-nowrap">DRIVER HUB</Link>
          </div>

          <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <Link 
              href="https://www.instagram.com/trueserve_delivery/" 
              target="_blank" 
              className="hidden lg:flex w-10 h-10 rounded-full bg-white/5 items-center justify-center text-slate-400 hover:text-primary hover:bg-white/10 transition-all border border-white/5 hover:scale-110"
              title="Instagram"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </Link>
            <Link 
              href="https://www.facebook.com/profile.php?id=61578548473742" 
              target="_blank" 
              className="hidden lg:flex w-10 h-10 rounded-full bg-white/5 items-center justify-center text-slate-400 hover:text-primary hover:bg-white/10 transition-all border border-white/5 hover:scale-110"
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
                <Link href="/user/settings" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10 hover:bg-white/10 transition-all">
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

          <div className="relative z-10 max-w-6xl space-y-12 animate-fade-in text-center flex flex-col items-center justify-center glow-blur-primary">
            
            <h1 className="text-5xl md:text-[115px] leading-[0.8] text-white font-black tracking-tighter italic animate-slide-up select-none">
              Cravings meet <br />
              <span className="text-primary not-italic tracking-[-0.03em] drop-shadow-[5px_5px_0px_rgba(255,255,255,0.1)] uppercase italic">Lightning Speed.</span>
            </h1>

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
        <section className="py-32 bg-[#0a0a0b]">
          <div className="mx-auto px-8 md:px-16 max-w-7xl">
            <div className="flex items-center justify-center gap-6 text-primary font-black uppercase tracking-[0.6em] text-[10px] mb-20 italic">
                <div className="w-12 h-px bg-primary/30" />
                Platform Features
                <div className="w-12 h-px bg-primary/30" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  title: "Order Locally.", 
                  img: "/community_section.png",
                  desc: "Support independent gems. Zero platform fees ensure local restaurants stay in business.",
                  cta: "Explore Menus",
                  link: "/restaurants"
                },
                { 
                  title: "Grow Partners.", 
                  img: "/merchant_section.png",
                  desc: "Stop losing margins to big apps. Fair pricing and elite dispatch built for you.",
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
                <Link key={i} href={card.link} className="group relative min-h-[520px] bg-black rounded-3xl overflow-hidden border border-white/5 hover:border-primary/40 transition-all duration-500 flex flex-col justify-end p-8 hover:scale-[1.015] active:scale-[0.99] shadow-xl">
                  <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] opacity-30 group-hover:opacity-55" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="relative z-10 space-y-4">
                    <h3 className="text-3xl md:text-4xl font-black text-white leading-tight italic uppercase">{card.title}</h3>
                    <p className="text-slate-400 text-sm font-bold italic leading-relaxed max-w-[85%]">{card.desc}</p>
                    <div className="pt-2">
                      <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white border border-white/20 rounded-full px-6 py-3 backdrop-blur-sm bg-black/30 group-hover:border-primary/50 group-hover:text-primary transition-all">
                         {card.cta} <span className="group-hover:translate-x-1 transition-transform">→</span>
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
              <Link 
                href="https://www.instagram.com/trueserve_delivery/" 
                target="_blank" 
                className="text-slate-500 hover:text-primary flex items-center gap-2 group/insta transition-all"
              >
                <svg className="w-5 h-5 group-hover/insta:scale-125 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </Link>
              <Link 
                href="https://www.facebook.com/profile.php?id=61578548473742" 
                target="_blank" 
                className="text-slate-500 hover:text-primary flex items-center gap-2 group/fb transition-all"
              >
                <svg className="w-5 h-5 group-hover/fb:scale-125 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.248h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="pt-16 border-t border-white/5 text-slate-700 text-[11px] font-black uppercase tracking-[0.4em] italic">
            © {new Date().getFullYear()} TrueServe. Empowering local businesses through strategic logistics and elite partnerships.
          </div>
        </div>
      </footer>
    </div>
  );
}
