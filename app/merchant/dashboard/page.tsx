import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import AddItemForm from "./AddItemForm";
import MenuScanner from "./MenuScanner";
import POSIntegration from "./POSIntegration";
import { updateOrderStatus, refundOrder, createStripeAccount } from "../actions";
import LogoutButton from "@/components/LogoutButton";
import StoreBannerUpload from "./StoreBannerUpload";
import WelcomeModal from "./WelcomeModal";
import { MOUNT_AIRY_RESTAURANTS } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

async function getMerchantData(userId: string) {
    const supabase = await createClient();
    try {
        // First try finding by ownerId (Real DB path)
        let { data: restaurant, error } = await supabase
            .from('Restaurant')
            .select(`
                *,
                apiKey,
                menuItems:MenuItem(*),
                orders:Order(
                    *,
                    user:User(*),
                    items:OrderItem(
                        *,
                        menuItem:MenuItem(*)
                    )
                )
            `)
            .eq('ownerId', userId)
            .maybeSingle();

        // If not found by ID (Demo Mode), and we have a mock ID, try finding by name to catch live orders
        if (!restaurant && userId.startsWith('mock-merchant-')) {
            const slug = userId.replace('mock-merchant-', '');
            const demoRest = MOUNT_AIRY_RESTAURANTS.find(r => r.email.includes(slug));
            if (demoRest) {
                const { data: dbRest } = await supabase
                    .from('Restaurant')
                    .select('*, orders:Order(*, user:User(*), items:OrderItem(*, menuItem:MenuItem(*)))')
                    .ilike('name', `%${demoRest.name}%`)
                    .maybeSingle();

                if (dbRest) {
                    restaurant = dbRest;
                }
            }
        }

        if (!restaurant) return null;

        // Fetch real orders for real restaurant
        const { data: recentOrders } = await supabase
            .from('Order')
            .select(`
                *,
                user:User(*),
                driver:Driver(
                    currentLat,
                    currentLng,
                    user:User(name)
                ),
                items:OrderItem(
                    *,
                    menuItem:MenuItem(*)
                )
            `)
            .eq('restaurantId', restaurant.id)
            .order('createdAt', { ascending: false })
            .limit(50);

        restaurant.orders = recentOrders || [];
        restaurant.menuItems = restaurant.menuItems || [];

        // Calculate REAL average prep time (diff between PENDING -> READY_FOR_PICKUP)
        const readyOrders = restaurant.orders.filter((o: any) => o.status === 'READY_FOR_PICKUP' || o.status === 'DELIVERED');
        if (readyOrders.length > 0) {
            const totalPrepTime = readyOrders.reduce((sum: number, o: any) => {
                const start = new Date(o.createdAt).getTime();
                const end = new Date(o.updatedAt).getTime();
                return sum + ((end - start) / 60000); // Minutes
            }, 0);
            restaurant.avgPrepTime = Math.round(totalPrepTime / readyOrders.length);
            restaurant.readyCount = readyOrders.length;
        } else {
            restaurant.avgPrepTime = 0;
            restaurant.readyCount = 0;
        }

        return restaurant;
    } catch (e) {
        console.warn("getMerchantData Error:", e);
        return null;
    }
}

export default async function MerchantDashboard({
    searchParams
}: {
    searchParams: { welcome?: string }
}) {
    const cookieStore = await cookies();
    let userId = cookieStore.get("userId")?.value;

    if (!userId) {
        // Fallback: Check Supabase session directly
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            userId = user.id;
            // Note: We can't set cookies in a Server Component body easily without a specialized pattern,
            // but we can proceed with the ID we found.
        } else {
            redirect("/login?role=merchant");
        }
    }

    let restaurant = await getMerchantData(userId);

    // Handle Demo Mode Fallback if DB lookup failed and we have a mock ID
    if (!restaurant && userId?.startsWith('mock-merchant-')) {
        const slug = userId.replace('mock-merchant-', '');
        restaurant = MOUNT_AIRY_RESTAURANTS.find(r => r.email.includes(slug)) as any;
        if (!restaurant && slug === 'general') restaurant = MOUNT_AIRY_RESTAURANTS[0] as any;
    }

    // Final Fallback UI if no restaurant found (or DB down and no mock hit)
    if (!restaurant) {
        return (
            <div className="min-h-screen">
                <nav className="border-b border-white/10 px-6 py-4">
                    <div className="container flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold tracking-tighter">
                            True<span className="text-gradient">Serve</span> Merchant
                        </Link>
                    </div>
                </nav>
                <div className="container py-20 text-center">
                    <h1 className="text-3xl font-bold mb-4">No Restaurant Found</h1>
                    <p className="text-slate-400 mb-8">
                        It seems you haven't set up a restaurant yet, or the database is currently unreachable.
                    </p>
                    <div className="p-6 card max-w-lg mx-auto bg-yellow-500/10 border-yellow-500/20">
                        <h3 className="text-yellow-400 font-bold mb-2">Demo Mode Active</h3>
                        <p className="text-sm text-slate-300">
                            Since the database is offline, we cannot show your real menu. <br />
                            Please ensure your database is running to manage your menu.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const pendingOrders = restaurant.orders.filter((o: any) => (o.status as any) === "PENDING" || (o.status as any) === "PREPARING" || (o.status as any) === "READY_FOR_PICKUP");
    const totalRevenue = restaurant.orders
        .filter((o: any) => o.status === "DELIVERED")
        .reduce((sum: number, o: any) => sum + Number(o.total), 0);

    return (
        <div className="min-h-screen">
            <WelcomeModal restaurantName={restaurant.name} />
            <header className="md:hidden flex p-4 border-b border-white/5 justify-between items-center sticky top-0 bg-black/80 backdrop-blur-2xl z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">M</div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#ff992a]"></span>
                            Terminal Open
                        </p>
                        <p className="text-sm font-black text-white leading-tight truncate max-w-[120px]">{restaurant.name}</p>
                    </div>
                </div>
                <LogoutButton />
            </header>

            <nav className="hidden md:flex sticky top-0 z-50 backdrop-blur-lg bg-black/40 border-b border-white/10 px-6 py-4">
                <div className="container flex justify-between items-center">
                    <Link href="/" className="text-2xl font-black tracking-tighter">
                        True<span className="text-primary">Serve</span> <span className="text-slate-500">Merchant</span>
                    </Link>
                    <div className="flex gap-4 items-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${restaurant.plan === 'Pro Subscription'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                            : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            }`}>
                            {restaurant.plan === 'Pro Subscription' ? 'Pro Scale' : 'Flex Scale'}
                        </span>
                        <span className="px-4 py-1.5 bg-white/5 text-white border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest shadow-inner">
                            {restaurant.name}
                        </span>
                        <LogoutButton />
                    </div>
                </div>
            </nav>

            <main className="container py-6 md:py-12 px-4 animate-fade-in pb-32">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8 mb-8 md:mb-12">
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
                            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-black uppercase tracking-widest translate-y-[-2px]">Instant</span>
                        </div>
                        <p className="text-4xl md:text-6xl font-black text-emerald-400">${totalRevenue.toFixed(2)}</p>
                        <p className="text-[9px] text-slate-500 mt-2 flex items-center gap-1 font-bold">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Funds available for withdrawal
                        </p>
                    </div>
                </div>

                {/* Stripe Connect Banner (If not connected) */}
                {!restaurant.stripeAccountId && (
                    <div className="mb-12 p-8 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl shadow-lg">💳</div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Connect Stripe to get paid.</h2>
                                <p className="text-slate-400 max-w-md">To start receiving payouts for your orders, you need to connect your Stripe account.</p>
                            </div>
                        </div>
                        <form action={async () => {
                            "use server";
                            await createStripeAccount();
                        }}>
                            <button className="btn bg-blue-600 hover:bg-blue-700 text-white border-none px-8 py-3 shadow-lg shadow-blue-500/20">
                                Connect Stripe account
                            </button>
                        </form>
                    </div>
                )}

                {restaurant.stripeAccountId && !restaurant.stripeOnboardingComplete && (
                    <div className="mb-12 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="animate-pulse w-3 h-3 bg-yellow-500 rounded-full"></span>
                            <div>
                                <p className="font-bold text-yellow-500">Stripe Onboarding Incomplete</p>
                                <p className="text-xs text-slate-400">Finish setting up your account to ensure your payouts aren't delayed.</p>
                            </div>
                        </div>
                        <form action={createStripeAccount}>
                            <button className="text-sm font-bold text-yellow-500 hover:underline">Complete Setup &rarr;</button>
                        </form>
                    </div>
                )}

                {/* Prep-time Prediction & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="card bg-primary/5 border-primary/20">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Prep-time Prediction</h3>
                            <span className="text-primary text-xs font-mono uppercase font-bold tracking-widest">AI Engine</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <p className="text-5xl font-bold">{(restaurant as any).avgPrepTime || 14}</p>
                            <p className="text-slate-400 mb-1 font-semibold">minutes</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-4">Predicted based on orders and current load.</p>
                    </div>

                    <div className="card bg-emerald-500/5 border-emerald-500/20">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Courier ETA</h3>
                            <span className="text-emerald-400 text-xs font-mono uppercase font-bold tracking-widest">Live</span>
                        </div>
                        <div className="flex items-end gap-2">
                            {pendingOrders.some((o: any) => o.driverId) ? (
                                <>
                                    <p className="text-5xl font-bold">~5-10</p>
                                    <p className="text-slate-400 mb-1 font-semibold">min to pickup</p>
                                </>
                            ) : (
                                <p className="text-3xl font-bold text-primary animate-pulse">Seeking Driver</p>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-4">
                            {pendingOrders.some((o: any) => o.driverId)
                                ? "Nearest courier has been dispatched."
                                : "Awaiting a driver to accept the request."}
                        </p>
                    </div>

                    <div className="card bg-blue-500/5 border-blue-500/20">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Pacing Metrics</h3>
                            <span className="text-blue-400 text-xs font-mono uppercase font-bold tracking-widest">Operational</span>
                        </div>
                        <div className="flex items-end gap-2 text-blue-400">
                            {restaurant.avgPrepTime > 0 ? (
                                <>
                                    <p className="text-5xl font-bold">{Math.round((15 / restaurant.avgPrepTime) * 100)}%</p>
                                    <p className="text-xs text-slate-500 mb-1 leading-tight">Score</p>
                                </>
                            ) : (
                                <p className="text-xl font-bold text-slate-500 animate-pulse">Building Profile...</p>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-4">
                            {restaurant.avgPrepTime > 0
                                ? `Current performance based on ${restaurant.readyCount} recent orders.`
                                : "Awaiting enough operational data to calculate score."}
                        </p>
                    </div>
                </div>

                {/* Orders Section */}
                <section className="mb-12">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            Incoming Orders
                            {pendingOrders.length > 0 && <span className="bg-primary text-white text-[10px] px-2 py-1 rounded-full">{pendingOrders.length}</span>}
                        </h2>
                        <div className="flex gap-2">
                            <button className="text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">History</button>
                            <button className="text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">Refund Management</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {pendingOrders.map((order: any) => (
                            <div key={order.id} className="card p-6 border-l-4 border-l-yellow-500 hover:shadow-[0_0_20px_rgba(234,179,8,0.05)] transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono text-slate-500">{order.id.slice(-6).toUpperCase()}</span>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${(order.status as any) === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                (order.status as any) === 'PREPARING' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {(order.status as any) === 'READY_FOR_PICKUP' ? 'PICKUP READY' : order.status}
                                            </span>
                                            {(order as any).isRefunded && <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded font-bold uppercase">Refunded</span>}
                                        </div>
                                        <h3 className="font-bold text-lg">{order.user.name}</h3>
                                        <p className="text-xs text-slate-500">LogKey: <span className="text-primary font-mono">{order.posReference}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-xl">${Number(order.total).toFixed(2)}</p>
                                        <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-lg p-3 mb-4">
                                    <ul className="space-y-1">
                                        {order.items.map((item: any) => (
                                            <li key={item.id} className="text-sm flex justify-between">
                                                <span>{item.quantity}x {item.menuItem.name}</span>
                                                <span className="text-slate-500">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex gap-3">
                                        {(order.status as any) === 'PENDING' ? (
                                            <form action={async () => {
                                                "use server";
                                                await updateOrderStatus(order.id, 'PREPARING');
                                            }}>
                                                <button type="submit" className="btn btn-primary text-sm py-2">Accept & Start Cooking</button>
                                            </form>
                                        ) : (
                                            <form action={async () => {
                                                "use server";
                                                await updateOrderStatus(order.id, 'READY_FOR_PICKUP');
                                            }}>
                                                <button type="submit" className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm py-2">Mark as Ready</button>
                                            </form>
                                        )}

                                        <form action={async () => {
                                            "use server";
                                            await updateOrderStatus(order.id, 'CANCELLED');
                                        }}>
                                            <button type="submit" className="btn btn-outline text-sm py-2 text-red-400 border-red-500/20 hover:bg-red-500/10">Reject</button>
                                        </form>

                                        {/* Track Driver Button */}
                                        {order.driver && order.driver.currentLat && (
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${order.driver.currentLat},${order.driver.currentLng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline text-sm py-2 text-blue-400 border-blue-500/20 hover:bg-blue-500/10 flex items-center gap-2"
                                            >
                                                <span>📍</span> Track Driver
                                            </a>
                                        )}
                                    </div>

                                    {!(order as any).isRefunded && (
                                        <form action={async () => {
                                            "use server";
                                            await refundOrder(order.id);
                                        }}>
                                            <button
                                                type="submit"
                                                className="text-xs text-slate-500 hover:text-red-400 transition-colors uppercase font-bold tracking-widest"
                                            >
                                                Issue Refund
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        ))}

                        {pendingOrders.length === 0 && (
                            <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-12 text-center">
                                <p className="text-slate-500 italic">No incoming orders right now. Good luck!</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Operations & Financials */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Store Hours */}
                    <div className="card border-white/10 bg-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">🕒 Store Hours</h2>
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold uppercase tracking-wide">Open Now</span>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-slate-400">
                                <span>Monday - Friday</span>
                                <span className="text-white font-mono">10:00 AM - 10:00 PM</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Saturday</span>
                                <span className="text-white font-mono">11:00 AM - 11:00 PM</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Sunday</span>
                                <span className="text-white font-mono">11:00 AM - 9:00 PM</span>
                            </div>
                        </div>
                        <button className="w-full mt-6 btn btn-outline text-xs py-2 border-white/10 hover:bg-white/5">Edit Hours</button>
                    </div>

                    {/* Financial Performance */}
                    <div className="card border-white/10 bg-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">💰 Financial Performance</h2>
                            <select className="bg-black/50 border border-white/10 rounded text-xs px-2 py-1 text-slate-400 outline-none">
                                <option>This Week</option>
                                <option>This Month</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <span className="text-slate-400 text-sm">Gross Sales</span>
                                <span className="font-mono text-lg font-bold">${(totalRevenue * 1.1).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <span className="text-slate-400 text-sm">Platform Fees (10%)</span>
                                <span className="font-mono text-red-400">-${(totalRevenue * 0.1).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-white font-bold">Net Payout</span>
                                <span className="font-mono text-2xl font-bold text-emerald-400">${totalRevenue.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <StoreBannerUpload currentImageUrl={restaurant.imageUrl} />
                </div>

                <div className="mb-12">
                    <POSIntegration currentApiKey={restaurant.apiKey} />
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Your Menu</h2>
                    <div className="flex gap-3">
                        <MenuScanner restaurantId={restaurant.id} />
                        <AddItemForm />
                    </div>
                </div>

                <div className="grid grid-1 gap-4">
                    {restaurant.menuItems.map((item: any) => (
                        <div key={item.id} className="card p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                            <div className="flex gap-4 items-center">
                                <div className="h-16 w-16 bg-slate-700 rounded-lg overflow-hidden shrink-0">
                                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${item.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                                            item.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                                item.status === 'FLAGGED' ? 'bg-orange-500/20 text-orange-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-sm">{item.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-xl">${Number(item.price).toFixed(2)}</p>
                                <div className="flex flex-col items-end gap-1 mt-1">
                                    <button className="text-xs text-primary hover:underline">Edit Item</button>
                                    {item.status === 'FLAGGED' && (
                                        <p className="text-[10px] text-orange-400 italic font-semibold">Admin flagged this item: Please review.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
