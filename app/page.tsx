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
              className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary transition-all shadow-lg grayscale focus:grayscale-0 group-hover:grayscale-0" 
            />
            <span className="text-xl md:text-2xl font-black tracking-tight text-white font-serif">TrueServe</span>
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
                <Link href="/user/settings" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-primary border border-white/10 hover:bg-white/10 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </Link>
                <LogoutButton />
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link href="/login" className="hidden md:block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Sign In</Link>
                <Link href="/restaurants" className="bg-primary hover:bg-primary/90 text-black text-[11px] font-black uppercase tracking-[0.2em] py-2.5 px-6 rounded-full transition-all hover:scale-105 shadow-xl shadow-primary/20">
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
              <Link href="/restaurants" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-black text-xs font-black uppercase tracking-[0.2em] py-5 px-12 rounded-[2rem] transition-all hover:-translate-y-1 shadow-[0_20px_40px_rgba(245,158,11,0.3)]">
                Browse Restaurants
              </Link>
              <Link href="/driver-signup" className="w-full sm:w-auto bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-black uppercase tracking-[0.2em] py-5 px-12 rounded-[2rem] transition-all backdrop-blur-md">
                Become a Driver
              </Link>
            </div>
          </div>
        </section>

        {/* ── MISSION ─────────────────────────────────────────────────────── */}
        <section className="py-32 bg-gradient-to-b from-[#0a0a0b] to-[#121214]">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-2xl md:text-3xl font-serif italic text-white leading-relaxed font-medium">
              &quot;TrueServe is a driver-first delivery marketplace that pays couriers 25–40% more than competitors while lowering restaurant commissions and simplifying customer pricing.&quot;
            </h2>
          </div>
        </section>

        {/* ── PLATFORM FEATURES ───────────────────────────────────────────── */}
        <section className="py-32 bg-[#121214]">
          <div className="container mx-auto px-6 max-w-7xl">
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
                  link: "/merchant-signup"
                },
                {
                  title: "Driver Sign Up",
                  img: "/driver_section.png",
                  desc: "Earn 20-40% more with fair splits and high-velocity routing engineered for efficiency.",
                  cta: "Apply Now",
                  link: "/driver-signup"
                }
              ].map((card, i) => (
                <Link key={i} href={card.link} className="group relative aspect-[4/5] bg-secondary rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-primary/50 transition-all flex flex-col justify-end p-10 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                  <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] opacity-60 group-hover:opacity-80" />
                  <div className="relative z-20 space-y-4">
                    <p className="text-primary font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em]">Platform Excellence</p>
                    <h3 className="text-3xl md:text-4xl font-serif font-bold text-white">{card.title}</h3>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-3">{card.desc}</p>
                    <div className="pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 group-hover:text-primary transition-colors flex items-center gap-2">
                       {card.cta} <span>→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── VOICES (TESTIMONIALS) ────────────────────────────────────────── */}
        <section className="py-32 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  quote: "TrueServe changed the game for our restaurant. Finally, a platform that respects the kitchen's margins.",
                  author: "Chef Marcus R.",
                  role: "Owner, The Hearth"
                },
                {
                  quote: "As a driver, the transparency is refreshing. I know exactly what I'm making before I accept a trip.",
                  author: "Sarah L.",
                  role: "Partner Driver"
                },
                {
                  quote: "The only app I use for delivery. The food stays hot and the service is always professional.",
                  author: "David K.",
                  role: "Premium Member"
                }
              ].map((t, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/10 p-10 rounded-[2.5rem] space-y-6 hover:bg-white/[0.05] transition-all">
                  <div className="text-primary text-4xl font-serif">&quot;</div>
                  <p className="text-lg text-white font-medium leading-relaxed italic">{t.quote}</p>
                  <div>
                    <h4 className="text-white font-bold">{t.author}</h4>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
        <section className="py-32 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="relative bg-[#121214] border border-white/10 rounded-[4rem] p-16 md:p-32 text-center overflow-hidden">
               <div className="absolute inset-0 z-0">
                <img
                  src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop"
                  alt="Background"
                  className="w-full h-full object-cover opacity-10 grayscale"
                />
              </div>
              <div className="relative z-10 space-y-10">
                <h2 className="text-4xl md:text-[70px] font-serif font-bold text-white leading-none tracking-tight">
                  Ready to experience <br />the new standard?
                </h2>
                <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed font-medium">
                  Join thousands of local partners and customers who have already upgraded their delivery experience.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link href="/restaurants" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-black text-[11px] font-black uppercase tracking-[0.2em] py-5 px-14 rounded-full transition-all shadow-2xl">
                    Order Food Now
                  </Link>
                  <Link href="/merchant-signup" className="w-full sm:w-auto bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[11px] font-black uppercase tracking-[0.2em] py-5 px-14 rounded-full transition-all">
                    Partner With Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="py-20 bg-black border-t border-white/5 px-8">
        <div className="container mx-auto max-w-7xl text-center">
          <div className="flex flex-col items-center gap-8 mb-12">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="TrueServe Logo" className="w-12 h-12 rounded-full grayscale hover:grayscale-0 transition-all" />
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
