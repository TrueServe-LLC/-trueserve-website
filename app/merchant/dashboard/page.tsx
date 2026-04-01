import { createClient } from "@/lib/supabase/server";
import { getAuthSession } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import MerchantRealtime from "@/components/MerchantRealtime";
import WelcomeModal from "./WelcomeModal";
import LogoutButton from "@/components/LogoutButton";
import { toggleBusyMode, updateOrderStatus, createStripeAccount } from "../actions";
import MorningBriefing from "./MorningBriefing";
import OperationalSettings from "./OperationalSettings";
import SmartOperations from "./SmartOperations";
import MenuArchitect from "./MenuArchitect";
import MerchantAnalytics from "./MerchantAnalytics";
import CustomerPulse from "./CustomerPulse";
import DriverPerformance from "./DriverPerformance";
import InventoryManager from "./InventoryManager";
import MerchantRejectButton from "./MerchantRejectButton";
import MenuScanner from "./MenuScanner";
import AddItemForm from "./AddItemForm";
import MenuRow from "./MenuRow";
import EmbedManager from "./EmbedManager";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function MerchantDashboard() {
    const { isAuth, userId } = await getAuthSession();
    if (!isAuth || !userId) {
        redirect("/login?role=merchant");
    }

    const supabase = await createClient();

    // Fetch Restaurant with all relations
    const { data: restaurant, error } = await supabase
        .from("Restaurant")
        .select(`
            *,
            menuItems:MenuItem(*),
            orders:Order(*, user:User(*)),
            schedules:MerchantSchedule(*)
        `)
        .eq("ownerId", userId)
        .single();

    if (error || !restaurant) {
        console.error("Dashboard Fetch Error:", error);
        redirect("/merchant-signup");
    }

    const pendingOrders = (restaurant.orders || [])
        .filter((o: any) => ["PENDING", "PREPARING", "READY_FOR_PICKUP"].includes(o.status))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalRevenue = (restaurant.orders || [])
        .filter((o: any) => o.status === "DELIVERED" || o.status === "COMPLETED")
        .reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30 font-sans">
            <MerchantRealtime restaurantId={restaurant.id} />
            <WelcomeModal restaurantName={restaurant.name} />

            {/* Standardized Replit-Style Top-Nav */}
            <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-black/60 border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Logo size="md" />
                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                    <nav className="flex items-center gap-1 font-sans">
                        <Link href="/restaurants" className="nav-link px-6">🍴 Order Food</Link>
                        <Link href="/merchant/dashboard" className="nav-link px-6 text-primary bg-primary/5 rounded-full">📊 Dashboard</Link>
                        <Link href="/merchant" className="nav-link px-6 text-slate-400">🏢 Partner Hub</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-8">
                    <LogoutButton />
                </div>
            </nav>

            <main className="container py-12 md:py-24 px-4 md:px-8 pb-40">
                {/* Header Title Stack */}
                <div className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto px-2">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-3xl shadow-xl">📊</div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight">
                                Orders Dashboard
                            </h1>
                            <p className="text-slate-500 text-xs md:text-sm font-black uppercase tracking-widest mt-1">
                                Manage and track incoming operational links for {restaurant.name}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Link 
                            href="/merchant/terminal" 
                            className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 group"
                        >
                            <span className="text-sm group-hover:scale-110 transition-transform">🍳</span>
                            Open Kitchen Terminal
                        </Link>
                         <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${restaurant.plan === 'Pro Subscription'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                            : 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-sm'
                            }`}>
                            {restaurant.plan === 'Pro Subscription' ? 'Pro Scale Activated' : 'Flex Scale Active'}
                        </span>
                        <form action={async () => {
                            "use server";
                            await toggleBusyMode(restaurant.id, restaurant.isBusy);
                        }}>
                            <button className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap shadow-xl ${restaurant.isBusy ? 'bg-red-600 text-white border-red-500 shadow-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'}`}>
                                {restaurant.isBusy ? 'System Paused' : 'Terminal Online'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Main Content Enclosure */}
                <div className="max-w-7xl mx-auto bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl space-y-24">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
                        <div className="group relative overflow-hidden bg-white/5 border border-white/5 p-6 md:p-10 rounded-2xl md:rounded-3xl hover:bg-white/10 transition-all min-h-[140px] md:min-h-[180px] flex flex-col justify-end">
                            <div className="absolute top-2 right-2 p-3 opacity-5 text-5xl md:text-7xl group-hover:scale-110 transition-transform pointer-events-none">📋</div>
                            <h3 className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-1">Incoming</h3>
                            <p className="text-4xl md:text-6xl font-black text-white">{pendingOrders.length}</p>
                        </div>
                        <div className="group relative overflow-hidden bg-white/5 border border-white/5 p-6 md:p-10 rounded-2xl md:rounded-3xl hover:bg-white/10 transition-all min-h-[140px] md:min-h-[180px] flex flex-col justify-end">
                            <div className="absolute top-2 right-2 p-3 opacity-5 text-5xl md:text-7xl group-hover:scale-110 transition-transform pointer-events-none">🍔</div>
                            <h3 className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-1">Items</h3>
                            <p className="text-4xl md:text-6xl font-black text-white">{restaurant.menuItems.length}</p>
                        </div>
                        <div className="group relative col-span-2 md:col-span-1 overflow-hidden bg-white/5 border border-white/5 p-6 md:p-10 rounded-2xl md:rounded-3xl hover:bg-white/10 transition-all min-h-[140px] md:min-h-[180px] flex flex-col justify-end">
                            <div className="absolute top-2 right-2 p-3 opacity-5 text-5xl md:text-7xl group-hover:scale-110 transition-transform pointer-events-none">💰</div>
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">Net Revenue</h3>
                                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-black uppercase tracking-widest translate-y-[-2px] shadow-sm whitespace-nowrap">Instant Payout</span>
                            </div>
                            <p className="text-4xl md:text-6xl font-black text-emerald-400">${totalRevenue.toFixed(2)}</p>
                        </div>
                    </div>

                    <MorningBriefing restaurantId={restaurant.id} />

                    {/* Stripe Connect Banner */}
                    {!restaurant.stripeAccountId && (
                        <div className="p-8 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl shadow-lg">💳</div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2 font-sans italic tracking-tight">Connect Stripe to get paid.</h2>
                                    <p className="text-slate-400 max-w-md text-sm font-medium">To start receiving payouts for your orders, you need to connect your Stripe account.</p>
                                </div>
                            </div>
                            <form action={async () => {
                                "use server";
                                await createStripeAccount();
                            }}>
                                <button className="btn bg-blue-600 hover:bg-blue-700 text-white border-none px-8 py-3 shadow-lg shadow-blue-500/20 text-xs font-black uppercase tracking-widest">
                                    Connect Stripe account
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Operational Sections List */}
                    <div className="space-y-32">
                        <OperationalSettings 
                            restaurantId={restaurant.id}
                            currentManualPrepTime={(restaurant as any).manualPrepTime}
                            avgPrepTime={(restaurant as any).avgPrepTime || 15}
                            isBusy={restaurant.isBusy}
                            busyUntil={restaurant.busyUntil}
                        />

                        <SmartOperations
                            restaurantId={restaurant.id}
                            schedules={restaurant.schedules || []}
                            autoPilotEnabled={restaurant.autoPilotEnabled || false}
                            capacityThreshold={restaurant.capacityThreshold || 10}
                        />

                        <MenuArchitect restaurantId={restaurant.id} />

                        <MerchantAnalytics 
                            orders={restaurant.orders || []} 
                            restaurantName={restaurant.name} 
                        />

                        <CustomerPulse restaurantId={restaurant.id} />

                        <DriverPerformance orders={restaurant.orders || []} />

                        <InventoryManager
                            restaurantId={restaurant.id}
                            menuItems={restaurant.menuItems || []}
                            outOfStockIngredients={restaurant.outOfStockIngredients || []}
                        />

                        <EmbedManager 
                            restaurantId={restaurant.id} 
                            restaurantName={restaurant.name}
                            slug={restaurant.slug}
                        />

                        <section>
                            <div className="flex justify-between items-end mb-10">
                                <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
                                    Incoming Orders
                                    {pendingOrders.length > 0 && <span className="bg-primary text-white text-[10px] px-3 py-1 rounded-full">{pendingOrders.length}</span>}
                                </h2>
                                <div className="flex gap-2">
                                    <button className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">History</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {pendingOrders.map((order: any) => (
                                    <div key={order.id} className="bg-black/40 border border-white/5 p-8 rounded-[2rem] border-l-4 border-l-yellow-500 hover:shadow-[0_0_40px_rgba(234,179,8,0.05)] transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{order.id.slice(-6).toUpperCase()}</span>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm whitespace-nowrap ${(order.status as any) === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                        (order.status as any) === 'PREPARING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        }`}>
                                                        {(order.status as any) === 'READY_FOR_PICKUP' ? 'PICKUP READY' : order.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <h3 className="font-black text-2xl tracking-tight">{order.user.name}</h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-3xl text-white tracking-tighter">${Number(order.total).toFixed(2)}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{new Date(order.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 items-center pt-6 border-t border-white/5">
                                            <div className="flex flex-wrap gap-2 flex-grow">
                                                {(order.status as any) === 'PENDING' ? (
                                                    <form action={async () => {
                                                        "use server";
                                                        await updateOrderStatus(order.id, 'PREPARING');
                                                    }}>
                                                        <button type="submit" className="badge-emerald px-6 py-3 text-[10px]">Accept & Start</button>
                                                    </form>
                                                ) : (
                                                    <form action={async () => {
                                                        "use server";
                                                        await updateOrderStatus(order.id, 'READY_FOR_PICKUP');
                                                    }}>
                                                        <button type="submit" className="badge-solid-primary bg-blue-600 border-none shadow-blue-500/20 px-6 py-3 text-[10px]">Mark Ready</button>
                                                    </form>
                                                )}
                                                <MerchantRejectButton orderId={order.id} />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {pendingOrders.length === 0 && (
                                    <div className="bg-black/20 border border-dashed border-white/10 rounded-[2rem] p-20 text-center">
                                        <p className="text-slate-600 font-black uppercase tracking-[0.2em] italic">No incoming orders found in active grid</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Menu Section */}
                        <section>
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Your Menu</h2>
                                <div className="flex gap-4">
                                    <MenuScanner restaurantId={restaurant.id} />
                                    <AddItemForm />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {restaurant.menuItems.map((item: any) => (
                                    <MenuRow 
                                        key={item.id} 
                                        item={item} 
                                        outOfStockIngredients={restaurant.outOfStockIngredients || []}
                                    />
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
