import Link from "next/link";
import Logo from "@/components/Logo";
import { Check, Zap, Crown, ArrowRight } from "lucide-react";

const PLANS = [
  {
    name: "Flex Options",
    tagline: "Starter",
    price: "0% commission",
    sub: "Pay only per transaction",
    color: "#3dd68c",
    badge: null,
    icon: Zap,
    cta: "Get Started Free",
    href: "/merchant/signup",
    features: [
      "Zero monthly fees",
      "Zero commission on orders",
      "Public restaurant page",
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
    price: "$49 / mo",
    sub: "Everything in Flex, plus",
    color: "#f97316",
    badge: "Most Popular",
    icon: Crown,
    cta: "Start Pro Trial",
    href: "/merchant/signup?plan=pro",
    features: [
      "Everything in Flex Options",
      "POS integration (Toast, Square, Clover)",
      "AutoPilot busy-window management",
      "Advanced prep timing controls",
      "Priority order routing",
      "GHL booking widget embed",
      "Compliance score dashboard",
      "Dedicated account manager",
      "Multi-location dashboard",
    ],
    notIncluded: [],
  },
];

const FAQS = [
  {
    q: "Is there really zero commission?",
    a: "Yes. TrueServe does not take a percentage of your orders. You keep everything your customers pay for food.",
  },
  {
    q: "How do I get paid?",
    a: "Payouts go directly to your Stripe account. Setup takes about 5 minutes and funds typically arrive within 2 business days.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes — you can upgrade or downgrade at any time from your dashboard settings. Changes take effect immediately.",
  },
  {
    q: "What POS systems do you support?",
    a: "Toast, Square, and Clover are supported on the Pro plan. More integrations are being added during our pilot phase.",
  },
  {
    q: "Is there a contract?",
    a: "No contracts, no lock-ins. Cancel anytime with no penalty.",
  },
  {
    q: "What markets are you currently in?",
    a: "We are currently live in Pineville, NC and Rock Hill, SC, with more markets launching soon.",
  },
];

export default function PricingPage() {
  return (
    <div className="food-app-shell">
      <nav className="food-app-nav">
        <div className="mx-auto flex items-center justify-between" style={{ width: "min(1180px, calc(100% - 32px))", padding: "14px 0" }}>
          <Logo size="sm" />
          <div className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-[0.14em]">
            <Link href="/restaurants" className="text-white/60 hover:text-white transition-colors">Order Food</Link>
            <Link href="/merchant/signup" className="text-white/60 hover:text-[#f97316] transition-colors">For Merchants</Link>
          </div>
          <div className="flex gap-2">
            <Link href="/merchant/login" className="btn btn-ghost text-xs">Sign In</Link>
            <Link href="/merchant/signup" className="btn btn-gold text-xs">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="food-app-main">

        {/* HERO */}
        <section className="food-panel relative overflow-hidden text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(249,115,22,0.18),transparent_55%)]" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="food-kicker mb-4">Merchant Pricing</p>
            <h1 className="food-heading" style={{ fontSize: "clamp(42px, 7vw, 80px)" }}>
              Keep every dollar <span className="accent">you earn.</span>
            </h1>
            <p className="food-subtitle mt-4 mx-auto">
              No commissions. No hidden fees. TrueServe makes money when you grow — not by taking a cut of every order.
            </p>
            <div className="food-chip-row mt-6 justify-center">
              <div className="food-chip"><span className="food-chip-dot" /> 0% commission</div>
              <div className="food-chip"><span className="food-chip-dot" /> No contracts</div>
              <div className="food-chip"><span className="food-chip-dot" /> Cancel anytime</div>
            </div>
          </div>
        </section>

        {/* PLAN CARDS */}
        <section className="mt-8 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isHighlighted = Boolean(plan.badge);
            return (
              <article
                key={plan.name}
                className="food-card relative overflow-hidden flex flex-col"
                style={isHighlighted ? { border: `1px solid ${plan.color}50` } : {}}
              >
                <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at top right, ${plan.color}14, transparent 50%)` }} />
                {plan.badge && (
                  <div className="absolute top-5 right-5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]"
                    style={{ background: `${plan.color}20`, border: `1px solid ${plan.color}40`, color: plan.color }}>
                    {plan.badge}
                  </div>
                )}
                <div className="relative z-10 flex-1">
                  <div className="mb-4 inline-flex rounded-xl p-2.5" style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}30` }}>
                    <Icon size={20} style={{ color: plan.color }} />
                  </div>
                  <p className="food-kicker mb-1">{plan.tagline}</p>
                  <h2 className="food-heading !text-[38px]">{plan.name}</h2>
                  <p className="text-2xl font-black mt-2" style={{ color: plan.color }}>{plan.price}</p>
                  <p className="text-xs text-white/40 mt-1 mb-6">{plan.sub}</p>

                  <div className="space-y-2.5">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                        <Check size={14} className="mt-0.5 shrink-0" style={{ color: plan.color }} />
                        {f}
                      </div>
                    ))}
                    {plan.notIncluded.map((f) => (
                      <div key={f} className="flex items-start gap-2.5 text-sm text-white/25 line-through">
                        <span className="mt-0.5 shrink-0 w-3.5 h-3.5 text-center text-white/20">—</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={plan.href}
                  className="relative z-10 mt-8 flex items-center justify-center gap-2 rounded-2xl py-4 text-xs font-black uppercase tracking-[0.13em] transition-all"
                  style={{ background: plan.color, color: "#0c0f0d" }}
                >
                  {plan.cta} <ArrowRight size={14} />
                </Link>
              </article>
            );
          })}
        </section>

        {/* COMPARISON ROW */}
        <section className="mt-10 food-panel max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <p className="food-kicker mb-2">How We Compare</p>
            <h2 className="food-heading !text-[34px]">The honest comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left py-3 pr-6 text-white/40 font-bold text-xs uppercase tracking-widest">Platform</th>
                  <th className="text-center py-3 px-4 text-white/40 font-bold text-xs uppercase tracking-widest">Commission</th>
                  <th className="text-center py-3 px-4 text-white/40 font-bold text-xs uppercase tracking-widest">Monthly Fee</th>
                  <th className="text-center py-3 px-4 text-white/40 font-bold text-xs uppercase tracking-widest">Contract</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "DoorDash", commission: "15–30%", monthly: "$0", contract: "No" },
                  { name: "Uber Eats", commission: "15–30%", monthly: "$0", contract: "No" },
                  { name: "GrubHub", commission: "15–30%", monthly: "$0", contract: "No" },
                  { name: "TrueServe ✦", commission: "0%", monthly: "$0 – $49", contract: "No", highlight: true },
                ].map((row: any) => (
                  <tr
                    key={row.name}
                    className="border-b border-white/5"
                    style={row.highlight ? { background: "rgba(249,115,22,0.06)" } : {}}
                  >
                    <td className="py-3 pr-6 font-bold" style={row.highlight ? { color: "#f97316" } : { color: "#fff" }}>
                      {row.name}
                    </td>
                    <td className="py-3 px-4 text-center font-bold" style={row.highlight ? { color: "#3dd68c" } : { color: "rgba(255,255,255,0.55)" }}>
                      {row.commission}
                    </td>
                    <td className="py-3 px-4 text-center" style={{ color: "rgba(255,255,255,0.55)" }}>{row.monthly}</td>
                    <td className="py-3 px-4 text-center" style={{ color: "rgba(255,255,255,0.55)" }}>{row.contract}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-white/30 text-center">Commission rates based on publicly available platform data. Actual rates may vary.</p>
        </section>

        {/* FAQ */}
        <section className="mt-10 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="food-kicker mb-2">FAQ</p>
            <h2 className="food-heading !text-[34px]">Common questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <div key={faq.q} className="food-card">
                <p className="font-bold text-white mb-2">{faq.q}</p>
                <p className="text-sm text-white/60 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="mt-10 food-panel text-center relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15),transparent_60%)]" />
          <div className="relative z-10 max-w-xl mx-auto">
            <p className="food-kicker mb-3">Ready to get started?</p>
            <h2 className="food-heading !text-[40px] mb-4">
              Your restaurant, <span className="accent">your revenue.</span>
            </h2>
            <p className="text-sm text-white/55 mb-8 leading-relaxed">
              Join TrueServe during our pilot launch in Pineville, NC and Rock Hill, SC. Setup takes less than 10 minutes.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/merchant/signup" className="portal-btn-gold" style={{ minWidth: 180 }}>
                Apply as a Merchant
              </Link>
              <Link href="/restaurants" className="portal-btn-outline" style={{ minWidth: 160 }}>
                See the Platform
              </Link>
            </div>
          </div>
        </section>

      </main>

      <footer className="mt-8 border-t border-white/5 py-8 text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
          © {new Date().getFullYear()} TrueServe · Built for local restaurants.
        </p>
      </footer>
    </div>
  );
}
