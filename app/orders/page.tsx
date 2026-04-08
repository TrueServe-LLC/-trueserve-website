import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import { getAuthSession } from "@/app/auth/actions";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
    const { userId } = await getAuthSession();
    if (!userId) redirect("/login");

    const supabase = await createClient();
    const { data: allOrders } = await supabase
        .from('Order')
        .select('*, restaurant:Restaurant(name, imageUrl, rating)')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

    const orders = allOrders || [];
    const activeOrders = orders.filter(o => ['PENDING', 'PREPARING', 'READY', 'READY_FOR_PICKUP', 'PICKED_UP'].includes(o.status));
    const pastOrders = orders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status));

    return (
        <div className="food-app-shell overflow-x-hidden">
            <nav className="food-app-nav sticky top-0 z-[60] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
                        <span className="text-sm">←</span>
                    </Link>
                    <div className="h-6 w-px bg-white/10" />
                    <Logo size="sm" />
                </div>
            </nav>

            <main className="food-app-main">
                <header className="food-panel mb-8">
                    <p className="food-kicker mb-3">Your account</p>
                    <h2 className="food-heading mb-2">Order <span className="accent">History</span></h2>
                    <p className="food-subtitle !max-w-none">Review active deliveries and past orders in the same customer-friendly design as the rest of the app.</p>
                </header>

                    {/* ACTIVE MISSIONS */}
                    <section className="space-y-6 mb-12">
                        <h3 className="food-kicker px-2 mb-4">Active Orders</h3>
                        {activeOrders.length > 0 ? (
                            <div className="space-y-4">
                                {activeOrders.map(order => (
                                    <Link key={order.id} href={`/orders/${order.id}`} className="block relative bg-[linear-gradient(180deg,rgba(21,24,32,.96),rgba(12,14,19,.98))] border border-white/8 rounded-[2rem] p-6 shadow-2xl active:scale-[0.98] transition-all overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8A020]/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-[#E8A020]/10 transition-all" />
                                        <div className="flex gap-4 items-center relative z-10">
                                            <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-2xl">📦</div>
                                            <div className="flex-1">
                                                <h4 className="font-bebas text-2xl text-white tracking-widest uppercase leading-none mb-1">{order.restaurant?.name || "Kitchen"}</h4>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#E8A020] animate-pulse" />
                                                    <span className="font-barlow-cond text-[10px] font-black text-[#E8A020] uppercase tracking-widest">{order.status.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bebas text-2xl text-white tracking-tighter">➔</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="food-panel text-center opacity-50">
                                <p className="font-barlow-cond text-[10px] font-black uppercase tracking-widest">No active orders right now.</p>
                            </div>
                        )}
                    </section>

                    {/* ARCHIVE */}
                    <section className="space-y-6">
                        <h3 className="food-kicker px-2 mb-4">Past Orders</h3>
                        <div className="space-y-3">
                            {pastOrders.map(order => (
                                <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between p-6 bg-[linear-gradient(180deg,rgba(21,24,32,.92),rgba(12,14,19,.96))] border border-white/5 rounded-3xl active:bg-white/[0.02] transition-colors group">
                                    <div>
                                        <p className="font-bold text-white tracking-tight barlow-cond uppercase">{order.restaurant?.name}</p>
                                        <p className="font-barlow-cond text-[9px] font-black text-[#444] uppercase tracking-widest mt-0.5">
                                            {new Date(order.createdAt).toLocaleDateString()} · ID: #{order.id.slice(-6).toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bebas text-xl text-white tracking-widest leading-none">${Number(order.total || 0).toFixed(2)}</p>
                                        <p className="font-barlow-cond text-[8px] font-black uppercase text-[#444] tracking-widest mt-1">{order.status}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
            </main>
        </div>
    );
}
