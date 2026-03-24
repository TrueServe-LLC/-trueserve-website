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
        <section className="max-w-5xl w-full flex flex-col items-center gap-12 mb-32 md:mb-56">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/[0.05] border border-white/10 rounded-full text-white text-[10px] md:text-xs font-black uppercase tracking-widest shadow-2xl leading-relaxed backdrop-blur-sm animate-fade-in mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Join the TrueServe Network
            </div>
            
            <h1 className="text-6xl md:text-[140px] font-black text-white italic tracking-tighter leading-[0.85] animate-fade-in stagger-1 px-4 text-center">
              Find <span className="text-primary italic">Foods.</span> <br />
              <span className="text-[0.6em] md:text-[0.5em] text-white/90">Your way.</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-400 font-medium italic leading-relaxed max-w-2xl animate-fade-in stagger-2 mt-8 text-center">
              Hyper-efficient routing that keeps food hot and fees low. <br />
              Grow with us. Engineered for the neighborhood gems.
            </p>
            
            <div className="w-full max-w-2xl animate-fade-in stagger-3 mt-16 flex flex-col items-center">
               <LandingSearch />
               
               <div className="flex flex-col sm:flex-row items-center justify-center gap-12 mt-20">
                    <Link href="/driver-signup" className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">
                        <span>Become a Driver</span>
                        <div className="w-8 h-px bg-white/10 group-hover:w-16 group-hover:bg-emerald-500 transition-all duration-500"></div>
                    </Link>
                    <Link href="/merchant-signup" className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">
                        <span>Partner Merchant</span>
                        <div className="w-8 h-px bg-white/10 group-hover:w-16 group-hover:bg-primary transition-all duration-500"></div>
                    </Link>
               </div>
            </div>
        </section>

        {/* Feature UI Mockup Section */}
        <section className="w-full max-w-7xl mb-64 animate-fade-in stagger-5 px-4">
             <div className="relative rounded-[4rem] overflow-hidden border border-white/10 shadow-3xl transition-all duration-1000 group bg-white/[0.02]">
                <div className="md:h-[600px] w-full overflow-hidden">
                    <HeroCarousel />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-12 left-12 md:bottom-24 md:left-24 text-left max-w-2xl z-10 px-2">
                    <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full inline-block mb-6 backdrop-blur-md">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">OPERATIONAL UPDATE</p>
                    </div>
                    <h3 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter leading-none mb-6 px-2">Live in the <br />South Corridor.</h3>
                    <p className="text-slate-400 font-bold italic text-lg leading-relaxed max-w-md px-2">Connecting Charlotte, Greenville, and Spartanburg with elite logistics.</p>
                </div>
             </div>
        </section>

        {/* Path Selection Grid */}
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 mb-64">
             <Link href="/driver" className="group relative aspect-square md:aspect-auto md:h-[600px] overflow-hidden rounded-[4rem] border border-white/10 shadow-3xl">
                <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200" className="w-full h-full object-cover grayscale opacity-20 group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                <div className="absolute bottom-16 left-16 right-16 text-left">
                    <h3 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-6 px-2 lowercase leading-none">fleet entry hub.</h3>
                    <p className="text-slate-400 font-bold italic text-lg mb-10 max-w-sm px-2">Earn more with fair splits and high-velocity routing.</p>
                    <div className="inline-flex items-center gap-3 badge-emerald py-4 px-10 text-[10px] tracking-widest !rounded-full">Apply to Hub →</div>
                </div>
             </Link>

             <Link href="/merchant" className="group relative aspect-square md:aspect-auto md:h-[600px] overflow-hidden rounded-[4rem] border border-white/10 shadow-3xl">
                <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200" className="w-full h-full object-cover grayscale opacity-20 group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                <div className="absolute bottom-16 left-16 right-16 text-left">
                    <h3 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-6 px-2 lowercase leading-none">partner architect.</h3>
                    <p className="text-slate-400 font-bold italic text-lg mb-10 max-w-sm px-2">Reclaim your margin. Zero commission marketplace protocols.</p>
                    <div className="inline-flex items-center gap-3 badge-outline-white py-4 px-10 text-[10px] tracking-widest !rounded-full">Join Network →</div>
                </div>
             </Link>
        </div>

        {/* Value Prop Ecosystem */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-32 px-8 max-w-7xl w-full text-left pt-32 border-t border-white/5">
          {[
              { icon: '💰', title: 'Transparent Splits', desc: 'No hidden fees. We show exactly what the driver keeps on every order.' },
              { icon: '🧭', title: 'Elite Dispatch', desc: 'Hyper-efficient routing that keeps food hot and delivery fees low.' },
              { icon: '💎', title: 'Purely Local', desc: 'Built for the neighborhood gems, not just the global chains.' }
          ].map((row, i) => (
             <div key={i} className="space-y-8 group">
                <div className="w-20 h-20 bg-white/[0.03] border border-white/5 rounded-[2rem] flex items-center justify-center text-4xl shadow-xl group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-500 group-hover:scale-110">{row.icon}</div>
                <h3 className="text-3xl font-black text-white italic tracking-tight px-1">{row.title}</h3>
                <p className="text-slate-500 text-lg font-medium leading-relaxed italic">{row.desc}</p>
             </div>
          ))}
        </section>
      </main>

      <footer className="py-24 bg-black border-t border-white/5 text-center px-4">
        <div className="container max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex items-center gap-4">
             <img src="/logo.png" alt="Logo" className="w-12 h-12 border border-white/10 rounded-full shadow-2xl" />
             <span className="font-black text-slate-500 tracking-tighter text-2xl italic uppercase">TrueServe Hub &copy; {new Date().getFullYear()}</span>
           </div>
           <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-[11px] font-black uppercase tracking-[0.4em] text-slate-600">
             <Link href="/restaurants" className="hover:text-primary transition-colors italic">Find Food</Link>
             <Link href="/driver" className="hover:text-emerald-400 transition-colors italic">Drive</Link>
             <Link href="/merchant" className="hover:text-primary transition-colors italic">Merchant</Link>
             <Link href="/admin" className="hover:text-white transition-colors italic">Internal</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
