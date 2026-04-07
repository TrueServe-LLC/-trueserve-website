import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import { getAuthSession } from "@/app/auth/actions";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
    const { isAuth, userId, name } = await getAuthSession();
    if (!userId) redirect("/login");

    const supabase = await createClient();
    const { data: user } = await supabase.from('User').select('*').eq('id', userId).single();

    const { data: allOrders } = await supabase
        .from('Order')
        .select('*, restaurant:Restaurant(name, imageUrl, rating)')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

    const orders = allOrders || [];
    const activeOrders = orders.filter(o => ['PENDING', 'PREPARING', 'READY', 'READY_FOR_PICKUP', 'PICKED_UP'].includes(o.status));
    const pastOrders = orders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status));

    return (
        <div className="min-h-screen bg-[#0c0e13] text-[#F0EDE8] font-barlow overflow-x-hidden">
            <div className="pb-32">
                <nav className="sticky top-0 z-[60] bg-[#0A0A0A]/85 backdrop-blur-2xl border-b border-white/5 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
                            <span className="text-sm">←</span>
                        </Link>
                        <div className="h-6 w-px bg-white/10" />
                        <Logo size="sm" />
                    </div>
                </nav>

                <main className="max-w-[430px] mx-auto px-5 pt-8 animate-up relative z-10">
                    <header className="mb-10">
                        <h2 className="font-bebas text-5xl italic leading-[0.9] text-white tracking-wider uppercase mb-2">Operational<br /><span className="text-[#E8A020]">Telemetry</span></h2>
                        <p className="font-barlow-cond text-[10px] font-black uppercase tracking-[0.3em] text-[#555] italic">Sector: Charlotte HQ · Active Tracking Enabled</p>
                    </header>

                    {/* ACTIVE MISSIONS */}
                    <section className="space-y-6 mb-12">
                        <h3 className="font-bebas text-2xl italic tracking-widest text-[#555] uppercase px-2 mb-4">Active Deployments</h3>
                        {activeOrders.length > 0 ? (
                            <div className="space-y-4">
                                {activeOrders.map(order => (
                                    <Link key={order.id} href={`/orders/${order.id}`} className="block relative bg-[#0d0d0d] border border-[#E8A020]/20 rounded-[2.5rem] p-6 shadow-2xl active:scale-[0.98] transition-all overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8A020]/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-[#E8A020]/10 transition-all" />
                                        <div className="flex gap-4 items-center relative z-10">
                                            <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-2xl">📦</div>
                                            <div className="flex-1">
                                                <h4 className="font-bebas text-2xl italic text-white tracking-widest uppercase leading-none mb-1">{order.restaurant?.name || "KITCHEN"}</h4>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#E8A020] animate-pulse" />
                                                    <span className="font-barlow-cond text-[10px] font-black text-[#E8A020] uppercase tracking-widest italic">{order.status.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bebas text-2xl italic text-white tracking-tighter">➔</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 border border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01] text-center opacity-30">
                                <p className="font-barlow-cond text-[9px] font-black uppercase tracking-widest italic">Awaiting new mission deployments...</p>
                            </div>
                        )}
                    </section>

                    {/* ARCHIVE */}
                    <section className="space-y-6">
                        <h3 className="font-bebas text-2xl italic tracking-widest text-[#555] uppercase px-2 mb-4">Transmission Archive</h3>
                        <div className="space-y-3">
                            {pastOrders.map(order => (
                                <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between p-6 bg-[#0c0c0e] border border-white/5 rounded-2xl active:bg-white/[0.02] transition-colors group">
                                    <div>
                                        <p className="font-bold text-white tracking-tight barlow-cond uppercase italic">{order.restaurant?.name}</p>
                                        <p className="font-barlow-cond text-[9px] font-black text-[#444] uppercase tracking-widest mt-0.5">
                                            {new Date(order.createdAt).toLocaleDateString()} · ID: #{order.id.slice(-6).toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bebas text-xl italic text-white tracking-widest leading-none">${Number(order.total || 0).toFixed(2)}</p>
                                        <p className="font-barlow-cond text-[8px] font-black uppercase text-[#444] tracking-widest mt-1 italic">{order.status}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
