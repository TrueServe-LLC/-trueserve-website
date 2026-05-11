"use client";

import { useState, useMemo } from "react";
import { saveProfitSettings } from "../actions";

const TRUESERVE_COMMISSION = 0.07;

interface TrueProfitPanelProps {
  orders: any[];
  restaurantId: string;
  initialFoodCostPct?: number;
  initialLaborCostPct?: number;
}

export default function TrueProfitPanel({
  orders,
  restaurantId,
  initialFoodCostPct = 30,
  initialLaborCostPct = 25,
}: TrueProfitPanelProps) {
  const [foodCostPct, setFoodCostPct] = useState(initialFoodCostPct);
  const [laborCostPct, setLaborCostPct] = useState(initialLaborCostPct);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const stats = useMemo(() => {
    const delivered = orders.filter(
      (o) => o.status === "DELIVERED" || o.status === "PICKED_UP"
    );
    const gross = delivered.reduce((s, o) => s + Number(o.total || o.totalPrice || 0), 0);
    const commission = gross * TRUESERVE_COMMISSION;
    const foodCost = gross * (foodCostPct / 100);
    const laborCost = gross * (laborCostPct / 100);
    const net = gross - commission - foodCost - laborCost;
    const margin = gross > 0 ? (net / gross) * 100 : 0;
    return { gross, commission, foodCost, laborCost, net, margin, orderCount: delivered.length };
  }, [orders, foodCostPct, laborCostPct]);

  const handleSave = async () => {
    setSaving(true);
    await saveProfitSettings(restaurantId, foodCostPct, laborCostPct);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const barWidth = (val: number) =>
    stats.gross > 0 ? Math.max(2, (Math.abs(val) / stats.gross) * 100) : 2;

  const rows = [
    { label: "Gross Sales", value: stats.gross, color: "#f97316", sub: `${stats.orderCount} delivered orders` },
    { label: "TrueServe Commission", value: -stats.commission, color: "#ef4444", sub: "7% flat — no hidden fees" },
    { label: "Food & COGS", value: -stats.foodCost, color: "#f59e0b", sub: `${foodCostPct}% of gross` },
    { label: "Labor Cost", value: -stats.laborCost, color: "#a78bfa", sub: `${laborCostPct}% of gross` },
  ];

  return (
    <div className="card bg-white/5 border-white/10 p-8 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 text-[120px] leading-none select-none">💰</div>

      <div className="relative z-10">
        <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "#f97316", marginBottom: 6 }}>
          True Profit Calculator
        </p>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
          What did you actually clear?
        </h2>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 28 }}>
          Enter your real costs — we'll show net profit, not just volume.
        </p>

        {/* Cost inputs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>
              Food Cost %
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px" }}>
              <input
                type="number"
                min={0}
                max={100}
                value={foodCostPct}
                onChange={(e) => setFoodCostPct(Number(e.target.value))}
                style={{ background: "none", border: "none", outline: "none", color: "#fff", fontSize: 20, fontWeight: 900, width: "100%" }}
              />
              <span style={{ color: "#f59e0b", fontWeight: 900 }}>%</span>
            </div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Industry avg: 28–35%</p>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>
              Labor Cost %
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px" }}>
              <input
                type="number"
                min={0}
                max={100}
                value={laborCostPct}
                onChange={(e) => setLaborCostPct(Number(e.target.value))}
                style={{ background: "none", border: "none", outline: "none", color: "#fff", fontSize: 20, fontWeight: 900, width: "100%" }}
              />
              <span style={{ color: "#a78bfa", fontWeight: 900 }}>%</span>
            </div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Industry avg: 25–35%</p>
          </div>
        </div>

        {/* Waterfall */}
        <div style={{ marginBottom: 24 }}>
          {rows.map((row) => (
            <div key={row.label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{row.label}</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: row.value < 0 ? "#ef4444" : row.color }}>
                  {row.value < 0 ? "−" : ""}${Math.abs(row.value).toFixed(2)}
                </span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 999 }}>
                <div style={{ height: "100%", width: `${barWidth(row.value)}%`, background: row.color, borderRadius: 999, opacity: 0.8 }} />
              </div>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{row.sub}</p>
            </div>
          ))}

          {/* Net line */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)" }}>Net Profit</p>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{stats.margin.toFixed(1)}% net margin</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 36, fontWeight: 900, color: stats.net >= 0 ? "#4dca80" : "#ef4444", lineHeight: 1 }}>
                {stats.net < 0 ? "−" : ""}${Math.abs(stats.net).toFixed(2)}
              </p>
              {stats.net < 0 && (
                <p style={{ fontSize: 10, color: "#ef4444", marginTop: 4 }}>Review your cost inputs — total exceeds revenue.</p>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: saved ? "#4dca80" : "rgba(249,115,22,0.15)",
            border: `1px solid ${saved ? "#4dca80" : "rgba(249,115,22,0.3)"}`,
            color: saved ? "#fff" : "#f97316",
            borderRadius: 12,
            padding: "10px 20px",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: saving ? "wait" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {saved ? "✓ Saved" : saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
