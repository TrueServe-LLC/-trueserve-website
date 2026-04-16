import { getDriverOrRedirect } from "@/lib/driver-auth";

export const dynamic = 'force-dynamic';

export default async function DriverAccount() {
    const driver = await getDriverOrRedirect();

    const name = driver?.name || driver?.user?.name || "Driver";
    const email = driver?.user?.email || "driver@trueserve.com";
    const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase();

    return (
        <div className="font-sans min-h-screen bg-[#080a0f]">
            <style dangerouslySetInnerHTML={{ __html: `
                .page-wrap { padding: 32px; }
                .page-title { font-family: 'Barlow Condensed', sans-serif; font-size: 52px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: -0.02em; line-height: 0.9; margin-bottom: 32px; }
                .page-title span { color: #f97316; }

                .acct-grid { display: grid; grid-template-columns: 1fr; gap: 1px; background: #1c1f28; border: 1px solid #1c1f28; }
                @media (min-width: 1024px) { .acct-grid { grid-template-columns: 1fr 1.2fr; } }
                
                .acct-panel { background: #0c0c0e; padding: 32px; position: relative; overflow: hidden; }
                .acct-sec-title { font-size: 10px; font-weight: 800; letter-spacing: 0.3em; text-transform: uppercase; color: #222; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 10; font-style: italic; }
                
                .tag-gold { font-size: 9px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; color: #f97316; background: rgba(249,115,22,0.05); border: 1px solid rgba(249,115,22,0.1); padding: 4px 10px; border-radius: 4px; }
                .tag-green { font-size: 9px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; color: #3dd68c; background: rgba(61,214,140,0.05); border: 1px solid rgba(61,214,140,0.1); padding: 4px 10px; border-radius: 4px; }

                .profile-hero { display: flex; align-items: center; gap: 24px; padding: 32px; background: #080808; border: 1px solid #1c1f28; margin-bottom: 32px; position: relative; border-radius: 24px; }
                .profile-hero::before { content: ""; position: absolute; left: 0; top: 20%; bottom: 20%; width: 4px; background: #f97316; border-radius: 0 4px 4px 0; }
                
                .profile-av { width: 80px; height: 80px; background: #f97316; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; color: #080a0f; flex-shrink: 0; transform: rotate(-3deg); box-shadow: 0 10px 30px rgba(249,115,22,0.2); }
                .profile-name { font-family: 'Barlow Condensed', sans-serif; font-size: 40px; font-weight: 800; color: #fff; margin-bottom: 4px; font-style: italic; text-transform: uppercase; line-height: 0.9; }
                .profile-meta { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #333; }
                
                .field-row { margin-bottom: 24px; }
                .field-lbl { font-size: 10px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #444; margin-bottom: 10px; font-style: italic; }
                .input-box { width: 100%; background: #080808; border: 1px solid #131720; color: #fff; font-family: 'DM Mono', monospace; font-size: 13px; padding: 16px; outline: none; border-radius: 12px; transition: all .2s; }
                .input-box:focus { border-color: #f97316; background: #0c0c0e; }
                
                .btn-save { width: 100%; padding: 18px; background: #f97316; border: none; color: #000; font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: all .2s; margin-top: 12px; border-radius: 14px; font-style: italic; }
                .btn-save:hover { background: #fff; transform: translateY(-2px); }

                .info-table { border: 1px solid #131720; background: #080808; border-radius: 20px; overflow: hidden; }
                .info-row { display: flex; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid #131720; }
                .info-row:last-child { border-bottom: none; }
                .info-label { font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #333; }
                .info-value { font-size: 13px; font-family: 'DM Mono', monospace; color: #888; font-weight: 600; }

                .stripe-card { background: #080808; border: 1px solid #131720; padding: 24px; border-radius: 20px; display: flex; flex-direction: column; gap: 20px; margin-bottom: 32px; }
                @media (min-width: 640px) { .stripe-card { flex-direction: row; align-items: center; justify-content: space-between; } }
                .stripe-left { display: flex; align-items: center; gap: 20px; }
                .stripe-icon { width: 52px; height: 52px; background: #0c0c0e; border: 1.5px solid #131720; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #4a5aaa; font-size: 24px; }
                .stripe-txt-hd { font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 2px; }
                .stripe-txt-sub { font-size: 11px; font-weight: 600; color: #333; text-transform: uppercase; letter-spacing: 0.1em; }
                .btn-connect { padding: 12px 24px; border: 1.5px solid #f97316; color: #f97316; background: transparent; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: all .2s; border-radius: 10px; font-style: italic; }
                .btn-connect:hover { background: #f97316; color: #000; }

                @media (max-width: 900px) {
                    .page-wrap { padding: 20px 16px; }
                    .page-title { font-size: 38px; margin-bottom: 20px; }
                    .acct-panel { padding: 20px; }
                    .profile-hero { padding: 20px; gap: 16px; margin-bottom: 20px; }
                    .profile-av { width: 64px; height: 64px; font-size: 24px; }
                    .profile-name { font-size: 30px; }
                }

                @media (max-width: 640px) {
                    .profile-hero { flex-direction: column; align-items: flex-start; }
                    .profile-hero::before { left: 16px; top: 0; bottom: auto; width: calc(100% - 32px); height: 3px; border-radius: 0 0 4px 4px; }
                    .info-row { padding: 14px 16px; gap: 10px; }
                    .info-value { font-size: 11px; text-align: right; }
                    .stripe-left { align-items: flex-start; }
                    .btn-connect { width: 100%; }
                }
            ` }} />
            
            <div className="page-wrap animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="page-title">Personal <span>Profile</span></div>
                
                <div className="acct-grid">
                    {/* LEFT PANEL: PUBLIC INFO */}
                    <div className="acct-panel border-b border-[#1c1f28] lg:border-b-0 lg:border-r">
                        <div className="profile-hero">
                            <div className="profile-av">{initials}</div>
                            <div>
                                <div className="profile-name">{name}</div>
                                <div className="profile-meta">FLEET AGENT · ACTIVE SINCE 2024</div>
                                <div className="mt-2 text-[10px] font-black tracking-widest text-[#f97316] uppercase">Sector: Charlotte, NC</div>
                            </div>
                        </div>

                        <div className="acct-sec-title">Operational Data <span className="tag-gold">Customer Visible</span></div>
                        
                        <div className="field-row">
                            <div className="field-lbl">Agent Identity Identifier</div>
                            <input className="input-box" value={name} readOnly />
                        </div>

                        <div className="field-row">
                            <div className="field-lbl">Profile Uplink Photo</div>
                            <div className="group relative flex items-center gap-5 bg-[#0c0e13] p-5 border border-[#2a2f3a] hover:border-[#f97316]/40 transition-all cursor-pointer rounded-xl overflow-hidden shadow-2xl">
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#f97316] to-transparent opacity-30 animate-pulse" />
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-xl text-slate-500 overflow-hidden relative border border-white/5">
                                    <span className="group-hover:scale-125 transition-transform duration-500">👤</span>
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-[#f97316] shadow-[0_0_10px_#f97316] opacity-0 group-hover:opacity-100 animate-scanning" />
                                </div>
                                <div className="flex-1">
                                    <button className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f97316] group-hover:text-white transition-colors">Start Identity Scan</button>
                                    <p className="text-[9px] font-bold text-[#333] uppercase mt-1 tracking-widest">Face-ID Sync · 2026 Secured</p>
                                </div>
                                <div className="text-[#f97316] opacity-30 text-xs">↑</div>
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
                                <div className="info-value text-[#f97316]">ALIGNED ALPHA</div>
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
