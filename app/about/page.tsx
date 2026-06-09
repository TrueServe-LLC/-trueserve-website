import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  HeartHandshake,
  MapPinned,
  ShieldCheck,
  Store,
  Truck,
  Users,
} from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata = {
  title: "About TrueServe | Local Delivery Built on Trust",
  description:
    "TrueServe is a local food delivery platform built for real restaurants, transparent handoffs, driver opportunity, and human support.",
};

const proofPoints = [
  {
    icon: Store,
    label: "Restaurant-first",
    value: "Local kitchens stay visible",
    text: "We are building around real neighborhood restaurants, direct relationships, and fewer marketplace surprises.",
  },
  {
    icon: Truck,
    label: "Driver clarity",
    value: "$20/hr daily pay path",
    text: "Drivers get a clear onboarding flow, document review, and straightforward earning expectations before they go active.",
  },
  {
    icon: ShieldCheck,
    label: "Trust layer",
    value: "Public health verification",
    text: "Restaurant readiness and compliance documents belong in a review queue, not buried in messages.",
  },
];

const values = [
  {
    icon: HeartHandshake,
    title: "Human support stays visible",
    text: "Serv can help with quick questions, but customers, drivers, and merchants should always know how to reach a real person.",
  },
  {
    icon: MapPinned,
    title: "Local context matters",
    text: "Restaurants, delivery zones, and availability should reflect where a customer actually is before showing options.",
  },
  {
    icon: BadgeCheck,
    title: "Operations before hype",
    text: "Every signup, document, invoice, and approval needs a clear owner, status, and next step.",
  },
];

export default function AboutPage() {
  return (
    <div className="ts-fig">
      <SiteHeader />
      <main>
        <section className="ts-fig-about-hero">
          <div className="ts-fig-container ts-fig-about-hero-grid">
            <div className="ts-fig-about-copy">
              <span className="ts-fig-chip">
                <span className="ts-fig-chip-dot" />
                Built for real local delivery
              </span>
              <h1>
                Local food delivery that feels accountable.
              </h1>
              <p>
                TrueServe connects customers with neighborhood kitchens, gives restaurants a fairer operating path, and keeps drivers and admins aligned through clear review workflows.
              </p>
              <div className="ts-fig-about-actions">
                <Link className="ts-fig-btn" href="/restaurants">
                  Find Food <ArrowRight size={18} />
                </Link>
                <Link className="ts-fig-btn ts-fig-btn-secondary" href="/merchant">
                  Partner With Us
                </Link>
              </div>
            </div>

            <div className="ts-fig-about-panel" aria-label="TrueServe trust snapshot">
              <div className="ts-fig-about-panel-head">
                <span className="ts-fig-live-dot" />
                TrueServe operating model
              </div>
              <div className="ts-fig-about-panel-row">
                <span>Customers</span>
                <strong>Order locally</strong>
              </div>
              <div className="ts-fig-about-panel-row">
                <span>Restaurants</span>
                <strong>Keep control</strong>
              </div>
              <div className="ts-fig-about-panel-row">
                <span>Drivers</span>
                <strong>Clear onboarding</strong>
              </div>
              <div className="ts-fig-about-panel-note">
                Built to reduce confusion across ordering, approvals, documents, support, and payouts.
              </div>
            </div>
          </div>
        </section>

        <section className="ts-fig-section ts-fig-section-haze">
          <div className="ts-fig-container">
            <span className="ts-fig-kicker">Why it exists</span>
            <h2>Delivery should feel less hidden.</h2>
            <div className="ts-fig-about-story">
              <p>
                The big delivery platforms made ordering convenient, but restaurants, drivers, and customers often get stuck guessing what is happening behind the screen. TrueServe is being built around plain-language status, visible handoffs, and fairer local relationships.
              </p>
              <p>
                That means showing only restaurants that can serve the customer, giving merchants an onboarding path that actually explains what happens next, and giving admins the tools to review drivers, documents, invoices, and support issues without hunting across different portals.
              </p>
            </div>
          </div>
        </section>

        <section className="ts-fig-section">
          <div className="ts-fig-container">
            <span className="ts-fig-kicker teal">Trust signals</span>
            <h2>What TrueServe is designed to protect.</h2>
            <div className="ts-fig-about-proof-grid">
              {proofPoints.map((item) => (
                <article className="ts-fig-about-proof" key={item.label}>
                  <div className="ts-fig-about-icon">
                    <item.icon size={22} />
                  </div>
                  <span>{item.label}</span>
                  <h3>{item.value}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ts-fig-section ts-fig-section-cream">
          <div className="ts-fig-container">
            <div className="ts-fig-about-values">
              {values.map((item) => (
                <article key={item.title}>
                  <item.icon size={24} />
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ts-fig-about-cta">
          <div className="ts-fig-container ts-fig-about-cta-inner">
            <div>
              <span className="ts-fig-kicker">Next step</span>
              <h2>Help us build the local delivery network the right way.</h2>
            </div>
            <div className="ts-fig-about-cta-actions">
              <Link className="ts-fig-btn" href="/drive">
                Drive & Earn
              </Link>
              <Link className="ts-fig-btn ts-fig-btn-secondary" href="/contact">
                Talk to Support
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
