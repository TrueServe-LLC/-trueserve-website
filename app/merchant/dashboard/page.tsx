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
        <div className="db min-h-screen">
            <MerchantRealtime restaurantId={restaurant.id} />
            <WelcomeModal restaurantName={restaurant.name} />

            {/* Standardized Portal Nav (Matches Admin) */}
            <div className="db-nav">
                <div className="db-nav-brand">True <span>SERVE</span></div>
                <div className="db-nav-links font-sans">
                    <Link href="/restaurants" className="db-nav-link">🍴 Order Food</Link>
                    <Link href="/merchant/dashboard" className="db-nav-link active">Dashboard</Link>
                    <Link href="/merchant" className="db-nav-link">Partner Hub</Link>
                    <div className="ml-4">
                        <LogoutButton />
                    </div>
                </div>
            </div>

            <main className="page max-w-7xl mx-auto">
                {/* Header Title Stack */}
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div>
                        <div className="page-title">Orders <span>Dashboard</span></div>
                        <div className="page-sub uppercase tracking-widest mt-1">
                            Operational control for {restaurant.name}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Link 
                            href="/merchant/terminal" 
                            className="db-btn-primary !bg-white/5 !text-white border border-white/10 !px-6 !py-2.5 sm"
                        >
                            🍳 Kitchen Terminal
                        </Link>
                         <span className={`db-badge ${restaurant.plan === 'Pro Subscription' ? 'db-badge-ok' : 'db-badge-gray'}`}>
                            {restaurant.plan === 'Pro Subscription' ? 'Pro Scale' : 'Flex Scale'}
                        </span>
                        <form action={async () => {
                            "use server";
                            await toggleBusyMode(restaurant.id, restaurant.isBusy);
                        }}>
                            <button className={`db-badge ${restaurant.isBusy ? 'db-badge-warn !bg-red-600 !text-white' : 'db-badge-ok'}`}>
                                {restaurant.isBusy ? 'Paused' : 'Online'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Main Content Enclosure */}
                <div className="space-y-16">
                    {/* Stats Grid */}
                    <div className="db-grid grid-cols-2 md:grid-cols-3">
                        <div className="db-panel !bg-[#0f1219] !border-none flex flex-col justify-end min-h-[140px]">
                            <h3 className="stat-name mb-2">Incoming Orders</h3>
                            <p className="stat-value">{pendingOrders.length}</p>
                        </div>
                        <div className="db-panel !bg-[#0f1219] !border-none flex flex-col justify-end min-h-[140px]">
                            <h3 className="stat-name mb-2">Menu Items</h3>
                            <p className="stat-value">{restaurant.menuItems.length}</p>
                        </div>
                        <div className="db-panel !bg-[#0f1219] !border-none flex flex-col justify-end min-h-[140px] col-span-2 md:col-span-1">
                            <h3 className="stat-name mb-2 text-[#e8a230]">Net Revenue</h3>
                            <p className="stat-value !text-emerald-400">${totalRevenue.toFixed(2)}</p>
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
