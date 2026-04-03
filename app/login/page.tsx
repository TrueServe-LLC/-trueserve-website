"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthSession, loginAsPilot } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";

export default function FleetLoginPage() {
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
                .login-grid { display: grid; grid-template-columns: 1fr 480px; min-height: 100vh; background: #0c0e13; }
                
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes slideRight {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                /* LEFT PANEL */
                .left-panel { position: relative; display: flex; flex-direction: column; justify-content: flex-end; padding: 60px 80px; overflow: hidden; background: #080a0f; }
                .bg-img { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; object-fit: cover; grayscale: 1; opacity: 0.25; filter: contrast(1.1); transform: scale(1.05); }
                .bg-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(12,14,19,0.3) 0%, rgba(12,14,19,0.8) 100%); z-index: 1; }
                
                .left-content { position: relative; z-index: 2; animation: slideRight 1s ease-out; }
                .logo-wrap { position: absolute; top: 40px; left: 80px; display: flex; align-items: center; gap: 12px; z-index: 2; animation: slideRight 0.8s ease-out; }
                .logo-ring { width: 38px; height: 38px; border: 1.5px solid #e8a230; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(19,23,32,0.6); }
                .logo-text { font-size: 20px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; }
                .logo-text span { color: #e8a230; }

                .fleet-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(26,18,0,0.4); border: 1px solid #3a2800; padding: 6px 14px; margin-bottom: 24px; border-radius: 2px; }
                .badge-dot { width: 6px; height: 6px; background: #e8a230; border-radius: 50%; box-shadow: 0 0 10px #e8a230; }
                .badge-text { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #e8a230; }

                .hero-txt { font-family: 'Barlow Condensed', sans-serif; font-size: 72px; font-weight: 800; font-style: italic; text-transform: uppercase; line-height: 0.9; margin-bottom: 20px; color: #fff; }
                .hero-txt span { color: #e8a230; }
                .hero-sub { font-size: 14px; color: #555; line-height: 1.6; max-width: 400px; margin-bottom: 40px; }

                .feat-item { display: flex; align-items: center; gap: 16px; padding: 14px 20px; background: rgba(15,18,25,0.4); border: 1px solid rgba(255,255,255,0.03); backdrop-filter: blur(10px); margin-bottom: 4px; }
                .feat-icon { width: 32px; height: 32px; background: rgba(232,162,48,0.1); border: 1px solid rgba(232,162,48,0.2); display: flex; align-items: center; justify-content: center; }
                .feat-name { font-size: 12px; font-weight: 700; color: #ccc; text-transform: uppercase; letter-spacing: 0.05em; }

                /* RIGHT PANEL */
                .right-panel { background: #0c0e13; border-left: 1px solid #1c1f28; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; }
                .form-box { width: 100%; max-width: 340px; animation: fadeInUp 0.8s ease-out; }
                .form-hd { font-size: 32px; font-weight: 700; color: #fff; margin-bottom: 4px; font-family: 'DM Sans', sans-serif; font-style: italic; }
                .form-sub { font-size: 9px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: #e8a230; margin-bottom: 40px; }

                .input-wrap { background: #0f1219; border: 1px solid #1c1f28; display: flex; align-items: center; margin-bottom: 16px; transition: border-color .15s; }
                .input-wrap:focus-within { border-color: #e8a230; }
                .country-box { padding: 0 16px; border-right: 1px solid #1c1f28; font-size: 12px; font-weight: 600; color: #444; height: 50px; display: flex; align-items: center; }
                .main-input { flex: 1; background: transparent; border: none; padding: 14px; color: #fff; font-family: 'DM Mono', monospace; font-size: 14px; outline: none; }
                .main-input::placeholder { color: #222; }

                .submit-btn { width: 100%; padding: 16px; background: #e8a230; border: none; color: #000; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; cursor: pointer; transition: opacity .15s; margin-bottom: 20px; }
                .submit-btn:hover { opacity: 0.9; }

                .divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; }
                .divider-line { flex: 1; height: 1px; background: #1c1f28; }
                .divider-txt { font-size: 10px; font-weight: 700; color: #222; text-transform: uppercase; letter-spacing: 0.1em; white-space: nowrap; }

                .pilot-btn { width: 100%; padding: 14px; background: transparent; border: 1.5px solid #2a2f3a; color: #888; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; cursor: pointer; transition: all .15s; margin-bottom: 8px; }
                .pilot-btn:hover { border-color: #e8a230; color: #e8a230; background: rgba(232,162,48,0.03); }
                .pilot-btn.gold { border-color: rgba(232,162,48,0.3); color: #e8a230; }

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
                    <div className="hero-sub">Enter the next-gen logistics network. Connect with the TrueServe platform and accept high-yield missions in your sector.</div>
                    
                    <div className="feat-item">
                        <div className="feat-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="#e8a230" strokeWidth="1.2"/><path d="M7 4v3.5l2 1.5" stroke="#e8a230" strokeWidth="1.2" strokeLinecap="round"/></svg></div>
                        <div className="feat-name">Rapid Liquidity Payouts</div>
                    </div>
                    <div className="feat-item">
                        <div className="feat-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="#e8a230" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                        <div className="feat-name">Optimized Mission Mesh</div>
                    </div>
                    <div className="feat-item">
                        <div className="feat-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2l1.6 3.3h3.4l-2.5 2.4l.6 3.3l-3.1-1.6l-3.1 1.6l.6-3.3l-2.5-2.4h3.4l1.6-3.3z" stroke="#e8a230" strokeWidth="1.2"/></svg></div>
                        <div className="feat-name">Priority Pilot Support</div>
                    </div>
                </div>
            </div>

            <div className="right-panel">
                <div className="form-box">
                    <div className="form-hd">Fleet Auth</div>
                    <div className="form-sub">Secure Terminal Access</div>

                    <div className="mb-8">
                        <div className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-3">Mobile Terminal Number</div>
                        <div className="input-wrap">
                            <div className="country-box">🇺🇸 +1</div>
                            <input className="main-input" type="tel" placeholder="555 000 0000" />
                        </div>
                        <button className="submit-btn">Request Access Code →</button>
                        <div className="text-center text-[10px] font-bold text-[#222] uppercase tracking-widest leading-loose">
                            System will transmit a secure<br/>one-time authentication payload.
                        </div>
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
                    
                    <button className="pilot-btn" onClick={() => router.push('/merchant/dashboard')}>
                        🛡️ Merchant Hub Preview
                    </button>

                    <div className="mt-8 flex items-center justify-center gap-2 text-[#222] font-black text-[9px] uppercase tracking-[0.2em]">
                        <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><rect x="1" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M3 5V3.5a2 2 0 014 0V5" stroke="currentColor" strokeWidth="1.2"/></svg>
                        Encrypted Connection · Secure Uplink
                    </div>
                </div>
            </div>
        </div>
    );
}
