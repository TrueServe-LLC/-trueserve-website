"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ClipboardCheck,
  Headphones,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Sparkles,
  Utensils,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const FAQS = [
  {
    q: "Where is my order?",
    a: "Sign in and open Orders to see live status, ETA, and handoff updates. If anything looks stuck, Ask Serv can route it to support.",
  },
  {
    q: "How do I cancel a TrueServe Plus or Premium subscription?",
    a: "Open Rewards, choose your current plan, and select manage plan. You can also email help@trueserve.delivery and we will help with the account change.",
  },
  {
    q: "My item is missing or wrong. What now?",
    a: "Start with Ask Serv or email help@trueserve.delivery with the order number, missing item, and a photo if you have one. We will review it with the restaurant.",
  },
  {
    q: "Can I tip after delivery?",
    a: "Yes. Open your completed order and choose the tip option when available. Drivers keep 100% of their tips.",
  },
  {
    q: "How do points work?",
    a: "Rewards points are added after delivered orders. Plus and Premium members earn faster multipliers and can unlock credit, perks, and priority support.",
  },
  {
    q: "How do I become a driver or partner restaurant?",
    a: "Drivers can apply from Drive & Earn. Restaurants can start from For Merchants. Both applications route to the admin team for review.",
  },
];

const SUPPORT_LANES = [
  {
    icon: Headphones,
    title: "Customer Care",
    detail: "Orders, refunds, rewards, subscriptions, delivery notes, and account questions.",
  },
  {
    icon: ClipboardCheck,
    title: "Driver Ops",
    detail: "Applications, document review, payouts, delivery issues, and approval updates.",
  },
  {
    icon: Utensils,
    title: "Restaurant Onboarding",
    detail: "Merchant applications, menu setup, POS planning, Stripe, and launch readiness.",
  },
];

function openServ(prefill?: string) {
  window.dispatchEvent(new CustomEvent("ts:support:open", { detail: { prefill } }));
}

export default function ContactPage() {
  const [openIndex, setOpenIndex] = useState(0);
  const [contactRole, setContactRole] = useState<"restaurant" | "default">("default");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setContactRole(params.get("role") === "restaurant" ? "restaurant" : "default");
  }, []);

  const isRestaurantRole = contactRole === "restaurant";

  return (
    <div className="ts-fig ts-fig-help-page ts-help-page">
      <SiteHeader />

      <main>
        <section className="ts-help-hero">
          <span className="ts-help-chip">
            <Sparkles size={16} aria-hidden="true" />
            {isRestaurantRole ? "Restaurant Partner Intake" : "Help Center"}
          </span>
          <h1>{isRestaurantRole ? <>Talk with <em>strategic accounts.</em></> : <>How can we <em>help?</em></>}</h1>
          <p>
            {isRestaurantRole
              ? "For multi-unit operators, POS questions, and restaurant launch planning. Real people review every inquiry."
              : "Most answers in under a minute. Real humans are always one tap away."}
          </p>
          <form
            className="ts-help-search"
            onSubmit={(event) => {
              event.preventDefault();
              const value = new FormData(event.currentTarget).get("q");
              openServ(typeof value === "string" ? value : undefined);
            }}
          >
            <Search size={24} aria-hidden="true" />
            <input
              name="q"
              placeholder={isRestaurantRole ? "Ask about POS, launch timing, or multi-unit onboarding..." : "Search 'cancel subscription', 'missing item'..."}
              aria-label={isRestaurantRole ? "Ask restaurant partner question" : "Search help"}
            />
            <button type="submit">{isRestaurantRole ? "Ask" : "Search"}</button>
          </form>
        </section>

        <section className="ts-help-action-grid" aria-label="Support options">
          <button
            type="button"
            className="ts-help-action-card primary"
            onClick={() => openServ(isRestaurantRole ? "I want to speak with strategic accounts about bringing my restaurant onto TrueServe." : "I need help with my TrueServe account.")}
          >
            <Sparkles size={30} aria-hidden="true" />
            <strong>{isRestaurantRole ? "Start partner chat" : "Ask Serv"}</strong>
            <span>{isRestaurantRole ? "Restaurant intake · routed" : "Quick answers · human handoff"}</span>
            <em>{isRestaurantRole ? "Open intake" : "Open chat"} <ArrowRight size={19} aria-hidden="true" /></em>
          </button>
          {isRestaurantRole ? (
            <>
              <Link className="ts-help-action-card" href="/merchant/signup">
                <MessageCircle size={30} aria-hidden="true" />
                <strong>Apply as partner</strong>
                <span>60-second restaurant application</span>
                <em>Start application <ArrowRight size={19} aria-hidden="true" /></em>
              </Link>
              <a className="ts-help-action-card" href="mailto:help@trueserve.delivery?subject=Restaurant%20Strategic%20Accounts%20Inquiry">
                <Mail size={30} aria-hidden="true" />
                <strong>Email restaurant team</strong>
                <span>Human review within 4 hours</span>
                <em>Email now <ArrowRight size={19} aria-hidden="true" /></em>
              </a>
            </>
          ) : (
            <>
              <button
                type="button"
                className="ts-help-action-card"
                onClick={() => openServ("I need a human support agent for this issue.")}
              >
                <MessageCircle size={30} aria-hidden="true" />
                <strong>Live Support</strong>
                <span>Human takeover when Serv cannot finish it</span>
                <em>Request support <ArrowRight size={19} aria-hidden="true" /></em>
              </button>
              <a className="ts-help-action-card" href="tel:8008787378">
                <Phone size={30} aria-hidden="true" />
                <strong>Call support</strong>
                <span>(800) TRU-SERV</span>
                <em>Call now <ArrowRight size={19} aria-hidden="true" /></em>
              </a>
            </>
          )}
        </section>

        <section className="ts-help-lanes" aria-labelledby="support-lanes-title">
          <div className="ts-help-lanes-head">
            <span>Human support lanes</span>
            <h2 id="support-lanes-title">A real team owns every issue type.</h2>
            <p>
              Serv can collect the first details, but TrueServe routes unresolved issues to the right support lane
              so people are not stuck repeating themselves.
            </p>
          </div>
          <div className="ts-help-lanes-grid">
            {SUPPORT_LANES.map((lane) => {
              const Icon = lane.icon;
              return (
                <article key={lane.title} className="ts-help-lane-card">
                  <Icon size={24} aria-hidden="true" />
                  <h3>{lane.title}</h3>
                  <p>{lane.detail}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="ts-help-video-panel" aria-label="TrueServe support experience">
          <div className="ts-help-video-copy">
            <span>Support without the runaround</span>
            <h2>Order questions, account help, and real people when you need them.</h2>
            <p>
              Ask Serv handles the first response. If the issue needs a person, the same thread is handed to human support so users do not have to start over.
            </p>
          </div>
          <div className="ts-help-video-frame" aria-hidden="true">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              src="/videos/help-support-loop.mp4"
            />
          </div>
        </section>

        <section className="ts-help-faq">
          <h2>Top questions</h2>
          <div className="ts-help-faq-list">
            {FAQS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <article key={item.q} className={isOpen ? "open" : ""}>
                  <button type="button" onClick={() => setOpenIndex(isOpen ? -1 : index)}>
                    <span>{item.q}</span>
                    <ChevronDown size={24} aria-hidden="true" />
                  </button>
                  <div>
                    <p>{item.a}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="ts-help-human">
          <div>
            <h2>Still need a human?</h2>
            <p>Drop us a line. We answer every email within 4 hours.</p>
          </div>
          <a href="mailto:help@trueserve.delivery">
            <Mail size={22} aria-hidden="true" />
            help@trueserve.delivery
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
