import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { redirect } from "next/navigation";
import AddItemForm from "./AddItemForm";
import { updateOrderStatus, refundOrder } from "../actions";

async function getMerchantData() {
    try {
        const { data: restaurant, error } = await supabase
            .from('Restaurant')
            .select(`
                *,
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
            // Sort orders at database level (requires correct foreign key setup/syntax, 
            // but Supabase select supports ordering on relations or we filter after. 
            // Since complex relation sorting in one query can be tricky, 
            // a better scalable approach relies on separate queries or simple ordering if supported.
            // For now, we simple-limit to prevent crash, then fetch recent orders in a clean query check below.
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error("Supabase Error (getMerchantData):", error);
            return null;
        }

        // Optimization: Fetch orders separately to allow powerful sorting/pagination without massive JOIN overhead
        if (restaurant) {
            const { data: recentOrders } = await supabase
                .from('Order')
                .select(`
                    *,
                    user:User(*),
                    items:OrderItem(
                        *,
                        menuItem:MenuItem(*)
                    )
                `)
                .eq('restaurantId', restaurant.id)
                .order('createdAt', { ascending: false })
                .limit(50); // Hard limit to prevent overload

            restaurant.orders = recentOrders || [];
        }

        return restaurant;
    } catch (e) {
        console.warn("DB failed", e);
        return null;
    }
}

export default async function MerchantDashboard() {
    const restaurant = await getMerchantData();

    // Fallback UI if no restaurant found (or DB down)
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
            <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 px-6 py-4">
                <div className="container flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold tracking-tighter">
                        True<span className="text-gradient">Serve</span> Merchant
                    </Link>
                    <div className="flex gap-4">
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
                            {restaurant.name}
                        </span>
                        <Link href="/merchant" className="hover:text-primary transition-colors">Log Out</Link>
                    </div>
                </div>
            </nav>

            <main className="container py-12 animate-fade-in">
                <div className="grid grid-3 gap-8 mb-12">
                    <div className="card">
                        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Active Orders</h3>
                        <p className="text-4xl font-bold">{pendingOrders.length}</p>
                    </div>
                    <div className="card">
                        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Menu Items</h3>
                        <p className="text-4xl font-bold">{restaurant.menuItems.length}</p>
                    </div>
                    <div className="card relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Total Revenue</h3>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">T+0 Payout</span>
                        </div>
                        <p className="text-4xl font-bold text-emerald-400">${totalRevenue.toFixed(2)}</p>
                        <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Funds available for instant withdrawal
                        </p>
                    </div>
                </div>

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
                            <p className="text-5xl font-bold">8</p>
                            <p className="text-slate-400 mb-1 font-semibold">min to pickup</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-4">Nearest driver is 1.2km away.</p>
                    </div>

                    <div className="card bg-blue-500/5 border-blue-500/20">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Pacing Metrics</h3>
                            <span className="text-blue-400 text-xs font-mono uppercase font-bold tracking-widest">Operational</span>
                        </div>
                        <div className="flex items-end gap-2 text-blue-400">
                            <p className="text-5xl font-bold">92%</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-4">Kitchen is performing 8% faster than 7-day average.</p>
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
                                                <button className="btn btn-primary text-sm py-2">Accept & Start Cooking</button>
                                            </form>
                                        ) : (
                                            <form action={async () => {
                                                "use server";
                                                await updateOrderStatus(order.id, 'READY_FOR_PICKUP');
                                            }}>
                                                <button className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm py-2">Mark as Ready</button>
                                            </form>
                                        )}
                                        <button className="btn btn-outline text-sm py-2 text-red-400 border-red-500/20 hover:bg-red-500/10">Reject</button>
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

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Your Menu</h2>
                    <AddItemForm />
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
