import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import AdminStyles from "@/components/admin/AdminStyles";
import Link from "next/link";
import { redirect } from "next/navigation";
import { approveMenuItem, rejectMenuItem, flagMenuItem, connectStripe, logout } from "../actions";
import { getAuthSession } from "@/app/auth/actions";
import KPIDashboard from "@/components/admin/KPIDashboard";
import ScenarioEngine from "@/components/admin/ScenarioEngine";
import SystemToggle from "@/components/admin/SystemToggle";
import FastActionBtn from "@/components/admin/FastActionBtn";
import AsanaBoard from "@/components/admin/AsanaBoard";

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

import { isInternalStaff, hasPermission } from "@/lib/rbac";

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
    const { userId, stripeAccountId } = await getAuthSession();

    const isStripeConnected = (await searchParams).stripe_connected === "true";

    return (
        <div className="db">
            <AdminStyles />
            <div className="nav">
                <div className="nav-brand">True <span>SERVE</span></div>
                <div className="nav-links">
                    {hasPermission(role, 'manage_pricing') && <Link href="/admin/pricing" className="nav-link">Pricing</Link>}
                    {hasPermission(role, 'manage_system_settings') && <Link href="/admin/settings" className="nav-link">Settings</Link>}
                    <Link href="/admin/content" className="nav-link">CMS</Link>
                    <Link href="/admin/team" className="nav-link">Team</Link>
                    <a href="https://app.asana.com/0/1213802368265152/board" target="_blank" rel="noopener noreferrer" className="nav-link alert">● Asana</a>
                    {hasPermission(role, 'view_dashboard') && <Link href="/admin/dashboard" className="nav-link active">Dashboard</Link>}
                    <a href="https://lcking992-1774309654202.atlassian.net/servicedesk/customer/portal/1" target="_blank" rel="noopener noreferrer" className="nav-link alert">● Triage Center</a>
                    <form action={async () => { "use server"; await logout(); }}>
                        <button className="nav-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>Log Out</button>
                    </form>
                </div>
            </div>

            {!stripeAccountId && role === 'ADMIN' && (
                <div className="infra-banner">
                    <div className="infra-left">
                        <div className="infra-title">Complete Your <span>Infrastructure</span></div>
                        <div className="infra-sub">Admin Action Required: Finalize Stripe Connect Link</div>
                    </div>
                    <form action={connectStripe}>
                        <button className="infra-btn">Continue to Stripe Connect →</button>
                    </form>
                </div>
            )}

            <div className="registry-header">
                <div>
                    <div className="registry-title">Admin <span>Registry</span></div>
                    <div className="registry-sub">Control Center Configuration</div>
                </div>
                <div className="toggles-row">
                    {await (async () => {
                        const { isOrderingEnabled, isAiScannerEnabled, isGoogleRatingSyncEnabled, isExpressCheckoutActive } = await import('@/lib/system');
                        const { toggleOrderingStatus, toggleAiScanner, toggleGoogleRatings, toggleExpressCheckout } = await import('../actions');
                        
                        const flags = [
                            { label: 'Marketplace', state: await isOrderingEnabled(), action: toggleOrderingStatus },
                            { label: 'AI Scanner', state: await isAiScannerEnabled(), action: toggleAiScanner },
                            { label: 'Google Sync', state: await isGoogleRatingSyncEnabled(), action: toggleGoogleRatings },
                            { label: 'Express Checkout', state: await isExpressCheckoutActive(), action: toggleExpressCheckout }
                        ];

                        return flags.map(f => (
                            <form key={f.label} className="toggle-block" action={async () => { "use server"; await f.action(!f.state); }}>
                                <span className="toggle-label">{f.label}</span>
                                <button className={`toggle-switch ${f.state ? 'on' : 'off'}`}>
                                    <div className="toggle-knob"></div>
                                </button>
                            </form>
                        ));
                    })()}
                    
                    {!isStripeConnected && (
                        <a href="https://dashboard.stripe.com/acct_1Sdd5I2XvtkOTi1j/payment-links/create" target="_blank" rel="noopener noreferrer" className="nav-cta" style={{ textDecoration: 'none' }}>
                            Connect Stripe
                        </a>
                    )}
                </div>
            </div>

                {/* KPI Dashboard (V1) */}
                <KPIDashboard orders={allOrders} drivers={drivers} restaurants={restaurants} />

                {/* Scenario Engine (v2 CORRECTED) */}
                <ScenarioEngine />

                {/* Asana Project Board */}
                <AsanaBoard />


                {/* Active Deliveries Map / List */}
                <section className="mb-16">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                            🛰️ Live Monitor
                            <span className="bg-primary/20 text-primary text-[10px] px-3 py-1 rounded-full uppercase font-black border border-primary/20">{activeOrders.length} Active</span>
                        </h2>
                        <a 
                            href="https://lcking992-1774309654202.atlassian.net/servicedesk/customer/portal/1" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center gap-2"
                        >
                            <span>🛠️</span> Report Incident
                        </a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeOrders.map((order) => (
                            <div key={order.id} className="card p-6 bg-black/40 border-white/5 hover:border-emerald-500/30 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Order {order.id.slice(-6).toUpperCase()}</span>
                            <span className={`text-[9px] px-3 py-1 flex items-center justify-center rounded-full font-black uppercase tracking-widest min-w-[100px] border whitespace-nowrap ${order.status === 'PICKED_UP' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white/5 text-slate-300 border-white/10'
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
                                    <FastActionBtn 
                                        action={async () => { "use server"; const { forceCompleteOrder } = await import('../actions'); await forceCompleteOrder(order.id); }} 
                                        className="flex-1 w-full text-[10px] font-black uppercase tracking-widest py-2 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5"
                                        loadingText="Completing..."
                                    >
                                        Force Complete
                                    </FastActionBtn>
                                    <FastActionBtn 
                                        action={async () => { "use server"; const { adminCancelOrder } = await import('../actions'); await adminCancelOrder(order.id); }} 
                                        className="flex-1 w-full text-[10px] font-black uppercase tracking-widest py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/10"
                                        loadingText="Canceling..."
                                    >
                                        Cancel
                                    </FastActionBtn>
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
                                        <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest border shadow-sm ${item.status === 'FLAGGED' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-300 text-sm mb-4">{item.description}</p>
                                    <div className="flex gap-2">
                                        <FastActionBtn 
                                            action={async () => { "use server"; await approveMenuItem(item.id); }}
                                            className="btn btn-primary text-[10px] font-black uppercase tracking-widest py-2 px-4 shadow-lg shadow-primary/20"
                                            loadingText="OK..."
                                        >
                                            Approve
                                        </FastActionBtn>
                                        <FastActionBtn 
                                            action={async () => { "use server"; await rejectMenuItem(item.id); }}
                                            className="btn btn-outline text-[10px] font-black uppercase tracking-widest py-2 px-4 border-red-500/50 text-red-400 hover:bg-red-500/10"
                                            loadingText="Rejecting..."
                                        >
                                            Reject
                                        </FastActionBtn>
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
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${driver.hasSignedAgreement ? 'text-primary' : 'text-red-400'}`}>
                                                    Agreement: {driver.hasSignedAgreement ? 'SIGNED' : 'NOT SIGNED'}
                                                </span>
                                            </div>

                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-sm">
                                                Pending Approval
                                            </span>

                                            {/* Background Check Badge */}
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border leading-none whitespace-nowrap shadow-sm ${driver.backgroundCheckStatus === 'CLEARED' ? 'bg-primary/10 text-primary border-primary/20' :
                                                driver.backgroundCheckStatus === 'FLAGGED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    'bg-white/5 text-slate-400 border-white/10'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${driver.backgroundCheckStatus === 'CLEARED' ? 'bg-primary shadow-[0_0_10px_rgba(245,158,11,0.4)]' :
                                                    driver.backgroundCheckStatus === 'FLAGGED' ? 'bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                                        'bg-slate-500 animate-pulse'
                                                    }`} />
                                                BG: {driver.backgroundCheckStatus || "PENDING"}
                                            </div>

                                            {driver.aiMetadata && (
                                                <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">AI Audit Log</span>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${driver.aiMetadata.idScan?.isValid ? 'bg-primary/10 text-primary border-primary/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
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
                                        <div className="flex bg-white/5 border border-white/5 rounded-xl overflow-hidden p-1">
                                            {driver.backgroundCheckStatus === 'CLEARED' && driver.hasSignedAgreement && (
                                                <FastActionBtn 
                                                    action={async () => { "use server"; const { approveDriver } = await import('../actions'); await approveDriver(driver.id); }}
                                                    className="btn btn-primary text-[10px] py-1.5 px-3 shadow-none font-black uppercase tracking-widest"
                                                    loadingText="Approving..."
                                                >
                                                    Approve
                                                </FastActionBtn>
                                            )}
                                            <FastActionBtn 
                                                action={async () => { "use server"; const { rejectDriver } = await import('../actions'); await rejectDriver(driver.id); }}
                                                className="btn btn-outline bg-transparent border-transparent text-[10px] py-1.5 px-3 text-red-400 hover:bg-red-500/10 font-black uppercase tracking-widest"
                                                loadingText="Rejecting..."
                                            >
                                                Reject
                                            </FastActionBtn>
                                            <FastActionBtn 
                                                action={async () => { "use server"; const { refreshBackgroundCheck } = await import('../actions'); await refreshBackgroundCheck(driver.id); }}
                                                className="btn btn-outline bg-transparent border-transparent text-[10px] py-1.5 px-2 text-slate-500 hover:bg-white/5 font-black uppercase tracking-widest transition-all"
                                                loadingText="Checking..."
                                            >
                                                ↻ Check
                                            </FastActionBtn>
                                        </div>
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
                                    <th className="px-4 md:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Actor</th>
                                    <th className="px-4 md:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Action</th>
                                    <th className="px-4 md:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Target</th>
                                    <th className="px-4 md:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Time</th>
                                    <th className="px-4 md:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.map((log) => (
                                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-4 md:px-6 py-4">
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
                                        <td className="px-4 md:px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full">{log.action.replace(/_/g, " ")}</span>
                                                {log.message && <span className="text-[10px] text-slate-400 italic line-clamp-1">{log.message}</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-4">
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

                {/* Marketplace Registry (WBS Step 8) */}
                <section>
                    <h2 className="text-2xl font-bold mb-8">Marketplace <span className="text-gradient">Registry</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {restaurants.map(r => (
                            <div key={r.id} className="card p-6 bg-white/[0.02] border-white/5 hover:border-white/10 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg">{r.name}</h3>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${r.isApproved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' : 'bg-primary/10 text-primary border-primary/10'}`}>
                                        {r.isApproved ? 'LIVE' : 'PENDING'}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-slate-500">
                                        <span>Payout Status</span>
                                        <span className="text-white">NOT CONNECTED</span>
                                    </div>
                                    <form action={async () => { "use server"; const { generateMerchantStripeLink } = await import('../actions'); await generateMerchantStripeLink(r.id); }}>
                                        <button className="w-full btn btn-primary py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                                            ⚡ Send Onboarding Link
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
