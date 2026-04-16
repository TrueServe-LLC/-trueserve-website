"use client";

import Link from "next/link";

interface RestaurantCardProps {
  r: any;
  address?: string;
  search?: string;
  latParam?: string;
  lngParam?: string;
}

function gradeToColor(grade: string): { bg: string; text: string; border: string } {
  switch (grade?.toUpperCase()) {
    case "A":
      return { bg: "#0d1a10", text: "#2ee5a0", border: "#1a4a2a" };
    case "B":
      return { bg: "#1c1508", text: "#f97316", border: "#57400f" };
    case "C":
      return { bg: "#1a1208", text: "#fb923c", border: "#5c3a0f" };
    case "D":
      return { bg: "#1a0d10", text: "#f87171", border: "#4a1a1a" };
    default:
      return { bg: "transparent", text: "#999", border: "transparent" };
  }
}

export default function RestaurantCard({
  r,
  address,
  search,
  latParam,
  lngParam,
}: RestaurantCardProps) {
  const hasGHL = Boolean(r.ghlUrl);
  const googleQuery = encodeURIComponent(`${r.name || ""} ${r.address || ""} ${r.city || ""} ${r.state || ""}`);

  const menuQuery = (() => {
    const params = new URLSearchParams();
    const addressText = (address || search || "").trim();
    if (addressText) params.set("address", addressText);
    if (latParam && lngParam) {
      params.set("lat", String(latParam));
      params.set("lng", String(lngParam));
    }
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  })();

  const hasHealthGrade = r.healthGrade && r.healthGrade !== "—";
  const colors = hasHealthGrade ? gradeToColor(r.healthGrade) : null;

  return (
    <Link key={r.id} href={`/restaurants/${r.id}${menuQuery}`} className="rest-card">
      <div
        className="rc-img"
        style={{
          backgroundImage: `url('${
            r.imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80"
          }')`,
          position: "relative",
        }}
      >
        {hasGHL && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              background: "rgba(12,14,19,.85)",
              color: "#fff",
              padding: "7px 10px",
              borderRadius: 999,
              fontSize: 9,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              gap: 6,
              zIndex: 1,
              border: "1px solid rgba(255,255,255,.08)",
              letterSpacing: ".12em",
            }}
          >
            <span style={{ color: "var(--gold)" }}>●</span> FAST ASSIST
          </div>
        )}

        {/* Health Grade Badge */}
        {hasHealthGrade && colors && (
          <div
            className="health-grade-badge"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: colors.bg,
              border: `2px solid ${colors.border}`,
              color: colors.text,
              width: 48,
              height: 48,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: "bold",
              zIndex: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {r.healthGrade}
          </div>
        )}
      </div>

      <div className="rc-info">
        <div className="rc-name">{r.name}</div>
        <div className="rc-meta">
          <div className="rc-rating">
            <span>★</span> {r.rating || "4.9"}
          </div>
          <div>•</div>
          <div>
            {typeof r.distanceMiles === "number"
              ? `${r.distanceMiles.toFixed(1)} mi`
              : "18-24 mins"}
          </div>
          <div>•</div>
          <div>
            {r.city}, {r.state}
          </div>
        </div>

        {/* Compliance Status Indicator */}
        {r.complianceStatus && r.complianceStatus !== "—" && (
          <div style={{ marginTop: "8px", fontSize: "12px", color: "#999" }}>
            {r.complianceStatus === "PASS" && "✅ Compliant"}
            {r.complianceStatus === "IN_REVIEW" && "⚠️ In Review"}
            {r.complianceStatus === "FLAGGED" && "🚨 Flagged"}
          </div>
        )}

        <button
          type="button"
          className="mt-2 inline-flex text-[11px] uppercase tracking-[0.14em] font-bold text-[#f97316] hover:text-white transition-colors"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            window.open(
              `https://www.google.com/search?q=${googleQuery}+reviews`,
              "_blank",
              "noopener,noreferrer"
            );
          }}
        >
          View Google Reviews
        </button>
      </div>
    </Link>
  );
}
