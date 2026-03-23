export const dynamic = "force-dynamic";

import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import LandingSearch from "@/components/LandingSearch";
import NotificationBell from "@/components/NotificationBell";
import LogoutButton from "@/components/LogoutButton";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-slate-200 bg-black">
      {/* Background Decor */}
      <div className="blob bg-secondary w-[500px] h-[500px] top-[-200px] right-[-100px] opacity-10" />
      <div className="blob bg-primary w-[300px] h-[300px] bottom-[10%] left-[-100px] opacity-10" />

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
          {!userId && (
            <div className="hidden lg:flex items-center gap-6 mr-6">
              <Link href="/driver" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-400 transition-colors">Become a Driver</Link>
              <Link href="/merchant" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-400 transition-colors">For Merchants</Link>
            </div>
          )}
          <Link href="/restaurants" className="btn btn-primary !py-1.5 md:!py-2 !px-3 md:!px-6 !text-[10px] md:!text-sm shadow-none hover:shadow-lg hover:shadow-primary/20 whitespace-nowrap uppercase tracking-widest font-black">
            {userId ? (
              <span className="hidden xs:inline">Browse Food</span>
            ) : (
              <span className="xs:hidden">Shop</span>
            )}
            {!userId && (
              <span className="hidden xs:inline">Order Now</span>
            )}
            {userId && (
              <span className="xs:hidden">Browse</span>
            )}
          </Link>
        </div>
      </div>
    </nav>

      <main>
      {/* Hero Section */}
      <section className="container py-8 md:py-32 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-1 text-center md:text-left space-y-6 md:space-y-8 animate-fade-in w-full px-2">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.05] border border-white/10 rounded-full text-white text-[10px] md:text-xs font-black uppercase tracking-widest shadow-2xl backdrop-blur-sm mb-4">
            <span>Premium Delivery Service</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-serif font-bold text-white leading-relaxed tracking-tight py-4">
            Cravings meet <br className="hidden md:block" />
            <span className="text-gradient">Lightning Speed.</span>
          </h1>
          <p className="text-base md:text-xl text-slate-400 max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
            The freshest food delivery.
            Zero hidden fees, transparent driver pay, and purely local flavor.
          </p>

          <div className="flex flex-col gap-8 justify-center md:justify-start w-full transition-all">
            <div className="relative group w-full max-w-2xl mx-auto md:mx-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-400 rounded-2xl md:rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
              <LandingSearch />
            </div>

            {!userId && (
              <div className="flex flex-wrap gap-4 w-full max-w-lg justify-center md:justify-start">
                <Link href="/restaurants" className="flex-1 min-w-[140px] btn btn-primary !py-3 !px-6 text-sm font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-105 transition-all text-center">
                  Order Food
                </Link>
                <Link href="/driver" className="flex-1 min-w-[140px] btn bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 !py-3 !px-6 text-sm font-black uppercase tracking-widest rounded-xl transition-all text-center">
                  Drive
                </Link>
                <Link href="/merchant" className="flex-1 min-w-[140px] btn bg-white/5 border border-white/10 hover:bg-white/10 text-white !py-3 !px-6 text-sm font-black uppercase tracking-widest rounded-xl transition-all text-center">
                  Merchant
                </Link>
              </div>
            )}
          </div>

          {/* Mobile-Only Dual Path Selection */}
          <div className="grid grid-cols-2 gap-3 mt-4 md:hidden">
            <Link href="/restaurants" className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl active:scale-95 transition-all">
              <div className="text-2xl">🍔</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Browse Food</span>
            </Link>
            <Link href="/driver" className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl active:scale-95 transition-all">
              <div className="text-2xl">🛵</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Join Fleet</span>
            </Link>
          </div>
        </div>

        <div className="flex-1 relative w-full mt-4 md:mt-0 px-2 lg:px-0">
          <div className="relative z-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <HeroCarousel />
          </div>
          {/* Floating Badge */}
          <div className="hidden md:flex absolute md:top-10 md:-right-4 mt-6 md:mt-0 mx-auto w-max bg-slate-800/90 backdrop-blur-md p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl z-20 animate-bounce border border-white/10 items-center" style={{ animationDuration: '3s' }}>
            <span className="text-xl md:text-2xl">🔥</span>
            <span className="font-bold text-white ml-2 text-sm md:text-base">Hot & Fresh</span>
          </div>
        </div>
      </section>


      {/* Mission Statement */}
      <section className="py-12 md:py-16">
        <div className="container text-center max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">Our Mission</h2>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium italic">
            "TrueServe is a driver-first delivery marketplace that pays
            couriers 25–40% more than competitors while lowering restaurant commissions and
            simplifying customer pricing. Our model focuses on fair earnings, transparent
            fees, and smarter logistics."
          </p>
        </div>
      </section>



      {/* Features Section */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="card p-8 hover:bg-white/5 transition-colors border border-white/10 bg-white/5 rounded-3xl">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white/5 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-sm mb-6 border border-white/10">💰</div>
              <h3 className="text-lg md:text-xl font-bold mb-3 text-white">Transparent Pricing</h3>
              <p className="text-sm md:text-base text-slate-400 leading-relaxed">Know exactly where your money goes. We show the driver split on every single order.</p>
            </div>
            <div className="card p-8 hover:bg-white/5 transition-colors border border-white/10 bg-white/5 rounded-3xl">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white/5 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-sm mb-6 border border-white/10">🧭</div>
              <h3 className="text-lg md:text-xl font-bold mb-3 text-white">Live GPS Tracking</h3>
              <p className="text-sm md:text-base text-slate-400 leading-relaxed">Watch your courier move in real-time. No more "arriving soon" guessing games.</p>
            </div>
            <div className="card p-8 hover:bg-white/5 transition-colors border border-white/10 bg-white/5 rounded-3xl">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white/5 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-sm mb-6 border border-white/10">🌱</div>
              <h3 className="text-lg md:text-xl font-bold mb-3 text-white">Local First</h3>
              <p className="text-sm md:text-base text-slate-400 leading-relaxed">We partner exclusively with local gems, not just big chains. Support your neighborhood.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Triple Path */}
      <section className="container py-24 hidden md:block">
        <div className="grid grid-cols-3 gap-8">
          {/* Customer CTA */}
          <div className="bg-slate-900/50 rounded-[3rem] p-12 text-center relative overflow-hidden border border-white/10 group hover:border-primary/50 transition-all shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay group-hover:opacity-20 transition-opacity"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-6">Hungry?</h2>
              <p className="text-slate-400 mb-8 max-w-xs mx-auto text-sm">Get your favorite local food delivered fast with transparent pricing.</p>
              <Link href="/restaurants" className="btn btn-primary px-8 py-3 text-sm text-black font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                Order Food
              </Link>
            </div>
          </div>

          {/* Driver CTA */}
          <div className="bg-slate-900/50 rounded-[3rem] p-12 text-center relative overflow-hidden border border-white/10 group hover:border-emerald-500/50 transition-all shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay group-hover:opacity-20 transition-opacity"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-6">Drive.</h2>
              <p className="text-slate-400 mb-8 max-w-xs mx-auto text-sm">Earn 25-40% more than other platforms with fair, distance-based pay.</p>
              <Link href="/driver" className="btn bg-emerald-500 text-black hover:scale-105 border-none px-8 py-3 text-sm font-black uppercase tracking-widest transition-all">
                Join Fleet
              </Link>
            </div>
          </div>

          {/* Merchant CTA */}
          <div className="bg-slate-900/50 rounded-[3rem] p-12 text-center relative overflow-hidden border border-white/10 group hover:border-blue-500/50 transition-all shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay group-hover:opacity-20 transition-opacity"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-6">Grow.</h2>
              <p className="text-slate-400 mb-8 max-w-xs mx-auto text-sm">Zero hidden fees and a digital storefront that respects your local margins.</p>
              <Link href="/merchant" className="btn bg-blue-600 text-white hover:scale-105 border-none px-8 py-3 text-sm font-black uppercase tracking-widest transition-all">
                Partner Up
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main><footer className="bg-black/20 py-12 border-t border-white/5 mt-12 pb-32 md:pb-12">
        <div className="container flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm px-6">
          <p>&copy; {new Date().getFullYear()} TrueServe Inc.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6 md:mt-0 justify-center md:justify-end">
            <Link href="/legal#privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/legal#terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/admin" className="hover:text-primary transition-colors">Admin</Link>
            <Link href="/merchant" className="hover:text-primary transition-colors">Merchant</Link>
            <Link href="/driver" className="hover:text-primary transition-colors">Driver</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
