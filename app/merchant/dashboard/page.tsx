import { createClient } from "@/lib/supabase/server";
import { getAuthSession } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import MerchantRealtime from "@/components/MerchantRealtime";
import WelcomeModal from "./WelcomeModal";
import { createStripeAccount } from "../actions";
import { logout } from "@/app/auth/actions";
import PrepTimingPanel from "@/app/merchant/dashboard/PrepTimingPanel";
import TerminalStatusPanel from "@/app/merchant/dashboard/TerminalStatusPanel";
import AutoPilotPanel from "@/app/merchant/dashboard/AutoPilotPanel";
import BusyZonesPanel from "@/app/merchant/dashboard/BusyZonesPanel";
import IssuesPanel from "@/app/merchant/dashboard/IssuesPanel";
import GHLSettingsPanel from "@/app/merchant/dashboard/GHLSettingsPanel";

export const dynamic = "force-dynamic";

export default async function MerchantDashboard({
    searchParams,
}: {
    searchParams?: Promise<{ mode?: string; stripe_connect?: string }>;
}) {
    const params = searchParams ? await searchParams : undefined;
    const activeMode = params?.mode === "pickup" ? "pickup" : "delivery";
    const stripeConnectError = params?.stripe_connect === "error";
    const stripeSetupRequired = params?.stripe_connect === "setup_required";
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
            redirect("/merchant/signup");
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
        <div className="min-h-screen bg-[#0c0e13]">
             <WelcomeModal restaurantName={restaurant.name} />
             {restaurant.id !== "preview" && <MerchantRealtime restaurantId={restaurant.id} />}

             <div className="md-body min-h-screen">
                {/* PAGE HEADER */}
                <div className="md-page-hd">
                    <div>
                        <div className="md-page-title">Merchant Dashboard</div>
                        <div className="md-page-sub">
                            {activeMode === "pickup" ? "Pickup Operations" : "Delivery Operations"} · {restaurant.name}
                        </div>
                    </div>
                    <div className="md-hd-right flex-wrap">
                        <div className="md-terminal-btn">
                            <span className="md-terminal-dot"></span>
                            Kitchen Terminal
                        </div>
                        <div className="md-online-badge">{activeMode === "pickup" ? "Pickup Mode" : "Delivery Mode"}</div>
                        <div className="md-online-badge" style={restaurant.isBusy ? { background: "#e24b4a" } : {}}>
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
                {stripeConnectError && !hasStripe && (
                    <div className="md-stripe-banner" style={{ borderColor: "#4a1a1a", background: "#1a0d10" }}>
                        <div className="md-stripe-left">
                            <div className="md-stripe-icon" style={{ borderColor: "#4a1a1a", background: "#2a0d12" }}>
                                <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                                    <rect x="1" y="1" width="18" height="12" rx="1" stroke="#f87171" strokeWidth="1.3"/>
                                    <path d="M1 5h18" stroke="#f87171" strokeWidth="1.3"/>
                                </svg>
                            </div>
                            <div>
                                <div className="md-stripe-title" style={{ fontStyle: "normal" }}>Stripe onboarding couldn’t start.</div>
                                <div className="md-stripe-desc">We logged the issue. Please try again in a moment, or contact support if it keeps happening.</div>
                            </div>
                        </div>
                    </div>
                )}
                {stripeSetupRequired && !hasStripe && (
                    <div className="md-stripe-banner" style={{ borderColor: "#57400f", background: "#1c1508" }}>
                        <div className="md-stripe-left">
                            <div className="md-stripe-icon" style={{ borderColor: "#6b4e16", background: "#2b1f0a" }}>
                                <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                                    <rect x="1" y="1" width="18" height="12" rx="1" stroke="#f1b243" strokeWidth="1.3"/>
                                    <path d="M1 5h18" stroke="#f1b243" strokeWidth="1.3"/>
                                </svg>
                            </div>
                            <div>
                                <div className="md-stripe-title" style={{ fontStyle: "normal" }}>Stripe Connect setup is still required.</div>
                                <div className="md-stripe-desc">Enable Connect in your Stripe account first, then retry onboarding from this button.</div>
                            </div>
                        </div>
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

                <GHLSettingsPanel 
                    restaurantId={restaurant.id} 
                    initialGhlUrl={restaurant.ghlUrl} 
                />

                <div className="md-two-col">
                    <div className="md-stat-block">
                        <div className="md-stat-name">Merchant Integration Hub</div>
                        <p style={{ color: "var(--t2)", fontSize: "13px", lineHeight: 1.6, marginBottom: "14px" }}>
                            Keep POS, compliance, Stripe, and storefront setup in one clear place.
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <Link href="/merchant/dashboard/integrations" className="btn btn-gold justify-center">POS + API</Link>
                            <Link href="/merchant/dashboard/compliance" className="btn btn-gold justify-center">Compliance</Link>
                            <Link href="/merchant/dashboard/storefront" className="btn btn-ghost justify-center">Storefront</Link>
                            <button className="btn btn-ghost justify-center" type="button">{hasStripe ? "Stripe Connected" : "Connect Stripe"}</button>
                        </div>
                    </div>
                    <div className="md-stat-block">
                        <div className="md-stat-name">Operations Assistant</div>
                        <p style={{ color: "var(--t2)", fontSize: "13px", lineHeight: 1.6, marginBottom: "14px" }}>
                            Guided onboarding, tutorial prompts, and support are always available from the portal header.
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <button className="btn btn-ghost justify-center" type="button">Tutorials On</button>
                            <button className="btn btn-ghost justify-center" type="button">Support Ready</button>
                        </div>
                    </div>
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
        </div>
    );
}
