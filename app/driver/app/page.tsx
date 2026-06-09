import Link from "next/link";
import {
  Bell,
  CarFront,
  ChevronRight,
  Download,
  FileCheck2,
  MapPinned,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const DRIVER_ACTIONS = [
  {
    icon: FileCheck2,
    label: "Application",
    title: "Apply to drive",
    copy: "Start the driver application, add your contact details, and tell us what vehicle you use.",
    href: "/driver/signup",
    cta: "Start application",
  },
  {
    icon: ShieldCheck,
    label: "Documents",
    title: "Upload required documents",
    copy: "License, insurance, and registration are stored privately for admin review.",
    href: "/driver/signup",
    cta: "Upload documents",
  },
  {
    icon: CarFront,
    label: "Dashboard",
    title: "Open your driver dashboard",
    copy: "View active routes, pickup notes, delivery status, and support tools from your phone.",
    href: "/driver/dashboard",
    cta: "View dashboard",
  },
  {
    icon: Wallet,
    label: "Earnings",
    title: "Track daily pay",
    copy: "$20/hr daily pay, tip visibility, and shift summaries stay tied to the same driver account.",
    href: "/driver/login",
    cta: "Sign in",
  },
];

const STATUS_CARDS = [
  {
    label: "Step 1",
    title: "Application submitted",
    status: "Driver Ops notified",
  },
  {
    label: "Step 2",
    title: "Documents uploaded",
    status: "Private review queue",
  },
  {
    label: "Step 3",
    title: "Admin decision",
    status: "Approved or needs updates",
  },
  {
    label: "Step 4",
    title: "Dashboard unlocked",
    status: "Ready for live orders",
  },
];

const READINESS = [
  {
    title: "Mobile web app",
    copy: "Available now through /driver/app and installable from the browser.",
  },
  {
    title: "Native wrapper",
    copy: "Capacitor can wrap these routes once QA passes end to end.",
  },
  {
    title: "Store release",
    copy: "TestFlight and Google Play internal testing should come before public launch.",
  },
];

export const metadata = {
  title: "TrueServe Driver App | Mobile Driver Portal",
  description:
    "Start with the TrueServe driver-first mobile web app, apply to drive, upload documents, and access the driver dashboard.",
};

export default function DriverAppPage() {
  return (
    <div className="driver-app-page">
      <SiteHeader />
      <main>
        <section className="driver-app-hero">
          <div className="ts-fig-container driver-app-hero-grid">
            <div className="driver-app-copy">
              <span className="driver-app-chip">
                <span className="driver-app-chip-dot" />
                TrueServe Driver
              </span>
              <h1>Your driver home base, built for the phone first.</h1>
              <p>
                Apply, upload documents, check approval status, and open the driver dashboard from one clean mobile
                entry point. This is the app flow we can wrap for Google Play and App Store once QA is solid.
              </p>
              <div className="driver-app-actions">
                <Link href="/driver/signup" className="ts-fig-btn">
                  Apply to drive
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
                <Link href="/driver/login" className="driver-app-secondary">
                  Driver sign in
                </Link>
              </div>
              <div className="driver-app-metrics" aria-label="Driver app highlights">
                <div>
                  <strong>$20/hr</strong>
                  <span>paid daily</span>
                </div>
                <div>
                  <strong>100%</strong>
                  <span>tips kept</span>
                </div>
                <div>
                  <strong>Mobile</strong>
                  <span>first flow</span>
                </div>
              </div>
            </div>

            <div className="driver-app-phone-wrap" aria-label="Driver app preview">
              <div className="driver-app-phone">
                <div className="driver-app-phone-top">
                  <span>9:41</span>
                  <span className="driver-app-live"><span /> TrueServe Driver</span>
                </div>
                <div className="driver-app-photo">
                  <img src="/driver-hero-delivery-car.png" alt="Driver preparing a delivery bag inside a car" />
                </div>
                <div className="driver-app-offer">
                  <div>
                    <span>Today</span>
                    <strong>$20/hr active</strong>
                    <small>Daily pay + 100% tips</small>
                  </div>
                  <strong>Ready</strong>
                </div>
                <div className="driver-app-route-card">
                  <div>
                    <FileCheck2 size={18} aria-hidden="true" />
                    <span>Application and document review in one flow</span>
                  </div>
                  <div>
                    <MapPinned size={18} aria-hidden="true" />
                    <span>Route dashboard unlocks after approval</span>
                  </div>
                  <div>
                    <Bell size={18} aria-hidden="true" />
                    <span>Email alerts keep drivers and admins aligned</span>
                  </div>
                </div>
                <Link href="/driver/dashboard" className="driver-app-open-dashboard">
                  Open dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="driver-app-section">
          <div className="ts-fig-container">
            <div className="driver-app-section-head">
              <span className="driver-app-kicker">Driver workflow</span>
              <h2>Every key action lives in one mobile path.</h2>
              <p>
                Drivers should never wonder where to apply, upload documents, check approval, or start working. These
                actions are the core of the driver app experience.
              </p>
            </div>
            <div className="driver-app-step-grid">
              {DRIVER_ACTIONS.map((step) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="driver-app-step-card">
                    <div className="driver-app-step-icon">
                      <Icon size={22} aria-hidden="true" />
                    </div>
                    <span>{step.label}</span>
                    <h3>{step.title}</h3>
                    <p>{step.copy}</p>
                    <Link href={step.href} className="driver-app-card-link">
                      {step.cta}
                      <ChevronRight size={16} aria-hidden="true" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="driver-app-status">
          <div className="ts-fig-container">
            <div className="driver-app-section-head">
              <span className="driver-app-kicker">Approval visibility</span>
              <h2>Clear enough for drivers, useful enough for admins.</h2>
            </div>
            <div className="driver-app-status-grid">
              {STATUS_CARDS.map((item) => (
                <article key={item.title} className="driver-app-status-card">
                  <span>{item.label}</span>
                  <strong>{item.title}</strong>
                  <small>{item.status}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="driver-app-install">
          <div className="ts-fig-container driver-app-install-grid">
            <div>
              <span className="driver-app-kicker">Installable today</span>
              <h2>Start with the PWA. Package the same flow later.</h2>
              <p>
                The driver experience can be tested on real phones now. Once signup, documents, admin approval, and
                dashboard access pass QA, the native wrapper becomes a packaging step instead of a rebuild.
              </p>
            </div>
            <div className="driver-app-install-card">
              <Download size={28} aria-hidden="true" />
              <h3>Add TrueServe Driver to your phone</h3>
              <ol>
                <li>Open this page on your phone.</li>
                <li>Tap Share or the browser menu.</li>
                <li>Choose Add to Home Screen.</li>
              </ol>
              <Link href="/driver/login" className="driver-app-secondary driver-app-secondary-light">
                Driver sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="driver-app-roadmap">
          <div className="ts-fig-container driver-app-roadmap-grid">
            <div>
              <span className="driver-app-kicker">Native readiness</span>
              <h2>The app store version should reuse what already works.</h2>
            </div>
            <div className="driver-app-roadmap-list">
              {READINESS.map((item, index) => (
                <div key={item.title} className="driver-app-roadmap-item">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
