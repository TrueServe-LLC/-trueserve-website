export const dynamic = "force-dynamic";

import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
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
    <div className="min-h-screen relative overflow-hidden font-sans text-slate-200 bg-black">
      <EmergencyBanner />
      
      {/* Background Decor */}
      <div className="blob bg-secondary w-[500px] h-[500px] top-[-200px] right-[-100px] opacity-10" />
      <div className="blob bg-primary w-[300px] h-[300px] bottom-[10%] left-[-100px] opacity-10" />

      {/* Standardized Linear Top-Nav */}
      <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="TrueServe Logo" className="w-8 h-8 rounded-full border border-white/10 shadow-lg" />
            <span className="text-xl font-black tracking-tighter text-white">True<span className="text-primary">Serve</span></span>
          </Link>
          <div className="hidden md:block h-6 w-px bg-white/10 mx-2"></div>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/restaurants" className="badge-subtle-primary text-[10px] py-1.5 border-none">🍴 Order Food</Link>
            <Link href="/driver" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 transition-colors">🛵 Drive</Link>
            <Link href="/merchant" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 transition-colors">📊 Partner</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {userId ? (
            <div className="flex items-center gap-3">
              <NotificationBell userId={userId} />
              <ModeToggle />
              <Link href="/user/settings" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10 hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-4">
               <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Sign In</Link>
               <ModeToggle />
               <Link href="/restaurants" className="badge-solid-primary py-2 px-6 text-[10px] font-black shadow-lg shadow-primary/10">Start Order</Link>
            </div>
          )}
        </div>
      </nav>

      <main className="container py-12 md:py-32 px-4 md:px-8 pb-48 text-center flex flex-col items-center">
        {/* Centered High-Impact Hero Section */}
        <section className="max-w-5xl w-full flex flex-col items-center gap-12 mb-40">
            {/* The "Sub-Pill" Label above H1 */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/[0.05] border border-white/10 rounded-full text-white text-[10px] md:text-xs font-black uppercase tracking-widest shadow-2xl leading-relaxed backdrop-blur-sm animate-fade-in mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Join the TrueServe Network
            </div>
            
            <h1 className="text-6xl md:text-[140px] font-black text-white italic tracking-tighter leading-[0.85] animate-fade-in stagger-1">
              Find <span className="text-primary italic">Foods.</span> <br />
              <span className="text-[0.6em] md:text-[0.5em] text-white/90">Your way.</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-400 font-medium italic leading-relaxed max-w-2xl animate-fade-in stagger-2 mt-8">
              Hyper-efficient routing that keeps food hot and fees low. <br />
              Grow with us. Engineered for the neighborhood gems.
            </p>
            
            <div className="w-full max-w-3xl animate-fade-in stagger-3 mt-12">
              <div className="relative group mb-12">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-400 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl p-2 md:p-3">
                   <LandingSearch />
                </div>
              </div>
              
              {/* High-Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <Link href="/driver-signup" className="btn-standard py-5 min-w-[240px]">Become a Driver →</Link>
                        <Link href="/merchant-signup" className="px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] border-b border-white/20 hover:border-white transition-all text-white">Become a Merchant</Link>
                    </div>
            </div>
        </section>

        {/* Feature UI Mockup Section */}
        <section className="w-full max-w-6xl mb-48 animate-fade-in stagger-5">
             <div className="relative rounded-[4rem] overflow-hidden border border-white/10 shadow-3xl group transition-all duration-1000 scale-[1.02] hover:scale-100">
                <HeroCarousel />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-16 left-16 text-left max-w-md">
                    <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full inline-block mb-6 backdrop-blur-md">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">NOW LIVE</p>
                    </div>
                    <h3 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter leading-none mb-6">Operational in the <br />South Corridor.</h3>
                    <p className="text-slate-400 font-bold italic text-lg leading-relaxed">Connecting Charlotte, Greenville, and Spartanburg with elite logistics.</p>
                </div>
             </div>
        </section>

        {/* Triple Path Selection (High-End Reference Cards) */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 mb-48">
             <Link href="/driver" className="group relative aspect-video md:aspect-auto md:h-[500px] overflow-hidden rounded-[3.5rem] border border-white/10 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover grayscale opacity-20 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                <div className="absolute bottom-12 left-12 right-12 text-left">
                    <h3 className="text-4xl font-black text-white italic tracking-tighter mb-4">Drive with TrueServe.</h3>
                    <p className="text-slate-400 font-medium mb-8">Earn more with fair splits and efficient routing.</p>
                    <div className="badge-emerald py-3 px-8 text-[11px]">Get Started</div>
                </div>
             </Link>

             <Link href="/merchant" className="group relative aspect-video md:aspect-auto md:h-[500px] overflow-hidden rounded-[3.5rem] border border-white/10 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover grayscale opacity-20 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                <div className="absolute bottom-12 left-12 right-12 text-left">
                    <h3 className="text-4xl font-black text-white italic tracking-tighter mb-4">Partner Your Brand.</h3>
                    <p className="text-slate-500 font-medium mb-8">Reclaim your margin. zero commission protocols.</p>
                    <div className="badge-outline-white py-3 px-8 text-[11px]">Partner Hub</div>
                </div>
             </Link>
        </div>

        {/* Value Prop Ecosystem */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 px-8 max-w-6xl w-full text-left pt-24 border-t border-white/5">
          {[
              { icon: '💰', title: 'Transparent Splits', desc: 'No hidden fees. We show exactly what the driver keeps on every order.' },
              { icon: '🧭', title: 'Elite Dispatch', desc: 'Hyper-efficient routing that keeps food hot and delivery fees low.' },
              { icon: '💎', title: 'Purely Local', desc: 'Built for the neighborhood gems, not just the global chains.' }
          ].map((row, i) => (
             <div key={i} className="space-y-6 group">
                <div className="w-20 h-20 bg-white/[0.03] border border-white/5 rounded-3xl flex items-center justify-center text-4xl shadow-xl group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">{row.icon}</div>
                <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tight">{row.title}</h3>
                <p className="text-slate-500 text-lg font-medium leading-relaxed">{row.desc}</p>
             </div>
          ))}
        </section>
      </main>

      <footer className="py-24 bg-black border-t border-white/5 text-center">
        <div className="container max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex items-center gap-3">
             <img src="/logo.png" alt="Logo" className="w-12 h-12 border border-white/10 rounded-full" />
             <span className="font-black text-slate-500 tracking-tighter text-2xl">TrueServe Hub &copy; {new Date().getFullYear()}</span>
           </div>
           <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-600">
             <Link href="/restaurants" className="hover:text-primary transition-colors">Find Food</Link>
             <Link href="/driver" className="hover:text-emerald-400 transition-colors">Drive</Link>
             <Link href="/merchant" className="hover:text-primary transition-colors">Merchant</Link>
             <Link href="/admin" className="hover:text-white transition-colors">Internal</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
