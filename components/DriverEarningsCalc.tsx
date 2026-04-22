"use client";

import { useState } from "react";

const MARKETS = [
  { id: "urban",    label: "Urban",    tripsPerHr: 2.8, avgPay: 9.50  },
  { id: "suburban", label: "Suburban", tripsPerHr: 2.3, avgPay: 10.50 },
  { id: "rural",    label: "Rural",    tripsPerHr: 1.8, avgPay: 11.50 },
] as const;

export default function DriverEarningsCalc() {
  const [hours, setHours] = useState(25);
  const [marketId, setMarketId] = useState<"urban" | "suburban" | "rural">("urban");

  const market = MARKETS.find(m => m.id === marketId)!;
  const weekly  = hours * market.tripsPerHr * market.avgPay;
  const monthly = weekly * 4.33;
  const annual  = weekly * 52;

  const fmt = (n: number) =>
    n >= 1000
      ? `$${(n / 1000).toFixed(1)}k`
      : `$${Math.round(n)}`;

  return (
    <div style={{
      background: "rgba(0,0,0,0.35)",
      border: "1px solid rgba(249,115,22,0.18)",
      borderRadius: 18,
      padding: "22px 24px",
      marginTop: 28,
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(249,115,22,0.7)", marginBottom: 6 }}>
        Earnings estimator
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 18 }}>
        How much could you make?
      </div>

      {/* Hours slider */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Hours per week</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#f97316" }}>{hours}h</span>
        </div>
        <input
          type="range"
          min={5}
          max={60}
          step={5}
          value={hours}
          onChange={e => setHours(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#f97316" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
          <span>5h</span><span>60h</span>
        </div>
      </div>

      {/* Market selector */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Market type</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {MARKETS.map(m => (
            <button
              key={m.id}
              onClick={() => setMarketId(m.id)}
              style={{
                background: marketId === m.id ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${marketId === m.id ? "rgba(249,115,22,0.5)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 9,
                padding: "8px 6px",
                color: marketId === m.id ? "#f97316" : "rgba(255,255,255,0.45)",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Earnings grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Weekly",  value: fmt(weekly)  },
          { label: "Monthly", value: fmt(monthly) },
          { label: "Annual",  value: fmt(annual)  },
        ].map(item => (
          <div key={item.label} style={{
            background: "rgba(0,0,0,0.4)",
            border: "0.5px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: "10px 8px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: item.label === "Weekly" ? 22 : 16, fontWeight: 800, color: item.label === "Weekly" ? "#f97316" : "#fff" }}>{item.value}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>
        Estimates based on {market.tripsPerHr} trips/hr avg · ${market.avgPay.toFixed(2)}/trip avg for {market.label.toLowerCase()} markets. Actual earnings vary by location, time, and demand.
      </p>
    </div>
  );
}
