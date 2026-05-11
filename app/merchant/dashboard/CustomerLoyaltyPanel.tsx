"use client";

import { useMemo, useState } from "react";

interface CustomerLoyaltyPanelProps {
  orders: any[];
}

interface CustomerStat {
  userId: string;
  name: string;
  orderCount: number;
  totalSpend: number;
  isNew: boolean;
  lastOrderAt: string;
  suggestLoyaltyReward: boolean;
}

const WINDOW_DAYS = 30;

export default function CustomerLoyaltyPanel({ orders }: CustomerLoyaltyPanelProps) {
  const [tab, setTab] = useState<"overview" | "fans" | "triggers">("overview");

  const windowStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - WINDOW_DAYS);
    return d.toISOString();
  }, []);

  const stats = useMemo(() => {
    // Group all-time orders by userId
    const allTime: Record<string, { name: string; dates: string[]; spend: number }> = {};
    orders.forEach((o) => {
      const uid = o.userId || o.user?.id;
      const name = o.user?.name || o.user?.email?.split("@")[0] || "Guest";
      if (!uid) return;
      if (!allTime[uid]) allTime[uid] = { name, dates: [], spend: 0 };
      allTime[uid].dates.push(o.createdAt);
      allTime[uid].spend += Number(o.total || o.totalPrice || 0);
    });

    // Orders inside the 30-day window
    const windowOrders = orders.filter((o) => o.createdAt >= windowStart);
    const windowByUser: Record<string, number> = {};
    windowOrders.forEach((o) => {
      const uid = o.userId || o.user?.id;
      if (uid) windowByUser[uid] = (windowByUser[uid] || 0) + 1;
    });

    const customers: CustomerStat[] = Object.entries(allTime).map(([uid, data]) => {
      const sortedDates = [...data.dates].sort();
      const firstEver = sortedDates[0];
      const windowCount = windowByUser[uid] || 0;
      const isNew = firstEver >= windowStart && windowCount > 0;
      const allTimeCount = data.dates.length;

      return {
        userId: uid,
        name: data.name,
        orderCount: allTimeCount,
        totalSpend: data.spend,
        isNew,
        lastOrderAt: sortedDates[sortedDates.length - 1],
        suggestLoyaltyReward: allTimeCount === 3,
      };
    });

    customers.sort((a, b) => b.orderCount - a.orderCount);

    const totalCustomers = customers.length;
    const newCount = customers.filter((c) => c.isNew).length;
    const returningCount = totalCustomers - newCount;
    const loyaltyTriggers = customers.filter((c) => c.suggestLoyaltyReward);
    const top10 = customers.slice(0, 10);
    const avgOrdersPerCustomer = totalCustomers > 0
      ? customers.reduce((s, c) => s + c.orderCount, 0) / totalCustomers
      : 0;

    return { totalCustomers, newCount, returningCount, top10, loyaltyTriggers, avgOrdersPerCustomer };
  }, [orders, windowStart]);

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "fans" as const, label: `Top Fans (${stats.top10.length})` },
    { id: "triggers" as const, label: `Loyalty Triggers (${stats.loyaltyTriggers.length})` },
  ];

  return (
    <div className="card bg-white/5 border-white/10 p-8 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 text-[120px] leading-none select-none">❤️</div>

      <div className="relative z-10">
        <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "#4dca80", marginBottom: 6 }}>
          Customer Loyalty
        </p>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
          Who are your biggest fans?
        </h2>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 24 }}>
          Your customer data — we give it back to you. Last {WINDOW_DAYS} days.
        </p>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 4, marginBottom: 24, width: "fit-content" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "6px 14px", borderRadius: 9, fontSize: 10, fontWeight: 900,
                background: tab === t.id ? "rgba(255,255,255,0.1)" : "transparent",
                border: "none", color: tab === t.id ? "#fff" : "rgba(255,255,255,0.4)",
                cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em", transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <>
            {/* KPI row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Total Customers", value: stats.totalCustomers, color: "#fff" },
                { label: "New This Month", value: stats.newCount, color: "#4dca80", sub: `${stats.totalCustomers > 0 ? ((stats.newCount / stats.totalCustomers) * 100).toFixed(0) : 0}% of total` },
                { label: "Returning", value: stats.returningCount, color: "#f97316", sub: "ordered before" },
                { label: "Avg Orders / Customer", value: stats.avgOrdersPerCustomer.toFixed(1), color: "#a78bfa" },
              ].map((kpi) => (
                <div key={kpi.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px" }}>
                  <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", margin: 0, marginBottom: 6 }}>{kpi.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 900, color: kpi.color, margin: 0, lineHeight: 1 }}>{kpi.value}</p>
                  {kpi.sub && <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", margin: 0, marginTop: 4 }}>{kpi.sub}</p>}
                </div>
              ))}
            </div>

            {/* New vs Returning bar */}
            {stats.totalCustomers > 0 && (
              <div>
                <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>New vs. Returning split</p>
                <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,0.05)", overflow: "hidden", display: "flex" }}>
                  <div style={{ width: `${(stats.newCount / stats.totalCustomers) * 100}%`, background: "#4dca80", transition: "width 0.5s ease" }} />
                  <div style={{ flex: 1, background: "#f97316" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontSize: 9, color: "#4dca80", fontWeight: 700 }}>● New ({stats.newCount})</span>
                  <span style={{ fontSize: 9, color: "#f97316", fontWeight: 700 }}>Returning ({stats.returningCount}) ●</span>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "fans" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {stats.top10.length === 0 && (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "32px 0" }}>No order data yet.</p>
            )}
            {stats.top10.map((c, i) => (
              <div
                key={c.userId}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: i === 0 ? "rgba(249,115,22,0.06)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${i === 0 ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.05)"}`,
                  borderRadius: 12, padding: "12px 14px",
                }}
              >
                <span style={{ fontSize: 18, width: 28, textAlign: "center", flexShrink: 0 }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 800, fontSize: 13, color: "#fff", margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", margin: 0, marginTop: 2 }}>
                    Last order {new Date(c.lastOrderAt).toLocaleDateString()}
                    {c.isNew && <span style={{ color: "#4dca80", marginLeft: 8 }}>● New</span>}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 18, fontWeight: 900, color: "#f97316", margin: 0 }}>{c.orderCount}</p>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", margin: 0 }}>orders</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 14, fontWeight: 900, color: "#4dca80", margin: 0 }}>${c.totalSpend.toFixed(0)}</p>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", margin: 0 }}>spent</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "triggers" && (
          <div>
            {stats.loyaltyTriggers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ fontSize: 28 }}>🎉</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>No pending loyalty triggers right now.</p>
              </div>
            ) : (
              <>
                <div style={{ background: "rgba(77,202,128,0.08)", border: "1px solid rgba(77,202,128,0.2)", borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
                  <p style={{ fontSize: 11, color: "#4dca80", fontWeight: 700, margin: 0 }}>
                    💡 These customers just hit 3 orders. A free dessert or 10% off on order #4 turns a regular into a loyal fan.
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {stats.loyaltyTriggers.map((c) => (
                    <div
                      key={c.userId}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        background: "rgba(77,202,128,0.04)", border: "1px solid rgba(77,202,128,0.15)",
                        borderRadius: 12, padding: "12px 14px",
                      }}
                    >
                      <span style={{ fontSize: 20 }}>🔔</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 800, fontSize: 13, color: "#fff", margin: 0 }}>{c.name}</p>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0, marginTop: 2 }}>
                          3 orders complete — ready for loyalty reward on order #4
                        </p>
                      </div>
                      <div style={{
                        background: "rgba(77,202,128,0.1)", border: "1px solid rgba(77,202,128,0.25)",
                        color: "#4dca80", borderRadius: 8, padding: "5px 12px",
                        fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                      }}>
                        Ready
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
