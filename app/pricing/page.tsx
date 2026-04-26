import Link from "next/link";
import Logo from "@/components/Logo";
import { Check, Minus, ArrowRight, Zap, Crown } from "lucide-react";

const PLANS = [
  {
    name: "Flex Options",
    tagline: "Starter",
    price: "0%",
    priceSub: "commission",
    sub: "Pay only per transaction — no monthly fee",
    color: "#3dd68c",
    badge: null,
    icon: Zap,
    cta: "Get Started Free",
    href: "/merchant/signup",
    features: [
      "Zero monthly fees",
      "Zero commission on orders",
      "Public restaurant storefront page",
      "Real-time order management",
      "Basic prep time controls",
      "Customer ratings visible",
      "Standard support",
    ],
    notIncluded: [
      "POS integration",
      "AutoPilot busy management",
      "Multi-location dashboard",
      "Dedicated account manager",
    ],
  },
  {
    name: "Pro",
    tagline: "Growth",
    price: "$49",
    priceSub: "/ month",
    sub: "Everything in Flex Options, plus",
    color: "#f97316",
    badge: "Best for Growth",
    icon: Crown,
    cta: "Start Free Trial",
    href: "/merchant/signup?plan=pro",
    features: [
      "Everything in Flex Options",
      "POS integration (Toast, Square, Clover)",
      "AutoPilot busy-window management",
      "Advanced prep timing controls",
      "Priority order routing",
      "GHL booking widget embed",
      "Compliance score dashboard",
      "Multi-location dashboard",
      "Dedicated account manager",
    ],
    notIncluded: [],
  },
];

const COMPARE = [
  { name: "DoorDash",   commission: "15–30%", fee: "$0",       contract: false },
  { name: "Uber Eats",  commission: "15–30%", fee: "$0",       contract: false },
  { name: "GrubHub",    commission: "15–30%", fee: "$0",       contract: false },
  { name: "TrueServe",  commission: "0%",     fee: "$0–$49",   contract: false, highlight: true },
];

const FAQS = [
  { q: "Is there really zero commission?",   a: "Yes. TrueServe does not take a percentage of your orders. You keep everything your customers pay for food." },
  { q: "How do I get paid?",                 a: "Payouts go directly to your Stripe account. Setup takes about 5 minutes and funds typically arrive within 2 business days." },
  { q: "Can I switch plans later?",          a: "Yes — upgrade or downgrade anytime from your dashboard. Changes take effect immediately, no penalty." },
  { q: "What POS systems are supported?",    a: "Toast, Square, and Clover on the Pro plan. More integrations are being added during our pilot phase." },
  { q: "Is there a contract?",               a: "No contracts, no lock-ins. Cancel anytime." },
  { q: "What markets are you in?",           a: "Currently live in Pineville, NC and Rock Hill, SC — expanding soon." },
];

export default function PricingPage() {
  return (
    <div className="food-app-shell">
      <nav className="food-app-nav">
        <Logo size="sm" />
        <div className="nav-links hidden md:flex">
          <Link href="/restaurants">Order Food</Link>
          <Link href="/merchant/signup">For Merchants</Link>
        </div>
        <div className="flex gap-2">
          <Link href="/merchant/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/merchant/signup" className="btn btn-gold">Get Started</Link>
        </div>
      </nav>

      <main className="food-app-main">

        {/* ── HERO ── */}
        <section className="food-panel relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.2),transparent_60%)]" />
          <div className="relative z-10 text-center max-w-3xl mx-auto py-6">
            <p className="food-kicker mb-4">Merchant Pricing</p>
            <h1 className="food-heading" style={{ fontSize: "clamp(48px, 8vw, 88px)", lineHeight: 0.92 }}>
              Keep every dollar<br /><span className="accent">you earn.</span>
            </h1>
            <p className="food-subtitle mt-5 mx-auto" style={{ maxWidth: 520 }}>
              No commissions. No hidden fees. TrueServe makes money when you grow — not by taking a cut of every order.
            </p>
            <div className="food-chip-row mt-6 justify-center">
              <div className="food-chip"><span className="food-chip-dot" />0% commission</div>
              <div className="food-chip"><span className="food-chip-dot" />No contracts</div>
              <div className="food-chip"><span className="food-chip-dot" />Cancel anytime</div>
              <div className="food-chip"><span className="food-chip-dot" />Live in minutes</div>
            </div>
          </div>
        </section>

        {/* ── PLAN CARDS ── */}
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <article
                key={plan.name}
                className="food-panel relative overflow-hidden flex flex-col"
                style={{ border: `1px solid ${plan.color}35` }}
              >
                <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at top right, ${plan.color}12, transparent 55%)` }} />

                {plan.badge && (
                  <span
                    className="absolute top-6 right-6 text-[10px] font-black uppercase tracking-[0.14em] rounded-full px-3 py-1"
                    style={{ background: `${plan.color}18`, border: `1px solid ${plan.color}40`, color: plan.color }}
                  >
                    {plan.badge}
                  </span>
                )}

                <div className="relative z-10 flex-1">
                  {/* Icon */}
                  <div className="mb-5 inline-flex rounded-2xl p-3" style={{ background: `${plan.color}12`, border: `1px solid ${plan.color}30` }}>
                    <Icon size={22} style={{ color: plan.color }} />
                  </div>

                  {/* Name + price */}
                  <p className="food-kicker mb-1">{plan.tagline}</p>
                  <h2 className="food-heading !text-[44px] mb-1">{plan.name}</h2>
                  <div className="flex items-end gap-2 mt-3 mb-1">
                    <span className="text-[52px] font-black leading-none" style={{ color: plan.color }}>{plan.price}</span>
                    <span className="text-base font-bold text-white/40 mb-2">{plan.priceSub}</span>
                  </div>
                  <p className="text-xs text-white/40 mb-8">{plan.sub}</p>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-3 text-sm text-white/80">
                        <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${plan.color}18` }}>
                          <Check size={11} style={{ color: plan.color }} />
                        </div>
                        {f}
                      </div>
                    ))}
                    {plan.notIncluded.map((f) => (
                      <div key={f} className="flex items-center gap-3 text-sm text-white/25">
                        <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-white/5">
                          <Minus size={10} className="text-white/20" />
                        </div>
                        <span className="line-through">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className="relative z-10 mt-8 flex items-center justify-center gap-2 rounded-2xl py-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all hover:opacity-90"
                  style={{ background: plan.color, color: "#0c0f0d" }}
                >
                  {plan.cta} <ArrowRight size={13} />
                </Link>
              </article>
            );
          })}
        </section>

        {/* ── COMPARISON ── */}
        <section className="mt-8 food-panel">
          <div className="text-center mb-8">
            <p className="food-kicker mb-3">How We Compare</p>
            <h2 className="food-heading !text-[36px]">The honest <span className="accent">comparison.</span></h2>
            <p className="text-sm text-white/45 mt-3">Other platforms charge 15–30% of every order. We don't.</p>
          </div>

          <div className="grid gap-3">
            {/* Header */}
            <div className="grid grid-cols-4 px-5 pb-2 border-b border-white/8">
              {["Platform", "Commission", "Monthly Fee", "Contract"].map((h, i) => (
                <p key={h} className={`text-[10px] font-black uppercase tracking-[0.16em] text-white/35 ${i === 0 ? "text-left" : "text-center"}`}>{h}</p>
              ))}
            </div>

            {COMPARE.map((row) => (
              <div
                key={row.name}
                className="grid grid-cols-4 items-center px-5 py-4 rounded-2xl"
                style={row.highlight ? { background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.2)" } : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <p className="font-black text-sm" style={row.highlight ? { color: "#f97316" } : { color: "rgba(255,255,255,0.7)" }}>
                  {row.name}{row.highlight && <span className="ml-1.5 text-[10px] font-black tracking-widest text-[#f97316]/60">✦</span>}
                </p>
                <p className="text-center text-sm font-black" style={row.highlight ? { color: "#3dd68c" } : { color: "rgba(255,255,255,0.45)" }}>
                  {row.commission}
                </p>
                <p className="text-center text-sm" style={{ color: row.highlight ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)" }}>{row.fee}</p>
                <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>None</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[10px] text-white/25 text-center tracking-wide">Commission rates based on publicly available data. Actual rates may vary by market.</p>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-8 food-panel">
          <div className="text-center mb-8">
            <p className="food-kicker mb-3">FAQ</p>
            <h2 className="food-heading !text-[36px]">Common <span className="accent">questions.</span></h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {FAQS.map((faq) => (
              <div key={faq.q} className="food-card">
                <p className="font-black text-white mb-2 text-sm">{faq.q}</p>
                <p className="text-sm text-white/55 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="mt-8 food-panel relative overflow-hidden text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.16),transparent_60%)]" />
          <div className="relative z-10 max-w-xl mx-auto py-4">
            <p className="food-kicker mb-4">Ready to partner with us?</p>
            <h2 className="food-heading !text-[44px] mb-5">
              Your restaurant,<br /><span className="accent">your revenue.</span>
            </h2>
            <p className="text-sm text-white/50 mb-8 leading-relaxed mx-auto" style={{ maxWidth: 420 }}>
              Join TrueServe during our pilot launch in Pineville, NC and Rock Hill, SC. Setup takes less than 10 minutes.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/merchant/signup" className="portal-btn-gold" style={{ minWidth: 200 }}>
                Apply as a Merchant
              </Link>
              <Link href="/restaurants" className="portal-btn-outline" style={{ minWidth: 160 }}>
                See the Platform
              </Link>
            </div>
          </div>
        </section>

      </main>

      <footer className="mt-8 border-t border-white/5 px-2 pt-10 pb-12 text-center">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5">
          <Logo size="md" />
          <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/merchant/signup" className="hover:text-[#f97316] transition-colors">Get Started</Link>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
            © {new Date().getFullYear()} TrueServe · Built for local restaurants.
          </p>
        </div>
      </footer>
    </div>
  );
}
