export const dynamic = "force-dynamic";

import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import LandingSearch from "@/components/LandingSearch";
import NotificationBell from "@/components/NotificationBell";
import LogoutButton from "@/components/LogoutButton";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-slate-200 bg-black">
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
            <Link href="/restaurants" className="btn btn-primary !py-1.5 md:!py-2 !px-3 md:!px-6 !text-[10px] md:!text-sm shadow-none hover:shadow-lg hover:shadow-primary/20 whitespace-nowrap uppercase tracking-widest font-black">
              Order Food Now
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="container py-8 md:py-24 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 text-center md:text-left space-y-6 md:space-y-8 animate-fade-in w-full px-2">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.05] border border-white/10 rounded-full text-white text-[10px] md:text-xs font-black uppercase tracking-widest shadow-2xl backdrop-blur-sm mb-4">
              <span>Premium Delivery Service</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-serif font-bold text-white leading-relaxed tracking-tight py-4">
              Cravings meet <br className="hidden md:block" />
              <span className="text-gradient">Lightning Speed.</span>
            </h1>
            
            <div className="flex flex-col gap-8 justify-center md:justify-start w-full transition-all">
              <div className="relative group w-full max-w-2xl mx-auto md:mx-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-400 rounded-2xl md:rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <LandingSearch />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl">
                <Link href="/restaurants" className="p-4 md:p-6 bg-primary/10 border border-primary/20 rounded-3xl hover:bg-primary/20 transition-all group overflow-hidden relative">
                   <div className="absolute -right-4 -bottom-4 text-4xl opacity-10 group-hover:scale-110 transition-transform">🍔</div>
                   <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-primary mb-1">Customer</h3>
                   <p className="text-slate-400 text-[10px]">Order Food</p>
                </Link>
                <Link href="/driver" className="p-4 md:p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl hover:bg-emerald-500/20 transition-all group overflow-hidden relative">
                   <div className="absolute -right-4 -bottom-4 text-4xl opacity-10 group-hover:scale-110 transition-transform">🛵</div>
                   <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-emerald-400 mb-1">Driver</h3>
                   <p className="text-slate-400 text-[10px]">Earn with Us</p>
                </Link>
                <Link href="/merchant" className="p-4 md:p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl hover:bg-blue-500/20 transition-all group overflow-hidden relative col-span-2 lg:col-span-1">
                   <div className="absolute -right-4 -bottom-4 text-4xl opacity-10 group-hover:scale-110 transition-transform">🏢</div>
                   <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-400 mb-1">Merchant</h3>
                   <p className="text-slate-400 text-[10px]">Grow Your Business</p>
                </Link>
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
             {/* Driver Card */}
             <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-12 relative overflow-hidden group hover:border-emerald-500/30 transition-all shadow-2xl">
                <div className="absolute top-0 right-0 p-8 text-8xl opacity-5 pointer-events-none group-hover:scale-110 transition-transform grayscale">🛵</div>
                <h2 className="text-4xl font-black text-white mb-6 italic tracking-tighter">Drive Your Income.</h2>
                <p className="text-slate-400 mb-10 max-w-sm font-medium leading-relaxed">Earn more with fair splits and clear payouts on every delivery.</p>
                <Link href="/driver" className="btn bg-emerald-500 text-black px-10 py-4 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-emerald-500/20">
                  Become a Driver
                </Link>
             </div>

             {/* Merchant Card */}
             <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-12 relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-2xl">
                <div className="absolute top-0 right-0 p-8 text-8xl opacity-5 pointer-events-none group-hover:scale-110 transition-transform grayscale">🏬</div>
                <h2 className="text-4xl font-black text-white mb-6 italic tracking-tighter">Scale Your Kitchen.</h2>
                <p className="text-slate-400 mb-10 max-w-sm font-medium leading-relaxed">Lower fees, better visibility, and a loyal local customer base.</p>
                <Link href="/merchant" className="btn bg-blue-600 text-white px-10 py-4 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-600/20">
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
                <h3 className="text-xl font-bold text-white italic">Transparent Splits</h3>
                <p className="text-slate-500 text-sm font-medium">No hidden fees. We show exactly what the driver keeps on every order.</p>
              </div>
              <div className="space-y-4">
                <div className="text-3xl">🧭</div>
                <h3 className="text-xl font-bold text-white italic">Elite Dispatch</h3>
                <p className="text-slate-500 text-sm font-medium">Hyper-efficient routing that keeps food hot and delivery fees low.</p>
              </div>
              <div className="space-y-4">
                <div className="text-3xl">🌱</div>
                <h3 className="text-xl font-bold text-white italic">Purely Local</h3>
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
