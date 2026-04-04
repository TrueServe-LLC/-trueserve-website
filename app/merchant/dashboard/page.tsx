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
import GHLSettingsPanel from "@/app/merchant/dashboard/GHLSettingsPanel";

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
        <div className="min-h-screen bg-[#0c0e13]">
             <WelcomeModal restaurantName={restaurant.name} />
             {restaurant.id !== "preview" && <MerchantRealtime restaurantId={restaurant.id} />}

             <div className="md-body min-h-screen">
                {/* PAGE HEADER */}
                <div className="md-page-hd">
                    <div>
                        <div className="md-page-title">Orders Dashboard</div>
                        <div className="md-page-sub">Operational Control · {restaurant.name}</div>
                    </div>
                    <div className="md-hd-right">
                        <div className="md-terminal-btn hidden sm:flex">
                            <span className="md-terminal-dot"></span>
                            Kitchen Terminal
                        </div>
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
                                <div className="md-stripe-desc hidden md:block">To start receiving payouts for your orders, you need to connect your Stripe account.</div>
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
                                <div className="md-stripe-desc hidden md:block">Your payouts are active. Funds are deposited on a rolling basis.</div>
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

                <GHLSettingsPanel 
                    restaurantId={restaurant.id} 
                    initialGhlUrl={restaurant.ghlUrl} 
                />

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
