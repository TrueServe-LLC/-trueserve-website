"use client";

import { useState } from "react";
import { saveAggregatorSettings } from "../actions";

const AGGREGATORS = [
  {
    id: "ItsaCheckmate",
    label: "ItsaCheckmate",
    icon: "✅",
    desc: "Official Toast partner. Routes orders from all delivery platforms directly to your KDS. Trusted by 10,000+ restaurants.",
    docsHint: "Find your Location ID in the ItsaCheckmate merchant portal under Settings → Locations.",
  },
  {
    id: "Chowly",
    label: "Chowly",
    icon: "🍜",
    desc: "Real-time menu sync and order injection into Toast. Auto-86 items when you run out.",
    docsHint: "Find your Location ID in the Chowly dashboard under your restaurant profile.",
  },
  {
    id: "Otter",
    label: "Otter",
    icon: "🦦",
    desc: "Unified tablet replacement. One screen for all your orders — TrueServe, DoorDash, Uber Eats — injected into Toast.",
    docsHint: "Find your Location ID in the Otter app under Account → Integrations.",
  },
];

interface AggregatorSectionProps {
  restaurantId: string;
  currentAggregatorType?: string | null;
  currentAggregatorApiKey?: string | null;
  currentAggregatorLocationId?: string | null;
}

export default function AggregatorSection({
  restaurantId,
  currentAggregatorType,
  currentAggregatorApiKey,
  currentAggregatorLocationId,
}: AggregatorSectionProps) {
  const [selected, setSelected] = useState(currentAggregatorType || "");
  const [apiKey, setApiKey] = useState(currentAggregatorApiKey || "");
  const [locationId, setLocationId] = useState(currentAggregatorLocationId || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const aggregator = AGGREGATORS.find((a) => a.id === selected);

  const handleSave = async () => {
    if (!selected || !apiKey || !locationId) {
      setError("All three fields are required.");
      return;
    }
    setError("");
    setSaving(true);
    const res = await saveAggregatorSettings(restaurantId, selected, apiKey, locationId);
    setSaving(false);
    if (res.error) {
      setError(res.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const isConnected = Boolean(currentAggregatorType && currentAggregatorApiKey);

  return (
    <div style={{
      background: "var(--card, #0d0f16)",
      border: "1px solid rgba(77,202,128,0.2)",
      borderRadius: 16,
      marginBottom: 24,
      overflow: "hidden",
      boxShadow: "0 0 0 1px rgba(77,202,128,0.05), 0 14px 32px rgba(0,0,0,0.2)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{
          width: 32, height: 32, background: "rgba(77,202,128,0.1)", border: "1px solid rgba(77,202,128,0.25)",
          borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15,
        }}>
          🔀
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.6)", margin: 0 }}>
              Aggregator Route <span style={{ color: "#4dca80" }}>(Recommended)</span>
            </p>
            {isConnected && (
              <span style={{
                fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                padding: "3px 9px", borderRadius: 999,
                background: "rgba(77,202,128,0.1)", border: "1px solid rgba(77,202,128,0.3)", color: "#4dca80",
              }}>
                ● Connected via {currentAggregatorType}
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0, marginTop: 3 }}>
            Skip Toast corporate. Orders go: TrueServe → Aggregator → your KDS. Official Toast partner pathway.
          </p>
        </div>
      </div>

      <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Left: partner cards */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", margin: 0, marginBottom: 10 }}>
            Choose your aggregator partner
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {AGGREGATORS.map((agg) => (
              <button
                key={agg.id}
                onClick={() => setSelected(agg.id)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px",
                  background: selected === agg.id ? "rgba(77,202,128,0.06)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${selected === agg.id ? "rgba(77,202,128,0.3)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 12, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{agg.icon}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 900, color: selected === agg.id ? "#4dca80" : "#fff", margin: 0 }}>{agg.label}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0, marginTop: 3, lineHeight: 1.5 }}>{agg.desc}</p>
                </div>
                {selected === agg.id && (
                  <span style={{ marginLeft: "auto", flexShrink: 0, color: "#4dca80", fontSize: 16 }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right: credentials */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", margin: 0, marginBottom: 10 }}>
            {selected ? `${selected} credentials` : "Select a partner first"}
          </p>

          {!selected ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160, color: "rgba(255,255,255,0.2)", fontSize: 12, fontStyle: "italic" }}>
              ← Pick a partner to continue
            </div>
          ) : (
            <>
              {aggregator && (
                <div style={{ background: "rgba(77,202,128,0.04)", border: "1px solid rgba(77,202,128,0.12)", borderRadius: 10, padding: "10px 12px", marginBottom: 14 }}>
                  <p style={{ fontSize: 10, color: "#4dca80", margin: 0, lineHeight: 1.6 }}>
                    💡 {aggregator.docsHint}
                  </p>
                </div>
              )}

              <label style={{ display: "block", fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
                API Key / Token
              </label>
              <input
                type="password"
                placeholder="Paste your aggregator API key…"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{
                  width: "100%", background: "#0c0e13", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, padding: "10px 12px", color: "#fff", fontSize: 12,
                  fontFamily: "DM Mono, monospace", outline: "none", marginBottom: 12, boxSizing: "border-box",
                }}
              />

              <label style={{ display: "block", fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
                Location ID
              </label>
              <input
                type="text"
                placeholder="e.g. loc_abc123"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                style={{
                  width: "100%", background: "#0c0e13", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, padding: "10px 12px", color: "#fff", fontSize: 12,
                  fontFamily: "DM Mono, monospace", outline: "none", marginBottom: 12, boxSizing: "border-box",
                }}
              />

              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 12px", marginBottom: 14 }}>
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", margin: 0, marginBottom: 4 }}>Your TrueServe Webhook (give this to {selected})</p>
                <p style={{ fontSize: 11, fontFamily: "DM Mono, monospace", color: "#4dca80", margin: 0, wordBreak: "break-all" }}>
                  https://app.trueserve.io/api/webhook/aggregator/{restaurantId}
                </p>
              </div>

              {error && <p style={{ fontSize: 11, color: "#f87171", marginBottom: 10 }}>{error}</p>}

              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  width: "100%", background: saved ? "rgba(77,202,128,0.15)" : "#4dca80",
                  border: `1px solid ${saved ? "rgba(77,202,128,0.4)" : "#4dca80"}`,
                  color: saved ? "#4dca80" : "#000", borderRadius: 10, padding: "11px",
                  fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase",
                  cursor: saving ? "wait" : "pointer", transition: "all 0.2s",
                }}
              >
                {saved ? "✓ Aggregator Connected" : saving ? "Saving…" : `Connect ${selected} →`}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Flow diagram */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {[
          { label: "Customer Orders", color: "#f97316" },
          { label: "TrueServe", color: "#f97316" },
          { label: selected || "Aggregator", color: "#4dca80" },
          { label: "Toast KDS", color: "#4dca80" },
          { label: "Kitchen ✓", color: "#4dca80" },
        ].map((step, i, arr) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
              color: step.color, padding: "3px 8px",
              background: `${step.color}18`, border: `1px solid ${step.color}33`,
              borderRadius: 6, whiteSpace: "nowrap",
            }}>
              {step.label}
            </span>
            {i < arr.length - 1 && <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
