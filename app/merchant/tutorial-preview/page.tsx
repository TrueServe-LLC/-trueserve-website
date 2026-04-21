"use client";

import { useState } from "react";
import Link from "next/link";
import MerchantDashboardWrapper from "../dashboard/MerchantDashboardWrapper";

type MerchantStep = {
  step: number;
  label: string;
  title: string;
  body: string;
  bullets: string[];
  preview: {
    status: string;
    focus: string;
    accent: string;
  };
};

const STEPS: MerchantStep[] = [
  {
    step: 1,
    label: "Choose POS",
    title: "Choose POS Provider",
    body: "Merchants start in Integrations and pick the POS they already use in-store. The portal stays in the same dark, flat shell as the live dashboard.",
    bullets: [
      "Select the restaurant’s POS system first so TrueServe knows which API to connect to.",
      "Supported systems show up as simple dashboard cards instead of a separate style or layout.",
      "If the POS is not listed, support can step in and help map the integration manually.",
    ],
    preview: { status: "Pending", focus: "Integrations", accent: "Toast" },
  },
  {
    step: 2,
    label: "Credentials",
    title: "Enter API Credentials",
    body: "The merchant enters the provider Client ID, Client Secret, and the matching location so the connection stays tied to the right store.",
    bullets: [
      "Credentials are shown in compact rows so nothing feels stacked or cluttered.",
      "The portal keeps sensitive values masked, while location details stay visible enough to confirm the right store.",
      "The same visual treatment is used across desktop and mobile so the flow feels familiar everywhere.",
    ],
    preview: { status: "Masked", focus: "Client ID + Secret", accent: "Secure" },
  },
  {
    step: 3,
    label: "Test Connection",
    title: "Run Connection Test",
    body: "When the merchant taps Test Connection, the portal validates credentials, checks menu access, and confirms the API is alive.",
    bullets: [
      "The progress bar animates while the provider checks credentials and permissions.",
      "This step shows the same strong orange accent used in the live merchant dashboard.",
      "Errors stay readable and actionable so merchants can fix the issue without guessing.",
    ],
    preview: { status: "Checking", focus: "API handshake", accent: "In progress" },
  },
  {
    step: 4,
    label: "Verified",
    title: "Connection Verified",
    body: "Once the provider validates, menu sync and order ingestion can move forward with the same flat status treatment used in the live portal.",
    bullets: [
      "The verified state is shown as a simple success row, not a noisy badge stack.",
      "Merchants can re-sync their menu any time after setup without redoing the whole flow.",
      "This keeps the preview aligned with the production portal’s straightforward dashboard language.",
    ],
    preview: { status: "Connected", focus: "Menu sync", accent: "Ready" },
  },
  {
    step: 5,
    label: "Get Paid",
    title: "Stripe Payout Setup",
    body: "Merchants connect Stripe once so customer payments and payouts can move through the production flow.",
    bullets: [
      "The payout step keeps the same flat dark panel treatment as the rest of the portal.",
      "Stripe Connect is the production-ready route for merchant payouts and verification.",
      "After setup, the merchant can move straight back into the dashboard without a design shift.",
    ],
    preview: { status: "Live", focus: "Stripe Connect", accent: "Ready for payout" },
  },
];

export default function MerchantTutorialPreviewPage() {
  const [step, setStep] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  const current = STEPS[step];

  const sequenceTone = (index: number) => {
    if (index < step) return "border-[#3dd68c]/20 bg-[#0f1210]";
    if (index === step) return "border-[#f97316]/35 bg-[#11120d] shadow-[0_0_0_1px_rgba(249,115,22,0.08)]";
    return "border-white/8 bg-[#0f1210]/80";
  };

  return (
    <MerchantDashboardWrapper
      restaurantName="Pilot Kitchen"
      pageTitle="Merchant Tutorial Preview"
      pageSubtitle="Style matched to the live merchant dashboard"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes mtProgress { from { width: 0%; } to { width: 72%; } }
        @keyframes mtPulse { 0%,100% { opacity: .55; } 50% { opacity: 1; } }

        .mch-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }
        .mch-stat-card {
          background: #141a18;
          border: 1px solid #1e2420;
          border-radius: 8px;
          padding: 14px;
        }
        .mch-stat-label {
          font-size: 11px;
          color: #777;
          margin-bottom: 7px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .mch-stat-icon {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          background: #0f1210;
          border: 1px solid #1e2420;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
        }
        .mch-stat-value {
          font-size: 27px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
        }
        .mch-stripe-banner {
          background: #141a18;
          border: 1px solid #1e2420;
          border-radius: 8px;
          padding: 13px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          gap: 12px;
        }
        .mch-stripe-banner.connected {
          border-color: #1e3a2a;
          background: #0f1a14;
        }
        .mch-stripe-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .mch-stripe-icon {
          width: 22px;
          height: 15px;
          border-radius: 3px;
          background: #f97316;
          flex-shrink: 0;
        }
        .mch-stripe-title {
          display: block;
          color: #fff;
          font-weight: 700;
          font-size: 12px;
          margin-bottom: 2px;
        }
        .mch-stripe-sub {
          font-size: 11px;
          color: #aab4c8;
        }
        .mch-stripe-connect-btn {
          background: #f97316;
          color: #000;
          border: none;
          border-radius: 8px;
          padding: 7px 16px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.15s;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }
        .mch-stripe-connect-btn:hover { background: #ea6c10; }
        .mch-stripe-connected-badge {
          font-size: 11px;
          color: #4dca80;
          font-weight: 800;
          white-space: nowrap;
        }
        .mch-section-head {
          font-size: 10px;
          font-weight: 800;
          color: #777;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .mch-tab-row {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .mch-tab-pill {
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          text-decoration: none;
          border: 1px solid #1e2420;
          color: #999;
          transition: all 0.15s;
          text-transform: uppercase;
          letter-spacing: 0.11em;
          background: transparent;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .mch-tab-pill:hover {
          color: #f97316;
          border-color: rgba(249,115,22,0.35);
          background: rgba(249,115,22,0.06);
        }
        .mch-tab-pill.mch-tab-active {
          background: rgba(249,115,22,0.08);
          color: #f97316;
          border-color: rgba(249,115,22,0.35);
        }
        .mch-tutorial-shell {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .mch-tutorial-banner {
          border-radius: 8px;
        }
        .mch-tutorial-banner .mch-stripe-btn,
        .mch-tutorial-banner .mch-stripe-connected-badge {
          align-self: center;
        }
        .mch-tutorial-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 12px;
          align-items: start;
        }
        .mch-tutorial-panel {
          background: #141a18;
          border: 1px solid #1e2420;
          border-radius: 8px;
          padding: 18px;
          min-width: 0;
        }
        .mch-tutorial-head {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 14px;
        }
        .mch-tutorial-badge {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #f97316;
        }
        .mch-tutorial-title {
          font-size: 28px;
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #fff;
        }
        .mch-tutorial-copy {
          font-size: 13px;
          line-height: 1.7;
          color: #aab4c8;
          max-width: 720px;
        }
        .mch-sequence-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 14px;
        }
        .mch-sequence-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border: 1px solid #1e2420;
          border-radius: 8px;
          padding: 12px 13px;
        }
        .mch-sequence-step {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 800;
          color: #fff;
        }
        .mch-sequence-step.active {
          border-color: rgba(249,115,22,0.35);
          background: rgba(249,115,22,0.12);
          color: #f97316;
        }
        .mch-sequence-step.done {
          border-color: rgba(61,214,140,0.28);
          background: rgba(61,214,140,0.1);
          color: #3dd68c;
        }
        .mch-sequence-title {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          line-height: 1.25;
        }
        .mch-sequence-copy {
          font-size: 12px;
          line-height: 1.6;
          color: #aab4c8;
          margin-top: 3px;
        }
        .mch-side-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .mch-mini-stack {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: 12px;
        }
        .mch-mini-card {
          background: #0f1210;
          border: 1px solid #1e2420;
          border-radius: 8px;
          padding: 12px;
          min-width: 0;
        }
        .mch-mini-label {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #777;
          margin-bottom: 6px;
        }
        .mch-mini-value {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
        }
        .mch-mini-value.orange { color: #f97316; }
        .mch-mini-value.green { color: #3dd68c; }
        .mch-tutorial-actions {
          display: flex;
          gap: 8px;
          margin-top: 14px;
        }
        .mch-tutorial-actions .mch-stripe-connect-btn {
          flex: 1;
          min-height: 38px;
          justify-content: center;
        }
        .mch-tutorial-actions .mch-back-btn {
          background: #0f1210;
          color: #999;
          border: 1px solid #1e2420;
        }
        .mch-tutorial-actions .mch-back-btn:hover {
          color: #f97316;
          border-color: rgba(249,115,22,0.35);
          background: rgba(249,115,22,0.06);
        }
        .mch-rating-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }
        .mch-rating-btn {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.55);
          font-size: 12px;
          font-weight: 800;
          transition: all .15s ease;
        }
        .mch-rating-btn:hover {
          border-color: rgba(249,115,22,0.35);
          color: #f97316;
        }
        .mch-rating-btn.active {
          background: rgba(249,115,22,1);
          border-color: rgba(249,115,22,0.85);
          color: #120c01;
        }
        .mch-steps-wrap {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .mch-step-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 34px;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.7);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .11em;
          text-transform: uppercase;
          line-height: 1;
          white-space: nowrap;
          transition: all .15s ease;
        }
        .mch-step-chip:hover {
          color: #fff;
          border-color: rgba(249,115,22,0.25);
        }
        .mch-step-chip.active {
          background: rgba(249,115,22,0.1);
          color: #f97316;
          border-color: rgba(249,115,22,0.35);
        }
        .mch-step-chip.done {
          background: rgba(61,214,140,0.08);
          color: #3dd68c;
          border-color: rgba(61,214,140,0.22);
        }
        @media (max-width: 1024px) {
          .mch-stat-grid {
            grid-template-columns: 1fr 1fr;
          }
          .mch-tutorial-grid {
            grid-template-columns: 1fr;
          }
          .mch-mini-stack {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .mch-stat-grid {
            grid-template-columns: 1fr;
          }
          .mch-tutorial-title { font-size: 22px; }
          .mch-tutorial-copy { font-size: 12px; }
        }
      ` }} />

      <div className="mch-tutorial-shell">
        <div className="mch-stat-grid">
          <div className="mch-stat-card">
            <div className="mch-stat-label">
              <div className="mch-stat-icon">1</div>
              Tutorial Step
            </div>
            <div className="mch-stat-value">{current.step}/5</div>
          </div>
          <div className="mch-stat-card">
            <div className="mch-stat-label">
              <div className="mch-stat-icon">🏪</div>
              Portal Focus
            </div>
            <div className="mch-stat-value" style={{ fontSize: 22 }}>{current.preview.focus}</div>
          </div>
          <div className="mch-stat-card">
            <div className="mch-stat-label">
              <div className="mch-stat-icon">✓</div>
              Tutorial Mode
            </div>
            <div className="mch-stat-value" style={{ fontSize: 22, color: "#f97316" }}>{current.preview.accent}</div>
          </div>
        </div>

        <div className="mch-stripe-banner mch-tutorial-banner">
          <div className="mch-stripe-left">
            <div className="mch-stripe-icon" />
            <div>
              <span className="mch-stripe-title">Tutorial mode active</span>
              <span className="mch-stripe-sub">
                Same flat cards, same sidebar, same orange accents — just a guided preview of how merchants connect their tools.
              </span>
            </div>
          </div>
          <Link href="/merchant/login" className="mch-stripe-connect-btn">
            Back to Login
          </Link>
        </div>

        <div className="mch-section-head">Walkthrough</div>
        <div className="mch-steps-wrap">
          {STEPS.map((item, index) => (
            <button
              key={item.step}
              type="button"
              className={`mch-step-chip ${index === step ? "active" : index < step ? "done" : ""}`}
              onClick={() => setStep(index)}
            >
              {item.step} · {item.label}
            </button>
          ))}
        </div>

        <div className="mch-tutorial-grid">
          <section className="mch-tutorial-panel">
            <div className="mch-tutorial-head">
              <div className="mch-tutorial-badge">Section {current.step} of 5</div>
              <div className="mch-tutorial-title">{current.title}</div>
              <div className="mch-tutorial-copy">{current.body}</div>
            </div>

            <div className="mch-sequence-list">
              {current.bullets.map((bullet, index) => (
                <div key={bullet} className={`mch-sequence-item ${sequenceTone(index)}`}>
                  <div className={`mch-sequence-step ${index < step ? "done" : index === step ? "active" : ""}`}>
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="mch-sequence-title">
                      {index === 0 ? "First move" : index === 1 ? "What the merchant sees" : "What happens next"}
                    </div>
                    <div className="mch-sequence-copy">{bullet}</div>
                  </div>
                </div>
              ))}
            </div>

            {step === 2 && (
              <div className="mt-4 rounded-[8px] border border-white/8 bg-black/20 px-4 py-3">
                <div className="mb-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#f97316]" style={{ animation: "mtPulse 1.8s ease-in-out infinite" }}>
                  Checking
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[#f97316]/85" style={{ width: "72%", animation: "mtProgress 2.6s ease-out" }} />
                </div>
              </div>
            )}

            {step > 2 && (
              <div className="mt-4 rounded-[8px] border border-[#3dd68c]/25 bg-[#3dd68c]/[0.06] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#3dd68c]">
                Connection verified and ready for menu sync.
              </div>
            )}

            <div className="mch-tutorial-actions">
              <button
                type="button"
                className="mch-stripe-connect-btn mch-back-btn"
                onClick={() => setStep((value) => Math.max(0, value - 1))}
                disabled={step === 0}
                style={{ opacity: step === 0 ? 0.35 : 1, pointerEvents: step === 0 ? "none" : "auto" }}
              >
                ← Back
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  className="mch-stripe-connect-btn"
                  onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}
                >
                  Next →
                </button>
              ) : (
                <Link href="/merchant/login" className="mch-stripe-connect-btn">
                  Done ✓
                </Link>
              )}
            </div>
          </section>

          <aside className="mch-side-stack">
            <div className="mch-tutorial-panel">
              <div className="mch-section-head" style={{ marginBottom: 8 }}>Preview Controls</div>
              <div className="mch-mini-stack">
                <div className="mch-mini-card">
                  <div className="mch-mini-label">Current status</div>
                  <div className="mch-mini-value">{current.preview.status}</div>
                </div>
                <div className="mch-mini-card">
                  <div className="mch-mini-label">Focused area</div>
                  <div className="mch-mini-value orange">{current.preview.focus}</div>
                </div>
                <div className="mch-mini-card">
                  <div className="mch-mini-label">Live shell</div>
                  <div className="mch-mini-value green">Match</div>
                </div>
              </div>
            </div>

            <div className="mch-tutorial-panel">
              <div className="mch-section-head" style={{ marginBottom: 8 }}>What merchants get</div>
              <div className="space-y-2">
                {[
                  "Flat 8px cards that match the live dashboard.",
                  "No crowded mockups — each step is separated cleanly.",
                  "The same portal shell appears on mobile and desktop.",
                ].map((text) => (
                  <div key={text} className="flex items-start gap-2 rounded-[8px] border border-white/8 bg-black/20 px-3 py-2.5">
                    <span className="mt-0.5 text-[#f97316]">•</span>
                    <span className="text-[12px] leading-relaxed text-white/65">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mch-tutorial-panel">
              <div className="mch-section-head" style={{ marginBottom: 8 }}>Tutorial feedback</div>
              <div className="text-[13px] font-semibold text-white">Was this walkthrough helpful?</div>
              <p className="mt-2 text-[12px] leading-relaxed text-white/55">
                Rate the preview so we can keep the merchant onboarding flow clean and production-ready.
              </p>
              <div className="mch-rating-row">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`mch-rating-btn ${rating === value ? "active" : ""}`}
                    onClick={() => setRating(value)}
                    aria-label={`Rate tutorial ${value} out of 5`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <button type="button" className="mch-stripe-connect-btn" style={{ marginTop: 14 }}>
                Send Feedback
              </button>
            </div>
          </aside>
        </div>
      </div>
    </MerchantDashboardWrapper>
  );
}
