import Link from "next/link";
import Logo from "@/components/Logo";
import { Check, Minus, ArrowRight, Zap, Crown } from "lucide-react";

const PLANS = [
  {
    name: "Flex",
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
    sub: "Everything in Flex, plus",
    color: "#f97316",
    badge: "Most Popular",
    icon: Crown,
    cta: "Start Free Trial",
    href: "/merchant/signup?plan=pro",
    features: [
      "Everything in Flex",
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
  { name: "DoorDash",  commission: "15–30%", fee: "$0",     contract: "None" },
  { name: "Uber Eats", commission: "15–30%", fee: "$0",     contract: "None" },
  { name: "GrubHub",   commission: "15–30%", fee: "$0",     contract: "None" },
  { name: "TrueServe", commission: "0%",     fee: "$0–$49", contract: "None", highlight: true },
];

const FAQS = [
  { q: "Is there really zero commission?",   a: "Yes. TrueServe does not take a percentage of your orders. You keep everything your customers pay for food." },
  { q: "How do I get paid?",                 a: "Payouts go directly to your Stripe account. Setup takes about 5 minutes and funds typically arrive within 2 business days." },
  { q: "Can I switch plans later?",          a: "Yes — upgrade or downgrade anytime from your dashboard. Changes take effect immediately, no penalty." },
  { q: "What POS systems are supported?",    a: "Toast, Square, and Clover on the Pro plan. More integrations are being added during our pilot phase." },
  { q: "Is there a contract?",               a: "No contracts, no lock-ins. Cancel anytime." },
  { q: "What markets are you in?",           a: "We're actively expanding — contact us to see if we're available in your area or to bring TrueServe to your market." },
];

export default function PricingPage() {
  return (
    <div className="food-app-shell">

      {/* ── NAV ── */}
      <nav className="food-app-nav">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
        </div>
        <div className="hidden md:flex items-center gap-5" style={{ fontSize: 13, fontWeight: 700 }}>
          <Link href="/restaurants" style={{ color: "rgba(255,255,255,0.6)" }} className="hover:text-white transition-colors">Order Food</Link>
          <Link href="/merchant/signup" style={{ color: "rgba(255,255,255,0.6)" }} className="hover:text-white transition-colors">For Merchants</Link>
          <Link href="/contact" style={{ color: "rgba(255,255,255,0.6)" }} className="hover:text-white transition-colors">Contact</Link>
        </div>
        <div className="flex gap-2 items-center">
          <Link href="/merchant/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/merchant/signup" className="btn btn-gold">Get Started</Link>
        </div>
      </nav>

      <main className="food-app-main">

        {/* ── HERO ── */}
        <section className="food-panel relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at top, rgba(249,115,22,0.18), transparent 60%)" }} />
          <div className="relative z-10 text-center max-w-2xl mx-auto py-6">
            <p className="food-kicker mb-4">Merchant Pricing</p>
            <h1 className="food-heading" style={{ fontSize: "clamp(36px,6vw,64px)", lineHeight: 0.95, textAlign: "center" }}>
              Keep every dollar<br /><span className="accent">you earn.</span>
            </h1>
            <p className="food-subtitle mt-5 mx-auto" style={{ maxWidth: 480, fontSize: 14, textAlign: "center" }}>
              No commissions. No hidden fees. TrueServe makes money when you grow — not by taking a cut of every order.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 20 }}>
              {["0% commission", "No contracts", "Cancel anytime", "Live in minutes"].map(label => (
                <span key={label} className="food-chip" style={{ fontSize: 11, padding: "6px 13px", flexShrink: 0 }}>
                  <span className="food-chip-dot" />{label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── PLAN CARDS ── */}
        <section style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <article
                key={plan.name}
                className="food-panel relative overflow-hidden flex flex-col"
                style={{ border: `1px solid ${plan.color}30`, padding: 28 }}
              >
                {/* Subtle glow */}
                <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at top right, ${plan.color}10, transparent 55%)` }} />

                {/* Badge */}
                {plan.badge && (
                  <span style={{
                    position: "absolute", top: 20, right: 20,
                    fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em",
                    background: `${plan.color}18`, border: `1px solid ${plan.color}40`, color: plan.color,
                    borderRadius: 999, padding: "4px 10px",
                  }}>
                    {plan.badge}
                  </span>
                )}

                <div className="relative z-10 flex-1">
                  {/* Icon */}
                  <div style={{
                    marginBottom: 16, display: "inline-flex", borderRadius: 14, padding: 10,
                    background: `${plan.color}12`, border: `1px solid ${plan.color}28`,
                  }}>
                    <Icon size={20} style={{ color: plan.color }} />
                  </div>

                  {/* Plan label + name */}
                  <p className="food-kicker" style={{ marginBottom: 4 }}>{plan.tagline}</p>
                  <h2 className="food-heading" style={{ fontSize: "clamp(28px,3vw,36px)", marginBottom: 4 }}>{plan.name}</h2>

                  {/* Price */}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginTop: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: "clamp(40px,5vw,52px)", fontWeight: 900, lineHeight: 1, fontFamily: "inherit", color: plan.color }}>{plan.price}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{plan.priceSub}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>{plan.sub}</p>

                  {/* Feature list */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                        <div style={{
                          flexShrink: 0, width: 20, height: 20, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: `${plan.color}18`,
                        }}>
                          <Check size={11} style={{ color: plan.color }} />
                        </div>
                        {f}
                      </div>
                    ))}
                    {plan.notIncluded.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.2)" }}>
                        <div style={{
                          flexShrink: 0, width: 20, height: 20, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: "rgba(255,255,255,0.04)",
                        }}>
                          <Minus size={10} style={{ color: "rgba(255,255,255,0.15)" }} />
                        </div>
                        <span style={{ textDecoration: "line-through" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={plan.href}
                  style={{
                    position: "relative", zIndex: 10, marginTop: 28,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: plan.color, color: "#0c0f0d",
                    borderRadius: 12, padding: "14px 20px",
                    fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em",
                    textDecoration: "none", transition: "opacity 0.15s",
                  }}
                >
                  {plan.cta} <ArrowRight size={13} />
                </Link>
              </article>
            );
          })}
        </section>

        {/* ── COMPARISON TABLE ── */}
        <section className="food-panel" style={{ marginTop: 24 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <p className="food-kicker" style={{ marginBottom: 8 }}>How We Compare</p>
            <h2 className="food-heading" style={{ fontSize: "clamp(26px,3.5vw,38px)" }}>The honest <span className="accent">comparison.</span></h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>Other platforms charge 15–30% of every order. We don't.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "0 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Platform", "Commission", "Monthly Fee", "Contract"].map((h, i) => (
                <p key={h} style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", textAlign: i === 0 ? "left" : "center", margin: 0 }}>{h}</p>
              ))}
            </div>

            {COMPARE.map((row) => (
              <div key={row.name} style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
                alignItems: "center", padding: "14px 16px", borderRadius: 10,
                background: row.highlight ? "rgba(249,115,22,0.07)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${row.highlight ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.04)"}`,
              }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: row.highlight ? "#f97316" : "rgba(255,255,255,0.7)" }}>
                  {row.name}{row.highlight && <span style={{ marginLeft: 6, fontSize: 9, color: "rgba(249,115,22,0.5)", fontWeight: 800, letterSpacing: "0.1em" }}>✦ US</span>}
                </p>
                <p style={{ margin: 0, textAlign: "center", fontSize: 13, fontWeight: 800, color: row.highlight ? "#3dd68c" : "rgba(255,255,255,0.4)" }}>{row.commission}</p>
                <p style={{ margin: 0, textAlign: "center", fontSize: 13, color: row.highlight ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}>{row.fee}</p>
                <p style={{ margin: 0, textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>{row.contract}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 14, fontSize: 10, color: "rgba(255,255,255,0.2)", textAlign: "center", letterSpacing: "0.06em" }}>
            Commission rates based on publicly available data. Actual rates may vary by market.
          </p>
        </section>

        {/* ── FAQ ── */}
        <section className="food-panel" style={{ marginTop: 24 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <p className="food-kicker" style={{ marginBottom: 8 }}>FAQ</p>
            <h2 className="food-heading" style={{ fontSize: "clamp(26px,3.5vw,38px)" }}>Common <span className="accent">questions.</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {FAQS.map((faq) => (
              <div key={faq.q} className="food-card" style={{ padding: 20 }}>
                <p style={{ fontWeight: 800, color: "#fff", marginBottom: 8, fontSize: 13, lineHeight: 1.4 }}>{faq.q}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="food-panel relative overflow-hidden" style={{ marginTop: 24, textAlign: "center" }}>
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(249,115,22,0.14), transparent 60%)" }} />
          <div className="relative" style={{ maxWidth: 480, margin: "0 auto", padding: "16px 0 8px" }}>
            <p className="food-kicker" style={{ marginBottom: 12 }}>Ready to partner with us?</p>
            <h2 className="food-heading" style={{ fontSize: "clamp(30px,4.5vw,48px)", marginBottom: 14 }}>
              Your restaurant,<br /><span className="accent">your revenue.</span>
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 28, lineHeight: 1.65 }}>
              Join TrueServe and start taking orders with zero commission.<br />Setup takes less than 10 minutes.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
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

      {/* ── FOOTER ── */}
      <footer style={{ marginTop: 32, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "36px 16px 48px", textAlign: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <Logo size="md" />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            {[
              { label: "Privacy",     href: "/privacy" },
              { label: "Terms",       href: "/terms" },
              { label: "Contact",     href: "/contact" },
              { label: "Get Started", href: "/merchant/signup" },
            ].map(l => (
              <Link key={l.label} href={l.href} style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "#555", textDecoration: "none" }}
                className="hover:text-white transition-colors">{l.label}</Link>
            ))}
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#444", margin: 0 }}>
            © {new Date().getFullYear()} TrueServe · Built for local restaurants.
          </p>
        </div>
      </footer>

    </div>
  );
}
