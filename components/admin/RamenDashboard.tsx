"use client";

interface RamenMetrics {
  retentionRate: number;
  retained: number;
  retentionDenominator: number;
  activationRate: number;
  activated: number;
  activationDenominator: number;
  revAll: number;
  rev30: number;
  revPrev: number;
  revTrend: number | null;
  aov: number;
  deliveredCount: number;
  wau: number;
  mau: number;
  stickiness: number;
  ordersPerMauUser: number;
  nps: number | null;
  avgRating: number | null;
  promoters: number;
  passives: number;
  detractors: number;
  reviewCount: number;
  totalCustomers: number;
  totalDrivers: number;
  sparkline: { date: string; orders: number; revenue: number }[];
}

function pct(n: number) {
  return `${Math.round(n)}%`;
}
function money(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}
function grade(rate: number, thresholds: [number, number]): "good" | "warn" | "bad" {
  if (rate >= thresholds[0]) return "good";
  if (rate >= thresholds[1]) return "warn";
  return "bad";
}

const COLORS = {
  good: { text: "#4dca80", bg: "rgba(77,202,128,0.08)", border: "rgba(77,202,128,0.2)" },
  warn: { text: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" },
  bad:  { text: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
  neutral: { text: "#888", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)" },
};

function Sparkline({ data, color = "#f97316" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const w = 120, h = 36;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      <polyline
        points={`0,${h} ${pts} ${w},${h}`}
        fill={color}
        opacity="0.08"
      />
    </svg>
  );
}

function MetricCard({
  letter,
  letterColor,
  title,
  value,
  sub,
  status,
  detail,
  sparkData,
  benchmark,
}: {
  letter: string;
  letterColor: string;
  title: string;
  value: string;
  sub?: string;
  status: "good" | "warn" | "bad" | "neutral";
  detail?: string;
  sparkData?: number[];
  benchmark?: string;
}) {
  const c = COLORS[status];
  return (
    <div style={{
      background: "#111",
      border: `1px solid ${c.border}`,
      borderRadius: 14,
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: `${letterColor}18`,
            border: `1px solid ${letterColor}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, color: letterColor,
            fontFamily: "monospace",
          }}>
            {letter}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#555" }}>{title}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.text, letterSpacing: "-0.02em", lineHeight: 1.1, marginTop: 2 }}>{value}</div>
          </div>
        </div>
        {sparkData && sparkData.some(v => v > 0) && (
          <Sparkline data={sparkData} color={c.text} />
        )}
      </div>

      {sub && (
        <div style={{ fontSize: 11, color: "#666", fontWeight: 500 }}>{sub}</div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        {detail && (
          <div style={{
            display: "inline-flex", alignItems: "center",
            background: c.bg, border: `1px solid ${c.border}`,
            color: c.text, borderRadius: 20,
            padding: "3px 10px", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            {detail}
          </div>
        )}
        {benchmark && (
          <div style={{ fontSize: 10, color: "#444", fontWeight: 500 }}>{benchmark}</div>
        )}
      </div>
    </div>
  );
}

export default function RamenDashboard({ metrics: m }: { metrics: RamenMetrics }) {
  const maxOrders = Math.max(...m.sparkline.map(d => d.orders), 1);

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{
            fontSize: 11, fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.18em", color: "#f97316",
          }}>
            Product Health
          </div>
          <div style={{
            background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)",
            color: "#f97316", borderRadius: 20, padding: "2px 10px",
            fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
          }}>
            RAMEN Framework
          </div>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 4 }}>
          Retention · Activation · Monetization · Engagement · NPS
        </h1>
        <p style={{ fontSize: 12, color: "#555" }}>
          {m.totalCustomers.toLocaleString()} customers · {m.totalDrivers.toLocaleString()} drivers · {m.deliveredCount.toLocaleString()} delivered orders
        </p>
      </div>

      {/* RAMEN grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 12,
        marginBottom: 24,
      }}>
        {/* R — Retention */}
        <MetricCard
          letter="R"
          letterColor="#4dca80"
          title="Retention · 30-day"
          value={m.retentionDenominator > 0 ? pct(m.retentionRate) : "—"}
          sub={m.retentionDenominator > 0
            ? `${m.retained} of ${m.retentionDenominator} customers reordered within 30 days`
            : "No delivered orders yet"}
          status={m.retentionDenominator === 0 ? "neutral" : grade(m.retentionRate, [30, 15])}
          detail={m.retentionDenominator > 0
            ? (m.retentionRate >= 30 ? "Healthy" : m.retentionRate >= 15 ? "Needs work" : "Critical")
            : undefined}
          benchmark="Target: >30%"
        />

        {/* A — Activation */}
        <MetricCard
          letter="A"
          letterColor="#60a5fa"
          title="Activation · 7-day"
          value={m.activationDenominator > 0 ? pct(m.activationRate) : "—"}
          sub={m.activationDenominator > 0
            ? `${m.activated} of ${m.activationDenominator} customers ordered within 7 days of signup`
            : "No customer signups with orders yet"}
          status={m.activationDenominator === 0 ? "neutral" : grade(m.activationRate, [50, 25])}
          detail={m.activationDenominator > 0
            ? (m.activationRate >= 50 ? "Strong funnel" : m.activationRate >= 25 ? "Leaking" : "Fix signup→order gap")
            : undefined}
          benchmark="Target: >50%"
        />

        {/* M — Monetization */}
        <MetricCard
          letter="M"
          letterColor="#f97316"
          title="Monetization · 30-day"
          value={money(m.rev30)}
          sub={`AOV ${money(m.aov)} · All-time ${money(m.revAll)}`}
          status={m.rev30 > 0 ? (m.revTrend !== null && m.revTrend >= 0 ? "good" : "warn") : "neutral"}
          detail={m.revTrend !== null
            ? `${m.revTrend >= 0 ? "+" : ""}${Math.round(m.revTrend)}% vs prev 30d`
            : m.rev30 > 0 ? "First period" : undefined}
          sparkData={m.sparkline.map(d => d.revenue)}
          benchmark="Watch AOV & trend"
        />

        {/* E — Engagement */}
        <MetricCard
          letter="E"
          letterColor="#a78bfa"
          title="Engagement · Stickiness"
          value={m.mau > 0 ? pct(m.stickiness) : "—"}
          sub={m.mau > 0
            ? `WAU ${m.wau} · MAU ${m.mau} · ${m.ordersPerMauUser.toFixed(1)} orders/user/mo`
            : "No orders in last 30 days"}
          status={m.mau === 0 ? "neutral" : grade(m.stickiness, [20, 10])}
          detail={m.mau > 0
            ? (m.stickiness >= 20 ? "Highly sticky" : m.stickiness >= 10 ? "Building habit" : "Low repeat usage")
            : undefined}
          sparkData={m.sparkline.map(d => d.orders)}
          benchmark="Target: WAU/MAU >20%"
        />

        {/* N — NPS */}
        <MetricCard
          letter="N"
          letterColor="#f472b6"
          title="NPS · Net Promoter Score"
          value={m.nps !== null ? `${m.nps > 0 ? "+" : ""}${m.nps}` : "—"}
          sub={m.reviewCount > 0
            ? `${m.reviewCount} reviews · ★ ${m.avgRating?.toFixed(1)} avg · ${m.promoters}P / ${m.passives}Pa / ${m.detractors}D`
            : "No reviews yet"}
          status={m.reviewCount === 0 ? "neutral" : m.nps === null ? "neutral" : grade(m.nps, [30, 0])}
          detail={m.nps !== null
            ? (m.nps >= 50 ? "Excellent" : m.nps >= 30 ? "Good" : m.nps >= 0 ? "Needs improvement" : "Urgent: more detractors than promoters")
            : undefined}
          benchmark="Target: >30"
        />
      </div>

      {/* 30-day order volume bar chart */}
      <div style={{
        background: "#111", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, padding: "20px 22px", marginBottom: 24,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#555", marginBottom: 16 }}>
          30-Day Order Volume
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 60 }}>
          {m.sparkline.map((d) => {
            const h = maxOrders > 0 ? Math.max(2, (d.orders / maxOrders) * 60) : 2;
            return (
              <div
                key={d.date}
                title={`${d.date}: ${d.orders} orders · ${money(d.revenue)}`}
                style={{
                  flex: 1, height: h, background: d.orders > 0 ? "#f97316" : "#222",
                  borderRadius: 3, opacity: d.orders > 0 ? 0.85 : 1,
                  cursor: "default", transition: "opacity 0.15s",
                }}
              />
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 9, color: "#444" }}>
          <span>{m.sparkline[0]?.date?.slice(5)}</span>
          <span>{m.sparkline[m.sparkline.length - 1]?.date?.slice(5)}</span>
        </div>
      </div>

      {/* Interpretation guide */}
      <div style={{
        background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.12)",
        borderRadius: 14, padding: "18px 22px",
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(249,115,22,0.6)", marginBottom: 12 }}>
          How to read RAMEN
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {[
            { letter: "R", color: "#4dca80", desc: ">30% of customers reorder within 30 days. Low = people aren't coming back after first order." },
            { letter: "A", color: "#60a5fa", desc: ">50% of signups place their first order within 7 days. Low = signup flow is leaking." },
            { letter: "M", color: "#f97316", desc: "Revenue growth trend + avg order value. AOV rising = upsell/selection is working." },
            { letter: "E", color: "#a78bfa", desc: "WAU/MAU stickiness >20% means people are forming a weekly habit." },
            { letter: "N", color: "#f472b6", desc: "NPS >30 is good. Calculated from driver/food ratings: 4-5★ promoters, 1-2★ detractors." },
          ].map(item => (
            <div key={item.letter} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                background: `${item.color}15`, border: `1px solid ${item.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 900, color: item.color, fontFamily: "monospace",
              }}>
                {item.letter}
              </div>
              <p style={{ fontSize: 11, color: "#555", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
