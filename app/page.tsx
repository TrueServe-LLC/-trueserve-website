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
    <div className="min-h-screen relative font-sans text-slate-300 bg-[#0a0a0b] selection:bg-primary/30">
      <EmergencyBanner />

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-[100] bg-black/60 backdrop-blur-2xl border-b border-white/5 py-3 md:py-4 px-6">
        <div className="container mx-auto flex justify-between items-center max-w-7xl">
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="TrueServe Logo" 
              className="w-10 h-10 rounded-xl border border-primary/20 group-hover:border-primary transition-all shadow-lg grayscale focus:grayscale-0 group-hover:grayscale-0" 
            />
            <span className="text-xl md:text-2xl font-black tracking-tight text-white font-serif">True<span className="text-primary not-italic font-sans uppercase tracking-widest text-lg">Serve</span></span>
          </Link>

          <div className="hidden lg:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <Link href="/restaurants" className="hover:text-primary transition-colors">Order Food</Link>
            <Link href="/merchant" className="hover:text-primary transition-colors">For Merchants</Link>
            <Link href="/driver" className="hover:text-primary transition-colors">Become a Driver</Link>
          </div>

          <div className="flex items-center gap-6">
            {userId ? (
              <div className="flex items-center gap-4">
                <NotificationBell userId={userId} />
                <Link href="/user/settings" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10 hover:bg-white/10 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </Link>
                <LogoutButton />
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link href="/login" className="hidden md:block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Sign In</Link>
                <Link href="/restaurants" className="badge-solid-primary !px-6 !py-2.5 !text-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center">
          <div className="absolute inset-0 z-0">
            <img
              src="/hero_food_delivery.png"
              alt="Fine Dining"
              className="w-full h-full object-cover opacity-40 brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/60 to-[#0a0a0b]/20" />
          </div>

          <div className="relative z-10 max-w-5xl space-y-8 animate-fade-in text-center flex flex-col items-center justify-center">
            
            <h1 className="text-5xl md:text-[100px] leading-[0.9] text-white font-serif font-bold tracking-tight drop-shadow-2xl">
              Cravings meet <br />
              <span className="text-primary italic">Lightning Speed.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed">
              Experience the future of local food delivery. Zero platform fees, fair driver pay, and the best local flavors delivered to your door.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
              <Link href="/restaurants" className="badge-solid-primary w-full sm:w-auto">
                Browse Restaurants
              </Link>
              <Link href="/driver-signup" className="badge-outline-white w-full sm:w-auto">
                Become a Driver
              </Link>
            </div>
          </div>
        </section>

        {/* ── MISSION ─────────────────────────────────────────────────────── */}
        <section className="py-48 bg-gradient-to-b from-[#0a0a0b] to-[#121214]">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-2xl md:text-4xl font-serif italic text-white leading-relaxed font-medium">
              &quot;<span className="text-primary">TrueServe</span> is a driver-first marketplace that pays couriers <span className="text-primary">25–40%</span> more while lowering commissions and simplifying costs.&quot;
            </h2>
          </div>
        </section>

        {/* ── PLATFORM FEATURES ───────────────────────────────────────────── */}
        <section className="py-32 bg-[#0a0a0b]">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex items-center gap-4 text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-12">
                <div className="w-8 h-px bg-primary/30" />
                Platform Features
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  title: "Order Food",
                  img: "/community_section.png",
                  desc: "Browse local gems and get the best food in your city delivered by a network that cares.",
                  cta: "Browse Menus",
                  link: "/restaurants"
                },
                {
                  title: "Merchant Sign Up",
                  img: "/merchant_section.png",
                  desc: "Reclaim your margins with zero-commission protocols and elite local dispatch.",
                  cta: "Join as Partner",
                  link: "/merchant"
                },
                {
                  title: "Become a Driver",
                  img: "https://images.unsplash.com/photo-1624513101683-162235c6de64?q=80&w=2070&auto=format&fit=crop",
                  desc: "Earn 20-40% more with fair splits and high-velocity routing engineered for efficiency.",
                  cta: "Start Application",
                  link: "/driver"
                }
              ].map((card, i) => (
                <Link key={i} href={card.link} className="group relative min-h-[500px] bg-secondary rounded-[3rem] overflow-hidden border border-white/5 hover:border-primary/50 transition-all flex flex-col justify-end p-10 pb-16 hover:scale-[1.02]">
                  <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/95 to-transparent z-10" />
                  <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] opacity-40 group-hover:opacity-60" />
                  <div className="relative z-20 space-y-6">
                    <p className="text-primary font-black text-[10px] uppercase tracking-[0.4em]">Platform Excellence</p>
                    <h3 className="text-4xl md:text-5xl font-serif font-black text-white leading-tight tracking-tight italic">{card.title}</h3>
                    <div className="pt-4">
                      <div className="badge-outline-white inline-flex !text-xs !px-6 !py-3 !bg-black/50 backdrop-blur-md border-white/20 group-hover:border-primary group-hover:bg-primary group-hover:text-black transition-all">
                         {card.cta} <span className="ml-2">→</span>
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
      <footer className="py-20 bg-black border-t border-white/5 px-8">
        <div className="container mx-auto max-w-7xl text-center">
          <div className="flex flex-col items-center gap-8 mb-12">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="TrueServe Logo" className="w-12 h-12 rounded-xl grayscale hover:grayscale-0 transition-all" />
              <span className="font-serif text-white text-2xl font-bold tracking-tight">TrueServe</span>
            </Link>
            
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              <Link href="/restaurants" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/merchant" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/driver" className="hover:text-primary transition-colors">Support</Link>
              <Link href="/admin" className="hover:text-primary transition-colors">Internal</Link>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} TrueServe LLC. All rights reserved. Registered in South Carolina.
          </div>
        </div>
      </footer>
    </div>
  );
}
