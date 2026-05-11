"use client";

import { useState, useMemo } from "react";
import { flagOrderDispute, resolveOrderDispute } from "../actions";

const DISPUTE_TYPES = [
  { value: "MISSING_ITEM",  label: "Missing Item",    icon: "📦" },
  { value: "WRONG_ORDER",   label: "Wrong Order",     icon: "❌" },
  { value: "TAMPERED",      label: "Packaging Issue", icon: "🔓" },
  { value: "LATE_PICKUP",   label: "Late Pickup",     icon: "⏱" },
];

interface OrderAccuracyPanelProps {
  orders: any[];
  restaurantId: string;
}

export default function OrderAccuracyPanel({ orders, restaurantId }: OrderAccuracyPanelProps) {
  const [flagging, setFlagging] = useState<string | null>(null);
  const [disputeType, setDisputeType] = useState("MISSING_ITEM");
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [localFlags, setLocalFlags] = useState<Record<string, string>>({});

  const recentDelivered = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    return orders
      .filter((o) =>
        (o.status === "DELIVERED" || o.status === "PICKED_UP" || o.disputeFlag) &&
        new Date(o.createdAt) >= cutoff
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);
  }, [orders]);

  const flagged = recentDelivered.filter((o) => o.disputeFlag || localFlags[o.id]);
  const clean = recentDelivered.filter((o) => !o.disputeFlag && !localFlags[o.id]);

  const accuracy =
    recentDelivered.length > 0
      ? (((recentDelivered.length - flagged.length) / recentDelivered.length) * 100).toFixed(1)
      : null;

  const handleFlag = async (orderId: string) => {
    setPending((p) => ({ ...p, [orderId]: true }));
    await flagOrderDispute(orderId, disputeType);
    setLocalFlags((f) => ({ ...f, [orderId]: disputeType }));
    setFlagging(null);
    setPending((p) => ({ ...p, [orderId]: false }));
  };

  const handleResolve = async (orderId: string) => {
    setPending((p) => ({ ...p, [orderId]: true }));
    await resolveOrderDispute(orderId);
    setLocalFlags((f) => { const n = { ...f }; delete n[orderId]; return n; });
    setPending((p) => ({ ...p, [orderId]: false }));
  };

  const disputeLabel = (type: string) =>
    DISPUTE_TYPES.find((d) => d.value === type)?.label || type;
  const disputeIcon = (type: string) =>
    DISPUTE_TYPES.find((d) => d.value === type)?.icon || "⚠";

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="card bg-white/5 border-white/10 p-8 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 text-[120px] leading-none select-none">🔍</div>

      <div className="relative z-10">
        <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "#f87171", marginBottom: 6 }}>
          Order Accuracy Audit
        </p>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
          Kitchen vs. driver — who made the mistake?
        </h2>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 24 }}>
          Flag disputed orders and trace them to pickup time and driver. Last 14 days.
        </p>

        {/* Accuracy score */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{
            background: accuracy && Number(accuracy) >= 95 ? "rgba(77,202,128,0.08)" : "rgba(248,113,113,0.08)",
            border: `1px solid ${accuracy && Number(accuracy) >= 95 ? "rgba(77,202,128,0.2)" : "rgba(248,113,113,0.2)"}`,
            borderRadius: 16, padding: "16px 24px", textAlign: "center", minWidth: 120,
          }}>
            <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", margin: 0, marginBottom: 4 }}>Accuracy Rate</p>
            <p style={{ fontSize: 36, fontWeight: 900, color: accuracy && Number(accuracy) >= 95 ? "#4dca80" : "#f87171", margin: 0, lineHeight: 1 }}>
              {accuracy ?? "—"}%
            </p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "16px 24px", textAlign: "center", minWidth: 100 }}>
            <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", margin: 0, marginBottom: 4 }}>Disputed</p>
            <p style={{ fontSize: 36, fontWeight: 900, color: flagged.length > 0 ? "#f87171" : "#fff", margin: 0, lineHeight: 1 }}>{flagged.length}</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "16px 24px", textAlign: "center", minWidth: 100 }}>
            <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", margin: 0, marginBottom: 4 }}>Clean</p>
            <p style={{ fontSize: 36, fontWeight: 900, color: "#4dca80", margin: 0, lineHeight: 1 }}>{clean.length}</p>
          </div>
        </div>

        {/* Flagged orders */}
        {flagged.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "#f87171", marginBottom: 12 }}>
              ⚠ Open Disputes
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {flagged.map((o) => {
                const type = localFlags[o.id] || o.disputeType || "MISSING_ITEM";
                const driver = o.driver?.user?.name || o.driver?.name || null;
                const pickedUp = o.pickedUpAt || (o.status === "DELIVERED" ? o.updatedAt : null);
                return (
                  <div
                    key={o.id}
                    style={{
                      background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.2)",
                      borderRadius: 12, padding: "12px 14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{disputeIcon(type)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <p style={{ fontWeight: 800, fontSize: 13, color: "#fff", margin: 0 }}>
                            Order #{o.id.slice(-6).toUpperCase()}
                          </p>
                          <span style={{
                            background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)",
                            color: "#f87171", borderRadius: 6, padding: "2px 8px",
                            fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                          }}>
                            {disputeLabel(type)}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
                          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                            🕐 Ordered: {formatTime(o.createdAt)}
                          </p>
                          {pickedUp && (
                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                              🚗 Picked up: {formatTime(pickedUp)}
                            </p>
                          )}
                          {driver && (
                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                              👤 Driver: {driver}
                            </p>
                          )}
                          {!driver && (
                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", margin: 0 }}>
                              👤 Driver not assigned
                            </p>
                          )}
                        </div>
                        {o.cancelComment && (
                          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", margin: 0, marginTop: 4, fontStyle: "italic" }}>
                            "{o.cancelComment}"
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleResolve(o.id)}
                        disabled={pending[o.id]}
                        style={{
                          background: "rgba(77,202,128,0.1)", border: "1px solid rgba(77,202,128,0.25)",
                          color: "#4dca80", borderRadius: 8, padding: "5px 12px",
                          fontSize: 9, fontWeight: 900, cursor: "pointer",
                          letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0,
                        }}
                      >
                        {pending[o.id] ? "…" : "Resolve"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent clean orders with flag button */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>
            Recent Orders
          </p>

          {/* Dispute type selector */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {DISPUTE_TYPES.map((dt) => (
              <button
                key={dt.value}
                onClick={() => setDisputeType(dt.value)}
                style={{
                  padding: "4px 10px", borderRadius: 999, fontSize: 9, fontWeight: 800,
                  background: disputeType === dt.value ? "rgba(248,113,113,0.15)" : "transparent",
                  border: `1px solid ${disputeType === dt.value ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.08)"}`,
                  color: disputeType === dt.value ? "#f87171" : "rgba(255,255,255,0.35)",
                  cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em",
                }}
              >
                {dt.icon} {dt.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {clean.slice(0, 10).map((o) => {
              const driver = o.driver?.user?.name || o.driver?.name || null;
              const isFlagging = flagging === o.id;
              return (
                <div
                  key={o.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 10, padding: "10px 12px",
                  }}
                >
                  <span style={{ fontSize: 14, color: "#4dca80", flexShrink: 0 }}>✓</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 12, color: "#fff", margin: 0 }}>
                      Order #{o.id.slice(-6).toUpperCase()}
                      <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.35)", marginLeft: 8, fontSize: 10 }}>
                        {formatTime(o.createdAt)}
                      </span>
                    </p>
                    {driver && <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", margin: 0, marginTop: 2 }}>Driver: {driver}</p>}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#4dca80" }}>
                    ${Number(o.total || o.totalPrice || 0).toFixed(2)}
                  </span>
                  {isFlagging ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => handleFlag(o.id)}
                        disabled={pending[o.id]}
                        style={{
                          background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.35)",
                          color: "#f87171", borderRadius: 8, padding: "4px 10px",
                          fontSize: 9, fontWeight: 900, cursor: "pointer",
                          letterSpacing: "0.1em", textTransform: "uppercase",
                        }}
                      >
                        {pending[o.id] ? "…" : `Flag as ${disputeLabel(disputeType)}`}
                      </button>
                      <button
                        onClick={() => setFlagging(null)}
                        style={{
                          background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                          color: "rgba(255,255,255,0.4)", borderRadius: 8, padding: "4px 10px",
                          fontSize: 9, fontWeight: 900, cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setFlagging(o.id)}
                      style={{
                        background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.3)", borderRadius: 8, padding: "4px 10px",
                        fontSize: 9, fontWeight: 900, cursor: "pointer",
                        letterSpacing: "0.1em", textTransform: "uppercase",
                      }}
                    >
                      Flag
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
