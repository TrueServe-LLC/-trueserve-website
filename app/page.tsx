export const dynamic = "force-dynamic";

import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import LandingSearch from "@/components/LandingSearch";
import NotificationBell from "@/components/NotificationBell";
import LogoutButton from "@/components/LogoutButton";
import { cookies } from "next/headers";
import EmergencyBanner from "@/components/EmergencyBanner";

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-slate-200 bg-black">
      <EmergencyBanner />
      {/* Background Decor */}
      <div className="blob bg-secondary w-[500px] h-[500px] top-[-200px] right-[-100px] opacity-10" />
      <div className="blob bg-primary w-[300px] h-[300px] bottom-[10%] left-[-100px] opacity-10" />

      {/* Top Utility Bar */}
      <div className="bg-slate-900/50 border-b border-white/5 px-4 md:px-6 py-2">
        <div className="container flex justify-end gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
           <Link href="/driver" className="hover:text-emerald-400 transition-colors">Become a Driver</Link>
           <Link href="/merchant" className="hover:text-blue-400 transition-colors">Partner with Us</Link>
           {!userId && <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>}
        </div>
      </div>

      <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 px-4 md:px-6 py-3 md:py-4">
        <div className="container flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="TrueServe Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 group-hover:border-primary transition-all shadow-lg backdrop-blur-sm" />
            <span className="text-xl md:text-2xl font-black tracking-tight text-white">
              True<span className="text-primary">Serve</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 md:gap-4">
            {userId && <LogoutButton />}
            {userId && <NotificationBell userId={userId} />}
            {userId && (
              <Link href="/user/settings" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 hover:border-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </Link>
            )}
            <Link href="/restaurants" className="btn btn-primary !py-2 !px-5 !text-sm shadow-none hover:shadow-lg transition-all hover:bg-emerald-500 hover:text-white rounded-xl font-bold">
              Order Food
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="container py-8 md:py-24 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 text-center md:text-left space-y-6 animate-fade-in w-full px-2">
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight py-4">
              Cravings meet <br className="hidden md:block" />
              <span className="text-gradient">Lightning Speed.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 font-medium max-w-lg mx-auto md:mx-0 pb-6">
              Get the best local food delivered fast. Or pickup and skip the line.
            </p>
            
            <div className="flex flex-col gap-6 justify-center md:justify-start w-full transition-all bg-white/[0.03] p-4 md:p-6 rounded-[2rem] border border-white/10 shadow-2xl max-w-2xl mx-auto md:mx-0">
              


              {/* Seamless Address Bar */}
              <div className="relative group w-full mt-2">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <LandingSearch />
              </div>
            </div>
          </div>

          <div className="flex-1 relative w-full mt-4 md:mt-0 px-2 lg:px-0">
            <div className="relative z-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <HeroCarousel />
            </div>
          </div>
        </section>

        {/* Triple Path Split - High Visibility Section */}
        <section className="container py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
             {/* Driver Path */}
             <div className="flex flex-col items-center md:items-start text-center md:text-left group cursor-pointer active:scale-95 transition-transform duration-300">
                <Link href="/driver" className="badge-solid-primary">
                    Become a Driver
                </Link>
             </div>

             {/* Merchant Path */}
             <div className="flex flex-col items-center md:items-start text-center md:text-left group cursor-pointer active:scale-95 transition-transform duration-300">
                <Link href="/merchant" className="badge-subtle-white">
                    Become a Merchant
                </Link>
             </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="py-24 border-t border-white/5">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="text-3xl">💰</div>
                <h3 className="text-xl font-bold text-white">Transparent Splits</h3>
                <p className="text-slate-500 text-sm font-medium">No hidden fees. We show exactly what the driver keeps on every order.</p>
              </div>
              <div className="space-y-4">
                <div className="text-3xl">🧭</div>
                <h3 className="text-xl font-bold text-white">Elite Dispatch</h3>
                <p className="text-slate-500 text-sm font-medium">Hyper-efficient routing that keeps food hot and delivery fees low.</p>
              </div>
              <div className="space-y-4">
                <div className="text-3xl">🌱</div>
                <h3 className="text-xl font-bold text-white">Purely Local</h3>
                <p className="text-slate-500 text-sm font-medium">TrueServe is built for the neighborhood gems, not just the global chains.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer py-24 bg-black border-t border-white/5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex items-center gap-2">
             <img src="/logo.png" alt="Logo" className="w-8 h-8 opacity-50" />
             <span className="font-black text-slate-500 tracking-tighter">TrueServe &copy; {new Date().getFullYear()}</span>
           </div>
           <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600">
             <Link href="/restaurants" className="hover:text-primary transition-colors">Find Food</Link>
             <Link href="/driver" className="hover:text-emerald-400 transition-colors">Drive</Link>
             <Link href="/merchant" className="hover:text-blue-400 transition-colors">Merchant</Link>
             <Link href="/admin" className="hover:text-white transition-colors">Internal</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
