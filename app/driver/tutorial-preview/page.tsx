"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const SECTIONS = [
  {
    step: 1, label: "Stats",
    badge: "Section 1 of 4", title: "Stats Overview",
    body: "The top row gives drivers an instant snapshot — available trips nearby, estimated earnings for the day, deliveries completed, and their current online status.",
    highlight: "stats",
  },
  {
    step: 2, label: "Active Delivery",
    badge: "Section 2 of 4", title: "Active Delivery",
    body: "When a driver has an active order, this block shows the pickup restaurant, the customer's drop-off address, and a live progress bar showing where in the delivery they currently are.",
    highlight: "delivery",
  },
  {
    step: 3, label: "Trip History",
    badge: "Section 3 of 4", title: "Trip History",
    body: "Below the active delivery, drivers see their most recent completed trips — the restaurant, destination street, time elapsed, and the exact payout earned for each trip.",
    highlight: "trips",
  },
  {
    step: 4, label: "Navigation",
    badge: "Section 4 of 4", title: "Navigation Tabs",
    body: "The top nav links to Settlements (weekly pay breakdowns), Reputation (ratings and customer feedback), and Profile (personal info, vehicle, and documents). Dashboard is always the home base.",
    highlight: "nav",
  },
];

export default function DriverTutorialPreviewPage() {
  const [step, setStep] = useState(0); // 0-indexed
  const [rating, setRating] = useState<number | null>(null);
  const cur = SECTIONS[step];

  function numStyle(i: number) {
    if (i < step) return "border-emerald-400/35 bg-emerald-400/15 text-emerald-400";
    if (i === step) return "border-[#e8a230]/45 bg-[#e8a230]/15 text-[#e8a230]";
    return "border-white/10 bg-white/5 text-white/30";
  }

  const hl = (key: string) =>
    cur.highlight === key
      ? "border-[#e8a230]/40 shadow-[0_0_0_2px_rgba(232,162,48,0.1)] bg-[#e8a230]/[0.04] transition-all duration-300"
      : "border-white/8 opacity-45 transition-all duration-300";

  const navTabs = ["Dashboard", "Settlements", "Reputation", "Profile"] as const;

  return (
    <div className="food-app-shell min-h-screen overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dpPulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes dpSweep { 0%{transform:translateX(-140%)} 100%{transform:translateX(260%)} }
        .dt-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 32px;
          padding: 7px 12px;
          border-radius: 999px;
          border: 1px solid #252b1e;
          background: #161a13;
          color: #5a6052;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1;
          box-shadow: none;
        }
        .dt-chip-active {
          border-color: rgba(232,162,48,0.45);
          background: rgba(232,162,48,0.14);
          color: #e8a230;
        }
        .dt-tabs {
          background: #0a0c09;
          border-bottom: 1px solid #1e2218;
          display: flex;
          gap: 0;
          overflow: hidden;
        }
        .dt-tab {
          padding: 8px 12px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #3d4436;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .dt-tab-active {
          color: #c8a84b;
          border-bottom-color: #c8a84b;
        }
      `}} />

      <header className="food-app-nav sticky top-0 z-50 border-b border-white/10">
        <div className="mx-auto flex w-[min(1240px,calc(100%-24px))] items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="hidden text-[10px] font-black uppercase tracking-[0.18em] text-[#68c7cc] md:inline-flex">
              Driver Pilot Preview
            </span>
          </div>
          <Link href="/driver/login" className="ts-pill-btn ts-pill-btn-sm md:w-auto">
            Back to Login
          </Link>
        </div>
      </header>

      <main className="mx-auto w-[min(1060px,calc(100%-24px))] py-10 md:py-12">

        {/* Hero */}
        <div className="mb-9 text-center md:mb-10">
          <p className="food-kicker mb-3">Interactive Walkthrough</p>
          <h1 className="food-heading !text-[22px] sm:!text-[28px] md:!text-[34px] lg:!text-[44px] leading-none">
            Driver Portal <span className="text-[#e8a230]">Preview</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[540px] text-[13px] leading-relaxed text-white/50">
            Explore the key sections of the TrueServe driver experience. Step through each section to see what drivers will interact with.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {SECTIONS.map((s, i) => (
              <button key={i} onClick={() => setStep(i)} className={`dt-chip min-w-[116px] ${i===step ? "dt-chip-active" : ""}`}>
                <span className="opacity-70">{s.step}</span>
                <span className="opacity-50">·</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8 border-t border-white/8" />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">

          {/* Portal frame */}
          <div className="food-panel min-w-0 overflow-hidden !p-0 !rounded-[12px]">

            {/* Topbar */}
            <div className="flex min-w-0 items-center gap-2.5 border-b border-white/8 bg-black/40 px-4 py-2.5">
              <img src="/logo.png" alt="TrueServe" width={22} height={22} style={{ borderRadius: "999px", flexShrink: 0, boxShadow: "0 0 10px rgba(232,162,48,0.3)" }} />
              <span className="shrink-0 text-[11px] font-black tracking-wide text-white">True<span style={{ color: "#68c7cc" }}>Serve</span></span>
              <span className="text-white/20">·</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/35">Driver Portal Preview</span>
            </div>

            {/* Nav tabs */}
            <div className={`dt-tabs flex-wrap gap-0 border-b border-white/8 px-3 py-0 transition-all duration-300 ${cur.highlight === "nav" ? "bg-[#e8a230]/[0.03]" : ""}`}>
              {navTabs.map(tab => {
                return (
                  <span key={tab} className={`dt-tab ${tab === "Dashboard" ? "dt-tab-active" : ""}`}>
                    {tab}
                  </span>
                );
              })}
            </div>

            <div className="space-y-3.5 p-4 md:space-y-4 md:p-5">

              {/* Stats */}
              <div className={`rounded-[8px] border p-3 ${hl("stats")} ${cur.highlight !== "stats" ? "hidden sm:block" : ""}`}>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { label: "Available Trips", val: "8", sub: "Nearby offers", cls: "text-white" },
                    { label: "Today", val: "$126", sub: "Est. earnings", cls: "text-[#e8a230]" },
                    { label: "Deliveries", val: "7", sub: "Completed today", cls: "text-white" },
                    { label: "Status", val: "Online", sub: "Accepting orders", cls: "text-emerald-300" },
                  ].map(s => (
                    <div key={s.label} className="rounded-[8px] border border-white/8 bg-black/30 px-3 py-2.5">
                      <p className="text-[10px] font-black uppercase tracking-[0.07em] text-white/40">{s.label}</p>
                      <p className={`mt-1.5 text-[18px] font-black leading-none ${s.cls}`}>{s.val}</p>
                      <p className="mt-0.5 text-[10px] text-white/45">{s.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active delivery */}
              <div className={`rounded-[8px] border overflow-hidden ${hl("delivery")} ${cur.highlight !== "delivery" ? "hidden sm:block" : ""}`}>
                <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e8a230]" style={{ animation: "dpPulse 2s ease-in-out infinite" }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[#e8a230]/80">Active Delivery</span>
                </div>
                <div className="grid grid-cols-2">
                  <div className="border-r border-white/8 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-white/40">Pickup</p>
                    <p className="mt-1 text-[12px] font-semibold text-white/85">Pilot Restaurant A</p>
                    <p className="text-[10px] text-white/50">100 Main St · 0.4 mi</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-white/40">Dropoff</p>
                    <p className="mt-1 text-[12px] font-semibold text-white/85">400 Market St, Apt 3C</p>
                    <p className="text-[10px] text-white/50">Customer: Pilot Customer · 1.2 mi</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-t border-white/8 px-4 py-2.5">
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.05em] text-white/35">Progress</span>
                  <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                    <span className="absolute inset-y-0 left-0 w-[68%] rounded-full bg-[#e8a230]/75" />
                    <span className="absolute inset-y-0 left-0 w-[25%] rounded-full bg-white/70" style={{ animation: "dpSweep 2.2s linear infinite" }} />
                  </div>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.03em] text-[#e8a230]">Picked up — En route</span>
                </div>
              </div>

              {/* Recent trips */}
              <div className={`rounded-[8px] border overflow-hidden ${hl("trips")} ${cur.highlight !== "trips" ? "hidden sm:block" : ""}`}>
                <div className="border-b border-white/8 px-4 py-2.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.08em] text-white/40">Recent Trips</span>
                </div>
                {[
                  { name: "Pilot Restaurant A", dest: "→ Market St · 12 min ago", pay: "$18.40" },
                  { name: "Pilot Restaurant B", dest: "→ Oak Ave · 9 min ago", pay: "$14.75" },
                  { name: "Pilot Restaurant C", dest: "→ Pine St · 7 min ago", pay: "$11.20" },
                ].map((t, i) => (
                  <div key={i} className={`flex items-center justify-between gap-3 px-4 py-2.5 ${i < 2 ? "border-b border-white/[0.05]" : ""}`}>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-white/85">{t.name}</p>
                      <p className="text-[10px] text-white/45">{t.dest}</p>
                    </div>
                    <span className="shrink-0 text-[14px] font-black text-[#e8a230]">{t.pay}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">

            {/* Sections list */}
            <div className="hidden sm:block food-panel !rounded-[12px] !p-5">
              <p className="mb-5 text-[10px] font-black uppercase tracking-[0.1em] text-white/40">Sections</p>
              <div className="space-y-4">
                {SECTIONS.map((s, i) => (
                  <button key={i} onClick={() => setStep(i)} className="flex w-full items-start gap-3 text-left">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black transition-all ${numStyle(i)}`}>
                      {i < step ? "✓" : s.step}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[12px] font-bold leading-tight transition-colors ${i===step ? "text-[#e8a230]" : i<step ? "text-emerald-300" : "text-white/40"}`}>{s.title ?? s.label}</p>
                      <p className="mt-0.5 text-[10px] leading-snug text-white/28">{s.badge}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Section detail */}
            <div className="food-panel flex flex-col gap-4 !rounded-[12px] !p-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#e8a230]/60">● {cur.badge}</p>
                <h3 className="food-heading mt-1.5 !text-[19px] leading-tight">{cur.title}</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-white/60">{cur.body}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(s => Math.max(0, s-1))} style={{ opacity: step===0 ? 0.3 : 1, pointerEvents: step===0 ? "none" : "auto" }}
                  className="ts-pill-btn ts-pill-btn-sm flex-1">
                  ← Back
                </button>
                {step < 3 ? (
                  <button onClick={() => setStep(s => Math.min(3, s+1))}
                    className="ts-pill-btn ts-pill-btn-sm flex-1">
                    Next →
                  </button>
                ) : (
                  <Link href="/driver/login"
                    className="ts-pill-btn ts-pill-btn-sm flex-1">
                    Done ✓
                  </Link>
                )}
              </div>
            </div>

          <div className="lg:col-span-2 food-panel !rounded-[12px] !p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#e8a230]/60">Tutorial Feedback</p>
                <h3 className="food-heading mt-1.5 !text-[19px] leading-tight">Was this tutorial helpful?</h3>
                <p className="mt-2 max-w-[540px] text-[12px] leading-relaxed text-white/55">
                  Tap a rating to help us improve the driver onboarding experience.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border text-[12px] font-black transition-all ${
                      rating === n
                        ? "border-[#e8a230]/70 bg-[#e8a230] text-black"
                        : "border-white/10 bg-white/[0.03] text-white/45 hover:border-[#e8a230]/35 hover:text-[#e8a230]"
                    }`}
                    aria-label={`Rate tutorial ${n} out of 5`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <button type="button" className="ts-pill-btn ts-pill-btn-sm mt-4">
              Send Feedback
            </button>
          </div>

          </div>
        </div>
      </main>
    </div>
  );
}
