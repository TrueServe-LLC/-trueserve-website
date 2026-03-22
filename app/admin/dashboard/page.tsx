import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { approveMenuItem, rejectMenuItem, flagMenuItem, connectStripe, logout } from "../actions";
import { getAuthSession } from "@/app/auth/actions";
import KPIDashboard from "@/components/admin/KPIDashboard";
import QAToolbox from "@/components/admin/QAToolbox";

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

async function getAllOrders() {
    try {
        const { data, error } = await supabase
            .from('Order')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) {
            console.error("Supabase Error (getAllOrders):", error);
            return [];
        }
        return data || [];
    } catch (e) {
        console.log("Admin Dashboard - Error fetching all orders:", e);
        return [];
    }
}

async function getAuditLogs() {
    try {
        const { data, error } = await supabase
            .from('AuditLog')
            .select('*')
            .order('createdAt', { ascending: false })
            .limit(10);

        if (error) {
            console.error("Supabase Error (getAuditLogs):", error);
            return [];
        }
        return data || [];
    } catch (e) {
        console.log("Admin Dashboard - Error fetching logs:", e);
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

async function getActiveOrders() {
    try {
        const { data, error } = await supabase
            .from('Order')
            .select(`
                *,
                user:User(*),
                restaurant:Restaurant(*),
                driver:Driver(user:User(*))
            `)
            .in('status', ['READY_FOR_PICKUP', 'PICKED_UP', 'PREPARING'])
            .order('createdAt', { ascending: false });

        if (error) {
            console.error("Supabase Error (getActiveOrders):", error);
            return [];
        }
        return data || [];
    } catch (e) {
        console.log("Admin Dashboard - Error fetching active orders:", e);
        return [];
    }
}

async function getAllRestaurants() {
    try {
        const { data, error } = await supabase.from('Restaurant').select('id, name, isActive, isApproved, createdAt');
        if (error) return [];
        return data || [];
    } catch { return []; }
}

import { isInternalStaff } from "@/lib/rbac";

export default async function AdminDashboard({ searchParams }: { searchParams: { stripe_connected?: string } }) {

    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();

    let isAuthorized = !!adminSession || (isAuth && isInternalStaff(role));

    if (!isAuthorized) {
        redirect("/admin/login");
    }

    const pendingItems = await getPendingItems();
    const drivers = await getPendingDrivers();
    const activeOrders = await getActiveOrders();
    const allOrders = await getAllOrders();
    const restaurants = await getAllRestaurants();
    const auditLogs = await getAuditLogs();

    const isStripeConnected = (await searchParams).stripe_connected === "true";

    return (
        <div className="min-h-screen">
            <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 px-6 py-4">
                <div className="container flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold tracking-tighter">
                        True<span className="text-gradient">Serve</span> Admin
                    </Link>
                    <div className="flex gap-4 items-center">
                        <Link href="/admin/dashboard" className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary pb-1">Control Center</Link>
                        <Link href="/admin/pricing" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Pricing</Link>
                        <Link href="/admin/settings" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Settings</Link>
                        <Link href="/admin/team" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Team</Link>
                        <Link href="/admin/support" className="hidden xs:block text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Support</Link>
                        <form action={async () => {
                            "use server";
                            await logout();
                        }}>
                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Log Out</button>
                        </form>
                    </div>
                </div>
            </nav>

            <main className="container py-12 animate-fade-in">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 w-full border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter">Admin <span className="text-gradient">Registry</span></h1>
                        <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold">Control Center configuration</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* System Status Toggle */}
                        <div className="px-4 py-2 border border-white/10 rounded-full flex items-center gap-3 bg-white/5">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Ordering System</span>
                            {await (async () => {
                                const { isOrderingEnabled } = await import('@/lib/system');
                                const enabled = await isOrderingEnabled();
                                const { toggleOrderingStatus } = await import('../actions');
                                return (
                                    <form action={async () => { "use server"; await toggleOrderingStatus(!enabled); }}>
                                        <button className={`w-10 h-5 rounded-full p-1 transition-colors relative ${enabled ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                            <div className={`w-3 h-3 rounded-full bg-white shadow-md transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </form>
                                );
                            })()}
                        </div>

                        {/* Stripe Connect Section */}
                        {isStripeConnected ? (
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 font-black uppercase tracking-widest text-[10px]">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                Stripe Connected
                            </div>
                        ) : (
                            <a href="https://dashboard.stripe.com/acct_1Sdd5I2XvtkOTi1j/payment-links/create" target="_blank" rel="noopener noreferrer" className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-full font-black uppercase tracking-widest text-[10px] transition-colors shadow-lg shadow-primary/20">
                                Connect Stripe
                            </a>
                        )}
                    </div>
                </div>

                {/* KPI Dashboard (V1) */}
                <KPIDashboard orders={allOrders} drivers={drivers} restaurants={restaurants} />

                {/* QA TOOLBOX (Pilot Testing Only) */}
                <div className="my-16">
                    <QAToolbox restaurants={restaurants} />
                </div>

                {/* Active Deliveries Map / List */}
                <section className="mb-16">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            🛰️ Live Delivery Monitor
                            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full">{activeOrders.length} Active</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeOrders.map((order) => (
                            <div key={order.id} className="card p-6 bg-black/40 border-white/5 hover:border-emerald-500/30 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Order {order.id.slice(-6).toUpperCase()}</span>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${order.status === 'PICKED_UP' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg">{order.restaurant?.name || "Restaurant"}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-white">${Number(order.totalAmount || order.total).toFixed(2)}</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Revenue Impact</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm">👤</div>
                                        <div>
                                            <p className="text-xs font-bold text-white">{order.user?.name}</p>
                                            <p className="text-[9px] text-slate-500 font-medium">{order.user?.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">🚗</div>
                                        <div>
                                            <p className="text-xs font-bold text-white">{order.driver?.user?.name || "Dispatching..."}</p>
                                            <p className="text-[9px] text-slate-500 font-medium">{order.driver?.user?.phone || "Awaiting Pickup"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                                    <form action={async () => { "use server"; const { forceCompleteOrder } = await import('../actions'); await forceCompleteOrder(order.id); }} className="flex-1">
                                        <button className="w-full text-[10px] font-black uppercase tracking-widest py-2 hover:bg-white/5 rounded-lg transition-colors">
                                            Force Complete
                                        </button>
                                    </form>
                                    <form action={async () => { "use server"; const { adminCancelOrder } = await import('../actions'); await adminCancelOrder(order.id); }} className="flex-1">
                                        <button className="w-full text-[10px] font-black uppercase tracking-widest py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                            Cancel
                                        </button>
                                    </form>
                                </div>

                            </div>
                        ))}
                        {activeOrders.length === 0 && (
                            <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-[2rem]">
                                <p className="text-4xl mb-4 opacity-20">📡</p>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active deliveries at this time.</p>
                            </div>
                        )}
                    </div>
                </section>


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
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
                                            <button className="btn btn-primary text-[10px] font-black uppercase tracking-widest py-2 px-4 shadow-lg shadow-primary/20">
                                                Approve
                                            </button>
                                        </form>
                                        <form action={async () => { "use server"; await rejectMenuItem(item.id); }}>
                                            <button className="btn btn-outline text-[10px] font-black uppercase tracking-widest py-2 px-4 border-red-500/50 text-red-400 hover:bg-red-500/10">
                                                Reject
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                            {pendingItems.length === 0 && (
                                <div className="p-12 text-center rounded-[2rem] border border-dashed border-white/10 opacity-50">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">No menu items pending approval.</p>
                                </div>
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
                                            <h3 className="font-bold text-lg">{driver.user?.name || driver.name || "Unknown"}</h3>
                                            <p className="text-sm text-slate-400 font-medium">{driver.user?.email || driver.email || "No Email"}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] text-slate-500 font-mono tracking-tight">{driver.backgroundCheckId || "ID_PENDING"}</span>
                                                <span className="text-slate-700 text-[10px]">•</span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${driver.hasSignedAgreement ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    Agreement: {driver.hasSignedAgreement ? 'SIGNED' : 'NOT SIGNED'}
                                                </span>
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

                                            {driver.aiMetadata && (
                                                <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">AI Audit Log</span>
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${driver.aiMetadata.idScan?.isValid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'
                                                            }`}>
                                                            Confidence: {(driver.aiMetadata.idScan?.confidence * 100 || 0).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="text-[9px]">
                                                            <p className="text-slate-500 uppercase font-black tracking-tighter">Extracted Name</p>
                                                            <p className="text-white font-bold truncate">{driver.aiMetadata.idScan?.extractedData?.name || "???"}</p>
                                                        </div>
                                                        <div className="text-[9px]">
                                                            <p className="text-slate-500 uppercase font-black tracking-tighter">Doc Type</p>
                                                            <p className="text-white font-bold">{driver.aiMetadata.idScan?.extractedData?.documentType || "???"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-6">
                                        <form action={async () => { "use server"; const { approveDriver } = await import('../actions'); await approveDriver(driver.id); }}>
                                            <button
                                                disabled={driver.backgroundCheckStatus !== 'CLEARED' || !driver.hasSignedAgreement}
                                                className="btn btn-primary text-[10px] py-1.5 px-3 shadow-none disabled:opacity-40 disabled:grayscale font-black uppercase tracking-widest"
                                            >
                                                Approve
                                            </button>
                                        </form>
                                        <form action={async () => { "use server"; const { rejectDriver } = await import('../actions'); await rejectDriver(driver.id); }}>
                                            <button
                                                className="btn btn-outline text-[10px] py-1.5 px-3 border-red-500/50 text-red-400 hover:bg-red-500/10 font-black uppercase tracking-widest"
                                            >
                                                Reject
                                            </button>
                                        </form>

                                        <form action={async () => { "use server"; const { refreshBackgroundCheck } = await import('../actions'); await refreshBackgroundCheck(driver.id); }}>
                                            <button type="submit" className="btn btn-outline text-[10px] py-1.5 px-2 border-white/5 text-slate-500 hover:bg-white/5 font-black uppercase tracking-widest transition-all">
                                                ↻ Check
                                            </button>
                                        </form>
                                        <div className="flex gap-1 ml-auto">
                                            {driver.insuranceDocumentUrl && (
                                                <a href={driver.insuranceDocumentUrl} target="_blank" className="text-[10px] py-1.5 px-3 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 font-black uppercase tracking-widest transition-all">
                                                    Insurance
                                                </a>
                                            )}
                                            {driver.registrationDocumentUrl && (
                                                <a href={driver.registrationDocumentUrl} target="_blank" className="text-[10px] py-1.5 px-3 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 font-black uppercase tracking-widest transition-all">
                                                    Docs
                                                </a>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            ))}
                            {drivers.filter(d => !d.vehicleVerified && (d.insuranceDocumentUrl || d.registrationDocumentUrl)).length === 0 && (
                                <div className="p-12 text-center rounded-[2rem] border border-dashed border-white/10 opacity-50">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">No drivers pending approval.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Audit Log / Change History */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            📜 System Audit Log
                            <span className="bg-white/5 text-slate-500 text-xs px-2 py-1 rounded-full">{auditLogs.length} Recent</span>
                        </h2>
                    </div>
                    <div className="card overflow-x-auto custom-scrollbar border-white/5 bg-black/40">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Actor</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Action</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Target</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Time</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.map((log) => (
                                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/20 text-[10px] flex items-center justify-center font-bold text-primary">
                                                    {log.actor?.name?.[0] || 'S'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-white">{log.actor?.name || "System"}</span>
                                                    <span className="text-[9px] text-slate-500 font-medium">{log.actor?.role || 'SYSTEM'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{log.action.replace(/_/g, " ")}</span>
                                                {log.message && <span className="text-[10px] text-slate-400 italic line-clamp-1">{log.message}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">{log.entityType}</span>
                                                <span className="text-[9px] font-mono text-slate-600 truncate max-w-[100px]">{log.targetId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleDateString()}
                                            <span className="block text-[10px] text-slate-600">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {(log.before || log.after) ? (
                                                <button className="text-[10px] font-black text-primary group-hover:underline uppercase tracking-widest border border-primary/20 px-2 py-1 rounded-md hover:bg-primary/5 transition-all">
                                                    View Diff
                                                </button>
                                            ) : (
                                                <span className="text-[9px] text-slate-700 uppercase font-bold">No Data</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {auditLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-20">
                                                <span className="text-4xl text-white">📜</span>
                                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Audit trail is empty</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}
