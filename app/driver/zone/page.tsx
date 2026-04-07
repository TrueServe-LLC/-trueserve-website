"use client";

import React from 'react';
import Link from 'next/link';
import Logo from "@/components/Logo";

export default function DeliveryZonePage() {
    const handleRefresh = () => {
        // Tactical refresh feedback
        const btn = document.querySelector('.refresh-btn');
        if (btn) {
            btn.innerHTML = '🔄 Scanning Network...';
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    };

    return (
        <div style={{
            backgroundColor: '#0a0d12',
            color: '#c8d8e8',
            fontFamily: "'Nunito', sans-serif",
            minHeight: '100vh',
            position: 'relative'
        }} className="selection:bg-[#e8a020]/30 selection:text-white antialiased">
            {/* INLINE CSS BLOCK FROM TEMPLATE */}
            <style dangerouslySetInnerHTML={{ __html: `
                :root {
                  --bg: #0a0d12;
                  --surface: #10151e;
                  --surface2: #161d2a;
                  --border: #1e2c3a;
                  --gold: #e8a020;
                  --gold-dim: #9b6a14;
                  --gold-light: rgba(232,160,32,0.08);
                  --green: #22c55e;
                  --cyan: #38bdf8;
                  --text: #c8d8e8;
                  --text-mid: #7a90a8;
                  --text-dim: #3a5060;
                  --shadow: 0 2px 16px rgba(0,0,0,0.4);
                  --shadow-lg: 0 8px 40px rgba(0,0,0,0.5);
                }

                .scanline-overlay {
                  content: '';
                  position: fixed; inset: 0;
                  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px);
                  pointer-events: none; z-index: 100;
                  opacity: 0.15;
                }

                /* TOPBAR */
                .topbar {
                  background: var(--surface);
                  border-bottom: 2px solid var(--border);
                  padding: 0 24px;
                  display: flex; justify-content: space-between; align-items: center;
                  height: 72px; position: sticky; top: 0; z-index: 50;
                  box-shadow: var(--shadow-lg);
                  backdrop-filter: blur(20px);
                }

                @media (min-width: 768px) {
                  .topbar { padding: 0 48px; }
                }

                .topbar-right { display: flex; align-items: center; gap: 12px; }
                @media (min-width: 768px) { .topbar-right { gap: 20px; } }

                .topbar-locating { font-size: 11px; font-weight: 700; color: var(--text-mid); text-transform: uppercase; letter-spacing: 0.1em; display: none; }
                @media (min-width: 640px) { .topbar-locating { display: block; } }

                .live-pill {
                  display: flex; align-items: center; gap: 6px;
                  background: rgba(34,197,94,0.1);
                  border: 1px solid rgba(34,197,94,0.4);
                  border-radius: 20px; padding: 6px 12px;
                  font-size: 11px; font-weight: 800; color: var(--green);
                  text-transform: uppercase; letter-spacing: 0.05em;
                }
                @media (min-width: 768px) {
                    .live-pill { padding: 7px 16px; font-size: 13px; gap: 8px; }
                }

                .live-dot {
                  width: 8px; height: 8px; border-radius: 50%;
                  background: var(--green); box-shadow: 0 0 10px var(--green);
                  animation: pulse-live 2s infinite;
                }
                @keyframes pulse-live { 0%,100%{opacity:1; transform: scale(1);} 50%{opacity:0.4; transform: scale(0.85);} }

                /* PAGE */
                .page-container {
                  max-width: 1100px; margin: 0 auto;
                  padding: 32px 20px;
                  display: grid;
                  grid-template-columns: 1fr;
                  gap: 32px; align-items: start;
                }
                @media (min-width: 1024px) {
                  .page-container { grid-template-columns: 1fr 1fr; padding: 48px 40px; }
                }

                /* LEFT COL & INFO CARDS */
                .left-col { display: flex; flex-direction: column; gap: 20px; }
                @media (min-width: 768px) { .left-col { gap: 24px; } }

                .col-title {
                  font-family: 'Barlow Condensed', sans-serif;
                  font-size: 26px; font-weight: 900; font-style: italic;
                  color: var(--text); margin-bottom: 4px; text-transform: uppercase;
                  letter-spacing: -0.01em;
                }
                @media (min-width: 768px) { .col-title { font-size: 32px; margin-bottom: 6px; } }

                .col-subtitle { font-size: 11px; font-weight: 700; color: var(--text-mid); text-transform: uppercase; letter-spacing: 0.05em; }
                @media (min-width: 768px) { .col-subtitle { font-size: 13px; } }

                .info-card {
                  background: var(--surface);
                  border: 1px solid var(--border);
                  border-radius: 16px; overflow: hidden;
                  box-shadow: var(--shadow);
                }
                @media (min-width: 768px) { .info-card { border-radius: 20px; } }

                .info-row {
                  display: flex; align-items: center; gap: 14px;
                  padding: 16px 18px;
                  border-bottom: 1px solid var(--border);
                  transition: all 0.2s;
                }
                @media (min-width: 768px) { .info-row { gap: 18px; padding: 20px 24px; } }

                .info-row:last-child { border-bottom: none; }
                .info-row:hover { background: var(--surface2); }

                .info-icon {
                  width: 44px; height: 44px; border-radius: 10px;
                  background: var(--surface2); border: 2px solid var(--border);
                  display: flex; align-items: center; justify-content: center;
                  font-size: 20px; flex-shrink: 0;
                }
                @media (min-width: 768px) { .info-icon { width: 52px; height: 52px; border-radius: 14px; font-size: 24px; } }

                .info-text { flex: 1; }
                .info-label {
                  font-size: 10px; font-weight: 800;
                  color: var(--text-dim); letter-spacing: 0.12em;
                  text-transform: uppercase; margin-bottom: 2px;
                }
                @media (min-width: 768px) { .info-label { font-size: 11px; margin-bottom: 4px; letter-spacing: 0.15em; } }
                .info-value { font-size: 15px; font-weight: 800; color: #fff; letter-spacing: -0.01em; }
                @media (min-width: 768px) { .info-value { font-size: 18px; } }

                .info-badge {
                  font-size: 10px; font-weight: 900;
                  padding: 4px 10px; border-radius: 20px;
                  text-transform: uppercase; letter-spacing: 0.05em;
                }
                @media (min-width: 768px) { .info-badge { font-size: 11px; padding: 5px 12px; letter-spacing: 0.08em; } }

                .badge-green {
                  background: rgba(34,197,94,0.1);
                  border: 1.5px solid rgba(34,197,94,0.5);
                  color: var(--green);
                }
                .badge-gold {
                  background: var(--gold-light);
                  border: 1.5px solid var(--gold-dim);
                  color: var(--gold);
                }

                /* REFRESH BTN */
                .refresh-btn {
                  width: 100%;
                  background: linear-gradient(to right, var(--gold), #c87010);
                  color: #0c0e12;
                  font-family: 'Barlow Condensed', sans-serif;
                  font-size: 18px; font-weight: 900; font-style: italic;
                  letter-spacing: 0.12em; padding: 16px;
                  border: none; border-radius: 12px; cursor: pointer;
                  box-shadow: 0 4px 20px rgba(232,160,32,0.3);
                  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                  display: flex; align-items: center; justify-content: center; gap: 10px;
                  text-transform: uppercase;
                }
                @media (min-width: 768px) { 
                    .refresh-btn { font-size: 20px; padding: 18px; border-radius: 16px; gap: 12px; letter-spacing: 0.15em; } 
                }
                .refresh-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(232,160,32,0.5); }
                .refresh-btn:active { transform: scale(0.97); }

                /* RIGHT COL & STATS GRID */
                .right-col { display: flex; flex-direction: column; gap: 24px; }
                .stats-grid {
                  display: grid; grid-template-columns: 1fr 1fr;
                  gap: 12px;
                }
                @media (min-width: 768px) { .stats-grid { gap: 16px; } }

                .stat-card {
                  background: var(--surface);
                  border: 1px solid var(--border);
                  border-radius: 16px; padding: 18px;
                  box-shadow: var(--shadow);
                  transition: all 0.2s;
                }
                @media (min-width: 768px) { .stat-card { border-radius: 18px; padding: 24px; } }
                .stat-card:hover { border-color: var(--gold-dim); transform: translateY(-2px); }

                .stat-icon { font-size: 22px; margin-bottom: 6px; }
                @media (min-width: 768px) { .stat-icon { font-size: 26px; margin-bottom: 8px; } }
                .stat-val {
                  font-family: 'Barlow Condensed', sans-serif;
                  font-size: 32px; font-weight: 900; font-style: italic;
                  color: var(--gold); line-height: 0.9; margin-bottom: 4px;
                }
                @media (min-width: 768px) { .stat-val { font-size: 42px; margin-bottom: 6px; } }
                .stat-label { font-size: 11px; font-weight: 800; color: var(--text-mid); text-transform: uppercase; letter-spacing: 0.05em; }
                @media (min-width: 768px) { .stat-label { font-size: 13px; } }
                .stat-sub { font-size: 10px; font-weight: 700; color: var(--text-dim); margin-top: 2px; text-transform: uppercase; font-style: italic; }

                /* PARTNER CARD */
                .partner-card {
                  background: linear-gradient(145deg, #0d1a10, #101a0d);
                  border: 2px solid #1e3a20;
                  border-radius: 20px; padding: 24px;
                  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                  position: relative; overflow: hidden;
                }
                @media (min-width: 768px) { .partner-card { border-radius: 24px; padding: 32px; } }
                .partner-card::after {
                  content: '🍴';
                  position: absolute; right: 20px; bottom: 16px;
                  font-size: 54px; opacity: 0.05; pointer-events: none;
                }
                @media (min-width: 768px) { .partner-card::after { right: 28px; bottom: 20px; font-size: 84px; } }

                .partner-tag {
                  display: inline-flex; align-items: center; gap: 6px;
                  background: rgba(34,197,94,0.15);
                  border: 1.5px solid rgba(34,197,94,0.4);
                  border-radius: 20px; padding: 4px 10px;
                  font-size: 10px; font-weight: 800; color: var(--green);
                  letter-spacing: 0.08em; margin-bottom: 14px; text-transform: uppercase;
                }
                @media (min-width: 768px) { .partner-tag { padding: 6px 14px; font-size: 12px; letter-spacing: 0.1em; margin-bottom: 18px; } }

                .partner-title {
                  font-size: 20px; font-weight: 900;
                  color: #fff; margin-bottom: 10px; line-height: 1.2;
                  letter-spacing: -0.01em;
                }
                @media (min-width: 768px) { .partner-title { font-size: 24px; margin-bottom: 12px; } }

                .partner-desc {
                  font-size: 13px; font-weight: 600;
                  color: var(--text-mid); line-height: 1.5; margin-bottom: 20px;
                }
                @media (min-width: 768px) { .partner-desc { font-size: 15px; margin-bottom: 24px; } }

                .partner-btn {
                  display: inline-flex; align-items: center; gap: 8px;
                  background: transparent; border: 2.5px solid var(--green);
                  color: var(--green); border-radius: 10px; padding: 10px 20px;
                  font-size: 13px; font-weight: 900; cursor: pointer;
                  transition: all 0.2s; letter-spacing: 0.06em;
                  text-transform: uppercase; text-decoration: none;
                }
                @media (min-width: 768px) { .partner-btn { padding: 12px 24px; font-size: 14px; letter-spacing: 0.1em; border-radius: 12px; gap: 10px; } }
                .partner-btn:hover { background: var(--green); color: #001a00; box-shadow: 0 0 20px var(--green); }
            ` }} />

            <div className="scanline-overlay"></div>

            <div className="topbar">
                <Logo size="sm" />
                <div className="topbar-right">
                    <div className="topbar-locating">📍 Searching Sector...</div>
                    <div className="live-pill">
                        <span className="live-dot"></span> 
                        Network Live
                    </div>
                </div>
            </div>

            <div className="page-container">
                {/* LEFT: Zone Info */}
                <div className="left-col">
                    <div>
                        <div className="col-title">Your Delivery Zone</div>
                        <div className="col-subtitle">Current coverage and delivery details &nbsp;·&nbsp; <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>VERSION 1.0 SECURE</span></div>
                    </div>

                    <div className="info-card">
                        <div className="info-row">
                            <div className="info-icon">🗺️</div>
                            <div className="info-text">
                                <div className="info-label">Coverage Area</div>
                                <div className="info-value">All Restaurants</div>
                            </div>
                            <span className="info-badge badge-gold">Universal</span>
                        </div>
                        <div className="info-row">
                            <div className="info-icon">⚡</div>
                            <div className="info-text">
                                <div className="info-label">Average Delivery Time</div>
                                <div className="info-value">Under 24 Minutes</div>
                            </div>
                            <span className="info-badge badge-green">Fast</span>
                        </div>
                        <div className="info-row">
                            <div className="info-icon">🛡️</div>
                            <div className="info-text">
                                <div className="info-label">Account Status</div>
                                <div className="info-value">Fully Verified</div>
                            </div>
                            <span className="info-badge badge-green">✓ Active</span>
                        </div>
                        <div className="info-row">
                            <div className="info-icon">📦</div>
                            <div className="info-text">
                                <div className="info-label">Order Types</div>
                                <div className="info-value">Restaurant Delivery</div>
                            </div>
                            <span className="info-badge badge-gold">Only</span>
                        </div>
                    </div>

                    <button className="refresh-btn" onClick={handleRefresh}>
                        🔄 Refresh Nearby Restaurants
                    </button>
                </div>

                {/* RIGHT: Stats + Partner */}
                <div className="right-col">
                    <div>
                        <div className="col-title">Zone Statistics</div>
                        <div className="col-subtitle">Live telemetry from your immediate sector</div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">🍽️</div>
                            <div className="stat-val" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>SCANNING...</div>
                            <div className="stat-label">Restaurants</div>
                            <div className="stat-sub">Identifying Active Sources</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">⚡</div>
                            <div className="stat-val" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>CALCULATING...</div>
                            <div className="stat-label">Avg. Pay</div>
                            <div className="stat-sub">Based on live demand</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🕐</div>
                            <div className="stat-val" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>SYNCING...</div>
                            <div className="stat-label">Avg. Drive</div>
                            <div className="stat-sub">To restaurant relay</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">📍</div>
                            <div className="stat-val" style={{ fontSize: '18px', letterSpacing: '0.1em' }}>IDENTIFYING...</div>
                            <div className="stat-label">Live Drivers</div>
                            <div className="stat-sub">Tracking sector units</div>
                        </div>
                    </div>

                    <div className="partner-card">
                        <div className="partner-tag">🍴 For Restaurant Owners</div>
                        <div className="partner-title">Own a restaurant in this area?</div>
                        <div className="partner-desc">
                            Stop paying high commissions to big delivery platforms. Join TrueServe and keep more of your earnings with our independent delivery network.
                        </div>
                        <Link href="/merchant/signup" className="partner-btn">Get Started as a Partner →</Link>
                    </div>
                </div>
            </div>
            
            <footer className="py-12 border-t border-[#1e2c3a] text-center opacity-30 mt-20">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#3a5060] italic">
                   TrueServe // Delivery Zone Intelligence Terminal
                </div>
            </footer>
        </div>
    );
}
