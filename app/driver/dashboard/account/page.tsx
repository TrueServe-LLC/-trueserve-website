import { cookies } from "next/headers";
import { getDriverOrRedirect } from "@/lib/driver-auth";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DriverAccount() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";

    const driver = isPreview
        ? { id: "preview", name: "Jordan Rivers", rating: "4.9", totalEarnings: 1247.50, stripeAccountId: null, user: { name: "Jordan Rivers", email: "driver@trueserve.com" } }
        : await getDriverOrRedirect();

    const name    = driver?.name || driver?.user?.name || "Driver";
    const email   = driver?.user?.email || "driver@trueserve.com";
    const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase();
    const hasStripe = Boolean((driver as any)?.stripeAccountId);

    return (
        <div className="font-sans">
            <style dangerouslySetInnerHTML={{ __html: `
                .acct-wrap { max-width: 800px; }
                .acct-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.02em; margin-bottom: 20px; }
                .acct-title span { color: #f97316; }

                /* Profile hero */
                .acct-hero {
                    background: #141a18; border: 1px solid #1e2420;
                    border-radius: 8px; padding: 20px 24px;
                    display: flex; align-items: center; gap: 18px;
                    margin-bottom: 14px;
                }
                .acct-avatar {
                    width: 56px; height: 56px; border-radius: 12px;
                    background: #f97316; display: flex; align-items: center;
                    justify-content: center; font-size: 22px; font-weight: 800;
                    color: #000; flex-shrink: 0;
                }
                .acct-hero-name { font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 4px; }
                .acct-hero-meta { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: #555; }

                /* Two col */
                .acct-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                @media (max-width: 700px) { .acct-grid { grid-template-columns: 1fr; } }

                /* Section card */
                .acct-card { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
                .acct-card-hd {
                    padding: 11px 16px; border-bottom: 1px solid #1e2420;
                    display: flex; align-items: center; justify-content: space-between;
                    font-size: 9px; font-weight: 800; text-transform: uppercase;
                    letter-spacing: 0.16em; color: #777;
                }
                .acct-card-body { padding: 14px 16px; }

                /* Fields */
                .acct-field { margin-bottom: 14px; }
                .acct-field:last-child { margin-bottom: 0; }
                .acct-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; color: #555; margin-bottom: 6px; }
                .acct-input {
                    width: 100%; background: #0f1210; border: 1px solid #1e2420;
                    border-radius: 6px; padding: 10px 12px; font-size: 13px; color: #ccc;
                    outline: none; font-family: inherit; transition: border-color 0.15s;
                }
                .acct-input:focus { border-color: rgba(249,115,22,0.4); }
                .acct-input::placeholder { color: #444; }
                .acct-textarea {
                    width: 100%; background: #0f1210; border: 1px solid #1e2420;
                    border-radius: 6px; padding: 10px 12px; font-size: 13px; color: #ccc;
                    outline: none; font-family: inherit; resize: vertical; min-height: 90px;
                    transition: border-color 0.15s;
                }
                .acct-textarea:focus { border-color: rgba(249,115,22,0.4); }
                .acct-textarea::placeholder { color: #444; }

                /* Save btn */
                .acct-save-btn {
                    width: 100%; background: #f97316; color: #000; border: none;
                    border-radius: 8px; padding: 11px; font-size: 11px; font-weight: 800;
                    text-transform: uppercase; letter-spacing: 0.14em; cursor: pointer;
                    font-family: inherit; transition: background 0.15s; margin-top: 14px;
                }
                .acct-save-btn:hover { background: #ea6c10; }

                /* Photo upload */
                .acct-photo-btn {
                    display: flex; align-items: center; gap: 14px;
                    background: #0f1210; border: 1px solid #1e2420;
                    border-radius: 6px; padding: 12px 14px; cursor: pointer;
                    transition: border-color 0.15s; width: 100%;
                }
                .acct-photo-btn:hover { border-color: rgba(249,115,22,0.35); }
                .acct-photo-icon {
                    width: 40px; height: 40px; border-radius: 8px;
                    background: #1e2420; display: flex; align-items: center;
                    justify-content: center; font-size: 18px; flex-shrink: 0;
                }

                /* Info rows */
                .acct-info-row {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 11px 16px; border-bottom: 1px solid #131720; gap: 12px;
                }
                .acct-info-row:last-child { border-bottom: none; }
                .acct-info-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #555; }
                .acct-info-val { font-size: 12px; font-weight: 700; color: #ccc; text-align: right; }

                /* Stripe */
                .acct-stripe-row {
                    display: flex; align-items: center; justify-content: space-between;
                    gap: 14px; flex-wrap: wrap;
                }
                .acct-stripe-info h4 { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 3px; }
                .acct-stripe-info p  { font-size: 11px; color: #555; }
                .acct-stripe-btn {
                    background: #f97316; color: #000; border: none; border-radius: 8px;
                    padding: 9px 20px; font-size: 11px; font-weight: 800;
                    text-transform: uppercase; letter-spacing: 0.12em; cursor: pointer;
                    font-family: inherit; white-space: nowrap; flex-shrink: 0;
                    text-decoration: none; display: inline-flex; align-items: center;
                    transition: background 0.15s;
                }
                .acct-stripe-btn:hover { background: #ea6c10; }
                .acct-stripe-btn.connected {
                    background: rgba(62,207,110,0.1); border: 1px solid rgba(62,207,110,0.25);
                    color: #3ecf6e; cursor: default;
                }

                @media (max-width: 500px) {
                    .acct-hero { flex-direction: column; align-items: flex-start; gap: 12px; }
                    .acct-info-row { flex-direction: column; align-items: flex-start; gap: 4px; }
                    .acct-info-val { text-align: left; }
                }
            ` }} />

            <div className="acct-wrap">
                <div className="acct-title">My <span>Profile</span></div>

                {/* Hero */}
                <div className="acct-hero">
                    <div className="acct-avatar">{initials}</div>
                    <div>
                        <div className="acct-hero-name">{name}</div>
                        <div className="acct-hero-meta">{email}</div>
                    </div>
                </div>

                <div className="acct-grid">
                    {/* Left: editable profile */}
                    <div>
                        <div className="acct-card">
                            <div className="acct-card-hd">
                                Public Profile
                                <span style={{ fontSize: 9, color: '#f97316', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Visible to customers</span>
                            </div>
                            <div className="acct-card-body">
                                <div className="acct-field">
                                    <div className="acct-label">Display Name</div>
                                    <input className="acct-input" defaultValue={name} />
                                </div>

                                <div className="acct-field">
                                    <div className="acct-label">Profile Photo</div>
                                    <div className="acct-photo-btn">
                                        <div className="acct-photo-icon">👤</div>
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc', marginBottom: 2 }}>Upload a photo</div>
                                            <div style={{ fontSize: 10, color: '#555' }}>JPG or PNG, shown to customers on delivery</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="acct-field">
                                    <div className="acct-label">Bio</div>
                                    <textarea
                                        className="acct-textarea"
                                        placeholder="Tell customers a little about yourself…"
                                    />
                                </div>

                                <button className="acct-save-btn">Save Profile</button>
                            </div>
                        </div>
                    </div>

                    {/* Right: account details + payout */}
                    <div>
                        {/* Stripe payout */}
                        <div className="acct-card">
                            <div className="acct-card-hd">Payout Settings</div>
                            <div className="acct-card-body">
                                <div className="acct-stripe-row">
                                    <div className="acct-stripe-info">
                                        <h4>Stripe Connect</h4>
                                        <p>{hasStripe ? 'Connected — payouts active' : 'Link your bank account to receive payouts'}</p>
                                    </div>
                                    {hasStripe ? (
                                        <span className="acct-stripe-btn connected">✓ Connected</span>
                                    ) : (
                                        <Link href="/driver/dashboard/account/stripe" className="acct-stripe-btn">
                                            Connect Stripe
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Account details */}
                        <div className="acct-card">
                            <div className="acct-card-hd">Account Details</div>
                            {[
                                { label: 'Email',       value: email },
                                { label: 'Driver ID',   value: `DRV-${initials}${driver.id?.slice(-4)?.toUpperCase() || '0001'}` },
                                { label: 'Rating',      value: `${Number((driver as any).rating || 5).toFixed(1)} ★` },
                                { label: 'Total Earned', value: `$${Number((driver as any).totalEarnings || 0).toFixed(2)}` },
                            ].map(row => (
                                <div key={row.label} className="acct-info-row">
                                    <span className="acct-info-label">{row.label}</span>
                                    <span className="acct-info-val">{row.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Password */}
                        <div className="acct-card">
                            <div className="acct-card-hd">Security</div>
                            <div className="acct-card-body">
                                <div className="acct-field">
                                    <div className="acct-label">New Password</div>
                                    <input type="password" className="acct-input" placeholder="Leave blank to keep current" />
                                </div>
                                <div className="acct-field">
                                    <div className="acct-label">Confirm Password</div>
                                    <input type="password" className="acct-input" placeholder="Repeat new password" />
                                </div>
                                <button className="acct-save-btn" style={{ background: 'transparent', border: '1px solid #1e2420', color: '#666' }}>
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
