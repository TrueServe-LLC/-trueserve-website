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
                        <button className="nav-link !bg-transparent !border-none !cursor-pointer">Log Out</button>
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
                                <button 
                                    className={`toggle-switch ${f.state ? 'on' : 'off'}`}
                                    aria-label={`Toggle ${f.label}`}
                                >
                                    <div className="toggle-knob"></div>
                                </button>
                            </form>
                        ));
                    })()}
                    
                    {!isStripeConnected && (
                        <a href="https://dashboard.stripe.com/acct_1Sdd5I2XvtkOTi1j/payment-links/create" target="_blank" rel="noopener noreferrer" className="nav-cta !no-underline">
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


            <div className="section-divider" />

            <div className="page">
                <div className="sec-hd">
                    <div className="sec-title">🛰️ Live Monitor <span className="badge badge-gray">{activeOrders.length} Active</span></div>
                    <a href="https://lcking992-1774309654202.atlassian.net/servicedesk/customer/portal/1" target="_blank" rel="noopener noreferrer" className="nav-cta !no-underline !text-[10px]">↗ Report Incident</a>
                </div>
                <div className="two-col" style={{gridTemplateColumns: '1fr', marginBottom: '20px'}}>
                    <div className="panel" style={{padding: '0'}}>
                   {activeOrders.length === 0 ? (
                       <div className="empty-panel">No active deliveries at this time.</div>
                   ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-[#1c1f28]">
                           {activeOrders.map(order => (
                                <div key={order.id} className="panel !border-none">
                                   <div className="panel-hd">Order {order.id.slice(-6).toUpperCase()} <span className={order.status === 'PICKED_UP' ? 'badge badge-ok' : 'badge badge-gray'}>{order.status.replace('_', ' ')}</span></div>
                                   <div className="text-[15px] font-bold text-white">{order.restaurant?.name || 'Restaurant'}</div>
                                   <div className="text-[11px] text-[#555] my-1 mb-3">${Number(order.totalAmount || order.total).toFixed(2)} Revenue Impact</div>
                                   <div className="flex gap-2">
                                       <FastActionBtn 
                                           action={async () => { "use server"; const { forceCompleteOrder } = await import('../actions'); await forceCompleteOrder(order.id); }} 
                                           className="nav-cta" 
                                           loadingText="..."
                                       >
                                           Complete
                                       </FastActionBtn>
                                       <FastActionBtn 
                                           action={async () => { "use server"; const { adminCancelOrder } = await import('../actions'); await adminCancelOrder(order.id); }} 
                                           className="nav-cta border-red-900 text-red-400" 
                                           loadingText="..."
                                       >
                                           Cancel
                                       </FastActionBtn>
                                   </div>
                               </div>
                           ))}
                       </div>
                   )}
                    </div>
                </div>

                <div className="divider" />

                <div className="two-col">
                    <div className="panel">
                        <div className="panel-hd">📋 Menu Approvals <span className="badge badge-gray">{pendingItems.length} Pending</span></div>
                        {pendingItems.length === 0 ? (
                            <div className="empty-panel">No menu items pending approval.</div>
                        ) : (
                            <div className="space-y-4 pt-4">
                                {pendingItems.map(item => (
                                    <div key={item.id} className="bg-[#0c0e13] border border-[#1c1f28] p-3">
                                        <div className="text-[13px] font-bold text-[#ccc]">{item.name}</div>
                                        <div className="text-[10px] text-[#555]">{item.restaurant.name}</div>
                                        <div className="flex gap-1 mt-2">
                                            <FastActionBtn action={async () => { "use server"; await approveMenuItem(item.id); }} className="nav-cta" loadingText="...">Approve</FastActionBtn>
                                            <FastActionBtn action={async () => { "use server"; await rejectMenuItem(item.id); }} className="nav-cta border-red-900 text-red-400" loadingText="...">Reject</FastActionBtn>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="panel">
                        <div className="panel-hd">🚗 Driver Applications <span className="badge badge-warn">{drivers.filter(d => !d.vehicleVerified && (d.insuranceDocumentUrl || d.registrationDocumentUrl)).length} Pending</span></div>
                        {drivers.filter(d => !d.vehicleVerified).length === 0 ? (
                            <div className="empty-panel">No drivers pending approval.</div>
                        ) : (
                            drivers.filter(d => !d.vehicleVerified).map(driver => (
                                <div key={driver.id} className="border-b border-[#1c1f28] pb-3 mb-3">
                                    <div className="flex justify-between">
                                        <div>
                                            <div className="text-[15px] font-bold text-white">{driver.user?.name || 'Unknown'}</div>
                                            <div className="text-[11px] text-[#555]">{driver.user?.email || 'No Email'}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="badge badge-warn mb-1">Confidence: {(driver.aiMetadata?.idScan?.confidence * 100 || 0).toFixed(0)}%</div>
                                            <div className="text-[9px] text-[#444] font-mono">BG: {driver.backgroundCheckStatus || 'PENDING'}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 mt-3">
                                        <FastActionBtn action={async () => { "use server"; const { approveDriver } = await import('../actions'); await approveDriver(driver.id); }} className="nav-cta" loadingText="...">Approve</FastActionBtn>
                                        <FastActionBtn action={async () => { "use server"; const { rejectDriver } = await import('../actions'); await rejectDriver(driver.id); }} className="nav-cta border-red-900 text-red-400" loadingText="...">Reject</FastActionBtn>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="divider" />

                {/* AUDIT LOG */}
                <div className="sec-hd">
                    <div className="sec-title">📜 System Audit Log <span className="badge badge-gray">{auditLogs.length} Recent</span></div>
                </div>
                            <div className="bg-[#0f1219] border border-[#1c1f28] mb-10">
                                <table className="audit-table">
                                    <thead>
                                        <tr>
                                            <th>Actor</th><th>Action</th><th>Target</th><th>Time</th><th>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {auditLogs.length === 0 ? (
                                            <tr><td colSpan={5} className="empty-panel !text-[#2a2f3a]">No recent audit entries.</td></tr>
                                        ) : (
                                            auditLogs.map(log => (
                                                <tr key={log.id}>
                                                    <td>{log.actor?.name || 'System'}</td>
                                                    <td className="text-[#e8a230]">{log.action.replace(/_/g, ' ')}</td>
                                        <td>{log.entityType}</td>
                                        <td>{new Date(log.createdAt).toLocaleTimeString()}</td>
                                        <td>{log.message || '—'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* OPERATIONAL PARAMETERS */}
                <div className="page-title">Operational <span>Parameters</span></div>
                <div className="page-sub">Fine-tune global platform constraints and feature rollouts.</div>

                <div className="params-grid">
                    <div className="param-row">
                        <div className="param-info">
                            <div className="param-name">Marketplace Visibility</div>
                            <div className="param-desc">Global switch to enable/disable all ordering features.</div>
                        </div>
                        <div className="param-right">
                            <div className="param-value enabled">Enabled</div>
                            <button className="nav-cta !text-[10px] !bg-transparent border !border-[#2a2f3a] !text-[#888]">Request Change</button>
                        </div>
                    </div>
                    <div className="param-row">
                        <div className="param-info">
                            <div className="param-name">Base Service Fee</div>
                            <div className="param-desc">Base platform service percentage on orders.</div>
                        </div>
                        <div className="param-right">
                            <div className="param-value">10%</div>
                            <button className="nav-cta !text-[10px]">Update</button>
                        </div>
                    </div>
                </div>
                
                <div className="divider" />

                {/* PRICING ENGINE */}
                <div className="page-title">Pricing <span>Engine</span></div>
                <div className="page-sub">Dynamic base pay, mileage rates, and surge policies.</div>

                <div className="rule-card">
                    <div className="rule-hd">
                        <div className="rule-name">Global Base Policy <span className="text-[#e8a230] ml-2">v1.0.4-Pilot</span></div>
                        <span className="badge badge-ok">Active</span>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-6">
                        <div>
                            <div className="text-[9px] font-bold text-[#555] uppercase mb-2">Base Pay (Per Drop)</div>
                            <div className="text-[32px] font-bold text-white font-mono">$3.55</div>
                        </div>
                        <div>
                            <div className="text-[9px] font-bold text-[#555] uppercase mb-2">Surge Multiplier</div>
                            <div className="text-[32px] font-bold text-[#e8a230] font-mono">1.2x</div>
                        </div>
                    </div>
                </div>

                <div className="divider" />

                {/* MARKETPLACE REGISTRY */}
                <div className="sec-hd">
                    <div className="sec-title">Marketplace Registry <span className="badge badge-gray">{restaurants.length} Total</span></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20 px-2">
                    {restaurants.map(r => (
                        <div key={r.id} className="panel !border-[#1c1f28]">
                            <div className="panel-hd">{r.name} <span className={r.isApproved ? 'badge badge-ok' : 'badge badge-warn'}>{r.isApproved ? 'LIVE' : 'PENDING'}</span></div>
                            <div className="text-[10px] text-[#555] mb-3 uppercase tracking-[0.1em]">Payout Status: NOT CONNECTED</div>
                            <form action={async () => { "use server"; const { generateMerchantStripeLink } = await import('../actions'); await generateMerchantStripeLink(r.id); }}>
                                <button className="nav-cta w-full !text-[10px]">⚡ Send Onboarding Link</button>
                            </form>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
