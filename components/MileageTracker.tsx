"use client";

import { useEffect, useRef, useState } from "react";
import { useRamenStream } from "@/hooks/useRamenStream";
import { driverLocChannel } from "@/lib/ramen/types";
import type { DriverLocationPayload } from "@/lib/ramen/types";

interface TripRecord {
  orderId: string;
  date: string;          // ISO date string
  miles: number;
  earnings: number;      // dollars
}

const STORAGE_KEY = "ts.driver.mileage";
const IRS_RATE = 0.67;   // 2024 IRS standard mileage rate $/mile

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8; // earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function loadTrips(): TripRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTrips(trips: TripRecord[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(trips)); } catch {}
}

function exportCSV(trips: TripRecord[]) {
  const irsRate = IRS_RATE;
  const rows = [
    ["Date", "Order ID", "Miles Driven", "IRS Rate", "Deduction Value", "Earnings"],
    ...trips.map(t => [
      t.date,
      t.orderId.slice(-8).toUpperCase(),
      t.miles.toFixed(2),
      `$${irsRate}`,
      `$${(t.miles * irsRate).toFixed(2)}`,
      `$${t.earnings.toFixed(2)}`,
    ]),
    [],
    ["TOTAL", "", trips.reduce((s, t) => s + t.miles, 0).toFixed(2), "", `$${(trips.reduce((s, t) => s + t.miles, 0) * irsRate).toFixed(2)}`, `$${trips.reduce((s, t) => s + t.earnings, 0).toFixed(2)}`],
  ];
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trueserve-mileage-${new Date().getFullYear()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  driverId: string;
  activeOrderId?: string | null;
  activeOrderEarnings?: number;
}

export default function MileageTracker({ driverId, activeOrderId, activeOrderEarnings = 0 }: Props) {
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [activeMiles, setActiveMiles] = useState(0);
  const lastPos = useRef<{ lat: number; lng: number } | null>(null);
  const activeOrderRef = useRef(activeOrderId);
  activeOrderRef.current = activeOrderId;

  useEffect(() => {
    setTrips(loadTrips());
  }, []);

  // Listen to RAMEN location stream to accumulate miles for active trip
  const { lastEvent } = useRamenStream<DriverLocationPayload>(
    driverId ? driverLocChannel(driverId) : null,
    { filter: ["driver_location"] },
  );

  useEffect(() => {
    if (!lastEvent) return;
    const { lat, lng } = lastEvent.payload;
    if (lastPos.current) {
      const delta = haversine(lastPos.current.lat, lastPos.current.lng, lat, lng);
      // Ignore implausible jumps (>0.5 mile between pings = bad GPS)
      if (delta < 0.5) {
        setActiveMiles(prev => prev + delta);
      }
    }
    lastPos.current = { lat, lng };
  }, [lastEvent]);

  // When activeOrderId changes (new delivery done), commit current trip
  const prevOrderId = useRef<string | null | undefined>(null);
  useEffect(() => {
    const prev = prevOrderId.current;
    prevOrderId.current = activeOrderId;
    if (prev && prev !== activeOrderId && activeMiles > 0) {
      const newTrip: TripRecord = {
        orderId: prev,
        date: new Date().toISOString().slice(0, 10),
        miles: parseFloat(activeMiles.toFixed(2)),
        earnings: activeOrderEarnings,
      };
      const updated = [newTrip, ...loadTrips()].slice(0, 200);
      saveTrips(updated);
      setTrips(updated);
      setActiveMiles(0);
      lastPos.current = null;
    }
  }, [activeOrderId, activeMiles, activeOrderEarnings]);

  const totalMiles = trips.reduce((s, t) => s + t.miles, 0);
  const totalDeduction = totalMiles * IRS_RATE;
  const ytdTrips = trips.filter(t => t.date.startsWith(new Date().getFullYear().toString()));
  const ytdMiles = ytdTrips.reduce((s, t) => s + t.miles, 0);

  return (
    <div style={{
      background: "#0c0e13", border: "1px solid #1c1f28",
      borderRadius: 12, overflow: "hidden", marginTop: 16,
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "1px solid #1c1f28",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f97316" }} />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f97316" }}>
            Mileage &amp; Tax Tracker
          </span>
        </div>
        <button
          type="button"
          onClick={() => exportCSV(trips)}
          disabled={trips.length === 0}
          style={{
            fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "4px 12px", borderRadius: 6, cursor: trips.length ? "pointer" : "default",
            background: trips.length ? "rgba(249,115,22,0.1)" : "transparent",
            border: `1px solid ${trips.length ? "rgba(249,115,22,0.3)" : "#1c1f28"}`,
            color: trips.length ? "#f97316" : "#333", transition: "all 0.15s",
          }}
        >
          Export IRS CSV
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderBottom: "1px solid #1c1f28" }}>
        {[
          { label: "YTD Miles", value: ytdMiles.toFixed(1) },
          { label: "Tax Deduction", value: `$${totalDeduction.toFixed(0)}` },
          { label: "Active Trip", value: activeMiles > 0 ? `${activeMiles.toFixed(2)} mi` : "—" },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: "12px 14px",
            borderRight: i < 2 ? "1px solid #1c1f28" : undefined,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: stat.label === "Active Trip" && activeMiles > 0 ? "#4dca80" : "#fff", fontFamily: "'DM Mono', monospace" }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* IRS note */}
      <div style={{ padding: "8px 16px", borderBottom: "1px solid #1c1f28", background: "rgba(249,115,22,0.03)" }}>
        <span style={{ fontSize: 10, color: "#444" }}>
          2024 IRS standard mileage rate: <strong style={{ color: "#555" }}>${IRS_RATE}/mile</strong> · Deduct this from your 1099 income
        </span>
      </div>

      {/* Trip table */}
      {trips.length === 0 ? (
        <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 12, color: "#333" }}>
          Your completed trips will appear here automatically.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Date", "Order", "Miles", "Deduction", "Earnings"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", textAlign: "left", borderBottom: "1px solid #1c1f28", background: "#0f1219" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trips.slice(0, 30).map((t, i) => (
                <tr key={t.orderId + i} style={{ borderBottom: "1px solid #131720" }}>
                  <td style={{ padding: "9px 12px", fontSize: 11, color: "#666", fontFamily: "'DM Mono', monospace" }}>{t.date}</td>
                  <td style={{ padding: "9px 12px", fontSize: 11, color: "#888", fontFamily: "'DM Mono', monospace" }}>{t.orderId.slice(-6).toUpperCase()}</td>
                  <td style={{ padding: "9px 12px", fontSize: 11, color: "#ccc", fontFamily: "'DM Mono', monospace" }}>{t.miles.toFixed(2)}</td>
                  <td style={{ padding: "9px 12px", fontSize: 11, color: "#f97316", fontFamily: "'DM Mono', monospace" }}>${(t.miles * IRS_RATE).toFixed(2)}</td>
                  <td style={{ padding: "9px 12px", fontSize: 11, color: "#4dca80", fontFamily: "'DM Mono', monospace" }}>${t.earnings.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
