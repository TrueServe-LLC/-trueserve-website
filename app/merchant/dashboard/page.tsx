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
        <div className="space-y-12 animate-fade-in">
             <WelcomeModal restaurantName={restaurant.name} />
             {restaurant.id !== "preview" && <MerchantRealtime restaurantId={restaurant.id} />}

             <div className="flex flex-col gap-10">
                {/* HUD HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-10 border-b border-[#1e2c3a]">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                             <div className="w-2.5 h-2.5 rounded-full bg-[#e8a020] shadow-[0_0_12px_#e8a020]"></div>
                             <h1 className="text-[44px] md:text-[54px] font-['Barlow_Condensed',sans-serif] font-black italic text-white uppercase tracking-tight leading-none">Mission Control</h1>
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#3a5060] italic">// Sector: {restaurant.name} · Operational Hub</p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="px-6 py-4 bg-[#10151e] border border-[#1e2c3a] rounded-2xl flex items-center gap-4 hover:border-[#e8a020]/40 transition-all cursor-pointer group shadow-lg">
                             <div className={`w-2.5 h-2.5 rounded-full ${restaurant.isBusy ? 'bg-red-500 shadow-[0_0_12px_#ef4444]' : 'bg-[#22c55e] shadow-[0_0_12px_#10b981]'} animate-pulse`}></div>
                             <span className="text-[11px] font-black uppercase tracking-widest text-white italic group-hover:text-[#e8a020] transition-colors">
                                {restaurant.isBusy ? "Protocol: Paused" : "Status: Online"}
                             </span>
                        </div>
                        <Link href="/merchant/dashboard/terminal" className="px-8 py-4 bg-[#e8a020] text-[#0a0d12] rounded-xl text-[12px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(232,160,32,0.3)] italic no-underline">
                             Launch Live Terminal
                        </Link>
                    </div>
                </div>

                {/* TACTICAL STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatBlock label="Incoming Mission Segments" value={pendingOrders.length} suffix="Active" />
                    
                    <Link href="/merchant/dashboard/menu" className="block group no-underline">
                        <div className="bg-[#10151e] border border-[#1e2c3a] rounded-[24px] p-8 md:p-10 hover:bg-[#161d2a] hover:border-[#e8a020]/40 transition-all h-full relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 p-8 text-5xl opacity-[0.03] font-['Barlow_Condensed',sans-serif] font-black italic select-none">ASSETS</div>
                            <div className="text-[10px] font-black text-[#3a5060] uppercase tracking-[0.4em] mb-7 italic group-hover:text-[#e8a020] transition-colors">// Stockpiled Assets</div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-[54px] font-['Barlow_Condensed',sans-serif] font-black italic text-white tracking-tight leading-none">{(restaurant.menuItems || []).length}</span>
                                <span className="text-[11px] font-black text-[#3a5060] uppercase italic">Registered SKU</span>
                            </div>
                            <div className="mt-5 text-[9px] font-black text-[#e8a020] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">Configure catalog ↗</div>
                        </div>
                    </Link>

                    <StatBlock label="Accumulated Yield" value={`$${netRevenue.toFixed(2)}`} isGold />
                </div>

                {/* STRIPE HANDSHAKE BANNER */}
                <div className={`relative overflow-hidden rounded-[2.5rem] border p-10 flex flex-col lg:flex-row justify-between items-center gap-10 shadow-2xl ${hasStripe ? 'bg-[#22c55e]/5 border-[#22c55e]/20' : 'bg-[#e8a020]/5 border-[#e8a020]/20'}`}>
                    <div className="flex items-center gap-10">
                        <div className={`w-[72px] h-[72px] rounded-2xl flex items-center justify-center border-2 ${hasStripe ? 'bg-[#22c55e]/10 border-[#22c55e]/30' : 'bg-[#e8a020]/10 border-[#e8a020]/30'}`}>
                             <span className="text-4xl">{hasStripe ? '💰' : '⛓️'}</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-['Barlow_Condensed',sans-serif] italic text-3xl uppercase tracking-widest text-white leading-none">
                                {hasStripe ? "Financial Pipeline: Synchronized" : "Stripe Handshake Required"}
                            </h3>
                            <p className="text-[13px] italic text-[#7a90a8] font-bold max-w-lg leading-relaxed">
                                {hasStripe 
                                    ? "Your payout node is verified. Financial settlement is occurring on a 24-hour rolling cycle with zero extraction leaks." 
                                    : "Establish a secure connection to Stripe to authorize automatic yield distribution to your business bank node."}
                            </p>
                        </div>
                    </div>
                    {hasStripe ? (
                        <div className="px-8 py-3 bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] font-black text-[11px] uppercase tracking-widest rounded-full italic shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                             ✓ Payouts Active
                        </div>
                    ) : (
                        <form action={createStripeAccount}>
                            <button type="submit" className="px-12 py-5 bg-[#e8a020] text-[#0a0d12] font-black uppercase text-[12px] tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_4px_24px_rgba(232,160,32,0.3)] italic">
                                Initialize Payout Node →
                            </button>
                        </form>
                    )}
                </div>

                {/* SECONDARY COMMAND MODULES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
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

                <div className="bg-[#10151e] border border-[#1e2c3a] rounded-[2rem] p-1 shadow-inner">
                    <GHLSettingsPanel 
                        restaurantId={restaurant.id} 
                        initialGhlUrl={restaurant.ghlUrl} 
                    />
                </div>

                {/* TERTIARY LOGISTICS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-1 h-full">
                        <AutoPilotPanel
                            restaurantId={restaurant.id}
                            autoPilotEnabled={restaurant.autoPilotEnabled ?? true}
                            capacityThreshold={restaurant.capacityThreshold ?? 10}
                        />
                    </div>
                    <div className="lg:col-span-2 h-full">
                         <BusyZonesPanel
                            restaurantId={restaurant.id}
                            schedules={restaurant.schedules || []}
                        />
                    </div>
                </div>

                <div className="pt-8 border-t border-[#1e2c3a]">
                    <IssuesPanel pendingCount={pendingOrders.length} />
                </div>
             </div>
        </div>
    );
}

function StatBlock({ label, value, suffix, isGold }: { label: string, value: any, suffix?: string, isGold?: boolean }) {
    return (
        <div className="bg-[#10151e] border border-[#1e2c3a] rounded-[24px] p-8 md:p-10 hover:bg-[#161d2a] hover:border-[#e8a020]/20 transition-all relative overflow-hidden group shadow-lg">
            <div className="text-[10px] font-black text-[#3a5060] uppercase tracking-[0.4em] mb-7 italic transition-colors group-hover:text-[#e8a020]">// {label}</div>
            <div className="flex items-baseline gap-4">
                <span className={`text-[54px] font-['Barlow_Condensed',sans-serif] font-black italic tracking-tight leading-none ${isGold ? 'text-[#e8a020] drop-shadow-[0_0_12px_rgba(232,160,32,0.3)]' : 'text-white'}`}>{value}</span>
                {suffix && <span className="text-[11px] font-black text-[#3a5060] uppercase italic">{suffix}</span>}
            </div>
            <div className="absolute top-0 right-0 p-8 text-5xl opacity-[0.02] font-['Barlow_Condensed',sans-serif] font-black italic select-none">DATA</div>
        </div>
    );
}

