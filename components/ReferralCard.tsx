"use client";

import { useState } from "react";

function deriveReferralCode(userId: string): string {
  // Deterministic short code from userId — no DB column needed
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) >>> 0;
  }
  let code = "";
  let h = hash;
  for (let i = 0; i < 6; i++) {
    code += chars[h % chars.length];
    h = Math.floor(h / chars.length);
  }
  return code;
}

export default function ReferralCard({ userId }: { userId: string }) {
  const code = deriveReferralCode(userId);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://trueserve.app";
  const link = `${origin}/signup?ref=${code}`;

  const copy = (type: "code" | "link") => {
    navigator.clipboard.writeText(type === "code" ? code : link).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <article className="food-card">
      <p className="food-kicker mb-2">Referrals</p>
      <h3 className="food-heading !text-[30px] mb-2">Invite Friends</h3>
      <p className="text-sm leading-7 text-white/70 mb-4">
        Share your link — your friend gets their first delivery fee waived, and you earn credit on their first order.
      </p>

      {/* Code display */}
      <div style={{
        background: "rgba(249,115,22,0.06)",
        border: "1px solid rgba(249,115,22,0.2)",
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
            Your referral code
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.12em", color: "#f97316", fontFamily: "monospace" }}>
            {code}
          </div>
        </div>
        <button
          onClick={() => copy("code")}
          style={{
            background: copied === "code" ? "rgba(62,207,110,0.15)" : "rgba(249,115,22,0.12)",
            border: `1px solid ${copied === "code" ? "rgba(62,207,110,0.3)" : "rgba(249,115,22,0.3)"}`,
            color: copied === "code" ? "#3ecf6e" : "#f97316",
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.15s",
          }}
        >
          {copied === "code" ? "Copied!" : "Copy Code"}
        </button>
      </div>

      {/* Link row */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "0.5px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
      }}>
        <div style={{ flex: 1, fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {link}
        </div>
        <button
          onClick={() => copy("link")}
          style={{
            background: "transparent",
            border: "0.5px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.6)",
            borderRadius: 7,
            padding: "6px 12px",
            fontSize: 10,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.15s",
            flexShrink: 0,
          }}
        >
          {copied === "link" ? "Copied!" : "Copy Link"}
        </button>
      </div>

      {/* Reward summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          { label: "You earn", value: "$5 credit", sub: "per successful referral" },
          { label: "Friend gets", value: "Free delivery", sub: "on their first order" },
        ].map(item => (
          <div key={item.label} style={{
            background: "rgba(255,255,255,0.03)",
            border: "0.5px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
            padding: "12px 14px",
          }}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#f97316", marginBottom: 2 }}>{item.value}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{item.sub}</div>
          </div>
        ))}
      </div>
    </article>
  );
}
