import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { approveMenuItem, rejectMenuItem, flagMenuItem, connectStripe, logout } from "../actions";

async function getPendingItems() {
    try {
        const { data, error } = await supabase
            .from('MenuItem')
            .select(`
                *,
                restaurant:Restaurant(*)
            `)
            .or('status.eq.PENDING,status.eq.FLAGGED');

        if (error) {
            console.error("Supabase Error (getPendingItems):", error);
            return [];
        }
        return data || [];
    } catch (e) {
        console.log("Admin Dashboard - Error fetching items:", e);
        return [];
    }
}

async function getPendingDrivers() {
    try {
        const { data, error } = await supabase
            .from('Driver')
            .select(`
                *,
                user:User(*)
            `);

        if (error) {
            console.error("Supabase Error (getPendingDrivers):", error);
            return [];
        }
        return data || [];
    } catch (e) {
        console.log("Admin Dashboard - Error fetching drivers:", e);
        return [];
    }
}

export default async function AdminDashboard({ searchParams }: { searchParams: { stripe_connected?: string } }) {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");

    if (!session) {
        redirect("/admin/login");
    }

    const pendingItems = await getPendingItems();
    const drivers = await getPendingDrivers();
    const isStripeConnected = searchParams.stripe_connected === "true";

    return (
        <div className="min-h-screen">
            <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 px-6 py-4">
                <div className="container flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold tracking-tighter">
                        True<span className="text-gradient">Serve</span> Admin
                    </Link>
                    <div className="flex gap-4">
                        <form action={async () => {
                            "use server";
                            await logout();
                        }}>
                            <button className="hover:text-primary transition-colors">Log Out</button>
                        </form>
                    </div>
                </div>
            </nav>

            <main className="container py-12 animate-fade-in">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-bold">Admin Control Center</h1>

                    {/* Stripe Connect Section */}
                    <div className="flex items-center gap-4">
                        {isStripeConnected ? (
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 font-bold text-sm">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                Stripe Connected
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <form action={async () => {
                                    "use server";
                                    await connectStripe();
                                }}>
                                    <button className="btn btn-primary py-2 px-4 shadow-lg shadow-primary/20">
                                        Connect Stripe
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* Real-time Analytics Section */}
                <section className="mb-16">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Platform Analytics</h2>
                        <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 rounded-full uppercase">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Live Metrics
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="card p-6 bg-white/5 border-white/10 hover:border-primary/50 transition-colors group">
                            <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 group-hover:text-primary transition-colors">Net Promoter Score (NPS)</p>
                            <div className="flex items-end gap-2">
                                <p className="text-4xl font-bold">78</p>
                                <p className="text-emerald-400 text-xs font-bold mb-1.5">↑ 4%</p>
                            </div>
                        </div>
                        <div className="card p-6 bg-white/5 border-white/10 hover:border-blue-500/50 transition-colors group">
                            <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 group-hover:text-blue-400 transition-colors">Avg. Prep-to-Pickup</p>
                            <div className="flex items-end gap-2">
                                <p className="text-4xl font-bold">18.2m</p>
                                <p className="text-red-400 text-xs font-bold mb-1.5">↓ 2%</p>
                            </div>
                        </div>
                        <div className="card p-6 bg-white/5 border-white/10 hover:border-yellow-500/50 transition-colors group">
                            <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 group-hover:text-yellow-400 transition-colors">Order Density</p>
                            <p className="text-4xl font-bold">4.8 / km²</p>
                        </div>
                        <div className="card p-6 bg-white/5 border-white/10 hover:border-emerald-500/50 transition-colors group">
                            <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 group-hover:text-emerald-400 transition-colors">Fraud Flag Rate</p>
                            <p className="text-4xl font-bold">0.12%</p>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Menu Approval Section */}
                    <section className="col-span-2">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            📋 Menu Approvals
                            <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">{pendingItems.length}</span>
                        </h2>
                        <div className="space-y-4">
                            {pendingItems.map((item) => (
                                <div key={item.id} className="card p-6 border-slate-700/50">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{item.name}</h3>
                                            <p className="text-sm text-slate-400">at {item.restaurant.name}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${item.status === 'FLAGGED' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-300 text-sm mb-4">{item.description}</p>
                                    <div className="flex gap-2">
                                        <form action={async () => { "use server"; await approveMenuItem(item.id); }}>
                                            <button className="btn btn-primary text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-500 shadow-none">
                                                Approve
                                            </button>
                                        </form>
                                        <form action={async () => { "use server"; await rejectMenuItem(item.id); }}>
                                            <button className="btn btn-outline text-xs py-2 px-4 border-red-500/50 text-red-400 hover:bg-red-500/10">
                                                Reject
                                            </button>
                                        </form>
                                        <form action={async () => { "use server"; await flagMenuItem(item.id); }}>
                                            <button className="btn btn-outline text-xs py-2 px-4 border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                                                Flag as Invalid
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                            {pendingItems.length === 0 && (
                                <p className="text-slate-500 italic">No menu items pending approval.</p>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
