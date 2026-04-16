import { createClient } from "@/lib/supabase/server";
import { getAuthSession } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import MerchantRealtime from "@/components/MerchantRealtime";
import WelcomeModal from "./WelcomeModal";
import { createStripeAccount } from "../actions";
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
        const { data: restaurants, error } = await supabase
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
            redirect("/merchant/signup");
        }

        restaurant = restaurants[0];
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
            <style>{`
                .mch-stat-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-bottom: 14px;
                }
                .mch-stat-card {
                    background: #1a1a1a;
                    border: 0.5px solid #2a2a2a;
                    border-radius: 10px;
                    padding: 14px;
                }
                .mch-stat-label {
                    font-size: 11px;
                    color: #888;
                    margin-bottom: 7px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .mch-stat-icon {
                    width: 18px; height: 18px;
                    border-radius: 4px;
                    background: #252525;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 11px;
                }
                .mch-stat-value {
                    font-size: 27px;
                    font-weight: 600;
                    color: #fff;
                    letter-spacing: -0.5px;
                }
                .mch-stripe-banner {
                    background: #1a1a1a;
                    border: 0.5px solid #2a2a2a;
                    border-radius: 10px;
                    padding: 13px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 14px;
                    gap: 12px;
                }
                .mch-stripe-banner.connected {
                    border-color: #1e3a2a;
                    background: #111a14;
                }
                .mch-stripe-left { display: flex; align-items: center; gap: 10px; }
                .mch-stripe-icon {
                    width: 22px; height: 15px;
                    border-radius: 3px;
                    background: #635bff;
                    flex-shrink: 0;
                }
                .mch-stripe-icon.connected { background: #1e3a2a; }
                .mch-stripe-title {
                    display: block;
                    color: #fff;
                    font-weight: 500;
                    font-size: 12px;
                    margin-bottom: 2px;
                }
                .mch-stripe-sub { font-size: 11px; color: #666; }
                .mch-stripe-connect-btn {
                    background: #f97316;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 7px 16px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    white-space: nowrap;
                    flex-shrink: 0;
                    transition: background 0.15s;
                }
                .mch-stripe-connect-btn:hover { background: #ea6c10; }
                .mch-stripe-connected-badge {
                    font-size: 11px;
                    color: #4dca80;
                    font-weight: 600;
                    white-space: nowrap;
                }
                .mch-section-head {
                    font-size: 10px;
                    font-weight: 600;
                    color: #666;
                    letter-spacing: 0.07em;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                }
                .mch-tab-row { display: flex; gap: 6px; margin-bottom: 14px; }
                .mch-tab-pill {
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    text-decoration: none;
                    border: 1px solid #333;
                    color: #777;
                    transition: all 0.15s;
                }
                .mch-tab-pill:hover { color: #bbb; border-color: #555; }
                .mch-tab-pill.mch-tab-active {
                    background: #f97316;
                    color: #fff;
                    border-color: #f97316;
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
                @media (max-width: 900px) {
                    .mch-stat-grid { grid-template-columns: 1fr 1fr; }
                    .mch-two-col, .mch-four-col { grid-template-columns: 1fr; }
                }
            `}</style>

            <WelcomeModal restaurantName={restaurant.name} />
            {restaurant.id !== "preview" && <MerchantRealtime restaurantId={restaurant.id} />}

            {/* KPI CARDS */}
            <div className="mch-stat-grid">
                <div className="mch-stat-card">
                    <div className="mch-stat-label">
                        <div className="mch-stat-icon">📦</div>
                        Incoming Orders
                    </div>
                    <div className="mch-stat-value">{pendingOrders.length}</div>
                </div>
                <div className="mch-stat-card">
                    <div className="mch-stat-label">
                        <div className="mch-stat-icon">🍽️</div>
                        Menu Items
                    </div>
                    <div className="mch-stat-value">{(restaurant.menuItems || []).length}</div>
                </div>
                <div className="mch-stat-card">
                    <div className="mch-stat-label">
                        <div className="mch-stat-icon">💵</div>
                        Net Revenue
                    </div>
                    <div className="mch-stat-value">${netRevenue.toFixed(2)}</div>
                </div>
            </div>

            {/* STRIPE BANNER */}
            <div className={`mch-stripe-banner${hasStripe ? ' connected' : ''}`}>
                <div className="mch-stripe-left">
                    <div className={`mch-stripe-icon${hasStripe ? ' connected' : ''}`} />
                    <div>
                        <span className="mch-stripe-title">
                            {hasStripe ? '✓ Stripe Connected' : 'Connect Stripe'}
                        </span>
                        <span className="mch-stripe-sub">
                            {hasStripe
                                ? 'Your payouts are active. Funds are deposited on a rolling basis.'
                                : 'To start receiving payouts, connect your Stripe account.'}
                        </span>
                    </div>
                </div>
                {!hasStripe ? (
                    <form action={createStripeAccount}>
                        <button type="submit" className="mch-stripe-connect-btn">Connect →</button>
                    </form>
                ) : (
                    <span className="mch-stripe-connected-badge">✓ Payouts Active</span>
                )}
            </div>

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
