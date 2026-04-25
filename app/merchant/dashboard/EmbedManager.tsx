"use client";

import { useState } from "react";

interface EmbedManagerProps {
    restaurantId: string;
    restaurantName: string;
    slug?: string;
    storefrontPath: string;
    storefrontUrl: string;
}

export default function EmbedManager({ restaurantId, restaurantName, slug, storefrontPath, storefrontUrl }: EmbedManagerProps) {
    const [copiedItem, setCopiedItem] = useState<null | "snippet" | "link" | "caption" | "qr">(null);
    const [primaryColor, setPrimaryColor] = useState("10B981");

    const embedId = slug || restaurantId;
    const embedUrl = `https://trueserve.delivery/restaurants/${embedId}?embed=true&primary=${primaryColor.replace('#', '')}`;
    const qrUrl = `/api/qr?size=260&data=${encodeURIComponent(storefrontUrl)}`;

    const snippet = `<div style="width:100%; overflow:hidden;">
  <iframe
    src="${embedUrl}"
    width="100%"
    height="1000px"
    frameborder="0"
    style="border:none; border-radius:32px; box-shadow:0 20px 50px rgba(0,0,0,0.5);"
    allow="payment"
  ></iframe>
</div>`;

    const socialCaption = `${restaurantName} is now live on TrueServe.\n\nOrder directly here: ${storefrontUrl}\n\nFresh meals. Fast delivery. Local support.`;

    const handleCopy = async (value: string, key: "snippet" | "link" | "caption" | "qr") => {
        await navigator.clipboard.writeText(value);
        setCopiedItem(key);
        setTimeout(() => setCopiedItem(null), 2000);
    };

    return (
        <div style={{ display: "grid", gap: "24px" }}>
            <div className="md-stat-block">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "12px" }}>
                    <div className="md-stat-name" style={{ marginBottom: 0 }}>Direct-Order Toolkit</div>
                    <div className="md-online-badge">Pilot Ready</div>
                </div>
                <p style={{ color: "var(--t2)", fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
                    Use one live ordering link everywhere: your website, Google Business Profile, Instagram bio, Facebook page, and QR flyers.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                    <div style={{ border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px" }}>
                        <div className="md-stat-name" style={{ marginBottom: "10px" }}>Live Ordering URL</div>
                        <div style={{ color: "var(--gold)", fontSize: "13px", fontWeight: 700, lineHeight: 1.6, wordBreak: "break-word", marginBottom: "12px" }}>
                            {storefrontUrl}
                        </div>
                        <button onClick={() => handleCopy(storefrontUrl, "link")} className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
                            {copiedItem === "link" ? "✓ Copied Link" : "Copy Ordering Link"}
                        </button>
                    </div>
                    <div style={{ border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px" }}>
                        <div className="md-stat-name" style={{ marginBottom: "10px" }}>Instagram / Facebook Caption</div>
                        <div style={{ color: "var(--t2)", fontSize: "13px", lineHeight: 1.6, minHeight: "88px", whiteSpace: "pre-wrap", marginBottom: "12px" }}>
                            {socialCaption}
                        </div>
                        <button onClick={() => handleCopy(socialCaption, "caption")} className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
                            {copiedItem === "caption" ? "✓ Copied Caption" : "Copy Social Caption"}
                        </button>
                    </div>
                    <div style={{ border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px" }}>
                        <div className="md-stat-name" style={{ marginBottom: "10px" }}>Customer QR Code</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", padding: "14px", borderRadius: "10px", marginBottom: "12px", minHeight: "180px" }}>
                            <img src={qrUrl} alt={`${restaurantName} ordering QR code`} style={{ width: "148px", height: "148px", display: "block" }} />
                        </div>
                        <button onClick={() => handleCopy(storefrontUrl, "qr")} className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
                            {copiedItem === "qr" ? "✓ Copied QR Link" : "Copy QR Destination"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="md-stat-block">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                    <div className="md-stat-name" style={{ marginBottom: 0 }}>Website Embed</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--t3)" }}>Brand Accent</span>
                    <input
                        type="color"
                        value={`#${primaryColor}`}
                        onChange={(e) => setPrimaryColor(e.target.value.replace('#', ''))}
                        style={{ height: "28px", width: "28px", cursor: "pointer", borderRadius: "6px", border: "2px solid var(--border2)", background: "transparent", padding: 0 }}
                    />
                </div>
                </div>

                <p style={{ color: "var(--t3)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: "12px" }}>
                    Generated exclusively for {restaurantName} · {storefrontPath}
                </p>

                <pre style={{ overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "12px", lineHeight: 1.8, color: "var(--green)", background: "var(--card2)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border)", marginBottom: "16px", fontFamily: "monospace" }}>
                    {snippet}
                </pre>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <button onClick={() => handleCopy(snippet, "snippet")} className="btn btn-ghost" style={{ justifyContent: "center", gap: "8px" }}>
                        {copiedItem === "snippet" ? "✓ Copied Snippet" : "Copy GHL Snippet"}
                    </button>
                    <a href={embedUrl} target="_blank" rel="noreferrer" className="btn btn-gold" style={{ justifyContent: "center", textDecoration: "none" }}>
                        Preview Embedded View ↗
                    </a>
                </div>
            </div>
        </div>
    );
}
