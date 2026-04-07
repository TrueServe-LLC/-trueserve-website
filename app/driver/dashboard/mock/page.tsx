"use client";

import { useState } from "react";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;1,700&family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #0a0d12;
  --surface: #10151e;
  --surface2: #161d2a;
  --border: #1e2c3a;
  --gold: #e8a020;
  --gold-dim: #9b6a14;
  --green: #22c55e;
  --green-dim: #14532d;
  --cyan: #38bdf8;
  --text: #c8d8e8;
  --text-dim: #5a7080;
  --red: #ef4444;
  --amber: #f59e0b;
}

.mock-app {
  font-family: 'Rajdhani', sans-serif;
  background: var(--bg);
  min-height: 100dvh;
  color: var(--text);
  max-width: 420px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* scanline overlay */
.mock-app::before {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.07) 2px,
    rgba(0,0,0,0.07) 4px
  );
  pointer-events: none;
  z-index: 100;
}

/* ── HEADER ── */
.header {
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(180deg, #0d1520 0%, transparent 100%);
}

.header-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1;
}
.header-title span { color: var(--gold); font-style: italic; }

.header-sub {
  font-family: 'Share Tech Mono', monospace;
  font-size: 8px;
  color: var(--text-dim);
  letter-spacing: 0.12em;
  margin-top: 5px;
  text-transform: uppercase;
}

.header-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.status-dot {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 9px;
  color: var(--green);
  letter-spacing: 0.1em;
}
.dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 6px var(--green);
  animation: pulse 2s infinite;
}
.dot.amber { background: var(--amber); box-shadow: 0 0 6px var(--amber); }
@keyframes pulse {
  0%,100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ── NAV TABS ── */
.nav-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.nav-tab {
  flex: 1;
  padding: 12px 0;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--text-dim);
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  text-transform: uppercase;
}
.nav-tab.active {
  color: var(--gold);
  border-bottom-color: var(--gold);
  background: rgba(232, 160, 32, 0.05);
}

/* ── SCROLL AREA ── */
.scroll-area {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
}
.scroll-area::-webkit-scrollbar { display: none; }

/* ── OPPORTUNITY CARD ── */
.opp-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.opp-card:hover { border-color: var(--gold-dim); }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
}

.card-name {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.05em;
  font-style: italic;
  text-transform: uppercase;
}

.live-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 9px;
  color: var(--green);
  letter-spacing: 0.1em;
}

.card-body {
  padding: 12px 14px;
  background: var(--surface2);
}

.card-address {
  font-size: 13px;
  color: var(--text-dim);
  margin-bottom: 10px;
  letter-spacing: 0.02em;
}

.card-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.badge-yield {
  background: var(--green-dim);
  border: 1px solid var(--green);
  color: var(--green);
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.badge-dist {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.engage-btn {
  background: var(--gold);
  color: #0a0d12;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 14px;
  font-weight: 800;
  font-style: italic;
  letter-spacing: 0.1em;
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  text-transform: uppercase;
}
.engage-btn:hover {
  background: #f0b030;
  box-shadow: 0 0 12px rgba(232,160,32,0.5);
}
.engage-btn:active { transform: scale(0.97); }

/* ── SETTLEMENT BRIDGE ── */
.settlement-card {
  background: linear-gradient(135deg, #0d1520 0%, #131c10 100%);
  border: 1px solid #2a3a1a;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.settlement-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--text-dim);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.settlement-amount {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 42px;
  font-weight: 800;
  font-style: italic;
  color: var(--green);
  line-height: 1;
}

.settlement-sub {
  font-family: 'Share Tech Mono', monospace;
  font-size: 8px;
  color: var(--text-dim);
  letter-spacing: 0.1em;
  margin-top: 6px;
  text-transform: uppercase;
}

.payout-btn {
  background: var(--green);
  color: #0a0d12;
  border: none;
  border-radius: 50%;
  width: 46px;
  height: 46px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(34,197,94,0.4);
  transition: all 0.15s;
}
.payout-btn:hover { transform: scale(1.08); }

/* ── ACTIVE DELIVERY SCREEN ── */
.delivery-screen {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
}
.delivery-screen::-webkit-scrollbar { display: none; }

.progress-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #1a1408;
  border: 1px solid var(--gold-dim);
  border-radius: 6px;
  padding: 8px 14px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 9px;
  color: var(--gold);
  letter-spacing: 0.12em;
  align-self: flex-start;
  text-transform: uppercase;
}

.delivery-name {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 38px;
  font-weight: 800;
  font-style: italic;
  letter-spacing: 0.04em;
  line-height: 0.9;
  text-transform: uppercase;
}

.op-id-block {
  margin: 4px 0;
}

.op-id-label {
  font-family: 'Share Tech Mono', monospace;
  font-size: 9px;
  color: var(--text-dim);
  letter-spacing: 0.15em;
  margin-bottom: 2px;
  text-transform: uppercase;
}

.op-id {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 20px;
  font-weight: 700;
  font-style: italic;
  color: var(--gold);
  letter-spacing: 0.06em;
}

.drop-card {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.map-thumb {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  background: #0a1520;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.drop-info { flex: 1; }

.drop-label {
  font-family: 'Share Tech Mono', monospace;
  font-size: 9px;
  color: var(--text-dim);
  letter-spacing: 0.15em;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.drop-address {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.2;
  margin-bottom: 5px;
  text-transform: uppercase;
}

.recipient {
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  color: var(--cyan);
  letter-spacing: 0.08em;
  font-style: italic;
  text-transform: uppercase;
}

/* delivery toggle */
.toggle-bar {
  display: flex;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.toggle-opt {
  flex: 1;
  padding: 10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-dim);
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
}
.toggle-opt.active {
  background: var(--gold);
  color: #0a0d12;
}

/* photo area */
.photo-zone {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.photo-area {
  height: 160px;
  background: #060a0f;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
}

.camera-icon {
  font-size: 32px;
  opacity: 0.3;
}

.photo-tap-hint {
  font-family: 'Share Tech Mono', monospace;
  font-size: 9px;
  color: var(--text-dim);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.corner {
  position: absolute;
  width: 16px; height: 16px;
  border-color: var(--gold-dim);
  border-style: solid;
  opacity: 0.6;
}
.corner.tl { top: 10px; left: 10px; border-width: 2px 0 0 2px; }
.corner.tr { top: 10px; right: 10px; border-width: 2px 2px 0 0; }
.corner.bl { bottom: 10px; left: 10px; border-width: 0 0 2px 2px; }
.corner.br { bottom: 10px; right: 10px; border-width: 0 2px 2px 0; }

.photo-footer {
  padding: 8px 14px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 8px;
  color: var(--text-dim);
  letter-spacing: 0.1em;
  border-top: 1px solid var(--border);
  text-align: center;
  text-transform: uppercase;
}

/* complete btn */
.complete-btn {
  background: linear-gradient(135deg, #1a1408, #221908);
  border: 1px solid var(--gold-dim);
  color: var(--gold);
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.15em;
  padding: 16px;
  border-radius: 10px;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;
  text-transform: uppercase;
  margin-top: 4px;
}
.complete-btn:hover {
  background: var(--gold);
  color: #0a0d12;
  box-shadow: 0 0 20px rgba(232,160,32,0.3);
}

@media (min-width: 421px) {
  .mock-app {
    margin: 40px auto;
    border-radius: 20px;
    height: calc(100vh - 80px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    border: 1px solid var(--border);
  }
}
`;

const opportunities = [
  { name: "Emerald Kitchen", address: "842 Poplar Tent Rd, Concord NC", yield: "$3.84", dist: "1.2 MI" },
  { name: "Mount Airy BBQ", address: "1220 Rockford St, Mount Airy NC", yield: "$3.56", dist: "0.8 MI" },
  { name: "Harbor Ramen", address: "310 S Tryon St, Charlotte NC", yield: "$4.12", dist: "2.1 MI" },
];

function SectorScreen() {
  return (
    <div className="scroll-area">
      {opportunities.map((o) => (
        <div className="opp-card" key={o.name}>
          <div className="card-header">
            <span className="card-name">{o.name}</span>
            <span className="live-badge">
              <span className="dot" /> LIVE
            </span>
          </div>
          <div className="card-body">
            <div className="card-address">{o.address}</div>
            <div className="card-meta">
              <span className="badge-yield">{o.yield} YIELD</span>
              <span className="badge-dist">{o.dist}</span>
            </div>
            <button className="engage-btn">ENGAGE</button>
          </div>
        </div>
      ))}

      <div className="settlement-card">
        <div>
          <div className="settlement-label">Settlement Bridge</div>
          <div className="settlement-amount">$62.00</div>
          <div className="settlement-sub">TAP ⚡ TO REQUEST INSTANT PAYOUT</div>
        </div>
        <button className="payout-btn">⚡</button>
      </div>
    </div>
  );
}

function ActiveScreen() {
  const [dropMode, setDropMode] = useState("door");

  return (
    <div className="delivery-screen">
      <div className="progress-badge">
        <span className="dot amber" /> DELIVERY IN PROGRESS
      </div>

      <div>
        <div className="delivery-name">SUSHI NEKO</div>
      </div>

      <div className="op-id-block">
        <div className="op-id-label">OPERATIONAL ID</div>
        <div className="op-id">#TIVE-1</div>
      </div>

      <div className="drop-card">
        <div className="map-thumb">📍</div>
        <div className="drop-info">
          <div className="drop-label">DROP LOCATION</div>
          <div className="drop-address">420 Main St,<br />Charlotte NC</div>
          <div className="recipient">RECIPIENT: ALEX RIVERA</div>
        </div>
      </div>

      <div className="toggle-bar">
        <button
          className={`toggle-opt${dropMode === "hand" ? " active" : ""}`}
          onClick={() => setDropMode("hand")}
        >
          HAND TO ME
        </button>
        <button
          className={`toggle-opt${dropMode === "door" ? " active" : ""}`}
          onClick={() => setDropMode("door")}
        >
          LEAVE AT DOOR
        </button>
      </div>

      <div className="photo-zone">
        <div className="photo-area">
          <div className="corner tl" /><div className="corner tr" />
          <div className="corner bl" /><div className="corner br" />
          <div className="camera-icon">📷</div>
          <div className="photo-tap-hint">TAP TO CAPTURE PROOF PHOTO</div>
        </div>
        <div className="photo-footer">PHOTO WILL BE SENT TO CUSTOMER</div>
      </div>

      <button className="complete-btn">Complete Delivery</button>
    </div>
  );
}

export default function MockDriverPortal() {
  const [screen, setScreen] = useState("sector");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="mock-app">
        <div className="header">
          <div>
            <div className="header-title">
              {screen === "sector" ? (
                <>SECTOR <span>OPPORTUNITIES</span></>
              ) : (
                <>ACTIVE <span>FULFILLMENT</span></>
              )}
            </div>
            <div className="header-sub">
              {screen === "sector"
                ? "UNASSIGNED PAYLOADS · OPERATIONAL VICINITY"
                : "ACTIVE FULFILLMENT NEURAL LINKS"}
            </div>
          </div>
          <div className="header-status">
            <div className="status-dot"><span className="dot" />ONLINE</div>
          </div>
        </div>

        <div className="nav-tabs">
          <button
            className={`nav-tab${screen === "sector" ? " active" : ""}`}
            onClick={() => setScreen("sector")}
          >
            SECTOR OPS
          </button>
          <button
            className={`nav-tab${screen === "active" ? " active" : ""}`}
            onClick={() => setScreen("active")}
          >
            ACTIVE DELIVERY
          </button>
        </div>

        {screen === "sector" ? <SectorScreen /> : <ActiveScreen />}
      </div>
    </>
  );
}
