"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

interface EmbedManagerProps {
    restaurantId: string;
    restaurantName: string;
    slug?: string;
    storefrontPath: string;
    storefrontUrl: string;
}

export default function EmbedManager({ restaurantId, restaurantName, slug, storefrontPath, storefrontUrl }: EmbedManagerProps) {
    const [copiedItem, setCopiedItem] = useState<null | "snippet" | "link" | "caption" | "qr">(null);
    const [downloadMode, setDownloadMode] = useState<null | "flyer" | "tableTent">(null);
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
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storefrontUrl)}`;
    const emailShareUrl = `mailto:?subject=${encodeURIComponent(`Order from ${restaurantName} on TrueServe`)}&body=${encodeURIComponent(socialCaption)}`;
    const smsShareUrl = `sms:?&body=${encodeURIComponent(`${restaurantName} is live on TrueServe. Order here: ${storefrontUrl}`)}`;

    const handleCopy = async (value: string, key: "snippet" | "link" | "caption" | "qr") => {
        await navigator.clipboard.writeText(value);
        setCopiedItem(key);
        setTimeout(() => setCopiedItem(null), 2000);
    };

    const buildQrDataUrl = async () =>
        QRCode.toDataURL(storefrontUrl, {
            width: 720,
            margin: 1,
            color: {
                dark: "#0b0f14",
                light: "#ffffff",
            },
        });

    const downloadFlyerPdf = async (variant: "flyer" | "tableTent") => {
        setDownloadMode(variant);
        try {
            const qrDataUrl = await buildQrDataUrl();
            const isFlyer = variant === "flyer";
            const doc = new jsPDF({
                orientation: isFlyer ? "portrait" : "landscape",
                unit: "pt",
                format: isFlyer ? "letter" : [396, 612],
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            doc.setFillColor(10, 14, 20);
            doc.rect(0, 0, pageWidth, pageHeight, "F");

            doc.setFillColor(249, 115, 22);
            doc.rect(0, 0, pageWidth, isFlyer ? 78 : 62, "F");

            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(isFlyer ? 26 : 24);
            doc.text(restaurantName, 36, isFlyer ? 48 : 40);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(isFlyer ? 14 : 12);
            doc.text("Order directly with TrueServe", 36, isFlyer ? 104 : 98);

            doc.setFont("helvetica", "bold");
            doc.setTextColor(249, 115, 22);
            doc.setFontSize(isFlyer ? 34 : 30);
            doc.text(isFlyer ? "SCAN TO ORDER" : "SCAN TO ORDER", 36, isFlyer ? 148 : 138);

            doc.addImage(qrDataUrl, "PNG", pageWidth - (isFlyer ? 244 : 210), isFlyer ? 108 : 86, isFlyer ? 188 : 156, isFlyer ? 188 : 156);

            doc.setTextColor(235, 235, 235);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(isFlyer ? 16 : 13);
            const bodyLines = doc.splitTextToSize(
                "Skip the marketplace detour. Order from our official TrueServe storefront for fresh meals, direct updates, and local delivery support.",
                isFlyer ? pageWidth - 320 : pageWidth - 270
            );
            doc.text(bodyLines, 36, isFlyer ? 188 : 176);

            doc.setDrawColor(255, 255, 255, 0.14);
            doc.line(36, isFlyer ? 262 : 236, pageWidth - 36, isFlyer ? 262 : 236);

            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(isFlyer ? 14 : 12);
            doc.text("Direct ordering link", 36, isFlyer ? 292 : 266);

            doc.setFont("helvetica", "normal");
            doc.setTextColor(200, 200, 200);
            doc.setFontSize(isFlyer ? 12 : 10);
            const urlLines = doc.splitTextToSize(storefrontUrl, isFlyer ? pageWidth - 72 : pageWidth - 72);
            doc.text(urlLines, 36, isFlyer ? 316 : 288);

            doc.setFillColor(17, 24, 39);
            doc.roundedRect(36, pageHeight - (isFlyer ? 122 : 96), pageWidth - 72, isFlyer ? 70 : 58, 10, 10, "F");
            doc.setTextColor(249, 115, 22);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(isFlyer ? 18 : 15);
            doc.text("Fresh meals. Fast delivery. Local support.", 54, pageHeight - (isFlyer ? 82 : 64));

            doc.setTextColor(230, 230, 230);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(isFlyer ? 11 : 10);
            doc.text("Powered by TrueServe", 54, pageHeight - (isFlyer ? 58 : 42));

            const safeName = restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            doc.save(`${safeName}-${variant}.pdf`);
        } finally {
            setDownloadMode(null);
        }
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginTop: "14px" }}>
                    <a href={facebookShareUrl} target="_blank" rel="noreferrer" className="btn btn-gold" style={{ justifyContent: "center", textDecoration: "none" }}>
                        Share to Facebook ↗
                    </a>
                    <a href={emailShareUrl} className="btn btn-ghost" style={{ justifyContent: "center", textDecoration: "none" }}>
                        Share by Email
                    </a>
                    <a href={smsShareUrl} className="btn btn-ghost" style={{ justifyContent: "center", textDecoration: "none" }}>
                        Share by Text
                    </a>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginTop: "12px" }}>
                    <button onClick={() => downloadFlyerPdf("flyer")} className="btn btn-ghost" style={{ justifyContent: "center" }}>
                        {downloadMode === "flyer" ? "Building Flyer..." : "Download Flyer PDF"}
                    </button>
                    <button onClick={() => downloadFlyerPdf("tableTent")} className="btn btn-ghost" style={{ justifyContent: "center" }}>
                        {downloadMode === "tableTent" ? "Building Table Tent..." : "Download Table Tent PDF"}
                    </button>
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
