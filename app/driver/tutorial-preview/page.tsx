"use client";

import { useState } from "react";
import Link from "next/link";
import DriverPortalWrapper from "../dashboard/DriverPortalWrapper";

type DriverStep = {
  step: number;
  label: string;
  title: string;
  body: string;
  highlight: "stats" | "delivery" | "trips" | "nav";
  bullets: string[];
};

const STEPS: DriverStep[] = [
  {
    step: 1,
    label: "Dashboard",
    title: "Driver Dashboard",
    body: "This is the home base for drivers — they can see earnings, trips, and online status at a glance without leaving the same flat dashboard shell.",
    highlight: "stats",
    bullets: [
      "The top cards are designed to feel identical to the live dashboard, with simple 8px surfaces and no crowded mock data blocks.",
      "Drivers see availability, earnings, deliveries, and rating in one place before they accept anything.",
      "This keeps the preview aligned with the actual portal layout used in production.",
    ],
  },
  {
    step: 2,
    label: "Active Delivery",
    title: "Active Delivery",
    body: "When a driver accepts an order, the portal shows pickup and drop-off details in the same dark, organized card style as the live app.",
    highlight: "delivery",
    bullets: [
      "Pickup and drop-off are separated into clean blocks so the route is easy to read on mobile.",
      "The live progress bar mirrors the exact production look instead of using a separate mock design.",
      "Payout information stays visible so the driver always knows what the trip is worth.",
    ],
  },
  {
    step: 3,
    label: "Trip History",
    title: "Trip History",
    body: "Recent deliveries are shown as flat rows with payout, distance, and restaurant details, matching the same dashboard language the live portal uses.",
    highlight: "trips",
    bullets: [
      "Trip rows stay compact and readable so the history area never feels cluttered.",
      "The preview reflects the real driver portal by keeping the same spacing and borders.",
      "This section helps drivers understand how completed orders appear after delivery.",
    ],
  },
  {
    step: 4,
    label: "Navigation",
    title: "Navigation + Support",
    body: "The navigation and support areas stay in the same style as the dashboard so drivers always know where to go next.",
    highlight: "nav",
    bullets: [
      "Navigation and support options are laid out like production cards instead of separate mock blocks.",
      "Drivers can move between settlements, reputation, profile, and help using the same shell as the live app.",
      "The preview keeps the structure simple enough for mobile without losing the desktop layout.",
    ],
  },
];

export default function DriverTutorialPreviewPage() {
  const [step, setStep] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  const current = STEPS[step];

  const panelTone = (index: number) => {
    if (index < step) return "border-[#3dd68c]/20 bg-[#0f1210]";
    if (index === step) return "border-[#f97316]/35 bg-[#11120d] shadow-[0_0_0_1px_rgba(249,115,22,0.08)]";
    return "border-white/8 bg-[#0f1210]/80";
  };

  const renderSnapshot = () => {
    switch (current.highlight) {
      case "stats":
        return (
          <div className="dd-stat-grid" style={{ marginBottom: 0 }}>
            {[
              { label: "Available Trips", value: "8", sub: "Nearby offers", color: "#fff" },
              { label: "Today’s Earnings", value: "$126", sub: "Est. payout", color: "#f97316" },
              { label: "Deliveries Done", value: "7", sub: "Completed today", color: "#fff" },
              { label: "Status", value: "Online", sub: "Accepting orders", color: "#3dd68c" },
            ].map((item) => (
              <div key={item.label} className="dd-stat-card">
                <div className="dd-stat-label">{item.label}</div>
                <div className="dd-stat-value" style={{ color: item.color }}>{item.value}</div>
                <div style={{ marginTop: 5, fontSize: 11, color: "#777" }}>{item.sub}</div>
              </div>
            ))}
          </div>
        );
      case "delivery":
        return (
          <div className="dd-order-card" style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
              <div>
                <div className="dd-order-status">PICKED UP</div>
                <div className="dd-order-name">Pilot Restaurant A</div>
              </div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#555" }}>
                #TRV-4821
              </div>
            </div>
            <div className="dd-addr-grid">
              <div className="dd-addr-block">
                <div className="dd-addr-label">Pickup</div>
                <div className="dd-addr-val">100 Main St</div>
              </div>
              <div className="dd-addr-block">
                <div className="dd-addr-label">Drop-off</div>
                <div className="dd-addr-val">400 Market St, Apt 3C</div>
                <div style={{ marginTop: 3, fontSize: 10, color: "#5bcfd4" }}>Customer: Pilot Customer</div>
              </div>
            </div>
            <div className="dd-progress-bar-wrap">
              <div className="dd-progress-bar" style={{ width: "68%" }} />
            </div>
            <div style={{ fontSize: 10, color: "#f97316", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Picked up — heading to customer
            </div>
          </div>
        );
      case "trips":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { name: "Pilot Restaurant A", dest: "→ Market St · 12 min ago", pay: "$18.40" },
              { name: "Pilot Restaurant B", dest: "→ Oak Ave · 9 min ago", pay: "$14.75" },
              { name: "Pilot Restaurant C", dest: "→ Pine St · 7 min ago", pay: "$11.20" },
            ].map((trip, index) => (
              <div key={trip.name} className="dd-avail-card" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <div className="dd-avail-name">{trip.name}</div>
                    <div className="dd-avail-addr">{trip.dest}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#f97316" }}>{trip.pay}</div>
                </div>
                {index < 2 && <div style={{ marginTop: 10, borderTop: "1px solid #1e2420" }} />}
              </div>
            ))}
          </div>
        );
      case "nav":
      default:
        return (
          <div>
            <div className="dd-map-wrap" style={{ height: 210, marginBottom: 12 }}>
              <div style={{ position: "relative", width: "100%", height: "100%", background: "#0e1a14" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "linear-gradient(rgba(46,229,160,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(46,229,160,0.06) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <div style={{ position: "absolute", bottom: 34, left: 24, right: 34, height: 2, background: "linear-gradient(90deg,#f97316,#3dd68c)", borderRadius: 2 }} />
                <div style={{ position: "absolute", bottom: 28, left: 18, width: 12, height: 12, borderRadius: "50%", background: "#f97316" }} />
                <div style={{ position: "absolute", bottom: 28, right: 30, width: 12, height: 12, borderRadius: "50%", background: "#3dd68c" }} />
                <div style={{ position: "absolute", bottom: 26, left: "45%", fontSize: 20 }}>🚗</div>
              </div>
            </div>
            <div className="dd-essentials-grid">
              <div className="dd-summary-row" style={{ marginBottom: 0 }}>
                <div className="dd-summary-label">ETA to pickup</div>
                <div className="dd-summary-val">4 min</div>
              </div>
              <div className="dd-summary-row" style={{ marginBottom: 0 }}>
                <div className="dd-summary-label">Total route</div>
                <div className="dd-summary-val">2.1 mi</div>
              </div>
              <div className="dd-summary-row" style={{ marginBottom: 0 }}>
                <div className="dd-summary-label">Full trip</div>
                <div className="dd-summary-val">18 min</div>
              </div>
              <div className="dd-summary-row" style={{ marginBottom: 0 }}>
                <div className="dd-summary-label">Support</div>
                <div className="dd-summary-val" style={{ color: "#3dd68c" }}>AI Ready</div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <DriverPortalWrapper>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dtSweep { 0% { transform: translateX(-140%); } 100% { transform: translateX(260%); } }
        @keyframes dtPulse { 0%,100% { opacity: .55; } 50% { opacity: 1; } }

        .dd-topbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 22px; flex-wrap: wrap; gap: 12px;
        }
        .dd-page-title {
          font-size: 20px; font-weight: 600;
          color: #fff; letter-spacing: -0.01em;
        }
        .dd-page-sub {
          font-size: 13px; color: #666;
          letter-spacing: 0.08em; text-transform: uppercase; margin-top: 6px;
          font-weight: 600;
        }
        .dd-topbar-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .dd-live-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 8px;
          font-size: 11px; font-weight: 800; color: #3dd68c;
          background: rgba(61,214,140,0.08);
          border: 1px solid rgba(61,214,140,0.16);
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .dd-live-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #3dd68c;
          animation: dtPulse 1.8s ease-in-out infinite;
        }

        .dd-stat-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 2px; margin-bottom: 2px;
        }
        .dd-stat-card {
          background: #141a18; border: 1px solid #1e2420;
          padding: 20px 22px;
        }
        .dd-stat-card:first-child { border-radius: 8px 0 0 0; }
        .dd-stat-card:last-child { border-radius: 0 8px 0 0; }
        .dd-stat-label {
          font-size: 10px; font-weight: 800; color: #777;
          letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px;
        }
        .dd-stat-value {
          font-size: 30px; font-weight: 700; color: #fff; letter-spacing: -1px;
        }
        .dd-stat-value.gold { color: #f97316; }
        .dd-weather-card {
          background: #141a18; border: 1px solid #1e2420;
          border-radius: 0 0 8px 8px;
          padding: 18px 22px; margin-bottom: 16px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .dd-weather-label {
          font-size: 10px; font-weight: 800; color: #777;
          letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px;
        }
        .dd-weather-temp { font-size: 28px; font-weight: 700; color: #3dd68c; letter-spacing: -0.5px; }

        .dd-stripe-banner {
          background: #141a18; border: 1px solid #1e2420;
          border-radius: 8px; padding: 16px 20px;
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px; gap: 16px;
        }
        .dd-stripe-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
        .dd-stripe-icon {
          width: 40px; height: 28px; border-radius: 6px;
          background: #0f1210;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; position: relative; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .dd-stripe-icon::after {
          content: ''; position: absolute;
          width: 20px; height: 3px;
          background: rgba(255,255,255,0.7); border-radius: 2px;
          top: 50%; left: 50%; transform: translate(-50%, -60%);
        }
        .dd-stripe-icon::before {
          content: ''; position: absolute;
          width: 13px; height: 3px;
          background: rgba(255,255,255,0.35); border-radius: 2px;
          top: 50%; left: 10px; transform: translateY(40%);
        }
        .dd-stripe-title {
          display: block; color: #fff;
          font-weight: 700; font-size: 13px; margin-bottom: 3px;
        }
        .dd-stripe-sub { font-size: 11px; color: #aab4c8; }
        .dd-stripe-connected { font-size: 12px; color: #3dd68c; font-weight: 700; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.08em; }

        .dd-two-col {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 12px; margin-bottom: 16px;
        }
        .dd-panel {
          background: #141a18; border: 1px solid #1e2420;
          border-radius: 8px; padding: 20px;
        }
        .dd-panel-section-label {
          font-size: 10px; font-weight: 800; color: #777;
          letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px;
        }
        .dd-panel-title {
          font-size: 20px; font-weight: 700; color: #fff;
          margin-bottom: 12px; letter-spacing: -0.3px;
        }
        .dd-empty-state {
          background: #0f1210; border: 1px solid #1e2420;
          border-radius: 8px; padding: 14px 16px;
          font-size: 12px; color: #aab4c8; text-align: center;
        }
        .dd-map-wrap {
          border-radius: 8px; overflow: hidden;
          height: 260px;
          border: 0.5px solid #2e2e2e;
        }
        .dd-bottom-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 12px; margin-bottom: 16px;
        }

        .dd-order-card {
          background: #0f1210; border: 1px solid #1e2420;
          border-radius: 8px; padding: 16px; margin-bottom: 8px;
        }
        .dd-order-status {
          font-size: 10px; text-transform: uppercase;
          letter-spacing: 0.12em; color: #f97316;
          font-weight: 800; margin-bottom: 4px;
        }
        .dd-order-name { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 10px; }
        .dd-addr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }
        .dd-addr-block {
          background: #141a18; border: 1px solid #1e2420;
          border-radius: 8px; padding: 10px 12px;
        }
        .dd-addr-label {
          font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em;
          color: #777; margin-bottom: 3px;
        }
        .dd-addr-val { font-size: 12px; font-weight: 700; color: #e0e0e0; }
        .dd-progress-bar-wrap {
          height: 4px; background: #1e2420; border-radius: 4px;
          overflow: hidden; margin: 10px 0 6px;
        }
        .dd-progress-bar {
          height: 100%; background: #f97316;
          border-radius: 4px; width: 68%;
        }

        .dd-avail-card {
          background: #0f1210; border: 1px solid #1e2420;
          border-radius: 8px; padding: 16px; margin-bottom: 8px;
        }
        .dd-avail-name { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .dd-avail-addr { font-size: 11px; color: #aab4c8; margin-bottom: 10px; }
        .dd-badge-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
        .dd-badge {
          border-radius: 8px; padding: 3px 10px;
          font-size: 10px; font-weight: 800;
        }
        .dd-badge-green { background: rgba(61,214,140,0.1); border: 1px solid rgba(61,214,140,0.25); color: #3dd68c; }
        .dd-badge-muted { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #777; }
        .dd-badge-red { background: rgba(232,64,64,0.1); border: 1px solid rgba(232,64,64,0.25); color: #e84040; }
        .dd-badge-orange { background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25); color: #f97316; }

        .dd-btn-gold {
          display: flex; align-items: center; justify-content: center;
          background: #f97316; color: #000; border: none;
          border-radius: 8px; padding: 10px 16px;
          font-size: 11px; font-weight: 800; cursor: pointer;
          text-decoration: none; transition: background 0.15s;
          margin-bottom: 6px; width: 100%;
          text-transform: uppercase;
          letter-spacing: 0.11em;
        }
        .dd-btn-gold:hover { background: #ea6c10; }
        .dd-btn-ghost {
          display: flex; align-items: center; justify-content: center;
          background: transparent; color: #999;
          border: 1px solid #1e2420;
          border-radius: 8px; padding: 10px 16px;
          font-size: 11px; font-weight: 800; cursor: pointer;
          text-decoration: none; transition: all 0.15s;
          margin-bottom: 6px; width: 100%;
          text-transform: uppercase;
          letter-spacing: 0.11em;
        }
        .dd-btn-ghost:hover { color: #f97316; border-color: rgba(249,115,22,0.35); background: rgba(249,115,22,0.06); }

        .dd-summary-row {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,0.03); border: 1px solid #1e2420;
          border-radius: 8px; padding: 10px 14px; margin-bottom: 6px;
        }
        .dd-summary-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #777; }
        .dd-summary-val { font-size: 12px; font-weight: 700; color: #e0e0e0; }
        .dd-essentials-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 10px;
        }

        @media (max-width: 1024px) {
          .dd-two-col, .dd-bottom-grid { grid-template-columns: 1fr; }
          .dd-stat-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .dd-stat-grid { grid-template-columns: 1fr 1fr; }
          .dd-addr-grid { grid-template-columns: 1fr; }
        }

        .dt-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }
        .dt-page-title {
          font-size: 20px;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.01em;
        }
        .dt-page-sub {
          font-size: 13px;
          color: #666;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: 6px;
          font-weight: 600;
        }
        .dt-topbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .dt-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          color: #3dd68c;
          background: rgba(61,214,140,0.08);
          border: 1px solid rgba(61,214,140,0.16);
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .dt-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #3dd68c;
          animation: dtPulse 1.8s ease-in-out infinite;
        }
        .dt-step-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin: 14px 0 16px;
        }
        .dt-step-chip {
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
        .dt-step-chip:hover {
          color: #fff;
          border-color: rgba(249,115,22,0.25);
        }
        .dt-step-chip.active {
          background: rgba(249,115,22,0.1);
          color: #f97316;
          border-color: rgba(249,115,22,0.35);
        }
        .dt-step-chip.done {
          background: rgba(61,214,140,0.08);
          color: #3dd68c;
          border-color: rgba(61,214,140,0.22);
        }
        .dt-tutorial-panel {
          background: #141a18;
          border: 1px solid #1e2420;
          border-radius: 8px;
          padding: 18px;
          min-width: 0;
        }
        .dt-tutorial-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 12px;
          align-items: start;
        }
        .dt-tutorial-head {
          margin-bottom: 14px;
        }
        .dt-tutorial-badge {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #f97316;
          margin-bottom: 6px;
        }
        .dt-tutorial-title {
          font-size: 28px;
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #fff;
        }
        .dt-tutorial-copy {
          margin-top: 10px;
          font-size: 13px;
          line-height: 1.7;
          color: #aab4c8;
          max-width: 720px;
        }
        .dt-bullets {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 14px;
        }
        .dt-bullet {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          background: #0f1210;
          border: 1px solid #1e2420;
          border-radius: 8px;
          padding: 11px 13px;
        }
        .dt-bullet-dot {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 800;
          color: #fff;
          background: #0f1210;
        }
        .dt-bullet-dot.active {
          border-color: rgba(249,115,22,0.35);
          background: rgba(249,115,22,0.12);
          color: #f97316;
        }
        .dt-bullet-dot.done {
          border-color: rgba(61,214,140,0.28);
          background: rgba(61,214,140,0.1);
          color: #3dd68c;
        }
        .dt-bullet-title {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          line-height: 1.25;
        }
        .dt-bullet-copy {
          margin-top: 3px;
          font-size: 12px;
          line-height: 1.6;
          color: #aab4c8;
        }
        .dt-mini-stack {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: 12px;
        }
        .dt-mini-card {
          background: #0f1210;
          border: 1px solid #1e2420;
          border-radius: 8px;
          padding: 12px;
        }
        .dt-mini-label {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #777;
          margin-bottom: 6px;
        }
        .dt-mini-value {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
        }
        .dt-mini-value.orange { color: #f97316; }
        .dt-mini-value.green { color: #3dd68c; }
        .dt-actions {
          display: flex;
          gap: 8px;
          margin-top: 14px;
        }
        .dt-actions .dd-stripe-btn {
          flex: 1;
          justify-content: center;
        }
        .dt-actions .dt-back-btn {
          background: #0f1210;
          color: #999;
          border: 1px solid #1e2420;
        }
        .dt-actions .dt-back-btn:hover {
          color: #f97316;
          border-color: rgba(249,115,22,0.35);
          background: rgba(249,115,22,0.06);
        }
        .dt-side-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .dt-rating-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }
        .dt-rating-btn {
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
        .dt-rating-btn:hover {
          border-color: rgba(249,115,22,0.35);
          color: #f97316;
        }
        .dt-rating-btn.active {
          background: rgba(249,115,22,1);
          border-color: rgba(249,115,22,0.85);
          color: #120c01;
        }
        .dt-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .dt-pill-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        @media (max-width: 1024px) {
          .dt-tutorial-grid,
          .dt-bottom-grid {
            grid-template-columns: 1fr;
          }
          .dt-mini-stack {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .dt-tutorial-title { font-size: 22px; }
          .dd-stat-grid { grid-template-columns: 1fr 1fr !important; }
        }
      ` }} />

      <div className="dt-topbar">
        <div>
          <div className="dt-page-title">Driver Tutorial Preview</div>
          <div className="dt-page-sub">Route Board · style matched to the live driver portal</div>
        </div>
        <div className="dt-topbar-actions">
          <span className="dt-live-pill">
            <span className="dt-live-dot" />
            Tutorial Mode
          </span>
          <Link href="/driver/login" className="dd-btn-gold" style={{ width: "auto", marginBottom: 0 }}>
            Back to Login
          </Link>
        </div>
      </div>

      <div className="dd-stat-grid">
        <div className="dd-stat-card">
          <div className="dd-stat-label">Tutorial Step</div>
          <div className="dd-stat-value gold">{current.step}/4</div>
        </div>
        <div className="dd-stat-card">
          <div className="dd-stat-label">Portal Focus</div>
          <div className="dd-stat-value" style={{ fontSize: 22 }}>{current.title}</div>
        </div>
        <div className="dd-stat-card">
          <div className="dd-stat-label">Portal Style</div>
          <div className="dd-stat-value" style={{ fontSize: 22, color: "#3dd68c" }}>Match</div>
        </div>
      </div>

      <div className="dd-weather-card" style={{ marginBottom: 14 }}>
        <div>
          <div className="dd-weather-label">Tutorial note</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Same flat dashboard language as production</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11, color: "#666", maxWidth: 280 }}>
          The tutorial preview keeps the exact portal shell, button style, and panel spacing so drivers know what the real app feels like.
        </div>
      </div>

      <div className="dd-stripe-banner">
        <div className="dd-stripe-left">
          <div className="dd-stripe-icon" />
          <div>
            <span className="dd-stripe-title">Tutorial mode active.</span>
            <span className="dd-stripe-sub">This preview uses the same flat cards and border treatment as the live driver dashboard.</span>
          </div>
        </div>
        <span className="dd-stripe-connected">Preview Ready</span>
      </div>

      <div className="dt-step-row">
        {STEPS.map((item, index) => (
          <button
            key={item.step}
            type="button"
            className={`dt-step-chip ${index === step ? "active" : index < step ? "done" : ""}`}
            onClick={() => setStep(index)}
          >
            {item.step} · {item.label}
          </button>
        ))}
      </div>

      <div className="dt-tutorial-grid">
        <section className="dt-tutorial-panel">
          <div className="dt-tutorial-head">
            <div className="dt-tutorial-badge">Section {current.step} of 4</div>
            <div className="dt-tutorial-title">{current.title}</div>
            <div className="dt-tutorial-copy">{current.body}</div>
          </div>

          <div className="dt-bullets">
            {current.bullets.map((bullet, index) => (
              <div key={bullet} className={`dt-bullet ${panelTone(index)}`}>
                <div className={`dt-bullet-dot ${index < step ? "done" : index === step ? "active" : ""}`}>{index + 1}</div>
                <div className="min-w-0">
                  <div className="dt-bullet-title">
                    {index === 0 ? "First glance" : index === 1 ? "What stays visible" : "Why it helps"}
                  </div>
                  <div className="dt-bullet-copy">{bullet}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            {renderSnapshot()}
          </div>

          {current.highlight === "delivery" && (
            <div className="mt-4 rounded-[8px] border border-white/8 bg-black/20 px-4 py-3">
              <div className="mb-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#f97316]" style={{ animation: "dtPulse 1.8s ease-in-out infinite" }}>
                Routing in progress
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[#f97316]/85" style={{ width: "68%", animation: "dtSweep 2.2s linear infinite" }} />
              </div>
            </div>
          )}

          {current.highlight === "nav" && (
            <div className="mt-4 rounded-[8px] border border-[#3dd68c]/20 bg-[#3dd68c]/[0.05] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#3dd68c]">
              Navigation and support stay in the same shell as the live dashboard.
            </div>
          )}

          <div className="dt-actions">
            <button
              type="button"
              className="dd-btn-ghost dt-back-btn"
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              disabled={step === 0}
              style={{ opacity: step === 0 ? 0.35 : 1, pointerEvents: step === 0 ? "none" : "auto", marginBottom: 0 }}
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="dd-btn-gold"
                onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}
                style={{ marginBottom: 0 }}
              >
                Next →
              </button>
            ) : (
              <Link href="/driver/login" className="dd-btn-gold" style={{ marginBottom: 0 }}>
                Done ✓
              </Link>
            )}
          </div>
        </section>

        <aside className="dt-side-stack">
          <div className="dt-tutorial-panel">
            <div className="dd-panel-section-label">Preview Controls</div>
            <div className="dt-mini-stack">
              <div className="dt-mini-card">
                <div className="dt-mini-label">Current status</div>
                <div className="dt-mini-value">{current.highlight === "nav" ? "Ready" : current.label}</div>
              </div>
              <div className="dt-mini-card">
                <div className="dt-mini-label">Active area</div>
                <div className="dt-mini-value orange">{current.title}</div>
              </div>
              <div className="dt-mini-card">
                <div className="dt-mini-label">Live shell</div>
                <div className="dt-mini-value green">Match</div>
              </div>
            </div>
          </div>

          <div className="dt-tutorial-panel">
            <div className="dd-panel-section-label">Portal Hints</div>
            <div className="space-y-2">
              {[
                "The driver preview keeps the same flat dashboard cards as production.",
                "Support, settlements, and profile all use the same shell and spacing.",
                "Mobile and desktop stay aligned so the tutorial never feels like a separate app.",
              ].map((text) => (
                <div key={text} className="flex items-start gap-2 rounded-[8px] border border-white/8 bg-black/20 px-3 py-2.5">
                  <span className="mt-0.5 text-[#f97316]">•</span>
                  <span className="text-[12px] leading-relaxed text-white/65">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="dt-bottom-grid" style={{ marginTop: 12 }}>
        <div className="dt-tutorial-panel">
          <div className="dd-panel-section-label">Recent Trips Preview</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { name: "Pilot Restaurant A", dest: "→ Market St · 12 min ago", pay: "$18.40" },
              { name: "Pilot Restaurant B", dest: "→ Oak Ave · 9 min ago", pay: "$14.75" },
              { name: "Pilot Restaurant C", dest: "→ Pine St · 7 min ago", pay: "$11.20" },
            ].map((trip) => (
              <div key={trip.name} className="dd-avail-card" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <div className="dd-avail-name">{trip.name}</div>
                    <div className="dd-avail-addr">{trip.dest}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#f97316" }}>{trip.pay}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dt-tutorial-panel">
          <div className="dd-panel-section-label">Tutorial Feedback</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Was this walkthrough helpful?</div>
          <p style={{ marginTop: 8, fontSize: 12, lineHeight: 1.6, color: "#aab4c8" }}>
            Rate the preview so we can keep the driver onboarding flow clean and production-ready.
          </p>
          <div className="dt-rating-row">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`dt-rating-btn ${rating === value ? "active" : ""}`}
                onClick={() => setRating(value)}
                aria-label={`Rate tutorial ${value} out of 5`}
              >
                {value}
              </button>
            ))}
          </div>
          <button type="button" className="dd-btn-gold" style={{ marginTop: 14, marginBottom: 0 }}>
            Send Feedback
          </button>
        </div>
      </div>
    </DriverPortalWrapper>
  );
}
