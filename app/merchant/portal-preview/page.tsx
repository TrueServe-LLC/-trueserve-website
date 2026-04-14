import Link from "next/link";
import Logo from "@/components/Logo";

const incomingOrders = [
  { name: "Pilot Order A", status: "PREPARING", total: "$34.20", note: "2 items · 12 min" },
  { name: "Pilot Order B", status: "READY FOR PICKUP", total: "$19.75", note: "1 item · 6 min" },
  { name: "Pilot Order C", status: "PENDING", total: "$28.10", note: "4 items · 3 min" },
];

const opsRows = [
  { label: "Prep Time", value: "15 min" },
  { label: "Terminal", value: "Online" },
  { label: "Capacity", value: "10 orders" },
  { label: "Support", value: "Ready" },
];

export default function MerchantPortalPreviewPage() {
  return (
    <div className="md-body min-h-screen">
      <div className="md-page-hd">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <div>
            <div className="md-page-title">Merchant Dashboard Preview</div>
            <div className="md-page-sub">Portal preview · mirrors the live merchant dashboard</div>
          </div>
        </div>
        <div className="md-hd-right flex-wrap">
          <div className="md-terminal-btn">
            <span className="md-terminal-dot"></span>
            Kitchen Terminal
          </div>
          <div className="md-online-badge">Delivery Mode</div>
          <div className="md-online-badge">Online</div>
              <Link href="/merchant/tutorial-preview" className="btn btn-gold">
            View Animated Tutorial
          </Link>
          <Link href="/merchant/login" className="btn btn-ghost">
            Back to Login
          </Link>
        </div>
      </div>

      <div className="md-stat-grid">
        <div className="md-stat-block">
          <div className="md-stat-name">Incoming Orders</div>
          <div className="md-stat-value">3</div>
        </div>
        <div className="md-stat-block">
          <div className="md-stat-name">Menu Items</div>
          <div className="md-stat-value">42</div>
        </div>
        <div className="md-stat-block">
          <div className="md-stat-name">Net Revenue</div>
          <div className="md-stat-value gold">$82.05</div>
        </div>
      </div>

      <div className="md-stripe-banner" style={{ background: "#0d1a10", borderColor: "#1a4a2a" }}>
        <div className="md-stripe-left">
          <div className="md-stripe-icon" style={{ borderColor: "#1a4a2a", background: "#0d2a1a" }}>
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
              <rect x="1" y="1" width="18" height="12" rx="1" stroke="#3dd68c" strokeWidth="1.3" />
              <path d="M1 5h18" stroke="#3dd68c" strokeWidth="1.3" />
            </svg>
          </div>
          <div>
            <div className="md-stripe-title" style={{ fontStyle: "normal" }}>
              Stripe account connected.
            </div>
            <div className="md-stripe-desc">This preview mirrors the live merchant workflow for orders, automation, and payouts.</div>
          </div>
        </div>
        <div className="md-stripe-connected">✓ Payouts Active</div>
      </div>

      <div className="md-two-col">
        <div className="md-stat-block">
          <div className="md-stat-name">Merchant Integration Hub</div>
          <div className="mt-2 text-[28px] font-black tracking-[-0.03em] text-white">Keep Everything Connected</div>
          <p className="mt-4 text-sm leading-6 text-white/65">
            POS, compliance, storefront, and payments are grouped into one control area so the portal stays simple.
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button
              disabled
              className="btn btn-gold justify-center opacity-50 cursor-not-allowed"
              title="Preview mode: View the full portal preview to explore integrations"
              type="button"
            >
              POS + API
            </button>
            <button
              disabled
              className="btn btn-gold justify-center opacity-50 cursor-not-allowed"
              title="Preview mode: View the full portal preview to explore compliance"
              type="button"
            >
              Compliance
            </button>
            <button
              disabled
              className="btn btn-ghost justify-center opacity-50 cursor-not-allowed"
              title="Preview mode: View the full portal preview to explore storefront"
              type="button"
            >
              Storefront
            </button>
            <button
              disabled
              className="btn btn-ghost justify-center opacity-50 cursor-not-allowed"
              type="button"
              title="Preview mode: This is a demo environment"
            >
              Stripe Connected
            </button>
          </div>
        </div>

        <div className="md-stat-block">
          <div className="md-stat-name">Operations Assistant</div>
          <div className="mt-2 text-[28px] font-black tracking-[-0.03em] text-white">Support + Guidance</div>
          <div className="mt-5 space-y-3">
            {[
              { label: "Tutorials", value: "Available" },
              { label: "AI Support", value: "Ready" },
              { label: "Preview Mode", value: "Pilot build" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span className="text-xs uppercase tracking-[0.12em] text-white/45">{row.label}</span>
                <span className="text-sm font-bold text-white/80">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button className="btn btn-gold justify-center" type="button">
              Tutorials On
            </button>
            <button className="btn btn-ghost justify-center" type="button">
              Support Ready
            </button>
          </div>
        </div>
      </div>

      <div className="md-bottom-grid">
        <div className="md-stat-block">
          <div className="md-stat-name">Live Orders</div>
          <div className="mt-2 text-[28px] font-black tracking-[-0.03em] text-white">Incoming Kitchen Queue</div>
          <div className="mt-5 space-y-3">
            {incomingOrders.map((order) => (
              <div key={order.name} className="rounded-2xl border border-white/10 bg-[#0b0f17] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-white/45">{order.status}</div>
                    <div className="mt-1 text-[15px] font-bold text-white">{order.name}</div>
                    <div className="mt-1 text-xs text-white/50">{order.note}</div>
                  </div>
                  <div className="text-[15px] font-black text-[#e8a230]">{order.total}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="md-stat-block">
          <div className="md-stat-name">Operations Snapshot</div>
          <div className="mt-2 text-[28px] font-black tracking-[-0.03em] text-white">Prep, Terminal, and Capacity</div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {opsRows.map((row) => (
              <div key={row.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">{row.label}</div>
                <div className="mt-1 text-lg font-black text-white">{row.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-[#0b0f17] p-4">
            <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">Automation</div>
            <div className="mt-1 text-[15px] font-bold text-white">AutoPilot enabled with a 10 order capacity threshold.</div>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Busy windows and support controls stay visible so the merchant portal feels organized and easy to scan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
