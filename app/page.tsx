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

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#080c14]/90 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="TrueServe Logo" className="w-9 h-9 rounded-xl" />
            <span className="text-xl font-black text-white tracking-tight font-serif">TrueServe</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <Link href="/restaurants" className="hover:text-white transition-colors">Order Food</Link>
            <Link href="/merchant" className="hover:text-white transition-colors">Restaurants</Link>
            <Link href="/driver" className="hover:text-white transition-colors">Drivers</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {userId ? (
            <div className="flex items-center gap-4">
              <NotificationBell userId={userId} />
              <ModeToggle />
              <Link href="/user/settings" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-[#448c89] border border-white/10 hover:bg-white/10 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link href="/merchant-signup" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors hidden sm:block">Join as Restaurant</Link>
              <Link href="/driver-signup" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors hidden sm:block">Become a Driver</Link>
              <ModeToggle />
              <Link href="/login" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Sign In</Link>
              <Link href="/restaurants" className="bg-[#448c89] hover:bg-[#3b7a77] text-white text-[10px] font-black uppercase tracking-widest py-2.5 px-6 rounded-full transition-all hover:-translate-y-px shadow-lg shadow-teal-900/30">Order Now</Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero_food_delivery.png"
            alt="Premium food delivery"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/50 to-[#080c14]/10" />
        </div>

        <div className="relative z-10 max-w-5xl text-center space-y-10">
          <div className="inline-block px-4 py-1.5 bg-[#448c89]/20 border border-[#448c89]/30 rounded-full text-[#448c89] text-[10px] font-bold uppercase tracking-[0.2em]">
            Now Serving South Carolina
          </div>
          <h1 className="text-6xl md:text-[90px] leading-[0.95] text-white font-serif max-w-4xl mx-auto drop-shadow-2xl">
            Order from local<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#448c89] to-[#f1a137]">restaurants near you</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-300 font-medium leading-relaxed">
            TrueServe LLC connects you with restaurants in your area. Browse menus, place orders, and track your delivery in real time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <div className="w-full max-w-lg">
              <LandingSearch />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/restaurants" className="bg-[#448c89] hover:bg-[#3b7a77] text-white text-[11px] font-black uppercase tracking-widest py-4 px-10 rounded-full transition-all hover:-translate-y-px shadow-lg shadow-teal-900/40">
              Order Now
            </Link>
            <Link href="/merchant-signup" className="border border-white/20 hover:border-white/40 text-white text-[11px] font-black uppercase tracking-widest py-4 px-10 rounded-full transition-all hover:bg-white/5">
              Partner With Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── EVERYTHING YOU NEED ─────────────────────────────────────────── */}
      <section className="container py-28">
        <div className="text-center mb-16 space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#448c89]">Platform</p>
          <h2 className="text-4xl md:text-6xl text-white font-serif">Everything you need to<br />order and deliver</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            TrueServe puts food ordering and delivery in one seamless platform. Find restaurants by location, manage orders as a merchant, or earn as a driver.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <Link href="/merchant-signup" className="bg-[#448c89] hover:bg-[#3b7a77] text-white text-[10px] font-black uppercase tracking-widest py-3.5 px-8 rounded-full transition-all hover:-translate-y-px shadow-lg shadow-teal-900/30">
              Join as Merchant
            </Link>
            <Link href="/driver-signup" className="bg-[#f1a137] hover:bg-[#e5952d] text-black text-[10px] font-black uppercase tracking-widest py-3.5 px-8 rounded-full transition-all hover:-translate-y-px shadow-lg shadow-amber-900/30">
              Sign Up as Driver
            </Link>
          </div>
        </div>

        {/* 3-column feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Restaurants",
              desc: "Manage orders, menus, and delivery schedules all in one place. Real-time updates keep you in control. Zero hidden commission fees.",
              link: "/merchant",
              cta: "Access Merchant Portal",
              img: "/merchant_section.png",
              accent: "#448c89",
            },
            {
              title: "Drivers",
              desc: "Track deliveries, earnings, and ratings in real time. Get paid for every trip completed on time. Earn 20–40% more with fair splits.",
              link: "/driver",
              cta: "Access Driver Portal",
              img: "/driver_section.png",
              accent: "#f1a137",
            },
            {
              title: "Community",
              desc: "Browse and order from restaurants near you. TrueServe shows what's available in your area, instantly. Flexible payment options.",
              link: "/restaurants",
              cta: "Browse Restaurants",
              img: "/community_section.png",
              accent: "#448c89",
            },
          ].map((item, i) => (
            <div key={i} className="group flex flex-col bg-white/[0.03] border border-white/5 rounded-[2rem] overflow-hidden hover:bg-white/[0.05] transition-all duration-500 shadow-2xl">
              <div className="h-56 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                />
              </div>
              <div className="p-10 space-y-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl text-white font-serif mb-3">{item.title}</h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">{item.desc}</p>
                </div>
                <Link
                  href={item.link}
                  className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest group-hover:gap-4 transition-all"
                  style={{ color: item.accent }}
                >
                  {item.cta} <span className="text-lg">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLATFORM FEATURES ───────────────────────────────────────────── */}
      <section className="bg-white/[0.02] border-y border-white/5 py-28">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#448c89]">Features</p>
            <h2 className="text-4xl md:text-5xl text-white font-serif">Location-based ordering,<br />built for South Carolina</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "📍",
                title: "Location-based ordering",
                desc: "Browse and order from restaurants near you. TrueServe shows what's available in your area, instantly.",
              },
              {
                icon: "🧾",
                title: "Merchant dashboard",
                desc: "Manage orders, menus, and delivery schedules all in one place. Real-time updates keep you in control.",
              },
              {
                icon: "💰",
                title: "Driver earnings portal",
                desc: "Track deliveries, earnings, and ratings in real time. Get paid for every trip completed on time.",
              },
              {
                icon: "📡",
                title: "Real-time order tracking",
                desc: "Follow your order from restaurant to door. Know exactly when your food arrives, every time.",
              },
              {
                icon: "💳",
                title: "Flexible payment options",
                desc: "Pay with card or cash at delivery. TrueServe supports the payment method that works for you.",
              },
              {
                icon: "🛟",
                title: "24/7 customer support",
                desc: "Questions about your order or account? Reach TrueServe support anytime through the app.",
              },
            ].map((feat, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.06] hover:border-[#448c89]/20 transition-all duration-300 group"
              >
                <div className="text-3xl mb-5">{feat.icon}</div>
                <h3 className="text-lg text-white font-serif mb-3">{feat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT / MISSION ─────────────────────────────────────────────── */}
      <section className="container py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#448c89] mb-4">About</p>
              <h2 className="text-5xl md:text-6xl text-white font-serif leading-none">
                Built by South Carolina<br />for food delivery
              </h2>
            </div>
            <div className="h-px w-20 bg-[#448c89]" />
            <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-xl">
              TrueServe LLC started with a simple mission: connect hungry customers with their favorite local restaurants through a platform that actually works. We handle the complexity so merchants, drivers, and customers can focus on what matters most.
            </p>
            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-2">
                <p className="text-4xl text-white font-serif">0%</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Hidden Commission Fees</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl text-white font-serif">100%</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Local Driver Profitability</p>
              </div>
            </div>
          </div>
          <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl aspect-[4/5] lg:h-[620px]">
            <img
              src="/hero_food_delivery.png"
              alt="Local food delivery"
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="bg-white/[0.02] border-y border-white/5 py-28">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto space-y-8 bg-white/[0.03] border border-white/10 p-16 md:p-20 rounded-[3rem] shadow-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#448c89]">Get Started</p>
            <h2 className="text-4xl md:text-6xl text-white font-serif">
              Start delivering or ordering<br />with TrueServe today
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
              Sign up as a merchant, driver, or customer. Fast setup, location-based ordering, and dedicated support to get you started.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                href="/merchant-signup"
                className="bg-[#448c89] hover:bg-[#3b7a77] text-white text-[10px] font-black uppercase tracking-widest py-4 px-10 rounded-full transition-all hover:-translate-y-px shadow-lg shadow-teal-900/30"
              >
                Sign Up as Merchant
              </Link>
              <Link
                href="/driver-signup"
                className="bg-[#f1a137] hover:bg-[#e5952d] text-black text-[10px] font-black uppercase tracking-widest py-4 px-10 rounded-full transition-all hover:-translate-y-px shadow-lg shadow-amber-900/30"
              >
                Sign Up as Driver
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="py-20 bg-[#080c14] border-t border-white/5 px-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            {/* Brand */}
            <div className="space-y-4 max-w-xs">
              <Link href="/" className="flex items-center gap-3">
                <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-xl" />
                <span className="font-serif text-white text-xl font-bold">TrueServe</span>
              </Link>
              <p className="text-slate-500 text-sm leading-relaxed">
                South Carolina's food delivery platform. Connecting customers, restaurants, and drivers.
              </p>
            </div>

            {/* Links grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 text-[11px] font-bold uppercase tracking-[0.2em]">
              <div className="space-y-4">
                <p className="text-white">Platform</p>
                <Link href="/" className="block text-slate-500 hover:text-white transition-colors">Home</Link>
                <Link href="/restaurants" className="block text-slate-500 hover:text-white transition-colors">Order Food</Link>
              </div>
              <div className="space-y-4">
                <p className="text-white">Partners</p>
                <Link href="/merchant" className="block text-slate-500 hover:text-white transition-colors">Merchant Portal</Link>
                <Link href="/merchant-signup" className="block text-slate-500 hover:text-white transition-colors">Join as Restaurant</Link>
              </div>
              <div className="space-y-4">
                <p className="text-white">Drivers</p>
                <Link href="/driver" className="block text-slate-500 hover:text-white transition-colors">Driver Hub</Link>
                <Link href="/driver-signup" className="block text-slate-500 hover:text-white transition-colors">Become a Driver</Link>
              </div>
              <div className="space-y-4">
                <p className="text-white">Company</p>
                <Link href="/login" className="block text-slate-500 hover:text-white transition-colors">Sign In</Link>
                <Link href="/admin" className="block text-slate-500 hover:text-white transition-colors">Internal</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-[11px] font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} TrueServe LLC. All rights reserved.
            </p>
            <p className="text-slate-600 text-[11px] font-bold uppercase tracking-widest">South Carolina, US</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
