import { getDriverOrRedirect } from "@/lib/driver-auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export default async function DriverAccount() {
    const driver = await getDriverOrRedirect();
    const isPreview = driver?.id === "preview-driver";

    const name = driver?.name || driver?.user?.name || "Driver";
    const email = driver?.user?.email || "driver@trueserve.com";
    const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase();

    return (
        <div className="font-sans min-h-screen bg-[#080a0f]">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=Barlow+Condensed:ital,wght@0,600;0,700;1,700;1,800&display=swap');
                
                .page-wrap { padding: 20px md:32px; }
                .page-title { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: 0.01em; margin-bottom: 24px; line-height: 1; }
                .page-title span { color: #e8a230; }

                .acct-grid { display: grid; grid-template-columns: 1fr; gap: 1px; background: #1c1f28; border: 1px solid #1c1f28; }
                @media (min-width: 1024px) { .acct-grid { grid-template-columns: 1fr 1.2fr; } }
                
                .acct-panel { background: #0f1219; padding: 24px; position: relative; overflow: hidden; }
                .acct-sec-title { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #444; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 10; }
                
                .tag-gold { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #e8a230; background: rgba(232,162,48,0.1); border: 1px solid rgba(232,162,48,0.2); padding: 4px 10px; }
                .tag-green { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #3dd68c; background: rgba(61,214,140,0.1); border: 1px solid rgba(61,214,140,0.2); padding: 4px 10px; }

                .profile-hero { display: flex; align-items: center; gap: 20px; padding: 20px; background: #0c0e13; border: 1px solid #1c1f28; border-left: 3px solid #e8a230; margin-bottom: 24px; }
                .profile-av { width: 64px; height: 64px; background: #e8a230; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: #000; flex-shrink: 0; box-shadow: 0 0 20px rgba(232,162,48,0.2); }
                .profile-name { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 4px; letter-spacing: -0.5px; }
                .profile-meta { font-size: 12px; color: #555; font-weight: 500; }
                
                .field-row { margin-bottom: 20px; }
                .field-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #444; margin-bottom: 8px; }
                .input-box { width: 100%; background: #0c0e13; border: 1px solid #2a2f3a; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 14px; outline: none; border-radius: 4px; transition: border-color .2s; }
                .input-box:focus { border-color: #e8a230; }
                
                .btn-save { width: 100%; padding: 16px; background: #e8a230; border: none; color: #000; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; cursor: pointer; transition: opacity .2s; margin-top: 10px; }
                .btn-save:hover { opacity: 0.9; }

                .info-table { width: 100%; }
                .info-row { display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
                .info-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #444; }
                .info-value { font-size: 13px; font-family: 'DM Mono', monospace; color: #888; font-weight: 500; }

                .stripe-card { background: #0c0e13; border: 1px solid #1c1f28; padding: 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
                .stripe-left { display: flex; align-items: center; gap: 16px; }
                .stripe-icon { width: 44px; height: 44px; background: #1a1e3a; border: 1px solid #2a3060; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .stripe-txt-hd { font-size: 14px; font-weight: 700; color: #ccc; margin-bottom: 2px; }
                .stripe-txt-sub { font-size: 11px; color: #555; }
                .btn-connect { padding: 9px 18px; border: 1.5px solid #e8a230; color: #e8a230; background: transparent; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: all .2s; }
                .btn-connect:hover { background: rgba(232,162,48,0.1); }
            ` }} />
            
            <div className="page-wrap animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="page-title">Personal <span>Profile</span></div>
                
                <div className="acct-grid">
                    {/* LEFT PANEL: PUBLIC INFO */}
                    <div className="acct-panel border-r border-[#1c1f28]">
                        <div className="profile-hero">
                            <div className="profile-av">{initials}</div>
                            <div>
                                <div className="profile-name">{name}</div>
                                <div className="profile-meta">FLEET AGENT · ACTIVE SINCE 2024</div>
                                <div className="mt-2 text-[10px] font-black tracking-widest text-[#e8a230] uppercase">Sector: Charlotte, NC</div>
                            </div>
                        </div>

                        <div className="acct-sec-title">Operational Data <span className="tag-gold">Customer Visible</span></div>
                        
                        <div className="field-row">
                            <div className="field-lbl">Agent Identity Identifier</div>
                            <input className="input-box" value={name} readOnly />
                        </div>

                        <div className="field-row">
                            <div className="field-lbl">Profile Uplink Photo</div>
                            <div className="flex items-center gap-4 bg-[#0c0e13] p-4 border border-[#2a2f3a]">
                                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-xs text-slate-500">?</div>
                                <button className="text-[10px] font-black uppercase tracking-widest text-[#e8a230]">Replace Scan</button>
                            </div>
                        </div>

                        <div className="field-row">
                            <div className="field-lbl">Operational Bio (Broadcast to Customers)</div>
                            <textarea className="input-box min-h-[100px] leading-relaxed" placeholder="Tell your customers a little about yourself, why you love driving, or your favorite food..."></textarea>
                        </div>
                        
                        <button className="btn-save">Sync Profile to Cloud →</button>
                    </div>

                    {/* RIGHT PANEL: SECURE INFO */}
                    <div className="acct-panel">
                        <div className="acct-sec-title">Liquidity Gateway <span className="tag-green">Secure Encryption</span></div>
                        <div className="stripe-card">
                            <div className="stripe-left">
                                <div className="stripe-icon">
                                    <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><rect x="1" y="1" width="18" height="12" rx="1" stroke="#4a5aaa" strokeWidth="1.3"/><path d="M1 5h18" stroke="#4a5aaa" strokeWidth="1.3"/></svg>
                                </div>
                                <div>
                                    <div className="stripe-txt-hd">Stripe Financial Connect</div>
                                    <div className="stripe-txt-sub">Real-time payouts and automatic tax fulfillment.</div>
                                </div>
                            </div>
                            <button className="btn-connect">Connect</button>
                        </div>

                        <div className="acct-sec-title">Credential Metadata</div>
                        <div className="info-table">
                            <div className="info-row">
                                <div className="info-label">Network Email</div>
                                <div className="info-value">{email}</div>
                            </div>
                            <div className="info-row">
                                <div className="info-label">Pilot Access Code</div>
                                <div className="info-value">TRUESERVE-P{initials}</div>
                            </div>
                            <div className="info-row">
                                <div className="info-label">Current Vehicle</div>
                                <div className="info-value">VERIFIED · HIGH-DEN</div>
                            </div>
                            <div className="info-row">
                                <div className="info-label">Fleet Tier</div>
                                <div className="info-value text-[#e8a230]">ALIGNED ALPHA</div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-[#0c0e13] border border-[#1c1f28] text-center">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2a2f3a] mb-4">Security Protocol Level 4</div>
                            <div className="flex justify-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#3dd68c] animate-pulse"></div>
                                <div className="w-2 h-2 rounded-full bg-[#3dd68c]/40"></div>
                                <div className="w-2 h-2 rounded-full bg-[#3dd68c]/20"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
