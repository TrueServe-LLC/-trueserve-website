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
import MerchantDashboardWrapper from "./MerchantDashboardWrapper";

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

        // For now, use the first restaurant (primary location)
        // TODO: Add restaurant selector if multiple locations
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
             <WelcomeModal restaurantName={restaurant.name} />
             {restaurant.id !== "preview" && <MerchantRealtime restaurantId={restaurant.id} />}

             <MerchantDashboardWrapper restaurantName={restaurant.name}>
                {/* KPI CARDS */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-[#10131b] border border-white/10 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">📦</span>
                            <p className="text-sm text-white/60 font-semibold">Incoming Orders</p>
                        </div>
                        <p className="text-4xl font-black text-white">{pendingOrders.length}</p>
                    </div>

                    <div className="bg-[#10131b] border border-white/10 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🍽️</span>
                            <p className="text-sm text-white/60 font-semibold">Menu Items</p>
                        </div>
                        <p className="text-4xl font-black text-white">{(restaurant.menuItems || []).length}</p>
                    </div>

                    <div className="bg-[#10131b] border border-white/10 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">💵</span>
                            <p className="text-sm text-white/60 font-semibold">Net Revenue</p>
                        </div>
                        <p className="text-4xl font-black text-white">${netRevenue.toFixed(2)}</p>
                    </div>
                </div>

                {/* STRIPE STATUS CARD */}
                <div className="bg-[#10131b] border border-white/10 rounded-lg p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            {!hasStripe && (
                                <>
                                    <h3 className="text-lg font-bold text-white mb-2">💳 Connect Stripe</h3>
                                    <p className="text-sm text-white/60">To start receiving payouts for your orders, connect your Stripe account.</p>
                                </>
                            )}
                            {hasStripe && (
                                <>
                                    <h3 className="text-lg font-bold text-white mb-2">✓ Stripe Connected</h3>
                                    <p className="text-sm text-white/60">Your payouts are active. Funds are deposited on a rolling basis.</p>
                                </>
                            )}
                        </div>
                        {!hasStripe && (
                            <form action={createStripeAccount}>
                                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg transition">
                                    Connect →
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* OPERATIONS CARDS */}
                <div className="space-y-8">
                    {/* QUICK ACTIONS */}
                    <div className="bg-[#10131b] border border-white/10 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-white mb-6">⚙️ Quick Setup</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/merchant/dashboard/integrations" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition text-center">
                                POS + API
                            </Link>
                            <Link href="/merchant/dashboard/compliance" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition text-center">
                                Compliance
                            </Link>
                            <Link href="/merchant/dashboard/storefront" className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition text-center">
                                Storefront
                            </Link>
                            <button className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition" type="button">
                                {hasStripe ? "Stripe ✓" : "Stripe"}
                            </button>
                        </div>
                    </div>

                    {/* OPERATIONS PANELS */}
                    <div className="grid grid-cols-2 gap-6">
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
                    <div className="grid grid-cols-2 gap-6">
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
                </div>

                {/* ISSUES TOAST */}
                <IssuesPanel pendingCount={pendingOrders.length} />
             </MerchantDashboardWrapper>
        </>
    );
}
