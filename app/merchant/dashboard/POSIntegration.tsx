"use client";

import { useState } from "react";
import { generateApiKey, savePosCredentials } from "../actions";

interface POSIntegrationProps {
    currentApiKey?: string;
    posType?: string;
}

export default function POSIntegration({ currentApiKey, posType = "None" }: POSIntegrationProps) {
    const [apiKey, setApiKey] = useState(currentApiKey || "");
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);
    
    // External Integrations
    const [externalPos, setExternalPos] = useState(posType);
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");

    const handleGenerate = async () => {
        if (apiKey && !confirm("Rotating will invalidate the current key. All existing integrations will disconnect. Continue?")) return;

        setLoading(true);
        const res = await generateApiKey();
        if (res.success && res.apiKey) {
            setApiKey(res.apiKey);
            setShowKey(true);
        } else {
            alert("Failed to rotate key: " + res.error);
        }
        setLoading(false);
    };

    const handleSync = async () => {
        if (!clientId || !clientSecret) {
            alert("Please provide both Client ID and Secret to sync.");
            return;
        }
        setSyncing(true);
        const res = await savePosCredentials(externalPos, clientId, clientSecret);
        if (res.success) {
            alert(`${externalPos} system synchronized and protocols active!`);
        } else {
            alert("Sync Failure: " + res.error);
        }
        setSyncing(false);
    };

    const copyToClipboard = () => {
        if (!showKey) {
            alert("Reveal the key protocol first.");
            return;
        }
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <style>{`
                /* ── SECTION ── */
                .section { background: #0f1219; border: 1px solid #1c1f28; margin-bottom: 24px; position: relative; }
                .section-hd { display: flex; align-items: center; gap: 10px; padding: 14px 20px; border-bottom: 1px solid #1c1f28; }
                .section-icon { width: 28px; height: 28px; background: #131720; border: 1px solid #2a2f3a; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .section-title-text { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: 0.02em; }
                .section-title-text span { color: #e8a230; }
                .section-sub-text { font-size: 11px; color: #444; margin-top: 2px; }
                .section-body { padding: 0; }

                /* ── TWO COL ── */
                .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #1c1f28; }
                .col { background: #0f1219; padding: 24px; position: relative; overflow: hidden; }

                /* ── PLATFORM SELECTOR ── */
                .field-label { font-size: 9px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #444; margin-bottom: 10px; }
                .platform-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
                .platform-btn { padding: 12px 16px; background: #0c0e13; border: 1px solid #2a2f3a; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #555; cursor: pointer; text-align: center; transition: all .15s; }
                .platform-btn:hover { border-color: #444; color: #888; }
                .platform-btn.active { background: #1a1200; border-color: #e8a230; color: #e8a230; }
                .platform-btn.none { grid-column: span 1; }

                /* ── FIELDS ── */
                .field-input { width: 100%; background: #0c0e13; border: 1px solid #2a2f3a; color: #ccc; font-family: 'DM Mono', monospace; font-size: 13px; padding: 11px 14px; outline: none; margin-bottom: 14px; transition: border-color .15s; }
                .field-input:focus { border-color: #e8a230; }
                .field-input::placeholder { color: #222; }

                /* ── BUTTONS ── */
                .primary-btn { width: 100%; background: #e8a230; border: none; color: #000; font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; padding: 14px; cursor: pointer; transition: opacity .15s; }
                .primary-btn:hover { opacity: .9; }
                .primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .outline-btn { background: transparent; border: 1px solid #2a2f3a; color: #888; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 11px 20px; cursor: pointer; transition: border-color .15s, color .15s; white-space: nowrap; }
                .outline-btn:hover { border-color: #e8a230; color: #e8a230; }
                .danger-btn { background: transparent; border: 1px solid #3a1010; color: #e24b4a; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 11px 20px; cursor: pointer; transition: border-color .15s; }
                .danger-btn:hover { border-color: #e24b4a; }

                /* ── KEY BLOCK ── */
                .key-block { display: flex; align-items: center; gap: 6px; background: #0c0e13; border: 1px solid #2a2f3a; padding: 12px 16px; margin-bottom: 6px; position: relative; }
                .key-value { flex: 1; font-family: 'DM Mono', monospace; font-size: 12px; color: #3dd68c; letter-spacing: 0.08em; overflow: hidden; text-overflow: ellipsis; }
                .key-hidden { flex: 1; font-family: 'DM Mono', monospace; font-size: 14px; color: #2a2f3a; letter-spacing: 0.1em; }
                .copy-btn { width: 32px; height: 32px; background: #131720; border: 1px solid #2a2f3a; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: border-color .15s; }
                .copy-btn:hover { border-color: #e8a230; }
                .key-hint { font-size: 10px; color: #333; line-height: 1.5; font-style: italic; margin-bottom: 14px; }

                /* ── STATUS TAG ── */
                .status-row { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
                .connected-tag { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 4px 10px; background: #0d2a1a; color: #3dd68c; border: 1px solid #1a4a2a; }
                .disconnected-tag { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 4px 10px; background: #1a0808; color: #e24b4a; border: 1px solid #3a1010; }

                /* ── API WATERMARK ── */
                .api-watermark { font-family: 'Barlow Condensed', sans-serif; font-size: 80px; font-weight: 800; font-style: italic; color: rgba(232, 162, 48, 0.04); letter-spacing: 0.05em; text-align: right; line-height: 1; margin-top: -8px; pointer-events: none; user-select: none; position: absolute; bottom: 10px; right: 20px; }
                
                .divider { height: 1px; background: #1c1f28; margin: 16px 0; }
                .action-row { display: flex; align-items: center; gap: 8px; }

                @media (max-width: 1100px) {
                    .two-col { grid-template-columns: 1fr; }
                    .col { padding: 18px; }
                }

                @media (max-width: 700px) {
                    .section-hd { padding: 12px 14px; }
                    .section-title-text { font-size: 16px; }
                    .section-sub-text { font-size: 10px; }
                    .platform-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                    .platform-btn { padding: 10px 10px; font-size: 10px; }
                    .platform-btn.none { grid-column: span 2; }
                    .key-block { border-radius: 12px; }
                    .key-value { word-break: break-all; }
                    .action-row { flex-direction: column; align-items: stretch; }
                    .outline-btn, .danger-btn { width: 100%; text-align: center; }
                    .api-watermark { display: none; }
                }
            `}</style>

            {/* SYSTEM HOOKS */}
            <div className="section">
                <div className="section-hd">
                    <div className="section-icon">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 7h8M7 3v8" stroke="#e8a230" strokeWidth="1.4" strokeLinecap="round"/>
                            <circle cx="7" cy="7" r="6" stroke="#e8a230" strokeWidth="1.2"/>
                        </svg>
                    </div>
                    <div>
                        <div className="section-title-text">System <span>Hooks</span></div>
                        <div className="section-sub-text">Synchronize your existing POS menus and orders.</div>
                    </div>
                </div>

                <div className="two-col">
                    <div className="col">
                        <div className="field-label">Platform Selection</div>
                        <div className="platform-grid">
                            {['Toast', 'Square', 'Clover', 'Revel', 'None'].map((sys) => (
                                <button 
                                    key={sys}
                                    onClick={() => setExternalPos(sys)}
                                    className={`platform-btn ${externalPos === sys ? 'active' : ''} ${sys === 'None' ? 'none' : ''}`}
                                >
                                    {sys}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="col">
                        <div className="status-row">
                            <div className={externalPos !== 'None' && clientId ? "connected-tag" : "disconnected-tag"}>
                                {externalPos !== 'None' && clientId ? "Protocols Active" : "Not Connected"}
                            </div>
                        </div>
                        
                        {externalPos !== "None" ? (
                            <>
                                <div className="field-label">{externalPos} Client ID</div>
                                <input 
                                    className="field-input" 
                                    type="text" 
                                    placeholder="Enter ID..."
                                    value={clientId}
                                    onChange={(e) => setClientId(e.target.value)}
                                />
                                <div className="field-label">{externalPos} Client Secret</div>
                                <input 
                                    className="field-input" 
                                    type="password" 
                                    placeholder="••••••••••••"
                                    value={clientSecret}
                                    onChange={(e) => setClientSecret(e.target.value)}
                                />
                                <button 
                                    className="primary-btn" 
                                    onClick={handleSync}
                                    disabled={syncing}
                                >
                                    {syncing ? "Syncing..." : `Sync ${externalPos} System →`}
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-[10px] uppercase font-bold text-slate-700 italic">
                                Select a platform to proceed
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* DIRECT HUB ACCESS */}
            <div className="section">
                <div className="section-hd">
                    <div className="section-icon">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <rect x="2" y="4" width="10" height="7" rx="1" stroke="#e8a230" strokeWidth="1.2"/>
                            <path d="M5 4V3a2 2 0 014 0v1" stroke="#e8a230" strokeWidth="1.2"/>
                            <circle cx="7" cy="7.5" r="1" fill="#e8a230"/>
                        </svg>
                    </div>
                    <div>
                        <div className="section-title-text">Direct <span>Hub Access</span></div>
                        <div className="section-sub-text">Integrate custom kiosks or 3rd party dispatchers.</div>
                    </div>
                </div>

                <div className="two-col">
                    <div className="col">
                        <div className="field-label">TrueServe Secret Key</div>
                        <div className="key-block">
                            <div className={showKey ? "key-value" : "key-hidden"}>
                                {showKey ? apiKey : "••••••••••••••••••••••••••••••••"}
                            </div>
                            <div className="copy-btn" onClick={copyToClipboard} title="Copy key">
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                    <rect x="4" y="4" width="8" height="8" rx="1" stroke="#888" strokeWidth="1.2"/>
                                    <path d="M1 9V2a1 1 0 011-1h7" stroke="#888" strokeWidth="1.2" strokeLinecap="round"/>
                                </svg>
                            </div>
                        </div>
                        <div className="key-hint">Generate a new key to reset your connection. Existing kiosks must be updated immediately.</div>
                        <div className="action-row">
                            <button className="outline-btn" onClick={() => setShowKey(!showKey)}>
                                {showKey ? "Hide Protocol Key" : "Reveal Protocol Key"}
                            </button>
                            <button className="danger-btn" onClick={handleGenerate} disabled={loading}>
                                {loading ? "Rotating..." : "Rotate Protocol"}
                            </button>
                        </div>
                    </div>

                    <div className="col">
                        <div className="field-label">API Endpoint</div>
                        <div className="key-block" style={{ marginBottom: "14px" }}>
                            <div className="key-value">https://api.trueserve.io/v1/hub</div>
                            <div className="copy-btn">
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                    <rect x="4" y="4" width="8" height="8" rx="1" stroke="#888" strokeWidth="1.2"/>
                                    <path d="M1 9V2a1 1 0 011-1h7" stroke="#888" strokeWidth="1.2" strokeLinecap="round"/>
                                </svg>
                            </div>
                        </div>
                        <div className="field-label">Webhook Delivery</div>
                        <div className="key-block">
                            <div className="key-value" style={{ color: "#555", fontSize: "11px" }}>No webhook URL configured</div>
                        </div>
                        <div className="divider"></div>
                        <div className="status-row">
                            <div className="connected-tag">Protocol Active</div>
                            <span style={{ fontSize: "10px", color: "#333", letterSpacing: "0.08em", textTransform: "uppercase" }}>Version 2.1</span>
                        </div>
                        <div className="api-watermark">API</div>
                    </div>
                </div>
            </div>
        </>
    );
}
