"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession, loginAsDemoMerchant } from "@/app/auth/actions";
import Logo from "@/components/Logo";
import Link from "next/link";

export default function MerchantLoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const isPreview = document.cookie.includes("preview_mode=true");
            if (isPreview) {
                router.push("/merchant/dashboard");
                return;
            }

            const session = await getAuthSession();
            if (session.isAuth && session.role === 'MERCHANT') {
                router.push("/merchant/dashboard");
            }
        };
        checkUser();
    }, [router]);

    return (
        <div className="login-grid selection:bg-[#E8A020]/30 min-h-screen bg-[#0A0A0A]">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;1,700;1,800&family=Barlow:wght@300;400;500;600;700&display=swap');
                
                body { margin: 0; background: #0A0A0A; overflow-x: hidden; font-family: 'Barlow', sans-serif; }
                .login-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; min-height: 100vh; }
                
                /* ── LEFT PANEL ── */
                .left-panel { position: relative; min-height: 100vh; display: flex; flex-direction: column; justify-content: flex-end; padding: 60px 45px; overflow: hidden; background: #070707; }
                .bg-img { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; object-fit: cover; grayscale: 1; opacity: 0.22; filter: contrast(1.2) brightness(0.7); }
                .bg-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(10,10,10,0.1) 0%, rgba(10,10,10,0.3) 40%, rgba(10,10,10,0.98) 100%); z-index: 1; }
                
                .left-content { position: relative; z-index: 3; animation: slideUp 0.8s ease-out; width: 100%; max-width: 480px; }
                @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

                .logo-row { position: absolute; top: 40px; left: 45px; display: flex; align-items: center; gap: 12px; z-index: 4; }
                
                .fleet-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(232,160,32,0.1); border: 1px solid rgba(232,160,32,0.2); padding: 6px 14px; margin-bottom: 25px; border-radius: 4px; }
                .badge-dot { width: 7px; height: 7px; background: #E8A020; border-radius: 50%; box-shadow: 0 0 10px #E8A020; }
                .badge-text { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #E8A020; }

                .hero-heading { font-family: 'Bebas Neue', sans-serif; font-size: clamp(64px, 8vw, 105px); font-weight: 400; font-style: italic; text-transform: uppercase; line-height: 0.88; margin-bottom: 25px; letter-spacing: -0.01em; }
                .hero-heading span { display: block; }
                .hero-heading .white { color: #F0EDE8; }
                .hero-heading .gold { color: #E8A020; }
                
                .hero-sub { font-size: 15px; font-weight: 300; color: #5A5550; line-height: 1.6; max-width: 360px; margin-bottom: 45px; }

                .feature-list { display: flex; flex-direction: column; gap: 4px; width: 100%; }
                .feature-item { display: flex; align-items: center; gap: 16px; padding: 14px 18px; background: rgba(15,15,15,0.6); border: 1px solid rgba(255,255,255,0.04); border-radius: 2px; }
                .feature-icon { width: 36px; height: 36px; background: rgba(232,160,32,0.08); border: 1px solid rgba(232,160,32,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .feature-icon img { width: 22px; height: 22px; object-fit: contain; }
                .feature-name { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; color: #F0EDE8; margin-bottom: 1px; text-transform: uppercase; tracking: 0.04em; }
                .feature-desc { font-size: 11px; color: #5A5550; font-weight: 400; }

                /* ── RIGHT PANEL ── */
                .right-panel { background: #0A0A0A; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; position: relative; }
                .form-wrap { width: 100%; max-width: 420px; animation: fadeIn 1.2s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                
                .form-title { font-family: 'Bebas Neue', sans-serif; font-size: 52px; font-weight: 400; font-style: italic; color: #F0EDE8; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.02em; }
                .form-subtitle { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: #E8A020; margin-bottom: 45px; opacity: 0.9; }

                .field-row { margin-bottom: 24px; position: relative; }
                .field-lbl { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #5A5550; margin-bottom: 10px; margin-left: 1px; }
                
                .input-wrap { display: flex; bg: #121212; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; border-radius: 2px; }
                .input-base { width: 100%; background: #0D0D0D; padding: 18px 20px; color: #F0EDE8; font-family: 'Barlow', sans-serif; font-size: 15px; font-weight: 500; outline: none; transition: all 0.2s; border: none; }
                .input-base:focus { background: #0F0F0F; }
                .input-base::placeholder { color: #222; }

                .submit-btn { width: 100%; height: 58px; background: #E8A020; border: none; color: #000; font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.18em; cursor: pointer; transition: all 0.2s; margin-top: 10px; border-radius: 2px; margin-bottom: 35px; }
                .submit-btn:hover { background: #d4911c; }
                .submit-btn:active { scale: 0.98; }

                .divider { display: flex; align-items: center; gap: 16px; margin-bottom: 25px; }
                .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.05); }
                .divider-txt { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; color: #222; text-transform: uppercase; letter-spacing: 0.25em; white-space: nowrap; }

                .alt-btn { width: 100%; height: 52px; background: transparent; border: 1px solid rgba(255,255,255,0.05); color: #E8A020; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; cursor: pointer; transition: all 0.2s; margin-bottom: 12px; border-radius: 2px; display: flex; align-items: center; justify-content: center; }
                .alt-btn:hover { border-color: rgba(232,160,32,0.4); color: #E8A020; }
                .alt-btn.gold { border-color: rgba(232,160,32,0.3); background: rgba(232,160,32,0.02); }

                @media (max-width: 1024px) { 
                    .login-grid { grid-template-columns: 1fr; }
                    .left-panel { display: none; }
                    .right-panel { padding: 40px 24px; min-height: 100vh; justify-content: center; }
                    .form-wrap { max-width: 100%; }
                }
            ` }} />

            <div className="left-panel">
                <img src="/merchant_login_bg_restaurant.png" alt="Merchant Background" className="bg-img" />
                <div className="bg-overlay" />
                
                <div className="logo-row">
                    <Logo size="lg" />
                </div>

                <div className="left-content">
                    <div className="fleet-badge">
                        <span className="badge-dot" />
                        <span className="badge-text">SECURE PARTNER UPLINK</span>
                    </div>

                    <div className="hero-heading">
                        <span className="white">READY TO</span>
                        <span className="gold">SCALE?</span>
                    </div>

                    <div className="hero-sub">Enter the operational nerve center for top-performing kitchens. Manage your orders and growth in real-time.</div>

                    <div className="feature-list">
                        <div className="feature-item">
                            <div className="feature-icon">📊</div>
                            <div>
                                <div className="feature-name">Live Operations Feed</div>
                                <div className="feature-desc">Monitor live order flow and preparation timers.</div>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🚀</div>
                            <div>
                                <div className="feature-name">Strategic Growth Engine</div>
                                <div className="feature-desc">Access high-yield sector data for market expansion.</div>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🛡️</div>
                            <div>
                                <div className="feature-name">Priority Partner Support</div>
                                <div className="feature-desc">Continuous 24/7 assistance for your operations.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="right-panel">
                <div className="form-wrap">
                    <div className="form-title">Partner Authorization</div>
                    <div className="form-subtitle">SECURE UPLINK TERMINAL</div>

                    <div className="field-row">
                        <div className="field-lbl">Merchant Identifier</div>
                        <div className="input-wrap">
                             <input type="text" className="input-base" placeholder="partner@yourstore.com" />
                        </div>
                    </div>

                    <div className="field-row">
                        <div className="field-lbl">Security Password</div>
                        <div className="input-wrap">
                             <input type="password" className="input-base" placeholder="••••••••" />
                        </div>
                    </div>

                    <button className="submit-btn" disabled={isLoading} onClick={() => setIsLoading(true)}>
                        {isLoading ? "AUTHORIZING..." : "AUTHORIZE CONNECTION →"}
                    </button>

                    <div className="divider">
                        <div className="divider-line" />
                        <div className="divider-txt">PARTNER ROLLOUT ACCESS</div>
                        <div className="divider-line" />
                    </div>

                    <button className="alt-btn gold" onClick={loginAsDemoMerchant}>
                        ⚡ QUICK PILOT ACCESS (MERCHANT)
                    </button>
                    
                    <button className="alt-btn" onClick={() => router.push("/merchant/apply")}>
                        PARTNER WITH TRUESERVE
                    </button>

                    <div className="mt-12 flex items-center justify-center gap-2 text-[#222] font-bold text-[10px] uppercase tracking-[0.2em] opacity-40">
                        <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><rect x="1" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M3 5V3.5a2 2 0 014 0V5" stroke="currentColor" strokeWidth="1.2"/></svg>
                        ENCRYPTED CONNECTION · SECURE UPLINK
                    </div>
                </div>
            </div>
        </div>
    );
}
