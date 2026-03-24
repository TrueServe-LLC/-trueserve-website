export const dynamic = "force-dynamic";

import Link from "next/link";
import LandingSearch from "@/components/LandingSearch";
import NotificationBell from "@/components/NotificationBell";
import LogoutButton from "@/components/LogoutButton";
import { cookies } from "next/headers";
import EmergencyBanner from "@/components/EmergencyBanner";
import ModeToggle from "@/components/ModeToggle";

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-slate-300 bg-[#080c14]">
      <EmergencyBanner />
      
      {/* Premium Header Sticky */}
      <nav className="sticky top-0 z-50 bg-[#080c14]/80 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-xl" />
            <span className="text-2xl font-black text-white tracking-tight font-serif italic">TrueServe</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <Link href="/restaurants" className="hover:text-primary transition-colors">Marketplace</Link>
            <Link href="/merchant" className="hover:text-primary transition-colors">Restaurants</Link>
            <Link href="/driver" className="hover:text-primary transition-colors">Drivers</Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {userId ? (
            <div className="flex items-center gap-4">
              <NotificationBell userId={userId} />
              <ModeToggle />
              <Link href="/user/settings" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary border border-white/10 hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-6">
               <Link href="/login" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white">Sign In</Link>
               <ModeToggle />
               <Link href="/restaurants" className="badge-solid-primary py-3 px-8 text-[10px] font-bold">Order Now</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Full Visual Impact */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden pt-0 pb-0">
          <div className="absolute inset-0 z-0">
            <img 
              src="/Users/lcking992/.gemini/antigravity/brain/6ab4212f-1910-4d39-a07f-8099fe107ea1/trueserve_hero_premium_delivery_1774363809773.png" 
              alt="Premium Delivery" 
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/40 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-5xl text-center space-y-12">
            <div className="inline-block px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
              Now Serving West Village, SC
            </div>
            <h1 className="text-6xl md:text-[100px] leading-[0.95] text-white font-serif max-w-4xl mx-auto drop-shadow-2xl">
              Elevated Delivery. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Local Soul.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-300 font-medium leading-relaxed italic border-l-2 border-primary/40 pl-8 text-left">
              Transparent earnings for drivers. Better margins for restaurants. 
              Higher standards for every single order. TrueServe is logistics for the community.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
               <div className="w-full max-w-xl">
                 <LandingSearch />
               </div>
            </div>
          </div>
      </section>

      {/* Features Grid - Services Section */}
      <section className="container py-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              title: "Restaurants",
              desc: "Reclaim your margins with our zero-commission protocols and elite local dispatch.",
              link: "/merchant",
              img: "/Users/lcking992/.gemini/antigravity/brain/6ab4212f-1910-4d39-a07f-8099fe107ea1/trueserve_restaurant_partner_tech_1774363830507.png"
            },
            {
              title: "Drivers",
              desc: "Earn 20-40% more with fair splits and high-velocity routing engineered for efficiency.",
              link: "/driver",
              img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200"
            },
            {
              title: "Community",
              desc: "Experience the best food in your city delivered by a network that cares about the outcome.",
              link: "/restaurants",
              img: "/Users/lcking992/.gemini/antigravity/brain/6ab4212f-1910-4d39-a07f-8099fe107ea1/trueserve_local_community_food_1774363850535.png"
            }
          ].map((item, i) => (
            <div key={i} className="group flex flex-col bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.05] transition-all duration-500 shadow-2xl">
              <div className="h-64 overflow-hidden">
                <img src={item.img} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
              </div>
              <div className="p-12 space-y-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl text-white font-serif mb-4">{item.title}</h3>
                  <p className="text-slate-400 text-base font-medium leading-relaxed">{item.desc}</p>
                </div>
                <Link href={item.link} className="inline-flex items-center gap-3 text-primary text-[11px] font-bold uppercase tracking-widest group-hover:gap-5 transition-all">
                  Access Portal <span className="text-xl">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Narrative Section - About Our Mission */}
      <section className="bg-white/[0.02] border-y border-white/5 py-32">
        <div className="container grid grid-cols-1 lg:grid-cols-2 gap-24 items-center px-8">
           <div className="space-y-12">
              <h2 className="text-5xl md:text-7xl text-white font-serif leading-none italic">A different kind <br />of logistics.</h2>
              <div className="h-1 w-24 bg-primary rounded-full"></div>
              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                Founded with a mission to bridge the gap between high-velocity tech and neighborhood grit. 
                TrueServe prioritizes the direct relationship between the gem on the corner and the driver down the street.
              </p>
              <div className="grid grid-cols-2 gap-12">
                 <div className="space-y-4">
                    <p className="text-4xl text-white font-serif">100%</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Local Driver Profitability Targeting</p>
                 </div>
                 <div className="space-y-4">
                    <p className="text-4xl text-white font-serif">0%</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Hidden Restaurant Commission fees</p>
                 </div>
              </div>
           </div>
           <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl aspect-[4/5] lg:aspect-auto lg:h-[700px]">
              <img src="/Users/lcking992/.gemini/antigravity/brain/6ab4212f-1910-4d39-a07f-8099fe107ea1/trueserve_local_community_food_1774363850535.png" alt="Local Food" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-transparent to-transparent"></div>
           </div>
        </div>
      </section>

      {/* CTA / Partnership Section */}
      <section className="container text-center py-48">
          <div className="max-w-4xl mx-auto space-y-12 bg-white/[0.03] border border-white/10 p-24 rounded-[4rem] shadow-3xl">
              <h2 className="text-5xl md:text-7xl text-white font-serif italic mb-8">Join the TrueServe Network.</h2>
              <p className="text-xl text-slate-400 font-semibold mb-12 max-w-2xl mx-auto uppercase tracking-tighter">Accelerate your growth. Reclaim your time. Support your neighborhood.</p>
              <div className="flex flex-wrap justify-center gap-8">
                <Link href="/merchant-signup" className="badge-solid-primary py-5 px-12 text-xs font-black shadow-primary/20">Become a Partner</Link>
                <Link href="/driver-signup" className="badge-solid-secondary py-5 px-12 text-xs font-black shadow-secondary/20">Sign up to Drive</Link>
              </div>
          </div>
      </section>

      <footer className="py-24 bg-[#080c14] border-t border-white/5 px-8">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex items-center gap-4">
             <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-xl" />
             <span className="font-serif text-slate-500 tracking-tight text-2xl uppercase italic">TrueServe LLC &copy; {new Date().getFullYear()}</span>
           </div>
           <div className="flex flex-wrap justify-center gap-x-16 gap-y-6 text-[11px] font-bold uppercase tracking-[0.4em] text-slate-600">
             <Link href="/restaurants" className="hover:text-primary transition-colors">Marketplace</Link>
             <Link href="/driver" className="hover:text-primary transition-colors">Driver Hub</Link>
             <Link href="/merchant" className="hover:text-primary transition-colors">Partner Portal</Link>
             <Link href="/admin" className="hover:text-white transition-colors">Internal Systems</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
