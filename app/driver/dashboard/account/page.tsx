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
        <div className="font-sans">
            <style dangerouslySetInnerHTML={{ __html: `
                .page-wrap { padding: 24px 28px; }
                .page-title { font-family: 'Barlow Condensed', sans-serif; font-size: 30px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: 0.01em; margin-bottom: 20px; }
                .page-title span { color: #e8a230; }

                .acct-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #1c1f28; border: 1px solid #1c1f28; }
                .acct-panel { background: #0f1219; padding: 20px; }
                .acct-sec-title { font-size: 9px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #444; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }
                
                .secure-tag { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; background: #0d2a1a; color: #3dd68c; border: 1px solid #1a4a2a; }
                .visible-tag { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #e8a230; background: #1a1200; border: 1px solid #3a2800; padding: 3px 8px; }

                .profile-card { display: flex; align-items: center; gap: 14px; padding: 14px; background: #0c0e13; border: 1px solid #1c1f28; margin-bottom: 16px; }
                .profile-av { width: 48px; height: 48px; background: #e8a230; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #000; flex-shrink: 0; }
                .profile-name { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 2px; }
                .profile-since { font-size: 11px; color: #444; margin-bottom: 6px; }
                .tier-badge { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; background: #1a1200; color: #e8a230; border: 1px solid #3a2800; display: inline-block; }

                .field-lbl { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #444; margin-bottom: 6px; margin-top: 12px; }
                .choose-btn { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 7px 14px; background: #e8a230; border: none; color: #000; cursor: pointer; }
                .field-hint { font-size: 10px; color: #333; margin-bottom: 12px; }
                .about-textarea { width: 100%; background: #0c0e13; border: 1px solid #2a2f3a; color: #555; font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 10px; resize: none; height: 90px; outline: none; line-height: 1.5; }
                .save-profile-btn { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 10px 20px; background: transparent; border: 1px solid #2a2f3a; color: #888; cursor: pointer; margin-top: 12px; display: block; transition: border-color .15s; width: 100%; text-align: center; }
                .save-profile-btn:hover { border-color: #e8a230; color: #e8a230; }

                .stripe-row { display: flex; align-items: center; justify-content: space-between; padding: 14px; background: #0c0e13; border: 1px solid #1c1f28; margin-bottom: 16px; }
                .stripe-icon-box { width: 36px; height: 36px; background: #1a1e3a; border: 1px solid #2a3060; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .stripe-name { font-size: 13px; font-weight: 700; color: #ccc; margin-bottom: 2px; }
                .stripe-desc { font-size: 11px; color: #444; }
                .connect-btn { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 8px 16px; background: transparent; border: 1.5px solid #e8a230; color: #e8a230; cursor: pointer; }

                .detail-table { width: 100%; border-collapse: collapse; }
                .detail-table td { padding: 10px 0; border-bottom: 1px solid #131720; font-size: 12px; }
                .detail-table td:first-child { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #444; width: 40%; }
                .detail-table td:last-child { text-align: right; font-family: 'DM Mono', monospace; color: #888; }
                .approved-tag { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; background: #0d2a1a; color: #3dd68c; border: 1px solid #1a4a2a; }
            ` }} />
            
            <div className="page-wrap">
                <div className="page-title"><span>Account</span></div>
                
                <div className="acct-grid">
                    <div className="acct-panel">
                        <div className="profile-card">
                            <div className="profile-av">{initials}</div>
                            <div>
                                <div className="profile-name">{name}</div>
                                <div className="profile-since">Driver since · Active</div>
                                <div className="tier-badge">Standard Tier</div>
                            </div>
                        </div>
                        <div className="acct-sec-title">Public Profile <span className="visible-tag">Visible to Customers</span></div>
                        <div className="field-lbl">Profile Photo (Optional)</div>
                        <div className="flex items-center gap-4 mb-4">
                            <button className="choose-btn">Choose File</button>
                            <span className="text-[11px] color-[#333]">No file selected</span>
                        </div>
                        <div className="field-hint">Upload a clear photo of yourself for customers.</div>
                        <div className="field-lbl">About Me (Optional)</div>
                        <textarea className="about-textarea" placeholder="Tell your customers a little about yourself, why you love driving, or your favorite food..."></textarea>
                        <button className="save-profile-btn">Save Public Profile</button>
                    </div>

                    <div className="acct-panel">
                        <div className="acct-sec-title">Payout Settings <span className="secure-tag">Secure</span></div>
                        <div className="stripe-row">
                            <div className="flex items-center gap-3">
                                <div className="stripe-icon-box">
                                    <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="1" y="1" width="16" height="10" rx="1" stroke="#4a5aaa" strokeWidth="1.2"/><path d="M1 4h16" stroke="#4a5aaa" strokeWidth="1.2"/></svg>
                                </div>
                                <div>
                                    <div className="stripe-name">Stripe Connect</div>
                                    <div className="stripe-desc">Instant payouts and taxes.</div>
                                </div>
                            </div>
                            <button className="connect-btn">Connect</button>
                        </div>

                        <div className="acct-sec-title" style={{ marginTop: '16px' }}>Personal Details</div>
                        <table className="detail-table">
                            <tbody>
                                <tr><td>Email</td><td>{email}</td></tr>
                                <tr><td>Support Code</td><td>PREVIEW-D</td></tr>
                            </tbody>
                        </table>

                        <div className="acct-sec-title" style={{ marginTop: '16px' }}>Vehicle &amp; Documents</div>
                        <table className="detail-table">
                            <tbody>
                                <tr><td>Vehicle</td><td><span className="approved-tag">Approved</span></td></tr>
                                <tr><td>Fleet ID</td><td>—</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
