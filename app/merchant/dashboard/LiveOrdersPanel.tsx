"use client";

import { useEffect, useState, useTransition } from "react";
import { supabase } from "@/lib/supabase";
import { updateOrderStatus } from "@/app/merchant/actions";

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  user?: { name?: string };
  items?: { name: string; quantity: number }[];
}

interface LiveOrdersPanelProps {
  restaurantId: string;
  initialOrders: Order[];
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING:          { label: "New Order",     color: "#f97316", bg: "rgba(249,115,22,.1)",  border: "rgba(249,115,22,.25)" },
  PREPARING:        { label: "Preparing",     color: "#fbbf24", bg: "rgba(251,191,36,.1)",  border: "rgba(251,191,36,.25)" },
  READY_FOR_PICKUP: { label: "Ready",         color: "#4dca80", bg: "rgba(77,202,128,.1)",  border: "rgba(77,202,128,.25)" },
};

const NEXT_ACTION: Record<string, { label: string; next: string; emoji: string }> = {
  PENDING:   { label: "Start Prep",         next: "PREPARING",        emoji: "🔥" },
  PREPARING: { label: "Ready for Pickup",   next: "READY_FOR_PICKUP", emoji: "✅" },
};

export default function LiveOrdersPanel({ restaurantId, initialOrders }: LiveOrdersPanelProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [pending, startTransition] = useTransition();
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (restaurantId === "preview") return;

    const channel = supabase
      .channel(`live-orders-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Order",
          filter: `restaurantId=eq.${restaurantId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [payload.new as Order, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Order;
            setOrders((prev) =>
              prev
                .map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
                .filter((o) => ["PENDING", "PREPARING", "READY_FOR_PICKUP"].includes(o.status))
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [restaurantId]);

  const activeOrders = orders.filter((o) =>
    ["PENDING", "PREPARING", "READY_FOR_PICKUP"].includes(o.status)
  );

  const advance = (orderId: string, nextStatus: string) => {
    setActionOrderId(orderId);
    startTransition(async () => {
      await updateOrderStatus(orderId, nextStatus);
      setActionOrderId(null);
    });
  };

  return (
    <div style={{
      background: "#111",
      border: "0.5px solid #2a2a2a",
      borderRadius: 12,
      padding: 18,
      marginBottom: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#666", letterSpacing: "0.07em", textTransform: "uppercase" }}>
          Live Orders
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", background: "#4dca80",
            animation: "ddPulse 1.8s ease-in-out infinite",
          }} />
          <span style={{ fontSize: 10, color: "#4dca80", fontWeight: 600 }}>
            {activeOrders.length} active
          </span>
        </div>
      </div>

      {activeOrders.length === 0 ? (
        <div style={{
          background: "#0d0d0d", border: "0.5px solid #1e1e1e",
          borderRadius: 8, padding: "14px 16px",
          fontSize: 12, color: "#555", textAlign: "center",
        }}>
          No active orders right now — new orders will appear here instantly.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activeOrders.map((order) => {
            const statusMeta = STATUS_LABEL[order.status];
            const action = NEXT_ACTION[order.status];
            const isActing = actionOrderId === order.id && pending;
            const age = Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000);

            return (
              <div key={order.id} style={{
                background: "#0d0d0d",
                border: `0.5px solid ${statusMeta?.border || "#242424"}`,
                borderRadius: 10,
                padding: "14px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                  <div>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      background: statusMeta?.bg, border: `1px solid ${statusMeta?.border}`,
                      color: statusMeta?.color, borderRadius: 20,
                      padding: "2px 10px", fontSize: 10, fontWeight: 800,
                      letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6,
                    }}>
                      {statusMeta?.label}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                      {order.user?.name || "Customer"} · ${Number(order.total).toFixed(2)}
                    </div>
                    <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>
                      #{order.id.slice(-6).toUpperCase()} · {age < 1 ? "just now" : `${age}m ago`}
                    </div>
                  </div>

                  {action && (
                    <button
                      onClick={() => advance(order.id, action.next)}
                      disabled={isActing}
                      style={{
                        background: action.next === "PREPARING" ? "rgba(249,115,22,0.15)" : "rgba(77,202,128,0.15)",
                        border: `1px solid ${action.next === "PREPARING" ? "rgba(249,115,22,0.4)" : "rgba(77,202,128,0.4)"}`,
                        color: action.next === "PREPARING" ? "#f97316" : "#4dca80",
                        borderRadius: 9, padding: "9px 14px",
                        fontSize: 11, fontWeight: 800, cursor: "pointer",
                        whiteSpace: "nowrap", flexShrink: 0,
                        opacity: isActing ? 0.5 : 1,
                        transition: "all 0.15s",
                        fontFamily: "inherit",
                      }}
                    >
                      {isActing ? "…" : `${action.emoji} ${action.label}`}
                    </button>
                  )}

                  {order.status === "READY_FOR_PICKUP" && (
                    <div style={{
                      background: "rgba(77,202,128,0.1)", border: "1px solid rgba(77,202,128,0.3)",
                      color: "#4dca80", borderRadius: 9, padding: "9px 14px",
                      fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", flexShrink: 0,
                    }}>
                      ✓ Awaiting Driver
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
