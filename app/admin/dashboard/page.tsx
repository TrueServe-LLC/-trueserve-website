import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { approveMenuItem, rejectMenuItem, flagMenuItem, connectStripe, logout } from "../actions";
import { getAuthSession } from "@/app/auth/actions";

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
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();

    let isAuthorized = !!adminSession || (isAuth && role === 'ADMIN');

    if (!isAuthorized) {
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

                    <div className="flex items-center gap-4">
                        {/* System Status Toggle */}
                        <div className="px-4 py-2 border border-white/10 rounded-full flex items-center gap-3 bg-white/5">
                            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Ordering System</span>
                            {await (async () => {
                                const { isOrderingEnabled } = await import('@/lib/system');
                                const enabled = await isOrderingEnabled();
                                const { toggleOrderingStatus } = await import('../actions');
                                return (
                                    <form action={async () => { "use server"; await toggleOrderingStatus(!enabled); }}>
                                        <button className={`w-12 h-6 rounded-full p-1 transition-colors relative ${enabled ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </button>
                                    </form>
                                );
                            })()}
                        </div>

                        {/* Stripe Connect Section */}
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
                        <div className="card p-6 bg-white/5 border-white/10 hover:border-primary/50 transition-colors group relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
                            <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 group-hover:text-primary transition-colors">Merchant Revenue (MRR)</p>
                            <div className="flex items-end gap-2">
                                {await (async () => {
                                    const { data } = await supabase.from('Restaurant').select('plan');
                                    const total = (data || []).reduce((acc: number, r: any) => {
                                        if (r.plan === 'Pro Subscription') return acc + 199;
                                        return acc;
                                    }, 0);
                                    return (
                                        <>
                                            <p className="text-4xl font-bold">${total.toLocaleString()}</p>
                                            <p className="text-emerald-400 text-xs font-bold mb-1.5">↑ {(data?.filter(r => r.plan === 'Pro Subscription').length || 0)} Pro</p>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="card p-6 bg-white/5 border-white/10 hover:border-blue-500/50 transition-colors group relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
                            <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 group-hover:text-blue-400 transition-colors">Customer MRR</p>
                            <div className="flex items-end gap-2">
                                {await (async () => {
                                    const { data } = await supabase.from('User').select('plan');
                                    const total = (data || []).reduce((acc: number, u: any) => {
                                        if (u.plan === 'Plus') return acc + 9.99;
                                        if (u.plan === 'Premium') return acc + 19.99;
                                        return acc;
                                    }, 0);
                                    return (
                                        <>
                                            <p className="text-4xl font-bold">${Math.round(total).toLocaleString()}</p>
                                            <p className="text-blue-400 text-xs font-bold mb-1.5">↑ {(data?.filter(u => u.plan !== 'Basic' && u.plan).length || 0)} Members</p>
                                        </>
                                    );
                                })()}
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
                    <section>
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
                                    </div>
                                </div>
                            ))}
                            {pendingItems.length === 0 && (
                                <p className="text-slate-500 italic">No menu items pending approval.</p>
                            )}
                        </div>
                    </section>

                    {/* Driver Approval Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            🚗 Driver Applications
                            <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">{drivers.filter(d => !d.vehicleVerified && (d.insuranceDocumentUrl || d.registrationDocumentUrl)).length}</span>
                        </h2>
                        <div className="space-y-4">
                            {drivers.filter(d => !d.vehicleVerified && (d.insuranceDocumentUrl || d.registrationDocumentUrl)).map((driver) => (
                                <div key={driver.id} className="card p-6 border-slate-700/50 group hover:border-white/20 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{driver.user.name}</h3>
                                            <p className="text-sm text-slate-400 font-medium">{driver.user.email}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{driver.vehicleType}</span>
                                                <span className="text-slate-700 text-[10px]">•</span>
                                                <span className="text-[10px] text-slate-500 font-mono tracking-tight">{driver.backgroundCheckId || "ID_PENDING"}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-xs px-2 py-1 rounded font-bold uppercase bg-yellow-500/20 text-yellow-400">
                                                Pending Approval
                                            </span>

                                            {/* Background Check Badge */}
                                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-black uppercase border leading-none ${driver.backgroundCheckStatus === 'CLEARED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                driver.backgroundCheckStatus === 'FLAGGED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    'bg-white/5 text-slate-400 border-white/10'
                                                }`}>
                                                <span className={`w-1 h-1 rounded-full ${driver.backgroundCheckStatus === 'CLEARED' ? 'bg-emerald-400 shadow-[0_0_50px_rgba(52,211,153,0.5)]' :
                                                    driver.backgroundCheckStatus === 'FLAGGED' ? 'bg-red-400' :
                                                        'bg-slate-400 animate-pulse'
                                                    }`} />
                                                Background: {driver.backgroundCheckStatus || "PENDING"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-6">
                                        <form action={async () => { "use server"; const { approveDriver } = await import('../actions'); await approveDriver(driver.id); }}>
                                            <button
                                                disabled={driver.backgroundCheckStatus !== 'CLEARED'}
                                                className="btn btn-primary text-[10px] py-2 px-4 shadow-none disabled:opacity-40 disabled:grayscale font-black uppercase tracking-widest"
                                            >
                                                Approve Driver
                                            </button>
                                        </form>
                                        <form action={async () => { "use server"; const { refreshBackgroundCheck } = await import('../actions'); await refreshBackgroundCheck(driver.id); }}>
                                            <button type="submit" className="btn btn-outline text-[10px] py-1.5 px-3 border-white/10 text-slate-400 hover:bg-white/5 font-black uppercase tracking-widest transition-all">
                                                Refresh Check
                                            </button>
                                        </form>
                                        <button className="text-[10px] py-1.5 px-3 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">
                                            View Docs
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {drivers.filter(d => !d.vehicleVerified && (d.insuranceDocumentUrl || d.registrationDocumentUrl)).length === 0 && (
                                <p className="text-slate-500 italic">No drivers pending approval.</p>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
