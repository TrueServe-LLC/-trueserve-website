import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MobileNav from "@/components/MobileNav";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
        redirect("/login");
    }

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
            <MobileNav role="CUSTOMER" />

            <nav className="hidden md:flex sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 px-4 md:px-6 py-3 md:py-4">
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

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between pt-12 pb-6 px-6">
                <Link href="/restaurants" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                </Link>
                <h1 className="text-xl font-black text-white px-4">My Orders</h1>
                <div className="w-10"></div>
            </div>

            <main className="container max-w-2xl mx-auto px-4 md:p-8 space-y-8 md:space-y-10">

                {/* Mobile Tabs Wrapper for Visual Grouping */}
                <div className="md:hidden flex gap-8 mb-2 border-b border-white/10 pb-0 px-2">
                    <button className="text-secondary font-black relative pb-3 after:absolute after:bottom-[-1px] after:left-0 after:w-full after:h-0.5 after:bg-secondary">
                        Active
                    </button>
                    <button className="text-slate-500 font-bold hover:text-white transition-colors pb-3">
                        History
                    </button>
                </div>

                {/* Active Orders Section */}
                <section>
                    <div className="hidden md:flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Active Tracking</h2>
                    </div>

                    {activeOrders.length > 0 ? (
                        <div className="space-y-4">
                            {activeOrders.map(order => (
                                <Link
                                    key={order.id}
                                    href={`/orders/${order.id}`}
                                    className="block p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl hover:bg-emerald-500/10 transition-all group shadow-lg"
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex gap-4 min-w-0">
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-800 overflow-hidden shrink-0 shadow-md">
                                                <img src={order.restaurant?.imageUrl || "/restaurant1.jpg"} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0 flex flex-col justify-center">
                                                <h3 className="font-black text-white text-base md:text-lg group-hover:text-primary transition-colors truncate">{order.restaurant?.name}</h3>
                                                <p className="text-[10px] md:text-xs font-bold text-emerald-400 uppercase tracking-widest mt-1">🚚 {order.status.replace('_', ' ')}</p>
                                                <p className="text-[10px] text-slate-500 mt-1.5 font-medium truncate">Order #{order.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="mt-1 md:mt-2 text-[10px] font-black text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-full text-center flex items-center gap-1.5 shadow-sm">
                                                <span>Track</span>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 md:py-12 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 text-xl opacity-80">⚡</div>
                            <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mt-2">No active orders</h3>
                        </div>
                    )}
                </section>

                <div className="w-full h-px bg-white/5 md:hidden my-8"></div>

                {/* History Section */}
                <section>
                    <div className="hidden md:flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Order History</h2>
                    </div>

                    {pastOrders.length > 0 ? (
                        <div className="space-y-4">
                            {pastOrders.map(order => (
                                <div
                                    key={order.id}
                                    className="p-5 bg-white/5 border border-white/5 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 md:gap-6 shadow-sm"
                                >
                                    <div className="flex gap-4 w-full sm:w-auto min-w-0">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-800 overflow-hidden shrink-0 grayscale opacity-70">
                                            <img src={order.restaurant?.imageUrl || "/restaurant1.jpg"} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0 flex flex-col justify-center">
                                            <h3 className="font-bold text-slate-300 text-base md:text-lg truncate">{order.restaurant?.name}</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                                {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1 font-semibold">${Number(order.totalPay || 0).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                                        <Link
                                            href={`/orders/${order.id}`}
                                            className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 active:bg-white/5 transition-colors text-slate-400 flex items-center justify-center"
                                        >
                                            Details
                                        </Link>
                                        <Link
                                            href={`/restaurants/${order.restaurantId}`}
                                            className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-xl bg-primary/90 text-black text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/20 hover:bg-primary active:scale-95 transition-all flex items-center justify-center"
                                        >
                                            Reorder
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 opacity-40">
                            <p className="text-[10px] font-black uppercase tracking-widest">No past orders found.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
