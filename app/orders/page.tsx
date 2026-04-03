import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) redirect("/login");

    const supabase = await createClient();
    let activeOrders: any[] = [];
    let pastOrders: any[] = [];

    const { data: allOrders } = await supabase
        .from('Order')
        .select('*, restaurant:Restaurant(name, imageUrl, rating)')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

    if (allOrders) {
        activeOrders = allOrders.filter(o => ['PENDING', 'PREPARING', 'READY', 'READY_FOR_PICKUP', 'PICKED_UP'].includes(o.status));
        pastOrders = allOrders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status));
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F0EDE8] font-barlow-cond pb-32">
            {/* AMBIENT ORBS */}
            <div className="orb w-[300px] h-[300px] top-[-50px] left-[-100px] bg-[#e8a230]/5" />
            
            <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-4 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5">
                <Logo size="sm" />
            </nav>

            <main className="max-w-[430px] mx-auto px-5 pt-8 space-y-10">
                <header className="animate-fade-in">
                    <h1 className="text-5xl font-bebas text-white uppercase italic leading-none tracking-wider">Mission <span className="text-[#e8a230]">LOGS</span></h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5A5550] mt-2 italic">Active Protocols & History</p>
                </header>

                {/* ACTIVE MISSIONS */}
                <section className="space-y-6 animate-slide-up">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <div className="w-2 h-2 rounded-full bg-[#e8a230] animate-pulse shadow-[0_0_8px_#e8a230]" />
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Active Tracking</h2>
                    </div>

                    {activeOrders.length > 0 ? (
                        <div className="space-y-4">
                            {activeOrders.map(order => (
                                <Link key={order.id} href={`/orders/${order.id}`} className="block p-5 bg-[#131313] border border-[#e8a230]/20 rounded-[2rem] hover:bg-[#1C1C1C] transition-all group shadow-[0_10px_40px_rgba(232,162,48,0.05)]">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-16 h-16 rounded-2xl bg-black/40 flex items-center justify-center text-3xl">📦</div>
                                        <div className="flex-1 space-y-1">
                                            <h3 className="text-lg font-bold text-white tracking-widest leading-none uppercase">{order.restaurant?.name}</h3>
                                            <p className="text-[11px] font-black text-[#e8a230] uppercase tracking-widest italic animate-pulse">🚚 {order.status.replace('_', ' ')}</p>
                                        </div>
                                        <span className="text-xl font-bebas text-white italic group-hover:translate-x-1 transition-transform">➔</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 bg-[#131313] border border-white/5 border-dashed rounded-[2rem] text-center opacity-40">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5550] italic">No active missions detected.</p>
                        </div>
                    )}
                </section>

                {/* PAST MISSIONS */}
                <section className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <div className="w-2 h-2 rounded-full bg-[#5A5550]" />
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#5A5550]">Archive</h2>
                    </div>

                    <div className="space-y-4">
                        {pastOrders.map(order => (
                            <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between p-5 bg-[#131313] border border-white/5 rounded-2xl hover:bg-[#1C1C1C] transition-all opacity-80">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-white tracking-widest uppercase">{order.restaurant?.name}</p>
                                    <p className="text-[9px] text-[#5A5550] font-black uppercase tracking-widest italic">
                                        {new Date(order.createdAt).toLocaleDateString()} · STATUS: {order.status}
                                    </p>
                                </div>
                                <span className="text-lg font-bebas text-white italic tracking-wider">${Number(order.total || 0).toFixed(2)}</span>
                            </Link>
                        ))}
                        {pastOrders.length === 0 && activeOrders.length === 0 && (
                            <div className="py-10 text-center">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5550] italic mb-6">Archive Empty</p>
                                <Link href="/restaurants" className="bg-[#e8a230] text-black px-10 py-4 rounded-xl font-bebas text-lg shadow-[0_0_20px_rgba(232,162,48,0.2)]">Execute Search</Link>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
