import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export default async function OrdersPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    const supabase = await createClient();

    let activeOrders: any[] = [];
    let pastOrders: any[] = [];

    if (userId) {
        const { data: allOrders } = await supabase
            .from('Order')
            .select('*, restaurant:Restaurant(name, imageUrl, rating)')
            .eq('userId', userId)
            .order('createdAt', { ascending: false });

        if (allOrders) {
            activeOrders = allOrders.filter(o => ['PENDING', 'PREPARING', 'READY', 'READY_FOR_PICKUP', 'PICKED_UP'].includes(o.status));
            pastOrders = allOrders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status));
        }
    }

    return (
        <div className="min-h-screen bg-black text-slate-200 pb-24 font-sans">
            <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 px-4 md:px-6 py-3 md:py-4">
                <div className="container flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full border border-white/10" />
                        <span className="text-xl font-black tracking-tight text-white uppercase">
                            Your<span className="text-primary">Orders</span>
                        </span>
                    </Link>
                    <Link href="/restaurants" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Browse Food</Link>
                </div>
            </nav>

            <main className="container max-w-2xl mx-auto p-4 md:p-8 space-y-10">
                {/* Active Orders Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Active Tracking</h2>
                    </div>

                    {activeOrders.length > 0 ? (
                        <div className="space-y-4">
                            {activeOrders.map(order => (
                                <Link
                                    key={order.id}
                                    href={`/orders/${order.id}`}
                                    className="block p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] hover:bg-emerald-500/10 transition-all group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-800 overflow-hidden border border-white/10 shrink-0">
                                                <img src={order.restaurant?.imageUrl || "/restaurant1.jpg"} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-white text-lg group-hover:text-primary transition-colors">{order.restaurant?.name}</h3>
                                                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-1">{order.status.replace('_', ' ')}</p>
                                                <p className="text-[10px] text-slate-500 mt-2 font-medium">Order #{order.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xl font-black text-white">${Number(order.totalPay || 0).toFixed(2)}</span>
                                            <div className="mt-2 text-[10px] font-black text-primary uppercase bg-primary/10 px-3 py-1 rounded-full text-center">Track Live</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white/5 rounded-[2.5rem] border border-white/10 border-dashed">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚡</div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">No active orders</h3>
                            <p className="text-slate-500 text-xs mt-2 px-6">Any orders you place will show up here for live tracking.</p>
                        </div>
                    )}
                </section>

                {/* History Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Order History</h2>
                    </div>

                    {pastOrders.length > 0 ? (
                        <div className="space-y-4">
                            {pastOrders.map(order => (
                                <div
                                    key={order.id}
                                    className="p-5 bg-white/5 border border-white/5 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center gap-6"
                                >
                                    <div className="flex gap-4 w-full sm:w-auto">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-800 overflow-hidden border border-white/10 shrink-0 grayscale opacity-60">
                                            <img src={order.restaurant?.imageUrl || "/restaurant1.jpg"} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-black text-white text-base truncate">{order.restaurant?.name}</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                                {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <p className="text-[10px] text-slate-600 mt-1">Total: ${Number(order.totalPay || 0).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <Link
                                            href={`/orders/${order.id}`}
                                            className="flex-1 sm:flex-none text-center px-6 py-2.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-slate-400"
                                        >
                                            Details
                                        </Link>
                                        <Link
                                            href={`/restaurants/${order.restaurantId}`}
                                            className="flex-1 sm:flex-none text-center px-6 py-2.5 rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Order Again
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 opacity-40">
                            <p className="text-xs font-black uppercase tracking-widest">No past orders found.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
