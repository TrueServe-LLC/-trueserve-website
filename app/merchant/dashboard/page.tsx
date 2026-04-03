import { createClient } from "@/lib/supabase/server";
import { getAuthSession } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import MerchantRealtime from "@/components/MerchantRealtime";
import WelcomeModal from "./WelcomeModal";
import { createStripeAccount } from "../actions";
import { logout } from "@/app/auth/actions";
import PrepTimingPanel from "@/app/merchant/dashboard/PrepTimingPanel";
import TerminalStatusPanel from "@/app/merchant/dashboard/TerminalStatusPanel";
import AutoPilotPanel from "@/app/merchant/dashboard/AutoPilotPanel";
import BusyZonesPanel from "@/app/merchant/dashboard/BusyZonesPanel";
import IssuesPanel from "@/app/merchant/dashboard/IssuesPanel";

export const dynamic = "force-dynamic";

export default async function MerchantDashboard() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;
    const { isAuth, userId } = await getAuthSession();
    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect("/login?role=merchant");
    }

    let restaurant: any = null;

    if (isPreview) {
        restaurant = {
            id: "preview",
            name: "Emerald Kitchen (Preview)",
            stripeAccountId: null,
            isBusy: false,
            busyUntil: null,
            manualPrepTime: null,
            autoPilotEnabled: true,
            capacityThreshold: 10,
            menuItems: [{ id: "1" }],
            orders: [{ id: "1", status: "PENDING", total: 0 }],
            schedules: [],
        };
    } else {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("Restaurant")
            .select(`
                *,
                menuItems:MenuItem(*),
                orders:Order(*, user:User(*)),
                schedules:MerchantSchedule(*)
            `)
            .eq("ownerId", activeUserId!)
            .single();

        if (error || !data) {
            console.error("Dashboard Fetch Error:", error);
            redirect("/merchant-signup");
        }
        restaurant = data;
    }

    const pendingOrders = (restaurant.orders || []).filter(
        (o: any) => o.status === "PENDING" || o.status === "PREPARING"
    );

    const netRevenue = (restaurant.orders || [])
        .filter((o: any) => o.status === "DELIVERED" || o.status === "READY_FOR_PICKUP" || o.status === "PICKED_UP")
        .reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

    const hasStripe = Boolean(restaurant.stripeAccountId);

    return (
        <>
            {/* Google Fonts for this page */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,700&family=DM+Mono:wght@400;500&family=Barlow+Condensed:ital,wght@1,700;1,800&display=swap');

                /* ── PAGE TOKENS ── */
                .md-body { background: #0c0e13; font-family: 'DM Sans', sans-serif; color: #fff; }
                .md-border { border: 1px solid #1c1f28; }
                .md-border-top { border-top: 1px solid #1c1f28; }
                .md-border-bottom { border-bottom: 1px solid #1c1f28; }
                .md-panel { background: #0f1219; }
                .md-surface { background: #131720; border: 1px solid #1c1f28; }

                /* ── PAGE HEADER ── */
                .md-page-hd {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 16px 24px; border-bottom: 1px solid #1c1f28;
                }
                .md-page-title { font-family: 'Barlow Condensed', sans-serif; font-size: 26px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: 0.01em; line-height: 1; }
                .md-page-sub { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #444; margin-top: 5px; }
                .md-hd-right { display: flex; align-items: center; gap: 8px; }
                .md-terminal-btn {
                    font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
                    padding: 8px 16px; background: #131720; border: 1px solid #2a2f3a; color: #888;
                    cursor: pointer; display: flex; align-items: center; gap: 6px;
                }
                .md-terminal-dot { width: 6px; height: 6px; background: #3dd68c; border-radius: 50%; flex-shrink: 0; }
                .md-scale-badge {
                    font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
                    padding: 7px 12px; background: #0d2a1a; border: 1px solid #1a4a2a; color: #3dd68c;
                }
                .md-online-badge {
                    font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
                    padding: 7px 12px; background: #e8a230; color: #000;
                }
                .md-logout {
                    font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
                    color: #444; cursor: pointer; background: none; border: none;
                }

                /* ── STAT GRID ── */
                .md-stat-grid {
                    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 1px; background: #1c1f28; border: 1px solid #1c1f28; margin: 20px 24px 0;
                }
                .md-stat-block { background: #0f1219; padding: 18px 20px; }
                .md-stat-name { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #555; margin-bottom: 10px; }
                .md-stat-value { font-size: 32px; font-weight: 700; color: #fff; font-family: 'DM Mono', monospace; line-height: 1; }
                .md-stat-value.gold { color: #e8a230; }

                /* ── STRIPE BANNER ── */
                .md-stripe-banner {
                    margin: 16px 24px 0; background: #111420; border: 1px solid #2a3060;
                    padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; gap: 20px;
                }
                .md-stripe-left { display: flex; align-items: center; gap: 16px; }
                .md-stripe-icon {
                    width: 44px; height: 44px; background: #1a1e3a; border: 1px solid #2a3060;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .md-stripe-title { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700; font-style: italic; color: #fff; margin-bottom: 3px; }
                .md-stripe-desc { font-size: 12px; color: #555; line-height: 1.5; }
                .md-stripe-btn {
                    font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
                    padding: 10px 20px; background: transparent; border: 1.5px solid #e8a230; color: #e8a230;
                    cursor: pointer; white-space: nowrap; flex-shrink: 0;
                }
                .md-stripe-btn:hover { background: #e8a23015; }
                .md-stripe-connected { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #3dd68c; white-space: nowrap; flex-shrink: 0; }

                /* ── TWO-COL LOWER ── */
                .md-two-col {
                    display: grid; grid-template-columns: 1fr 1fr;
                    gap: 1px; background: #1c1f28; border: 1px solid #1c1f28; margin: 16px 24px 0;
                }

                @media (max-width: 1024px) {
                    .md-page-hd { flex-direction: column; align-items: flex-start; gap: 16px; padding: 20px; }
                    .md-hd-right { width: 100%; justify-content: space-between; flex-wrap: wrap; }
                    .md-stat-grid { grid-template-columns: repeat(2, 1fr); margin: 16px 20px 0; }
                    .md-two-col { grid-template-columns: 1fr; margin: 16px 20px 0; }
                    .md-stripe-banner { flex-direction: column; align-items: flex-start; gap: 16px; margin: 16px 20px 0; }
                    .md-stripe-left { flex-direction: column; align-items: flex-start; gap: 12px; }
                }

                @media (max-width: 640px) {
                    .md-stat-grid { grid-template-columns: 1fr; }
                    .md-stat-value { font-size: 26px; }
                }

                /* ── BOTTOM TWO-COL ── */
                .md-bottom-grid {
                    display: grid; grid-template-columns: 1fr 1fr;
                    gap: 1px; background: #1c1f28; border: 1px solid #1c1f28; margin: 16px 24px 24px;
                }

                /* ── PANEL SHARED ── */
                .md-panel-inner { background: #0f1219; padding: 18px 20px; }
                .md-panel-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
                .md-panel-title { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: 0.02em; }

                /* ── LIVE DOT (reuse from layout) ── */
                .md-live-dot { width: 6px; height: 6px; background: #3dd68c; border-radius: 50%; animation: md-pulse 2s infinite; }
                @keyframes md-pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
            `}</style>

            <div className="md-body">
                {restaurant.id !== "preview" && <MerchantRealtime restaurantId={restaurant.id} />}
                <WelcomeModal restaurantName={restaurant.name} />

                {/* PAGE HEADER */}
                <div className="md-page-hd">
                    <div>
                        <div className="md-page-title">Orders Dashboard</div>
                        <div className="md-page-sub">Operational Control · {restaurant.name}</div>
                    </div>
                    <div className="md-hd-right">
                        <div className="md-terminal-btn">
                            <span className="md-terminal-dot"></span>
                            Kitchen Terminal
                        </div>
                        <div className="md-scale-badge">Pro Scale</div>
                        <div className={`md-online-badge`} style={restaurant.isBusy ? { background: "#e24b4a" } : {}}>
                            {restaurant.isBusy ? "Paused" : "Online"}
                        </div>
                        <form action={logout} style={{ display: "inline" }}>
                            <button type="submit" className="md-logout">Log Out</button>
                        </form>
                    </div>
                </div>

                {/* STAT GRID */}
                <div className="md-stat-grid">
                    <div className="md-stat-block">
                        <div className="md-stat-name">Incoming Orders</div>
                        <div className="md-stat-value">{pendingOrders.length}</div>
                    </div>
                    <div className="md-stat-block">
                        <div className="md-stat-name">Menu Items</div>
                        <div className="md-stat-value">{(restaurant.menuItems || []).length}</div>
                    </div>
                    <div className="md-stat-block">
                        <div className="md-stat-name">Net Revenue</div>
                        <div className="md-stat-value gold">${netRevenue.toFixed(2)}</div>
                    </div>
                </div>

                {/* STRIPE BANNER */}
                {!hasStripe && (
                    <div className="md-stripe-banner">
                        <div className="md-stripe-left">
                            <div className="md-stripe-icon">
                                <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                                    <rect x="1" y="1" width="18" height="12" rx="1" stroke="#4a5aaa" strokeWidth="1.3"/>
                                    <path d="M1 5h18" stroke="#4a5aaa" strokeWidth="1.3"/>
                                </svg>
                            </div>
                            <div>
                                <div className="md-stripe-title">Connect Stripe to get paid.</div>
                                <div className="md-stripe-desc">To start receiving payouts for your orders, you need to connect your Stripe account.</div>
                            </div>
                        </div>
                        <form action={createStripeAccount}>
                            <button type="submit" className="md-stripe-btn">Connect Stripe Account →</button>
                        </form>
                    </div>
                )}

                {hasStripe && (
                    <div className="md-stripe-banner" style={{ borderColor: "#1a4a2a", background: "#0d1a10" }}>
                        <div className="md-stripe-left">
                            <div className="md-stripe-icon" style={{ borderColor: "#1a4a2a", background: "#0d2a1a" }}>
                                <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                                    <rect x="1" y="1" width="18" height="12" rx="1" stroke="#3dd68c" strokeWidth="1.3"/>
                                    <path d="M1 5h18" stroke="#3dd68c" strokeWidth="1.3"/>
                                </svg>
                            </div>
                            <div>
                                <div className="md-stripe-title" style={{ fontStyle: "normal" }}>Stripe account connected.</div>
                                <div className="md-stripe-desc">Your payouts are active. Funds are deposited on a rolling basis.</div>
                            </div>
                        </div>
                        <div className="md-stripe-connected">✓ Payouts Active</div>
                    </div>
                )}

                {/* PREP TIMING + TERMINAL STATUS */}
                <div className="md-two-col">
                    <PrepTimingPanel
                        restaurantId={restaurant.id}
                        manualPrepTime={restaurant.manualPrepTime}
                        avgPrepTime={restaurant.avgPrepTime || 15}
                    />
                    <TerminalStatusPanel
                        restaurantId={restaurant.id}
                        isBusy={restaurant.isBusy}
                        busyUntil={restaurant.busyUntil}
                    />
                </div>

                {/* AI AUTOPILOT + BUSY ZONES */}
                <div className="md-bottom-grid">
                    <AutoPilotPanel
                        restaurantId={restaurant.id}
                        autoPilotEnabled={restaurant.autoPilotEnabled ?? true}
                        capacityThreshold={restaurant.capacityThreshold ?? 10}
                    />
                    <BusyZonesPanel
                        restaurantId={restaurant.id}
                        schedules={restaurant.schedules || []}
                    />
                </div>

                {/* ISSUES TOAST */}
                <IssuesPanel pendingCount={pendingOrders.length} />
            </div>
        </>
    );
}
