"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthSession, loginAsPilot } from "@/app/auth/actions";

export default function FleetLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0c0e13] flex items-center justify-center text-[10px] font-black uppercase tracking-[0.4em] text-[#e8a230] animate-pulse italic">Uplinking Terminal...</div>}>
            <FleetLoginContent />
        </Suspense>
    );
}

function FleetLoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("next") || "/driver/dashboard";
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const isPreview = document.cookie.includes("preview_mode=true");
            if (isPreview) {
                router.push("/driver/dashboard");
                return;
            }

            const session = await getAuthSession();
            if (session.isAuth) {
                let dest = redirectUrl;
                if (session.role === 'MERCHANT') dest = "/merchant/dashboard";
                else if (session.role === 'DRIVER') dest = "/driver/dashboard";
                else if (session.role === 'ADMIN') dest = "/admin/dashboard";
                router.push(dest);
            }
        };
        checkUser();
    }, [router, redirectUrl]);

    return (
        <div className="login-grid font-sans">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=Barlow+Condensed:ital,wght@0,700;0,800;1,700;1,800&display=swap');
                
                body { margin: 0; background: #0c0e13; overflow-x: hidden; }
                .login-grid { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; background: #0c0e13; }
                
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }

                /* LEFT PANEL */
                .left-panel { position: relative; display: flex; flex-direction: column; justify-content: flex-end; padding: 60px 80px; overflow: hidden; background: #080a0f; }
                .bg-img { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; object-fit: cover; grayscale: 1; opacity: 0.25; filter: contrast(1.1); transform: scale(1.05); }
                .bg-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(12,14,19,0.3) 0%, rgba(12,14,19,0.85) 100%); z-index: 1; }
                
                .left-content { position: relative; z-index: 2; animation: slideRight 1s ease-out; }
                .logo-wrap { position: absolute; top: 40px; left: 80px; display: flex; align-items: center; gap: 12px; z-index: 2; animation: slideRight 0.8s ease-out; }
                .logo-ring { width: 42px; height: 42px; border: 1.5px solid #2a2f3a; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(19,23,32,0.6); }
                .logo-text { font-size: 20px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; }
                .logo-text span { color: #e8a230; }

                .fleet-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(26,18,0,0.4); border: 1px solid #3a2800; padding: 6px 14px; margin-bottom: 24px; border-radius: 2px; }
                .badge-dot { width: 7px; height: 7px; background: #e8a230; border-radius: 50%; box-shadow: 0 0 10px #e8a230; }
                .badge-text { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #e8a230; }

                .hero-txt { font-family: 'Barlow Condensed', sans-serif; font-size: 72px; font-weight: 800; font-style: italic; text-transform: uppercase; line-height: 0.95; margin-bottom: 20px; color: #fff; }
                .hero-txt span { color: #e8a230; }
                .hero-sub { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6; max-width: 400px; margin-bottom: 40px; }

                .feat-list { display: flex; flex-direction: column; gap: 3px; }
                .feat-item { display: flex; align-items: center; gap: 16px; padding: 14px 20px; background: rgba(15,18,25,0.7); border: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(8px); }
                .feat-icon { width: 36px; height: 36px; background: rgba(232,162,48,0.12); border: 1px solid rgba(232,162,48,0.2); display: flex; align-items: center; justify-content: center; }
                .feat-name { font-size: 13px; font-weight: 700; color: #fff; }
                .feat-desc { font-size: 11px; color: rgba(255,255,255,0.35); }

                /* RIGHT PANEL */
                .right-panel { background: #0c0e13; border-left: 1px solid #1c1f28; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; }
                .form-box { width: 100%; max-width: 440px; animation: fadeInUp 0.8s ease-out; }
                .form-hd { font-size: 32px; font-weight: 700; color: #fff; margin-bottom: 4px; font-family: 'DM Sans', sans-serif; font-style: italic; letter-spacing: -0.3px; }
                .form-sub { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #e8a230; margin-bottom: 32px; }

                .field-row { margin-bottom: 24px; }
                .field-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #555; margin-bottom: 8px; }
                
                .input-wrap { background: #0f1219; border: 1px solid #2a2f3a; display: flex; align-items: center; margin-bottom: 14px; transition: border-color .15s; }
                .input-wrap:focus-within { border-color: #e8a230; }
                .country-box { padding: 0 16px; border-right: 1px solid #2a2f3a; font-size: 12px; font-weight: 600; color: #888; height: 52px; display: flex; align-items: center; gap: 8px; }
                .main-input { flex: 1; background: transparent; border: none; padding: 14px; color: #ccc; font-family: 'DM Mono', monospace; font-size: 14px; outline: none; }
                .main-input::placeholder { color: #333; }

                .submit-btn { width: 100%; padding: 17px; background: #e8a230; border: none; color: #000; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; cursor: pointer; transition: opacity .15s; margin-bottom: 18px; }
                .submit-btn:hover { opacity: 0.9; }

                .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
                .divider-line { flex: 1; height: 1px; background: #1c1f28; }
                .divider-txt { font-size: 10px; font-weight: 700; color: #2a2f3a; text-transform: uppercase; letter-spacing: 0.12em; white-space: nowrap; }

                .pilot-btn { width: 100%; padding: 15px; background: transparent; border: 1px solid #2a2f3a; color: #888; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; cursor: pointer; transition: all .15s; margin-bottom: 8px; }
                .pilot-btn:hover { border-color: #e8a230; color: #e8a230; }
                .pilot-btn.gold { border-color: rgba(232,162,48,0.3); color: #e8a230; background: rgba(232,162,48,0.02); }

                @media (max-width: 1024px) { 
                    .login-grid { grid-template-columns: 1fr; }
                    .left-panel { display: none; }
                }
            ` }} />

            <div className="left-panel">
                <img src="/admin_login_bg_cinematic_1774378543203.png" alt="" className="bg-img" />
                <div className="bg-overlay" />
                
                <div className="logo-wrap">
                    <div className="logo-ring">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#e8a230" strokeWidth="1.5"/><path d="M7 10l2.5 2.5L14 7" stroke="#e8a230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div className="logo-text">True<span>Serve</span></div>
                </div>

                <div className="left-content">
                    <div className="fleet-badge">
                        <div className="badge-dot" />
                        <div className="badge-text">Secure Fleet Uplink</div>
                    </div>
                    <div className="hero-txt">Ready to<br/><span>Earn?</span></div>
                    <div className="hero-sub">Connect with the TrueServe platform and start accepting high-yield delivery routes in your area today.</div>
                    
                    <div className="feat-list">
                        <div className="feat-item">
                            <div className="feat-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#e8a230" strokeWidth="1.3"/><path d="M8 5v3.5l2 1.5" stroke="#e8a230" strokeWidth="1.3" strokeLinecap="round"/></svg></div>
                            <div>
                                <div className="feat-name">Daily Liquidity Settlements</div>
                                <div className="feat-desc">Drive today, get paid today. Transparent splits.</div>
                            </div>
                        </div>
                        <div className="feat-item">
                            <div className="feat-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8 3l5 5-5 5" stroke="#e8a230" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                            <div>
                                <div className="feat-name">Optimized Strategic Routing</div>
                                <div className="feat-desc">Smart dispatching to maximize fuel and time.</div>
                            </div>
                        </div>
                        <div className="feat-item">
                            <div className="feat-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L10 6h4L11 9l1.5 4L8 11l-4.5 2L5 9 2 6h4L8 2z" stroke="#e8a230" strokeWidth="1.2"/></svg></div>
                            <div>
                                <div className="feat-name">Priority Fleet Support</div>
                                <div className="feat-desc">Continuous assistance for every mile of your mission.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="right-panel">
                <div className="form-box">
                    <div className="form-hd">Fleet Authorization</div>
                    <div className="form-sub">Secure Uplink Terminal</div>

                    <div className="field-row">
                        <div className="field-lbl">Mobile Identification</div>
                        <div className="input-wrap">
                            <div className="country-box">🇺🇸 +1</div>
                            <input className="main-input" type="tel" placeholder="555 000 0000" />
                        </div>
                        <button className="submit-btn" disabled={isLoading} onClick={() => setIsLoading(true)}>
                            {isLoading ? "AUTHORIZING..." : "Request Access Code →"}
                        </button>
                    </div>

                    <div className="divider">
                        <div className="divider-line" />
                        <div className="divider-txt">Pilot Rollout Access</div>
                        <div className="divider-line" />
                    </div>

                    <form action={loginAsPilot}>
                        <button className="pilot-btn gold" type="submit">
                            ⚡ Quick Pilot Access (Driver)
                        </button>
                    </form>
                    
                    <button className="pilot-btn" onClick={() => router.push('/driver-signup')}>
                        New to the fleet? Apply to Drive
                    </button>

                    <div className="mt-8 flex items-center justify-center gap-2 text-[#2a2f3a] font-black text-[9px] uppercase tracking-[0.2em]">
                        <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><rect x="1" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M3 5V3.5a2 2 0 014 0V5" stroke="currentColor" strokeWidth="1.2"/></svg>
                        Encrypted Connection · Secure Uplink
                    </div>
                </div>
            </div>
        </div>
    );
}
