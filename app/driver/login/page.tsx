"use client";

import { Suspense } from "react";
import Link from "next/link";
import DriverLoginForm from "./DriverLoginForm";
import Logo from "@/components/Logo";

export default function DriverLoginPage() {
    return (
        <div className="login-grid selection:bg-[#E8A020]/30 min-h-screen bg-[#0A0A0A]">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;1,700;1,800&family=Barlow:wght@300;400;500;600;700&display=swap');
                
                body { margin: 0; background: #0A0A0A; overflow-x: hidden; font-family: 'Barlow', sans-serif; }
                .login-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; min-height: 100vh; }
                
                /* ── LEFT PANEL ── */
                .left-panel { position: relative; min-height: 100vh; display: flex; flex-direction: column; justify-content: flex-end; padding: 60px 50px; overflow: hidden; background: #070707; }
                .bg-img { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; object-fit: cover; grayscale: 1; opacity: 0.25; filter: contrast(1.2) brightness(0.8); }
                .bg-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.2) 40%, rgba(10,10,10,0.95) 100%); z-index: 1; }
                
                .left-content { position: relative; z-index: 3; animation: slideUp 0.8s ease-out; width: 100%; max-width: 480px; }
                @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

                .logo-row { position: absolute; top: 40px; left: 50px; display: flex; align-items: center; gap: 12px; z-index: 4; }
                
                .fleet-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(232,160,32,0.1); border: 1px solid rgba(232,160,32,0.2); padding: 6px 16px; margin-bottom: 25px; border-radius: 6px; }
                .badge-dot { width: 7px; height: 7px; background: #E8A020; border-radius: 50%; box-shadow: 0 0 10px #E8A020; }
                .badge-text { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #E8A020; }

                .hero-heading { font-family: 'Bebas Neue', sans-serif; font-size: clamp(64px, 8vw, 105px); font-weight: 400; font-style: italic; text-transform: uppercase; line-height: 0.88; margin-bottom: 30px; letter-spacing: -0.01em; }
                .hero-heading span { display: block; }
                .hero-heading .white { color: #F0EDE8; }
                .hero-heading .gold { color: #E8A020; }
                
                .hero-sub { font-size: 15px; font-weight: 300; color: #5A5550; line-height: 1.6; max-width: 360px; margin-bottom: 45px; }

                .feature-list { display: flex; flex-direction: column; gap: 12px; width: 100%; }
                .feature-item { display: flex; align-items: center; gap: 18px; padding: 18px 20px; background: rgba(19,19,19,0.7); border: 1px solid rgba(255,255,255,0.04); border-radius: 6px; }
                .feature-icon { width: 44px; height: 32px; background: #1C1C1C; border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .feature-icon img { width: 24px; height: 24px; object-fit: contain; }
                .feature-name { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; color: #F0EDE8; margin-bottom: 2px; text-transform: uppercase; tracking: 0.04em; }
                .feature-desc { font-size: 12px; color: #5A5550; font-weight: 400; }

                /* ── RIGHT PANEL ── */
                .right-panel { background: #0A0A0A; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; position: relative; }
                .form-wrap { width: 100%; max-width: 420px; animation: fadeIn 1.2s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                
                .form-title { font-family: 'Barlow Condensed', sans-serif; font-size: 42px; font-weight: 800; font-style: italic; color: #F0EDE8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: -0.01em; }
                .form-subtitle { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: #E8A020; margin-bottom: 45px; opacity: 0.9; }

                @media (max-width: 1024px) { 
                    .login-grid { grid-template-columns: 1fr; }
                    .left-panel { display: none; }
                    .right-panel { padding: 40px 24px; min-height: 100vh; justify-content: center; }
                    .form-wrap { max-width: 100%; }
                }
            ` }} />

            <div className="left-panel">
                <img src="/driver_login_background_v2.png" alt="Driving Background" className="bg-img" />
                <div className="bg-overlay" />
                
                <div className="logo-row">
                    <Logo size="lg" />
                </div>

                <div className="left-content">
                    <div className="fleet-badge">
                        <span className="badge-dot" />
                        <span className="badge-text">SECURE FLEET UPLINK</span>
                    </div>

                    <div className="hero-heading">
                        <span className="white">READY TO</span>
                        <span className="gold">EARN?</span>
                    </div>

                    <div className="hero-sub">Connect with the TrueServe platform and start accepting high-yield delivery routes in your area today.</div>

                    <div className="feature-list">
                        <div className="feature-item">
                            <div className="feature-icon">🚗</div>
                            <div>
                                <div className="feature-name">Daily Liquidity Settlements</div>
                                <div className="feature-desc">Drive today, get paid today. Transparent splits.</div>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🛰️</div>
                            <div>
                                <div className="feature-name">Optimized Strategic Routing</div>
                                <div className="feature-desc">Smart dispatching to maximize fuel and time.</div>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🛡️</div>
                            <div>
                                <div className="feature-name">Priority Fleet Support</div>
                                <div className="feature-desc">Continuous assistance for every mile of your mission.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="right-panel">
                <div className="form-wrap">
                    <div className="form-title">Fleet Authorization</div>
                    <div className="form-subtitle">SECURE UPLINK TERMINAL</div>

                    <Suspense fallback={<div className="text-center text-[#5A5550] text-[10px] font-bold uppercase tracking-widest animate-pulse p-12">Uplinking Terminal...</div>}>
                        <DriverLoginForm />
                    </Suspense>

                    <div className="mt-[45px] flex items-center justify-center gap-2 text-[#222] font-bold text-[10px] uppercase tracking-[0.2em] opacity-40">
                        <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><rect x="1" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M3 5V3.5a2 2 0 014 0V5" stroke="currentColor" strokeWidth="1.2"/></svg>
                        ENCRYPTED CONNECTION · SECURE UPLINK
                    </div>
                </div>
            </div>
        </div>
    );
}
