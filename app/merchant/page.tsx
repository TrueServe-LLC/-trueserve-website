"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function MerchantLanding() {
  return (
    <div className="food-app-shell" style={{ minHeight: "100vh", background: "#09090c" }}>
      <nav className="food-app-nav">
        <Logo size="sm" />
        <div className="nav-links hidden md:flex">
          <Link href="/restaurants">Order Food</Link>
          <Link href="/driver">For Drivers</Link>
        </div>
        <div className="nav-r">
          <Link href="/merchant/login" className="btn btn-ghost">Sign In</Link>
        </div>
      </nav>

      <main className="food-app-main">
        {/* Hero */}
        <section style={{ padding: "64px 0 48px", textAlign: "center" }}>
          <p className="food-kicker" style={{ marginBottom: 16, color: "#f97316" }}>For Restaurant Partners</p>
          <h1 className="food-title" style={{ marginBottom: 20, maxWidth: 800, margin: "0 auto 20px" }}>
            Grow your restaurant<br /><span className="accent">with TrueServe</span>
          </h1>
          <p className="food-subtitle" style={{ maxWidth: 560, margin: "0 auto 36px", textAlign: "center" }}>
            Reach more local customers, manage orders in real time, and keep more of what you earn — no upfront cost to get started.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/merchant/signup" className="portal-btn-gold portal-btn-gold-block" style={{ width: "auto", padding: "14px 32px", fontSize: 14 }}>
              Partner With Us →
            </Link>
            <Link href="/merchant/login" className="portal-btn-outline portal-btn-outline-block" style={{ width: "auto", padding: "14px 28px", fontSize: 14 }}>
              Sign In
            </Link>
          </div>
        </section>

        {/* Feature cards */}
        <section className="grid gap-6 md:grid-cols-3" style={{ marginBottom: 56 }}>
          {[
            {
              icon: "💳",
              kicker: "No Setup Fees",
              title: "Zero upfront cost",
              desc: "Get your restaurant listed and receiving orders today. We only earn when you do — no monthly minimums, no contracts.",
            },
            {
              icon: "📊",
              kicker: "Real-Time Control",
              title: "Live order dashboard",
              desc: "See every order the moment it comes in, track prep timing, monitor your driver, and view daily revenue — all in one place.",
            },
            {
              icon: "🤝",
              kicker: "Fair Rates",
              title: "Transparent commission",
              desc: "Clear, flat commission rates with no hidden charges. Know exactly what you keep on every order before you accept.",
            },
          ].map((card) => (
            <div key={card.title} className="food-card" style={{ padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
              <p className="food-kicker" style={{ marginBottom: 8 }}>{card.kicker}</p>
              <h3 className="food-heading" style={{ fontSize: 26, marginBottom: 10 }}>{card.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.65)" }}>{card.desc}</p>
            </div>
          ))}
        </section>

        {/* How it works */}
        <section className="food-panel" style={{ marginBottom: 56, padding: 40 }}>
          <p className="food-kicker" style={{ marginBottom: 12 }}>How It Works</p>
          <h2 className="food-heading" style={{ marginBottom: 32 }}>Up and running <span className="accent">in minutes</span></h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: "01", title: "Apply online", desc: "Fill out a quick form with your restaurant info. We review and approve within 24 hours." },
              { step: "02", title: "Connect your POS", desc: "Sync with Toast, Square, or enter your menu manually. Your storefront goes live instantly." },
              { step: "03", title: "Start earning", desc: "Orders flow directly to your dashboard. Drivers are dispatched automatically. You get paid." },
            ].map((item) => (
              <div key={item.step} style={{ display: "flex", gap: 16 }}>
                <div style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 40, lineHeight: 1, color: "rgba(249,115,22,0.25)", flexShrink: 0, minWidth: 48 }}>{item.step}</div>
                <div>
                  <h4 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 20, letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff", marginBottom: 6 }}>{item.title}</h4>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.6)" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA banner */}
        <section style={{ textAlign: "center", padding: "40px 0 64px" }}>
          <h2 className="food-heading" style={{ marginBottom: 12 }}>Ready to grow?</h2>
          <p className="food-subtitle" style={{ maxWidth: 420, margin: "0 auto 28px" }}>
            Join local restaurants already serving their neighborhood through TrueServe.
          </p>
          <Link href="/merchant/signup" className="portal-btn-gold portal-btn-gold-block" style={{ width: "auto", display: "inline-flex", padding: "16px 40px", fontSize: 15 }}>
            Get Started — It&apos;s Free
          </Link>
        </section>

        <footer className="mt-4 border-t border-white/5 px-2 pt-8 pb-10 text-center">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-4">
            <Logo size="md" />
            <div className="flex items-center gap-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/driver" className="hover:text-[#f97316] transition-colors">For Drivers</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              © {new Date().getFullYear()} TrueServe · Bringing local flavor to your doorstep.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
