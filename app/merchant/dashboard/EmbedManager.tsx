"use client";

import { useState } from "react";

interface EmbedManagerProps {
    restaurantId: string;
    restaurantName: string;
    slug?: string;
}

export default function EmbedManager({ restaurantId, restaurantName, slug }: EmbedManagerProps) {
    const [copied, setCopied] = useState(false);
    const [primaryColor, setPrimaryColor] = useState("10B981");

    const embedId = slug || restaurantId;
    const embedUrl = `https://trueserve.delivery/restaurants/${embedId}?embed=true&primary=${primaryColor.replace('#', '')}`;

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

    const handleCopy = () => {
        navigator.clipboard.writeText(snippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="md-stat-block">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div className="md-stat-name" style={{ marginBottom: 0 }}>Storefront Embed</div>
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
                Generated exclusively for {restaurantName}
            </p>

            <pre style={{ overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "12px", lineHeight: 1.8, color: "var(--green)", background: "var(--card2)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border)", marginBottom: "16px", fontFamily: "monospace" }}>
                {snippet}
            </pre>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <button onClick={handleCopy} className="btn btn-ghost" style={{ justifyContent: "center", gap: "8px" }}>
                    {copied ? "✓ Copied" : "Copy GHL Snippet"}
                </button>
                <a href={embedUrl} target="_blank" rel="noreferrer" className="btn btn-gold" style={{ justifyContent: "center", textDecoration: "none" }}>
                    Preview Storefront ↗
                </a>
            </div>
        </div>
    );
}
