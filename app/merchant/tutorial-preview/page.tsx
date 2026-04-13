"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const SECTIONS = [
  {
    step: 1, label: "Choose POS",
    badge: "Section 1 of 5", title: "Choose POS Provider",
    body: "Merchants open the Integrations tab and select a supported POS provider from the list. This opens the credentials panel for that integration.",
    note: "This is visual-only and does not save credentials. It mirrors the merchant integration workflow so teammates can review before launch.",
    highlightBlock: 0, showCred: false, showStatus: false, showStripe: false, progState: 0,
  },
  {
    step: 2, label: "Credentials",
    badge: "Section 2 of 5", title: "Enter API Credentials",
    body: "The merchant enters the provider Client ID, Client Secret, and selects the matching store location. All fields are masked for security.",
    note: "In the real portal, credentials are encrypted at rest and never exposed after initial entry.",
    highlightBlock: 1, showCred: true, showStatus: false, showStripe: false, progState: 0,
  },
  {
    step: 3, label: "Test Connection",
    badge: "Section 3 of 5", title: "Run Connection Test",
    body: "Clicking 'Test Connection' fires a live validation request to the provider API. The progress bar shows the handshake in real time.",
    note: "If the test fails, TrueServe surfaces the exact error code so merchants can fix credentials without guessing.",
    highlightBlock: 2, showCred: true, showStatus: false, showStripe: false, progState: 1,
  },
  {
    step: 4, label: "Verified",
    badge: "Section 4 of 5", title: "Connection Verified",
    body: "Once validated, menu sync and order webhooks become available immediately. The status bar confirms the integration is live and ready.",
    note: "Merchants can re-sync their menu at any time from this panel without re-entering credentials.",
    highlightBlock: 3, showCred: true, showStatus: true, showStripe: false, progState: 2,
  },
  {
    step: 5, label: "Get Paid",
    badge: "Section 5 of 5", title: "Stripe Payout Setup",
    body: "Merchants connect Stripe once to receive order payouts automatically. This final step makes the merchant portal production-ready.",
    note: "TrueServe uses Stripe Connect so merchant payouts deposit securely on a rolling schedule after customer orders are processed.",
    highlightBlock: 4, showCred: false, showStatus: false, showStripe: true, progState: 3,
  },
];

const STEP_BLOCKS = [
  { label: "Step 1", name: "Choose POS Provider", detail: "Merchant selects a provider in Integrations and opens the credentials panel." },
  { label: "Step 2", name: "Enter API Credentials", detail: "Client ID, Client Secret, and location details are entered securely." },
  { label: "Step 3", name: "Run Connection Test", detail: null },
  { label: "Step 4", name: "Connection Verified", detail: "Menu sync and order webhooks become available immediately." },
  { label: "Step 5", name: "Stripe Payout Setup", detail: "Connect Stripe so order revenue can be deposited securely." },
];

export default function MerchantTutorialPreviewPage() {
  const [step, setStep] = useState(0); // 0-indexed
  const [rating, setRating] = useState<number | null>(null);
  const cur = SECTIONS[step];
  const activeStepBlock = STEP_BLOCKS[step];

  function blockStyle(i: number) {
    if (i < step) return "border-emerald-400/25 bg-emerald-400/[0.03]";
    if (i === step) return "border-[#e8a230]/45 bg-[#e8a230]/[0.05] shadow-[0_0_0_2px_rgba(232,162,48,0.1)]";
    return "border-white/8 bg-white/[0.025]";
  }
  function tagStyle(i: number) {
    if (i < step) return "text-emerald-400";
    if (i === step) return "text-[#e8a230]";
    return "text-[#e8a230]/50";
  }
  function numStyle(i: number) {
    if (i < step) return "border-emerald-400/35 bg-emerald-400/15 text-emerald-400";
    if (i === step) return "border-[#e8a230]/45 bg-[#e8a230]/15 text-[#e8a230]";
    return "border-white/10 bg-white/5 text-white/30";
  }

  return (
    <div className="food-app-shell min-h-screen overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes mpProg { from { width:0% } to { width:72% } }
        @keyframes mpPulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        .mp-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 32px;
          padding: 7px 12px;
          border-radius: 8px;
          border: 1px solid #252b1e;
          background: #161a13;
          color: #5a6052;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1;
          white-space: nowrap;
          box-shadow: none;
        }
        .mp-chip-active {
          border-color: rgba(232,162,48,0.45);
          background: rgba(232,162,48,0.14);
          color: #e8a230;
        }
      `}} />

      <header className="food-app-nav sticky top-0 z-50 border-b border-white/10">
        <div className="mx-auto flex w-[min(1240px,calc(100%-24px))] flex-col items-start gap-3 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="hidden text-[10px] font-black uppercase tracking-[0.18em] text-[#68c7cc] md:inline-flex">
              Merchant Pilot Preview
            </span>
          </div>
          <div className="flex w-full flex-wrap gap-2 md:w-auto md:justify-end">
            <Link href="/merchant/portal-preview" className="ts-pill-btn ts-pill-btn-sm w-auto whitespace-nowrap">
              View Portal Preview
            </Link>
            <Link href="/merchant/login" className="ts-pill-btn ts-pill-btn-sm w-auto whitespace-nowrap">
              Back to Login
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-[min(1060px,calc(100%-24px))] py-10 md:py-12">

        {/* Hero */}
        <div className="mb-9 text-center md:mb-10">
          <p className="food-kicker mb-3">Interactive Walkthrough</p>
          <h1 className="food-heading !text-[22px] sm:!text-[28px] md:!text-[34px] lg:!text-[44px] leading-none">
            POS Connection <span className="text-[#e8a230]">Preview</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[540px] text-[13px] leading-relaxed text-white/50">
            Step through how merchants connect a POS provider, validate credentials, and sync their menu inside the TrueServe portal.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {SECTIONS.map((s, i) => (
              <button key={i} type="button" onClick={() => setStep(i)} className={`mp-chip min-w-[116px] ${i===step ? "mp-chip-active" : ""}`}>
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
            <div className="border-b border-white/8 bg-black/35 px-5 py-4">
              <div className="mb-3 flex min-w-0 items-center gap-2">
                <img src="/logo.png" alt="TrueServe" width={20} height={20} style={{ borderRadius: "999px", flexShrink: 0, boxShadow: "0 0 10px rgba(232,162,48,0.3)" }} />
                <span className="shrink-0 text-[11px] font-black tracking-wide text-white">True<span style={{ color: "#68c7cc" }}>Serve</span></span>
                <span className="text-white/20">·</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/35">Merchant Portal Preview</span>
              </div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.1em] text-white/40">Portal Preview</p>
              <h2 className="food-heading !text-[22px] leading-tight">
                How POS Connection Looks
              </h2>
              <p className="mt-1.5 max-w-[560px] text-[12px] leading-relaxed text-white/55">
                This preview shows the exact portal area where merchants connect a POS provider, validate credentials, and sync their menu.
              </p>
            </div>

            <div className="space-y-3 p-4 md:p-5">
              {/* Connection sequence */}
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/35">Connection Sequence</p>
              <div className="sm:hidden rounded-[8px] border border-[#252b1e] bg-[#161a13] px-4 py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#e8a230]/85">Step {cur.step}</p>
                <p className="mt-1 text-[20px] font-black leading-tight text-white">{activeStepBlock.name}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/70">
                  {activeStepBlock.detail || "Run a live connection check to validate credentials and confirm API access."}
                </p>
                {step === 2 && (
                  <div className="mt-3">
                    <div className="mb-1 text-[10px] font-black uppercase tracking-[0.06em] text-[#e8a230]">Checking</div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-[#e8a230]/80" style={{ animation: "mpProg 2.5s ease-out forwards" }} />
                    </div>
                  </div>
                )}
                {step > 2 && (
                  <div className="mt-3 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.06em] text-emerald-300">
                    Connection verified
                  </div>
                )}
              </div>

              <div className="hidden sm:block space-y-2">
                {STEP_BLOCKS.map((b, i) => (
                  <div key={i} className={`rounded-[8px] border px-4 py-3 transition-all duration-300 ${blockStyle(i)}`}>
                    {i === 2 ? (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`text-[10px] font-black uppercase tracking-[0.08em] ${tagStyle(i)}`}>{b.label}</p>
                          <p className={`mt-0.5 text-[13px] font-bold ${i <= step ? "text-white" : "text-white/50"}`}>{b.name}</p>
                          {/* Progress bar for step 3 */}
                          {step >= 2 && (
                            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                              {step === 2 ? (
                                <div key="prog-anim" className="h-full rounded-full bg-[#e8a230]/80" style={{ animation: "mpProg 3s ease-out forwards" }} />
                              ) : (
                                <div className="h-full w-full rounded-full bg-emerald-400/80" />
                              )}
                            </div>
                          )}
                        </div>
                        {step === 2 && (
                          <span className="mt-0.5 shrink-0 text-[10px] font-black uppercase tracking-[0.06em] text-[#e8a230]" style={{ animation: "mpPulse 1.6s ease-in-out infinite" }}>
                            Checking
                          </span>
                        )}
                        {step > 2 && (
                          <span className="mt-0.5 shrink-0 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.05em] text-emerald-300">Done</span>
                        )}
                      </div>
                    ) : (
                      <>
                        <p className={`text-[10px] font-black uppercase tracking-[0.08em] ${tagStyle(i)}`}>{b.label}</p>
                        <p className={`mt-0.5 text-[13px] font-bold ${i <= step ? "text-white" : "text-white/50"}`}>{b.name}</p>
                        {b.detail && <p className={`mt-0.5 text-[12px] leading-snug ${i === step ? "text-white/55" : "text-white/30"}`}>{b.detail}</p>}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Credentials block */}
              <div className={`rounded-[8px] border transition-all duration-300 overflow-hidden ${cur.showCred ? "border-[#e8a230]/30 bg-[#e8a230]/[0.03] shadow-[0_0_0_2px_rgba(232,162,48,0.08)]" : "border-white/8 bg-white/[0.02] opacity-40"} ${!cur.showCred ? "hidden sm:block" : ""}`}>
                <div className="border-b border-white/8 px-4 py-2.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.09em] text-white/40">POS Credentials</p>
                </div>
                {[
                  { label: "Client ID", val: "client_id_001" },
                  { label: "Client Secret", val: "••••••••••••••" },
                  { label: "Location", val: "Location 01 / POS-0042" },
                ].map((f) => (
                  <div key={f.label} className="flex items-baseline justify-between gap-4 border-b border-white/[0.05] px-4 py-2.5 last:border-0">
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.07em] text-white/40">{f.label}</span>
                    <span className="max-w-[170px] truncate text-[12px] font-semibold text-right text-white/80">{f.val}</span>
                  </div>
                ))}
                <div className="flex gap-2 border-t border-white/8 px-4 py-3">
                  <button type="button" className="ts-pill-btn ts-pill-btn-sm flex-1">Test Connection</button>
                  <button type="button" className="ts-pill-btn ts-pill-btn-sm flex-1">Sync Menu</button>
                </div>
                {cur.showStatus && (
                  <div className="border-t border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-2.5">
                    <p className="text-[10px] font-semibold text-emerald-300">● Connected: menu sync and order ingestion are active.</p>
                  </div>
                )}
              </div>

              {cur.showStripe && (
                <div className="rounded-[6px] border border-[#8fb5ff]/25 bg-[#8fb5ff]/[0.06] overflow-hidden">
                  <div className="border-b border-white/8 px-4 py-2.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.09em] text-white/40">Stripe Payout Setup</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8fb5ff]">Connect Stripe to receive payouts</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-white/60">
                      Merchants create or link a Stripe account, verify business details, and connect their bank so payouts can be deposited automatically.
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between rounded-[10px] border border-white/8 bg-black/20 px-3 py-2">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-white/45">Processing</span>
                        <span className="text-[11px] font-bold text-[#8fb5ff]">2.9% + 30¢</span>
                      </div>
                      <div className="flex items-center justify-between rounded-[10px] border border-white/8 bg-black/20 px-3 py-2">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-white/45">Payout</span>
                        <span className="text-[11px] font-bold text-emerald-300">Rolling · every 2 days</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                      <p className={`text-[12px] font-bold leading-tight transition-colors ${i===step ? "text-[#e8a230]" : i<step ? "text-emerald-300" : "text-white/40"}`}>{s.title}</p>
                      <p className="mt-0.5 text-[10px] leading-snug text-white/28">{s.badge.replace(/.*Section/, "Section")}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview controls */}
            <div className="hidden sm:block food-panel !rounded-[12px] !p-5">
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.1em] text-white/40">Preview Controls</p>
              <div className="space-y-2">
                {[
                  { k: "POS", v: "Pilot POS", vc: "text-[#e8a230]" },
                  { k: "Status", v: step >= 3 ? "Connected" : "Pending", vc: step >= 3 ? "text-emerald-300" : "text-white/35" },
                  { k: "Stripe", v: step >= 4 ? "Ready" : "Pending", vc: step >= 4 ? "text-[#8fb5ff]" : "text-white/25" },
                ].map(row => (
                  <div key={row.k} className={`flex items-center justify-between rounded-[10px] border px-4 py-2.5 transition-all ${row.k==="Status" && step>=3 ? "border-emerald-400/20 bg-emerald-400/[0.04]" : "border-white/8 bg-white/[0.03]"}`}>
                    <span className="text-[10px] font-semibold text-white/45">{row.k}</span>
                    <span className={`text-[11px] font-bold ${row.vc}`}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section detail */}
            <div className="food-panel hidden sm:flex flex-col gap-4 !rounded-[12px] !p-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#e8a230]/60">● {cur.badge}</p>
                <h3 className="food-heading mt-1.5 !text-[19px] leading-tight">{cur.title}</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-white/60">{cur.body}</p>
                <div className="mt-3 rounded-[8px] border border-white/8 bg-black/20 px-4 py-3">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-[0.07em] text-white/35">Note</p>
                  <p className="text-[12px] leading-relaxed text-white/50">{cur.note}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(s => Math.max(0, s-1))} style={{ opacity: step===0 ? 0.3 : 1, pointerEvents: step===0 ? "none" : "auto" }}
                  className="ts-pill-btn ts-pill-btn-sm flex-1">
                  ← Back
                </button>
                {step < 4 ? (
                  <button onClick={() => setStep(s => Math.min(4, s+1))}
                    className="ts-pill-btn ts-pill-btn-sm flex-1">
                    Next →
                  </button>
                ) : (
                  <Link href="/merchant/login"
                    className="ts-pill-btn ts-pill-btn-sm flex-1">
                    Done ✓
                  </Link>
                )}
              </div>
            </div>

            <div className="food-panel !rounded-[12px] !p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#e8a230]/60">Tutorial Feedback</p>
              <h3 className="food-heading mt-1.5 !text-[19px] leading-tight">Was this tutorial helpful?</h3>
              <p className="mt-2 text-[12px] leading-relaxed text-white/55">
                Rate the walkthrough so we can keep improving the merchant onboarding flow.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
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
