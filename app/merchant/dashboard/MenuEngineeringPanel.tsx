"use client";

import { useState, useMemo } from "react";
import { updateMenuItemCost } from "../actions";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  costPrice?: number | null;
  category?: string;
  sales?: number | null;
  isAvailable?: boolean;
}

interface MenuEngineeringPanelProps {
  menuItems: MenuItem[];
  orders: any[];
}

type Quadrant = "star" | "plow_horse" | "puzzle" | "dog";

const QUADRANT_META: Record<Quadrant, { label: string; color: string; bg: string; border: string; icon: string; tip: string }> = {
  star:       { label: "Stars",       color: "#4dca80", bg: "rgba(77,202,128,0.08)",  border: "rgba(77,202,128,0.2)",  icon: "⭐", tip: "High margin + high volume. Promote these aggressively." },
  plow_horse: { label: "Plow Horses", color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)", icon: "🐴", tip: "High volume but thin margins. Can you raise price or cut cost?" },
  puzzle:     { label: "Puzzles",     color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)", icon: "🧩", tip: "Great margin but low visibility. Move them up the menu." },
  dog:        { label: "Dogs",        color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)",  icon: "🐕", tip: "Low margin + low volume. Consider removing or reworking." },
};

function classifyItem(marginPct: number, volumeScore: number, medianMargin: number, medianVolume: number): Quadrant {
  const highMargin = marginPct >= medianMargin;
  const highVolume = volumeScore >= medianVolume;
  if (highMargin && highVolume) return "star";
  if (!highMargin && highVolume) return "plow_horse";
  if (highMargin && !highVolume) return "puzzle";
  return "dog";
}

export default function MenuEngineeringPanel({ menuItems, orders }: MenuEngineeringPanelProps) {
  const [costEdits, setCostEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [activeQuadrant, setActiveQuadrant] = useState<Quadrant | null>(null);

  // Count how many times each menu item appears in orders
  const volumeMap = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      (o.orderItems || o.OrderItems || []).forEach((oi: any) => {
        const id = oi.menuItemId || oi.MenuItem?.id;
        if (id) map[id] = (map[id] || 0) + (oi.quantity || 1);
      });
    });
    return map;
  }, [orders]);

  const enriched = useMemo(() => {
    return menuItems
      .filter((item) => item.isAvailable !== false)
      .map((item) => {
        const price = Number(item.price || 0);
        const cost = Number(costEdits[item.id] ?? item.costPrice ?? 0);
        const margin = price > 0 && cost > 0 ? ((price - cost) / price) * 100 : price > 0 ? null : null;
        const volume = volumeMap[item.id] || item.sales || 0;
        return { ...item, price, cost, margin, volume };
      });
  }, [menuItems, costEdits, volumeMap]);

  const { medianMargin, medianVolume } = useMemo(() => {
    const withMargin = enriched.filter((i) => i.margin !== null).map((i) => i.margin as number);
    const vols = enriched.map((i) => i.volume);
    const mid = (arr: number[]) => { const s = [...arr].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] || 0; };
    return { medianMargin: mid(withMargin), medianVolume: mid(vols) };
  }, [enriched]);

  const classified = useMemo(() => {
    return enriched.map((item) => ({
      ...item,
      quadrant: item.margin !== null
        ? classifyItem(item.margin, item.volume, medianMargin, medianVolume)
        : ("dog" as Quadrant),
    }));
  }, [enriched, medianMargin, medianVolume]);

  const grouped = useMemo(() => {
    const g: Record<Quadrant, typeof classified> = { star: [], plow_horse: [], puzzle: [], dog: [] };
    classified.forEach((i) => g[i.quadrant].push(i));
    return g;
  }, [classified]);

  const displayed = activeQuadrant ? grouped[activeQuadrant] : classified;

  const handleSaveCost = async (itemId: string) => {
    const val = parseFloat(costEdits[itemId]);
    if (isNaN(val)) return;
    setSaving((s) => ({ ...s, [itemId]: true }));
    await updateMenuItemCost(itemId, val);
    setSaving((s) => ({ ...s, [itemId]: false }));
  };

  const needsCost = enriched.filter((i) => !i.costPrice && !costEdits[i.id]).length;

  return (
    <div className="card bg-white/5 border-white/10 p-8 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 text-[120px] leading-none select-none">📊</div>

      <div className="relative z-10">
        <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "#a78bfa", marginBottom: 6 }}>
          Menu Engineering
        </p>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
          What should you sell more of?
        </h2>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>
          Items plotted by margin × volume. Stars make you money — Dogs drain it.
        </p>

        {needsCost > 0 && (
          <div style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 12, padding: "10px 14px", marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: "#f97316", fontWeight: 700 }}>
              ⚠ {needsCost} item{needsCost > 1 ? "s" : ""} missing a cost price — enter it below for accurate quadrant placement.
            </p>
          </div>
        )}

        {/* Quadrant filter pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          <button
            onClick={() => setActiveQuadrant(null)}
            style={{
              padding: "5px 12px", borderRadius: 999, fontSize: 10, fontWeight: 900,
              background: !activeQuadrant ? "rgba(255,255,255,0.12)" : "transparent",
              border: "1px solid rgba(255,255,255,0.12)", color: !activeQuadrant ? "#fff" : "rgba(255,255,255,0.4)",
              cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em",
            }}
          >
            All ({classified.length})
          </button>
          {(Object.keys(QUADRANT_META) as Quadrant[]).map((q) => {
            const meta = QUADRANT_META[q];
            return (
              <button
                key={q}
                onClick={() => setActiveQuadrant(activeQuadrant === q ? null : q)}
                style={{
                  padding: "5px 12px", borderRadius: 999, fontSize: 10, fontWeight: 900,
                  background: activeQuadrant === q ? meta.bg : "transparent",
                  border: `1px solid ${activeQuadrant === q ? meta.border : "rgba(255,255,255,0.08)"}`,
                  color: activeQuadrant === q ? meta.color : "rgba(255,255,255,0.4)",
                  cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em",
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                <span>{meta.icon}</span>
                {meta.label} ({grouped[q].length})
              </button>
            );
          })}
        </div>

        {activeQuadrant && (
          <div style={{ background: QUADRANT_META[activeQuadrant].bg, border: `1px solid ${QUADRANT_META[activeQuadrant].border}`, borderRadius: 12, padding: "10px 14px", marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: QUADRANT_META[activeQuadrant].color, fontWeight: 700 }}>
              {QUADRANT_META[activeQuadrant].icon} {QUADRANT_META[activeQuadrant].tip}
            </p>
          </div>
        )}

        {/* Item list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {displayed.length === 0 && (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "32px 0" }}>
              No items in this category yet.
            </p>
          )}
          {displayed.map((item) => {
            const meta = QUADRANT_META[item.quadrant];
            const marginDisplay = item.margin !== null ? `${item.margin.toFixed(0)}%` : "—";
            return (
              <div
                key={item.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                {/* Quadrant badge */}
                <span
                  title={meta.tip}
                  style={{
                    background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color,
                    borderRadius: 8, padding: "3px 8px", fontSize: 9, fontWeight: 900,
                    textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap",
                    cursor: "help",
                  }}
                >
                  {meta.icon} {meta.label}
                </span>

                {/* Name + category */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 800, fontSize: 13, color: "#fff", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                  {item.category && <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", margin: 0, marginTop: 1 }}>{item.category}</p>}
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>Price</p>
                    <p style={{ fontSize: 14, fontWeight: 900, color: "#fff", margin: 0 }}>${item.price.toFixed(2)}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>Margin</p>
                    <p style={{ fontSize: 14, fontWeight: 900, color: item.margin !== null ? meta.color : "rgba(255,255,255,0.25)", margin: 0 }}>{marginDisplay}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>Sold</p>
                    <p style={{ fontSize: 14, fontWeight: 900, color: "#fff", margin: 0 }}>{item.volume}</p>
                  </div>
                </div>

                {/* Cost input */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Cost $</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    value={costEdits[item.id] ?? (item.costPrice != null ? String(item.costPrice) : "")}
                    onChange={(e) => setCostEdits((c) => ({ ...c, [item.id]: e.target.value }))}
                    style={{
                      width: 64, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8, padding: "4px 8px", color: "#fff", fontSize: 12, fontWeight: 700, outline: "none",
                    }}
                  />
                  {costEdits[item.id] !== undefined && (
                    <button
                      onClick={() => handleSaveCost(item.id)}
                      disabled={saving[item.id]}
                      style={{
                        background: "rgba(77,202,128,0.15)", border: "1px solid rgba(77,202,128,0.3)",
                        color: "#4dca80", borderRadius: 8, padding: "4px 10px", fontSize: 9,
                        fontWeight: 900, cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase",
                      }}
                    >
                      {saving[item.id] ? "…" : "Save"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
