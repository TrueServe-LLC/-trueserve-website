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
        <div className="space-y-10 animate-fade-in">
             <WelcomeModal restaurantName={restaurant.name} />
             {restaurant.id !== "preview" && <MerchantRealtime restaurantId={restaurant.id} />}

             <div className="flex flex-col gap-10">
                {/* HUD HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-white/5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-[#e8a230] shadow-glow"></div>
                             <h1 className="text-4xl md:text-5xl font-bebas italic text-white uppercase tracking-tight">Mission Control</h1>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">// Sector: {restaurant.name} · Operational Hub</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="px-6 py-3 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-4 hover:border-[#e8a230]/30 transition-all cursor-pointer group">
                             <div className={`w-2 h-2 rounded-full ${restaurant.isBusy ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-[#3dd68c] shadow-[0_0_10px_#10b981]'} animate-pulse`}></div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-white italic group-hover:text-[#e8a230]">
                                {restaurant.isBusy ? "Protocol: Paused" : "Status: Online"}
                             </span>
                        </div>
                        <Link href="/merchant/dashboard/terminal" className="px-6 py-3 bg-[#e8a230] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-glow shadow-[#e8a230]/10 italic">
                             Launch Live Terminal
                        </Link>
                    </div>
                </div>

                {/* TACTICAL STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatBlock label="Incoming Mission Segments" value={pendingOrders.length} suffix="Active" />
                    
                    <Link href="/merchant/dashboard/menu" className="block group">
                        <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 hover:bg-white/[0.04] hover:border-[#e8a230]/30 transition-all h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-5xl opacity-[0.02] font-bebas italic select-none">ASSETS</div>
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 italic group-hover:text-[#e8a230] transition-colors">// Stockpiled Assets</div>
                            <div className="flex items-baseline gap-3">
                                <span className="text-5xl font-bebas italic text-white tracking-tight">{(restaurant.menuItems || []).length}</span>
                                <span className="text-[10px] font-black text-slate-700 uppercase italic">Registered SKU</span>
                            </div>
                            <div className="mt-4 text-[8px] font-black text-[#e8a230] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Configure catalog ↗</div>
                        </div>
                    </Link>

                    <StatBlock label="Accumulated Yield" value={`$${netRevenue.toFixed(2)}`} isGold />
                </div>

                {/* STRIPE HANDSHAKE BANNER */}
                <div className={`relative overflow-hidden rounded-[2.5rem] border p-8 flex flex-col lg:flex-row justify-between items-center gap-8 ${hasStripe ? 'bg-[#3dd68c]/5 border-[#3dd68c]/20' : 'bg-[#e8a230]/5 border-[#e8a230]/20'}`}>
                    <div className="flex items-center gap-8">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${hasStripe ? 'bg-[#3dd68c]/10 border-[#3dd68c]/30' : 'bg-[#e8a230]/10 border-[#e8a230]/30'}`}>
                             <span className="text-3xl">{hasStripe ? '💰' : '⛓️'}</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bebas italic text-2xl uppercase tracking-widest text-white">
                                {hasStripe ? "Financial Pipeline: Synchronized" : "Stripe Handshake Required"}
                            </h3>
                            <p className="text-xs italic text-slate-500 font-medium max-w-lg">
                                {hasStripe 
                                    ? "Your payout node is verified. Financial settlement is occurring on a 24-hour rolling cycle." 
                                    : "Establish a secure connection to Stripe to authorize automatic yield distribution to your business bank."}
                            </p>
                        </div>
                    </div>
                    {hasStripe ? (
                        <div className="px-6 py-2 bg-[#3dd68c]/10 border border-[#3dd68c]/30 text-[#3dd68c] font-black text-[9px] uppercase tracking-widest rounded-full italic">
                             ✓ Payouts Active
                        </div>
                    ) : (
                        <form action={createStripeAccount}>
                            <button type="submit" className="px-10 py-5 bg-[#e8a230] text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:scale-105 transition-all shadow-glow shadow-[#e8a230]/10 italic">
                                Initialize Payout Node →
                            </button>
                        </form>
                    )}
                </div>

                {/* SECONDARY COMMAND MODULES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

                {/* TERTIARY LOGISTICS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <AutoPilotPanel
                            restaurantId={restaurant.id}
                            autoPilotEnabled={restaurant.autoPilotEnabled ?? true}
                            capacityThreshold={restaurant.capacityThreshold ?? 10}
                        />
                    </div>
                    <div className="lg:col-span-2">
                         <BusyZonesPanel
                            restaurantId={restaurant.id}
                            schedules={restaurant.schedules || []}
                        />
                    </div>
                </div>

                <IssuesPanel pendingCount={pendingOrders.length} />
             </div>
        </div>
    );
}

function StatBlock({ label, value, suffix, isGold }: { label: string, value: any, suffix?: string, isGold?: boolean }) {
    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 hover:bg-white/[0.04] transition-all relative overflow-hidden group">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 italic transition-colors group-hover:text-white">// {label}</div>
            <div className="flex items-baseline gap-3">
                <span className={`text-5xl font-bebas italic tracking-tight ${isGold ? 'text-[#e8a230] shadow-glow' : 'text-white'}`}>{value}</span>
                {suffix && <span className="text-[10px] font-black text-slate-700 uppercase italic">{suffix}</span>}
            </div>
            <div className="absolute top-0 right-0 p-8 text-5xl opacity-[0.01] font-bebas italic select-none">DATA</div>
        </div>
    );
}

