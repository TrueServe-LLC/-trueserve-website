import { getDriverOrRedirect } from "@/lib/driver-auth";

export const dynamic = 'force-dynamic';

export default async function DriverPreferences() {
    await getDriverOrRedirect();

    return (
        <div className="font-sans">
            <style dangerouslySetInnerHTML={{ __html: `
                .page-wrap { padding: 24px 28px; }
                .page-title { font-family: 'Barlow Condensed', sans-serif; font-size: 30px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: 0.01em; margin-bottom: 20px; }
                .page-title span { color: #e8a230; }

                .prefs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .prefs-section { background: #0f1219; border: 1px solid #1c1f28; }
                .prefs-sec-hd { padding: 12px 16px; border-bottom: 1px solid #1c1f28; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #888; }
                .pref-row { display: flex; align-items: flex-start; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #131720; gap: 16px; }
                .pref-row:last-child { border-bottom: none; }
                .pref-info .pref-name { font-size: 13px; font-weight: 700; color: #ccc; margin-bottom: 3px; }
                .pref-info .pref-desc { font-size: 11px; color: #444; line-height: 1.4; }

                .toggle-sw { width: 36px; height: 20px; border-radius: 2px; position: relative; cursor: pointer; flex-shrink: 0; margin-top: 2px; }
                .toggle-sw.on { background: #e8a230; }
                .toggle-sw.off { background: #2a2f3a; border: 1px solid #3a3f4a; }
                .toggle-knob { width: 16px; height: 16px; background: #fff; border-radius: 1px; position: absolute; top: 2px; transition: left .15s; }
                .toggle-sw.on .toggle-knob { left: 18px; }
                .toggle-sw.off .toggle-knob { left: 2px; }

                .nav-option { padding: 10px; border: 1px solid #2a2f3a; text-align: center; cursor: pointer; font-size: 12px; font-weight: 700; color: #555; letter-spacing: 0.06em; transition: all .15s; display: flex; align-items: center; justify-content: center; gap: 6px; }
                .nav-option.active { background: #1a1200; border-color: #e8a230; color: #e8a230; }
            ` }} />
            
            <div className="page-wrap">
                <div className="page-title"><span>Preferences</span></div>
                
                <div className="prefs-grid">
                    <div className="prefs-section">
                        <div className="prefs-sec-hd">Delivery Settings</div>
                        <div className="pref-row">
                            <div className="pref-info">
                                <div className="pref-name">Alcohol Deliveries</div>
                                <div className="pref-desc">Requires ID verification on drop-off.</div>
                            </div>
                            <div className="toggle-sw on"><div className="toggle-knob"></div></div>
                        </div>
                        <div className="pref-row">
                            <div className="pref-info">
                                <div className="pref-name">Cash on Delivery</div>
                                <div className="pref-desc">Collect cash from customers (kept as earnings).</div>
                            </div>
                            <div className="toggle-sw off"><div className="toggle-knob"></div></div>
                        </div>
                        <div className="pref-row">
                            <div className="pref-info">
                                <div className="pref-name">Long Distance Trips (8 mi)</div>
                                <div className="pref-desc">Higher pay, more drive time.</div>
                            </div>
                            <div className="toggle-sw on"><div className="toggle-knob"></div></div>
                        </div>
                    </div>

                    <div className="prefs-section">
                        <div className="prefs-sec-hd">App Settings</div>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #131720' }}>
                            <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: '8px' }}>Navigation App</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                <div className="nav-option active">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2L9 6h3L9 9l1 4-3-2-3 2 1-4-3-3h3L7 2z" stroke="#e8a230" strokeWidth="1.1"/></svg>
                                    Google Maps
                                </div>
                                <div className="nav-option">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="5" width="10" height="7" rx="1" stroke="#555" strokeWidth="1.1"/><path d="M5 5V4a2 2 0 014 0v1" stroke="#555" strokeWidth="1.1"/></svg>
                                    Waze
                                </div>
                            </div>
                        </div>
                        <div className="pref-row">
                            <div className="pref-info">
                                <div className="pref-name">Dark Mode</div>
                                <div className="pref-desc">Always on for driver safety.</div>
                            </div>
                            <div className="toggle-sw on" style={{ opacity: 0.5 }}><div className="toggle-knob"></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
