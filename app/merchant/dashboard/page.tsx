import { getAuthSession } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";
import MerchantRealtime from "@/components/MerchantRealtime";
import WelcomeAnimation from "@/components/WelcomeAnimation";
import OnboardingChecklist from "./OnboardingChecklist";
import { createStripeAccount } from "../actions";
import PrepTimingPanel from "@/app/merchant/dashboard/PrepTimingPanel";
import TerminalStatusPanel from "@/app/merchant/dashboard/TerminalStatusPanel";
import AutoPilotPanel from "@/app/merchant/dashboard/AutoPilotPanel";
import BusyZonesPanel from "@/app/merchant/dashboard/BusyZonesPanel";
import IssuesPanel from "@/app/merchant/dashboard/IssuesPanel";
import GHLSettingsPanel from "@/app/merchant/dashboard/GHLSettingsPanel";
import LiveOrdersPanel from "@/app/merchant/dashboard/LiveOrdersPanel";
import HoursPanel from "@/app/merchant/dashboard/HoursPanel";
import CoverPhotoPanel from "@/app/merchant/dashboard/CoverPhotoPanel";
import RevenueSparkline from "@/app/merchant/dashboard/RevenueSparkline";
import MerchantPortalRecovery from "./MerchantPortalRecovery";
import { ArrowRight, CheckCircle2, CreditCard, DollarSign, Package, UtensilsCrossed } from "lucide-react";
import LaunchCenter from "@/app/merchant/dashboard/LaunchCenter";
import GrowthConsultant from "@/app/merchant/dashboard/GrowthConsultant";

export const dynamic = "force-dynamic";

function buildSlug(value: string) {
    return value
        .toLowerCase()
        .replace(/['']/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export default async function MerchantDashboard({
    searchParams,
}: {
    searchParams?: Promise<{ mode?: string; stripe_connect?: string }>;
}) {
    const params = searchParams ? await searchParams : undefined;
    const stripeConnectState = params?.stripe_connect;
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
            name: "Pilot Kitchen",
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
        const { data: restaurants, error } = await supabaseAdmin
            .from("Restaurant")
            .select(`
                *,
                menuItems:MenuItem(*),
                orders:Order(*, user:User(*)),
                schedules:MerchantSchedule(*)
            `)
            .eq("ownerId", activeUserId!);

        if (error || !restaurants || restaurants.length === 0) {
            console.error("Dashboard Fetch Error:", error);
            return <MerchantPortalRecovery />;
        }

        restaurant = restaurants[0];
    }

    const pendingOrders = (restaurant.orders || []).filter(
        (o: any) => o.status === "PENDING" || o.status === "PREPARING"
    );

    const netRevenue = (restaurant.orders || [])
        .filter((o: any) => o.status === "DELIVERED" || o.status === "READY_FOR_PICKUP" || o.status === "PICKED_UP")
        .reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

    const hasStripeAccount = Boolean(restaurant.stripeAccountId);
    const hasStripe = Boolean(restaurant.stripeOnboardingComplete);
    const hasHours = Boolean(restaurant.openTime && restaurant.closeTime);
    const hasGhl = Boolean(String(restaurant.ghlUrl || "").trim());
    const hasPos = Boolean(
        (restaurant.posSystem && restaurant.posSystem !== "None") ||
        (restaurant.posType && restaurant.posType !== "None") ||
        restaurant.posClientId
    );
    const hasTestOrder = (restaurant.orders || []).some((o: any) =>
        String(o.posReference || "").startsWith("TEST-")
    );
    const storefrontSlug = restaurant.slug || buildSlug(restaurant.name || "restaurant") || restaurant.id;
    const storefrontPath = `/restaurants/${storefrontSlug}`;
    const storefrontUrl = `https://trueserve.delivery${storefrontPath}`;
    const launchReadyItems = [
        { label: "Menu", done: (restaurant.menuItems || []).length > 0 },
        { label: "Stripe", done: hasStripe },
        { label: "Hours", done: hasHours },
        { label: "POS", done: hasPos || restaurant.posSystem === "None" || restaurant.posType === "None" },
        { label: "GHL", done: hasGhl },
        { label: "Photo", done: Boolean(restaurant.imageUrl) },
        { label: "Live", done: restaurant.visibility === "VISIBLE" },
    ];
    const launchDoneCount = launchReadyItems.filter((item) => item.done).length;
    const launchReadyPercent = Math.round((launchDoneCount / launchReadyItems.length) * 100);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weeklyOrders = (restaurant.orders || []).filter((order: any) => {
        const createdAt = order.createdAt || order.created_at;
        return createdAt ? new Date(createdAt) >= weekStart : false;
    });
    const weeklyRevenue = weeklyOrders.reduce((sum: number, order: any) => sum + Number(order.total || 0), 0);
    const commissionRate = Number(restaurant.commissionRate ?? restaurant.platformFeeRate ?? 0);
    const trueServeFee = weeklyRevenue * (commissionRate / 100);
    const posName = restaurant.posSystem || restaurant.posType || (hasPos ? "Connected POS" : "Not connected");
    const posStatus = hasPos ? "Connected" : "Pending setup";
    const disputeCount = (restaurant.orders || []).filter((order: any) =>
        ["DISPUTED", "REFUND_REQUESTED", "ISSUE_REPORTED"].includes(String(order.status || ""))
    ).length;

    return (
        <>
            <style>{`
                .mch-stat-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-bottom: 14px;
                }
                .mch-stat-card {
                    background: #141a18;
                    border: 1px solid #1e2420;
                    border-radius: 8px;
                    padding: 14px;
                }
                .mch-stat-label {
                    font-size: 11px;
                    color: #777;
                    margin-bottom: 7px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .mch-stat-icon {
                    width: 18px; height: 18px;
                    border-radius: 4px;
                    background: #0f1210;
                    border: 1px solid #1e2420;
                    display: flex; align-items: center; justify-content: center;
                    color: #f97316;
                }
                .mch-stat-value {
                    font-size: 27px;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: -0.5px;
                }
                .mch-stripe-banner {
                    background: linear-gradient(180deg, #111713 0%, #0d110f 100%);
                    border: 1px solid #202a24;
                    border-radius: 14px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 14px;
                    gap: 16px;
                    box-shadow: 0 16px 40px rgba(0,0,0,.18);
                }
                .mch-stripe-banner.connected {
                    border-color: rgba(61,214,140,.28);
                    background: linear-gradient(180deg, #101913 0%, #0d140f 100%);
                }
                .mch-stripe-banner.pending {
                    border-color: rgba(249,115,22,.28);
                    background: linear-gradient(180deg, #18130f 0%, #0f100d 100%);
                }
                .mch-stripe-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
                .mch-stripe-icon {
                    width: 40px; height: 40px;
                    border-radius: 10px;
                    background: rgba(99,91,255,.13);
                    border: 1px solid rgba(99,91,255,.3);
                    color: #b8b5ff;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .mch-stripe-icon.connected { background: rgba(61,214,140,.1); border-color: rgba(61,214,140,.28); color: #3dd68c; }
                .mch-stripe-icon.pending { background: rgba(249,115,22,.1); border-color: rgba(249,115,22,.28); color: #f97316; }
                .mch-stripe-title {
                    display: block;
                    color: #fff;
                    font-weight: 900;
                    font-size: 15px;
                    margin-bottom: 4px;
                }
                .mch-stripe-sub { display: block; font-size: 12px; line-height: 1.45; color: #a5aea8; max-width: 520px; }
                .mch-stripe-connect-btn {
                    background: #f97316;
                    color: #071009;
                    border: none;
                    border-radius: 10px;
                    min-height: 42px;
                    padding: 0 16px;
                    font-size: 11px;
                    font-weight: 900;
                    cursor: pointer;
                    white-space: nowrap;
                    flex-shrink: 0;
                    transition: background 0.15s;
                    text-transform: uppercase;
                    letter-spacing: 0.11em;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                .mch-stripe-connect-btn:hover { background: #ea6c10; }
                .mch-stripe-connected-badge {
                    font-size: 11px;
                    color: #3dd68c;
                    font-weight: 900;
                    letter-spacing: .1em;
                    text-transform: uppercase;
                    white-space: nowrap;
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                }
                .mch-section-head {
                    font-size: 10px;
                    font-weight: 800;
                    color: #777;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                }
                .mch-tab-row { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
                .mch-tab-pill {
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 800;
                    cursor: pointer;
                    text-decoration: none;
                    border: 1px solid #1e2420;
                    color: #999;
                    transition: all 0.15s;
                    text-transform: uppercase;
                    letter-spacing: 0.11em;
                    background: transparent;
                }
                .mch-tab-pill:hover { color: #f97316; border-color: rgba(249,115,22,0.35); background: rgba(249,115,22,0.06); }
                .mch-tab-pill.mch-tab-active {
                    background: rgba(249,115,22,0.08);
                    color: #f97316;
                    border-color: rgba(249,115,22,0.35);
                }
                .mch-two-col {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 14px;
                }
                .mch-four-col {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 14px;
                }
                .mch-transparency {
                    margin: 0 0 14px;
                    border: 1px solid rgba(255,255,255,0.08);
                    background: linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025));
                    border-radius: 14px;
                    overflow: hidden;
                    box-shadow: 0 18px 45px rgba(0,0,0,0.2);
                }
                .mch-transparency-head {
                    padding: 18px;
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                }
                .mch-transparency-kicker {
                    margin: 0 0 5px;
                    color: #f97316;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 0.16em;
                    text-transform: uppercase;
                }
                .mch-transparency-head h2 {
                    margin: 0;
                    color: #fff;
                    font-size: 20px;
                    font-weight: 900;
                    letter-spacing: -0.02em;
                }
                .mch-transparency-head p {
                    margin: 6px 0 0;
                    color: #9ca3af;
                    font-size: 12px;
                    line-height: 1.55;
                    max-width: 660px;
                }
                .mch-status-pill {
                    display: inline-flex;
                    align-items: center;
                    border: 1px solid rgba(62,207,110,0.28);
                    background: rgba(62,207,110,0.08);
                    color: #3ecf6e;
                    border-radius: 999px;
                    padding: 7px 11px;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    white-space: nowrap;
                }
                .mch-status-pill.pending {
                    border-color: rgba(249,115,22,0.3);
                    background: rgba(249,115,22,0.08);
                    color: #f97316;
                }
                .mch-transparency-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                }
                .mch-transparency-card {
                    padding: 18px;
                    border-right: 1px solid rgba(255,255,255,0.07);
                    min-height: 178px;
                }
                .mch-transparency-card:last-child { border-right: 0; }
                .mch-transparency-label {
                    color: #a3a3a3;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    margin-bottom: 12px;
                }
                .mch-transparency-value {
                    color: #fff;
                    font-size: 26px;
                    font-weight: 900;
                    letter-spacing: -0.03em;
                    line-height: 1;
                    margin-bottom: 8px;
                }
                .mch-transparency-card p {
                    color: #9ca3af;
                    font-size: 12px;
                    line-height: 1.5;
                    margin: 0;
                }
                .mch-fee-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 14px;
                    color: #d4d4d4;
                    font-size: 12px;
                    padding: 7px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .mch-fee-row:last-child { border-bottom: 0; }
                .mch-fee-row strong { color: #fff; font-weight: 900; }
                .mch-progress-track {
                    height: 8px;
                    border-radius: 999px;
                    background: rgba(255,255,255,0.08);
                    overflow: hidden;
                    margin: 13px 0 10px;
                }
                .mch-progress-fill {
                    height: 100%;
                    border-radius: inherit;
                    background: linear-gradient(90deg, #f97316, #14b8a6);
                }
                .mch-transparency-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    margin-top: 13px;
                    color: #f97316;
                    font-size: 11px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    text-decoration: none;
                }
                @media (max-width: 900px) {
                    .mch-stat-grid { grid-template-columns: 1fr 1fr; }
                    .mch-two-col, .mch-four-col { grid-template-columns: 1fr; }
                    .mch-transparency-grid { grid-template-columns: 1fr 1fr; }
                    .mch-transparency-card:nth-child(2) { border-right: 0; }
                    .mch-transparency-card:nth-child(-n+2) { border-bottom: 1px solid rgba(255,255,255,0.07); }
                }
                @media (max-width: 768px) {
                    .mch-stat-grid {
                        grid-template-columns: 1fr;
                    }
                    .mch-stat-card {
                        padding: 16px;
                    }
                    .mch-stripe-banner {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .mch-stripe-left {
                        align-items: flex-start;
                    }
                    .mch-stripe-connect-btn,
                    .mch-stripe-connected-badge {
                        width: 100%;
                        text-align: center;
                    }
                    .mch-tab-row {
                        display: grid;
                        grid-template-columns: 1fr;
                    }
                    .mch-tab-pill {
                        width: 100%;
                        text-align: center;
                    }
                    .mch-transparency-head { flex-direction: column; }
                    .mch-transparency-grid { grid-template-columns: 1fr; }
                    .mch-transparency-card {
                        border-right: 0;
                        border-bottom: 1px solid rgba(255,255,255,0.07);
                        min-height: auto;
                    }
                    .mch-transparency-card:last-child { border-bottom: 0; }
                }
            `}</style>

            <WelcomeAnimation
                name={restaurant.name}
                role="merchant"
                stats={[
                    { label: "Pending Orders", value: String(pendingOrders.length) },
                    { label: "Revenue", value: `$${netRevenue.toFixed(0)}` },
                    { label: "Menu Items", value: String((restaurant.menuItems || []).length) },
                ]}
            />
            {restaurant.id !== "preview" && <MerchantRealtime restaurantId={restaurant.id} />}

            <OnboardingChecklist
                hasMenuItems={(restaurant.menuItems || []).length > 0}
                hasStripe={hasStripe}
                hasImage={Boolean(restaurant.imageUrl)}
                isVisible={restaurant.visibility === "VISIBLE"}
                hasHours={hasHours}
                hasPos={hasPos || restaurant.posSystem === "None" || restaurant.posType === "None"}
                hasGhl={hasGhl}
                hasTestOrder={hasTestOrder}
                restaurantId={restaurant.id}
            />

            <LaunchCenter
                restaurantName={restaurant.name}
                storefrontUrl={storefrontUrl}
                storefrontPath={storefrontPath}
                readyItems={launchReadyItems}
            />

            <section className="mch-transparency" aria-label="Merchant transparency center">
                <div className="mch-transparency-head">
                    <div>
                        <div className="mch-transparency-kicker">Radical transparency</div>
                        <h2>Every fee, payout, POS state, and issue in one place.</h2>
                        <p>
                            This is the restaurant control room: onboarding progress, weekly earnings, POS connection status,
                            and dispute paths stay visible before the kitchen goes live.
                        </p>
                    </div>
                    <span className={`mch-status-pill${launchReadyPercent === 100 ? "" : " pending"}`}>
                        {launchReadyPercent === 100 ? "Ready to operate" : `${launchReadyPercent}% setup`}
                    </span>
                </div>
                <div className="mch-transparency-grid">
                    <div className="mch-transparency-card">
                        <div className="mch-transparency-label">Per-order fee logic</div>
                        <div className="mch-fee-row"><span>Food revenue</span><strong>${weeklyRevenue.toFixed(2)}</strong></div>
                        <div className="mch-fee-row"><span>TrueServe rate</span><strong>{commissionRate.toFixed(1)}%</strong></div>
                        <div className="mch-fee-row"><span>Estimated deduction</span><strong>${trueServeFee.toFixed(2)}</strong></div>
                        <p>No hidden deductions: every order should reconcile against this model.</p>
                    </div>
                    <div className="mch-transparency-card">
                        <div className="mch-transparency-label">Onboarding tracker</div>
                        <div className="mch-transparency-value">{launchDoneCount}/{launchReadyItems.length}</div>
                        <p>Menu, payout, hours, POS, customer follow-up, photo, and visibility checks.</p>
                        <div className="mch-progress-track"><div className="mch-progress-fill" style={{ width: `${launchReadyPercent}%` }} /></div>
                    </div>
                    <div className="mch-transparency-card">
                        <div className="mch-transparency-label">POS connection</div>
                        <div className="mch-transparency-value">{posStatus}</div>
                        <p>{posName}. Keep this connected so menu and order handoffs stay reliable.</p>
                        <Link className="mch-transparency-link" href="/merchant/dashboard/integrations">Manage POS <ArrowRight size={13} /></Link>
                    </div>
                    <div className="mch-transparency-card">
                        <div className="mch-transparency-label">Weekly earnings + disputes</div>
                        <div className="mch-transparency-value">${weeklyRevenue.toFixed(0)}</div>
                        <p>{weeklyOrders.length} orders this week. {disputeCount} dispute or refund item{disputeCount === 1 ? "" : "s"} flagged.</p>
                        <Link className="mch-transparency-link" href="/merchant/dashboard/billing">View billing <ArrowRight size={13} /></Link>
                    </div>
                </div>
            </section>

            {/* KPI CARDS */}
            <div className="mch-stat-grid">
                <div className="mch-stat-card">
                    <div className="mch-stat-label">
                        <div className="mch-stat-icon"><Package size={12} aria-hidden="true" /></div>
                        Incoming Orders
                    </div>
                    <div className="mch-stat-value">{pendingOrders.length}</div>
                </div>
                <div className="mch-stat-card">
                    <div className="mch-stat-label">
                        <div className="mch-stat-icon"><UtensilsCrossed size={12} aria-hidden="true" /></div>
                        Menu Items
                    </div>
                    <div className="mch-stat-value">{(restaurant.menuItems || []).length}</div>
                </div>
                <div className="mch-stat-card">
                    <div className="mch-stat-label">
                        <div className="mch-stat-icon"><DollarSign size={12} aria-hidden="true" /></div>
                        Net Revenue
                    </div>
                    <div className="mch-stat-value">${netRevenue.toFixed(2)}</div>
                </div>
            </div>

            {/* REVENUE SPARKLINE */}
            <RevenueSparkline orders={restaurant.orders || []} />

            <GrowthConsultant
                restaurantName={restaurant.name}
                orders={restaurant.orders || []}
                menuItems={restaurant.menuItems || []}
            />

            {/* STRIPE BANNER */}
            {stripeConnectState === "setup_required" && (
                <div style={{ marginBottom: 14, border: "1px solid rgba(249,115,22,0.28)", background: "rgba(249,115,22,0.08)", borderRadius: 10, padding: "13px 15px", color: "#f5c7a6", fontSize: 12, lineHeight: 1.55 }}>
                    <strong style={{ color: "#f97316" }}>TrueServe needs Stripe Connect enabled first.</strong>{" "}
                    The button is reaching Stripe, but Stripe will not create merchant payout accounts until the TrueServe Stripe dashboard is enrolled in Connect at dashboard.stripe.com/connect.
                </div>
            )}
            {stripeConnectState === "error" && (
                <div style={{ marginBottom: 14, border: "1px solid rgba(239,68,68,0.28)", background: "rgba(239,68,68,0.08)", borderRadius: 10, padding: "13px 15px", color: "#fecaca", fontSize: 12, lineHeight: 1.55 }}>
                    <strong style={{ color: "#f87171" }}>Stripe connection failed.</strong>{" "}
                    Please try again or contact TrueServe support before taking live orders.
                </div>
            )}
            <div className={`mch-stripe-banner${hasStripe ? ' connected' : hasStripeAccount ? ' pending' : ''}`}>
                <div className="mch-stripe-left">
                    <div className={`mch-stripe-icon${hasStripe ? ' connected' : hasStripeAccount ? ' pending' : ''}`}>
                        {hasStripe ? <CheckCircle2 size={19} /> : <CreditCard size={19} />}
                    </div>
                    <div>
                        <span className="mch-stripe-title">
                            {hasStripe ? 'Stripe connected' : hasStripeAccount ? 'Finish Stripe setup' : 'Connect Stripe'}
                        </span>
                        <span className="mch-stripe-sub">
                            {hasStripe
                                ? 'Payouts are active. Funds deposit to the restaurant bank account on Stripe’s schedule.'
                                : hasStripeAccount
                                    ? 'Stripe started the account, but onboarding is not complete yet. Continue setup to activate payouts.'
                                    : 'Connect Stripe so payouts can go directly to the restaurant bank account.'}
                        </span>
                    </div>
                </div>
                {!hasStripe ? (
                    <form action={createStripeAccount}>
                        <button type="submit" className="mch-stripe-connect-btn">
                            {hasStripeAccount ? "Continue setup" : "Connect"}
                            <ArrowRight size={15} />
                        </button>
                    </form>
                ) : (
                    <span className="mch-stripe-connected-badge"><CheckCircle2 size={15} /> Payouts active</span>
                )}
            </div>

            <div style={{
                marginBottom: 14,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.035)",
                borderRadius: 10,
                padding: "13px 15px",
                display: "grid",
                gap: 6,
            }}>
                <div style={{ fontSize: 10, color: "#f97316", fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase" }}>
                    Launch support
                </div>
                <div style={{ color: "rgba(255,255,255,.72)", fontSize: 12, lineHeight: 1.55 }}>
                    Need help with Stripe, Toast, menu setup, or a test order? Keep this portal open during onboarding and TrueServe can walk the restaurant through each step before going live.
                </div>
            </div>

            {/* LIVE ORDERS */}
            <LiveOrdersPanel
                restaurantId={restaurant.id}
                initialOrders={pendingOrders}
            />

            {/* QUICK SETUP */}
            <div className="mch-section-head">Quick Setup</div>
            <div className="mch-tab-row">
                <Link href="/merchant/dashboard/integrations" className="mch-tab-pill mch-tab-active">POS + API</Link>
                <Link href="/merchant/dashboard/compliance" className="mch-tab-pill">Compliance</Link>
                <Link href="/merchant/dashboard/storefront" className="mch-tab-pill">Storefront</Link>
            </div>

            {/* OPERATIONS PANELS */}
            <div className="mch-two-col">
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

            {/* COVER PHOTO */}
            <CoverPhotoPanel
                restaurantId={restaurant.id}
                currentImageUrl={restaurant.imageUrl ?? null}
                restaurantName={restaurant.name}
            />

            {/* HOURS */}
            <HoursPanel
                restaurantId={restaurant.id}
                openTime={restaurant.openTime ?? null}
                closeTime={restaurant.closeTime ?? null}
            />

            {/* GHL */}
            <GHLSettingsPanel
                restaurantId={restaurant.id}
                initialGhlUrl={restaurant.ghlUrl}
            />

            {/* AI AUTOPILOT + BUSY ZONES */}
            <div className="mch-four-col">
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
        </>
    );
}
