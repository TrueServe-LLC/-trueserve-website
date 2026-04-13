import Link from "next/link";
import Logo from "@/components/Logo";

const availableTrips = [
  { restaurant: "Nearby Restaurant", address: "Your area", payout: "Varies", distance: "— mi" },
  { restaurant: "Nearby Restaurant", address: "Your area", payout: "Varies", distance: "— mi" },
  { restaurant: "Nearby Restaurant", address: "Your area", payout: "Varies", distance: "— mi" },
];

const routeRows = [
  { label: "Balance", value: "—" },
  { label: "Weather", value: "—" },
  { label: "Trip Count", value: "—" },
  { label: "Rating", value: "—" },
];

export default function DriverPortalPreviewPage() {
  return (
    <div className="md-body min-h-screen">
      <div className="md-page-hd">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <div>
            <div className="md-page-title">Driver Dashboard Preview</div>
            <div className="md-page-sub">Portal preview · mirrors the live driver dashboard</div>
          </div>
        </div>
        <div className="md-hd-right flex-wrap">
          <div className="md-terminal-btn">
            <span className="md-terminal-dot"></span>
            Live Routes
          </div>
          <div className="md-online-badge">Online</div>
          <div className="md-online-badge" style={{ background: "#0d1a10", color: "#3dd68c", borderColor: "#1a4a2a" }}>
            Payouts Active
          </div>
          <Link href="/driver/tutorial-preview" className="btn btn-gold">
            View Animated Tutorial
          </Link>
          <Link href="/driver/login" className="btn btn-ghost">
            Back to Login
          </Link>
        </div>
      </div>

      <div className="md-stat-grid">
        <div className="md-stat-block">
          <div className="md-stat-name">Daily Yield</div>
          <div className="md-stat-value gold">$—</div>
        </div>
        <div className="md-stat-block">
          <div className="md-stat-name">Trips</div>
          <div className="md-stat-value">—</div>
        </div>
        <div className="md-stat-block">
          <div className="md-stat-name">Rating</div>
          <div className="md-stat-value">— ★</div>
        </div>
        <div className="md-stat-block">
          <div className="md-stat-name">Weather</div>
          <div className="md-stat-value grn">—</div>
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
              Stripe payouts active.
            </div>
            <div className="md-stripe-desc">This preview mirrors the live driver layout for routes, earnings, and payout status.</div>
          </div>
        </div>
        <div className="md-stripe-connected">✓ Active</div>
      </div>

      <div className="md-two-col">
        <div className="md-stat-block">
          <div className="md-stat-name">Active Mission</div>
          <div className="mt-2 text-[28px] font-black tracking-[-0.03em] text-white">Current Route</div>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-[#e8a230]">Picked Up</div>
                  <h3 className="mt-1 text-[22px] font-black">Active Restaurant</h3>
                </div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-white/45">#TRV-XXXX</div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-[#0b0f17] p-4">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-white/55">Pickup</div>
                  <div className="mt-1 font-bold">Restaurant Address</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0b0f17] p-4">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-white/55">Drop-off</div>
                  <div className="mt-1 font-bold">Customer Address</div>
                  <div className="mt-1 text-xs text-[#68c7cc]">Customer: —</div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b0f17] p-4">
                <div className="text-[10px] uppercase tracking-[0.14em] text-white/55">Progress</div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[68%] rounded-full bg-[#e8a230]" />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#e8a230]">En route</div>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  Complete the drop-off once you arrive at the customer address.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">Route Snapshot</div>
              <div className="mt-4 rounded-[24px] border border-white/10 bg-[#0b0f17] p-4">
                <div
                  className="relative h-44 overflow-hidden rounded-[18px] border border-white/10"
                  style={{
                    background:
                      "radial-gradient(circle at 20% 25%, rgba(232,162,48,.18), transparent 28%), radial-gradient(circle at 80% 75%, rgba(61,214,140,.16), transparent 24%), linear-gradient(180deg, rgba(10,14,20,.96), rgba(6,9,14,.98))",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-25"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
                      backgroundSize: "28px 28px",
                    }}
                  />
                  <div className="absolute left-6 top-6 rounded-full border border-[#e8a230]/30 bg-[#e8a230]/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#e8a230]">
                    Pickup
                  </div>
                  <div className="absolute right-6 bottom-6 rounded-full border border-emerald-300/30 bg-emerald-300/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-300">
                    Drop-off
                  </div>
                  <div className="absolute left-[18%] top-[58%] h-[2px] w-[64%] rounded-full bg-gradient-to-r from-[#e8a230] via-white to-emerald-300" />
                  <div className="absolute left-[21%] top-[54%] h-5 w-5 rounded-full border-4 border-white bg-[#e8a230] shadow-[0_0_20px_rgba(232,162,48,.45)]" />
                  <div className="absolute right-[17%] top-[58%] h-5 w-5 rounded-full border-4 border-white bg-emerald-300 shadow-[0_0_20px_rgba(61,214,140,.35)]" />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">ETA</div>
                    <div className="mt-1 text-lg font-black">— min</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">Route</div>
                    <div className="mt-1 text-lg font-black">— mi</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">Payout</div>
                    <div className="mt-1 text-lg font-black text-[#e8a230]">$—</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="md-stat-block">
            <div className="md-stat-name">Driver Essentials</div>
            <div className="mt-2 text-[28px] font-black tracking-[-0.03em] text-white">Payments and Tools</div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Link href="/driver/dashboard/account" className="btn btn-gold justify-center">
                Stripe Payout Setup
              </Link>
              <Link href="/driver/dashboard/compliance" className="btn btn-gold justify-center">
                Compliance Checklist
              </Link>
              <Link href="/driver/dashboard/earnings" className="btn btn-ghost justify-center">
                Settlement History
              </Link>
              <Link href="/driver/dashboard/help" className="btn btn-ghost justify-center">
                TrueServe AI Support
              </Link>
            </div>
          </div>

          <div className="md-stat-block">
            <div className="md-stat-name">Navigation</div>
            <div className="mt-2 text-[28px] font-black tracking-[-0.03em] text-white">Live Map + Heatmap</div>
            <div className="mt-5 rounded-[22px] border border-white/10 bg-[#0b0f17] p-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.12em] text-white/40">
                <span>Route View</span>
                <span>Driver preview</span>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { stop: "Pickup", place: "Restaurant Name", detail: "Restaurant Address · — mi" },
                  { stop: "Drop-off", place: "Customer Address", detail: "Customer: — · — mi" },
                ].map((stop) => (
                  <div key={stop.stop} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">{stop.stop}</div>
                    <div className="mt-1 text-[13px] font-semibold text-white/90">{stop.place}</div>
                    <div className="mt-0.5 text-xs text-white/50">{stop.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md-bottom-grid">
        <div className="md-stat-block">
          <div className="md-stat-name">Available Orders</div>
          <div className="mt-2 text-[28px] font-black tracking-[-0.03em] text-white">Nearby Opportunities</div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {availableTrips.map((trip) => (
              <div key={trip.restaurant} className="rounded-2xl border border-white/10 bg-[#0b0f17] p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-black">{trip.restaurant}</h3>
                  <span className="text-[11px] uppercase tracking-[0.12em] text-[#68c7cc]">Live</span>
                </div>
                <p className="mb-4 text-sm leading-6 text-white/65">{trip.address}</p>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#3dd68c]/30 bg-[#3dd68c]/10 px-3 py-1 text-xs font-bold text-[#3dd68c]">
                    {trip.payout} payout
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white/65">{trip.distance}</span>
                </div>
                <button className="btn btn-gold w-full justify-center">Accept Order</button>
              </div>
            ))}
          </div>
        </div>

        <div className="md-stat-block">
          <div className="md-stat-name">Route Summary</div>
          <div className="mt-2 text-[28px] font-black tracking-[-0.03em] text-white">Today at a glance</div>
          <div className="mt-5 space-y-3">
            {routeRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span className="text-xs uppercase tracking-[0.12em] text-white/45">{row.label}</span>
                <span className="text-sm font-bold text-white/80">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-2">
            <Link href="/driver/dashboard/compliance" className="btn btn-gold justify-center">
              Open Compliance
            </Link>
            <Link href="/driver/dashboard/earnings" className="btn btn-ghost justify-center">
              View Settlements
            </Link>
            <Link href="/driver/dashboard/help" className="btn btn-ghost justify-center">
              Get Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
