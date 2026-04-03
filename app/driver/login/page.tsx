"use client";

import { Suspense } from "react";
import Link from "next/link";
import DriverLoginForm from "./DriverLoginForm";
import Logo from "@/components/Logo";

export default function DriverLoginPage() {
    return (
        <div className="login-grid selection:bg-primary/30">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=Barlow+Condensed:ital,wght@0,700;0,800;1,700;1,800&display=swap');
                
                body { margin: 0; background: #0c0e13; overflow-x: hidden; }
                .login-grid { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; background: #0c0e13; }
                
                /* ── LEFT PANEL ── */
                .left-panel { position: relative; min-height: 100vh; display: flex; flex-direction: column; justify-content: flex-end; padding: 40px 44px; overflow: hidden; background: #0e1018; }
                .bg-img { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; object-fit: cover; grayscale: 0.1; opacity: 0.8; filter: contrast(1.1); transition: transform 0.5s ease-out; }
                .bg-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(10,12,18,0.55) 0%, rgba(10,12,18,0.3) 40%, rgba(10,12,18,0.85) 100%); z-index: 1; }
                .bg-grid { position: absolute; inset: 0; background-image: 
                    repeating-linear-gradient(0deg, transparent, transparent 48px, rgba(255,255,255,0.02) 48px, rgba(255,255,255,0.02) 49px),
                    repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(255,255,255,0.02) 48px, rgba(255,255,255,0.02) 49px); 
                    z-index: 2; 
                }
                
                .left-content { position: relative; z-index: 3; animation: slideUp 0.8s ease-out; }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                .logo-row { position: absolute; top: 36px; left: 44px; display: flex; align-items: center; gap: 12px; z-index: 4; }
                
                .fleet-badge { display: inline-flex; align-items: center; gap: 6px; background: #1a1200; border: 1px solid #3a1010; padding: 5px 14px; margin-bottom: 20px; border-radius: 4px; }
                .badge-dot { width: 7px; height: 7px; background: #e8a230; border-radius: 50%; box-shadow: 0 0 10px #e8a230; }
                .badge-text { font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #e8a230; }

                .hero-heading { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(52px, 6vw, 80px); font-weight: 800; font-style: italic; text-transform: uppercase; line-height: 0.95; margin-bottom: 16px; }
                .hero-heading .white { color: #fff; }
                .hero-heading .gold { color: #e8a230; }
                
                .hero-sub { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6; max-width: 380px; margin-bottom: 32px; }

                .feature-list { display: flex; flex-direction: column; gap: 4px; }
                .feature-item { display: flex; align-items: center; gap: 14px; padding: 12px 16px; background: rgba(15,18,25,0.7); border: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(8px); transition: all 0.2s; }
                .feature-item:hover { border-color: rgba(232,162,48,0.2); transform: translateX(4px); }
                .feature-icon { width: 36px; height: 36px; background: rgba(232,162,48,0.12); border: 1px solid rgba(232,162,48,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .feature-name { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 2px; }
                .feature-desc { font-size: 11px; color: rgba(255,255,255,0.35); }

                /* ── RIGHT PANEL ── */
                .right-panel { background: #0c0e13; border-left: 1px solid #1c1f28; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 72px; }
                .form-wrap { width: 100%; max-width: 440px; animation: fadeIn 1s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                
                .form-title { font-family: 'DM Sans', sans-serif; font-size: 32px; font-weight: 700; font-style: italic; color: #fff; margin-bottom: 4px; letter-spacing: -0.3px; }
                .form-subtitle { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #e8a230; margin-bottom: 32px; }

                @media (max-width: 1024px) { 
                    .login-grid { grid-template-columns: 1fr; }
                    .left-panel { display: none; }
                }
            ` }} />

            <div className="left-panel">
                <img src="/driver_login_background_v2.png" alt="Driving Background" className="bg-img" />
                <div className="bg-overlay" />
                <div className="bg-grid" />
                
                <div className="logo-row">
                    <Logo size="lg" />
                </div>

                <div className="left-content">
                    <div className="fleet-badge">
                        <span className="badge-dot" />
                        <span className="badge-text">Fleet Access Program</span>
                    </div>

                    <div className="hero-heading">
                        <div className="white">Ready to</div>
                        <div className="gold">Earn?</div>
                    </div>

                    <div className="hero-sub">Connect with the TrueServe platform and start accepting local delivery routes in your area today.</div>

                    <div className="feature-list">
                        <div className="feature-item">
                            <div className="feature-icon">💰</div>
                            <div>
                                <div className="feature-name">Daily Payouts</div>
                                <div className="feature-desc">Drive today, get paid today. Transparent splits.</div>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🏎️</div>
                            <div>
                                <div className="feature-name">Optimized Routing</div>
                                <div className="feature-desc">Smart dispatching to minimize fuel and time.</div>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🏆</div>
                            <div>
                                <div className="feature-name">Fleet Support</div>
                                <div className="feature-desc">Priority 24/7 assistance for every mile.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="right-panel">
                <div className="form-wrap">
                    <div className="form-title">Fleet Authorization</div>
                    <div className="form-subtitle">Secure Uplink Terminal</div>

                    <Suspense fallback={<div className="text-center text-slate-500 text-[10px] font-black uppercase tracking-widest animate-pulse p-12">Uplinking Terminal...</div>}>
                        <DriverLoginForm />
                    </Suspense>

                    <div className="mt-8 flex items-center justify-center gap-2 text-[#2a2f3a] font-black text-[9px] uppercase tracking-[0.2em]">
                        <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><rect x="1" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M3 5V3.5a2 2 0 014 0V5" stroke="currentColor" strokeWidth="1.2"/></svg>
                        Encrypted Connection · Secure Hub Access
                    </div>
                </div>
            </div>
        </div>
    );
}
