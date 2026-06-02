import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import AdminPortalWrapper from "@/app/admin/AdminPortalWrapper";
import { canAccessAdminSection } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function money(value: number) {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function AdminDisputesPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, "disputes"));
    if (!isAuthorized) redirect("/admin/login");

    const { data: orders } = await supabaseAdmin
        .from("Order")
        .select("id, userId, restaurantId, status, totalAmount, createdAt")
        .in("status", ["CANCELLED", "REFUNDED", "DISPUTED"])
        .order("createdAt", { ascending: false })
        .limit(100);

    const { data: chats, error: chatsError } = await supabaseAdmin
        .from("SupportChat")
        .select("id, status, role, userId, createdAt, updatedAt")
        .order("updatedAt", { ascending: false })
        .limit(50);

    const supportChats = chatsError ? [] : (chats || []);
    const openChats = supportChats.filter((chat: any) => !["RESOLVED", "CLOSED"].includes(String(chat.status || "").toUpperCase()));
    const dollarAtRisk = (orders || []).reduce((sum: number, order: any) => sum + Number(order.totalAmount || 0), 0);

    return (
        <AdminPortalWrapper role={role}>
            <style>{`
                .dis-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
                .dis-card, .dis-table-wrap { background: #141a18; border: 1px solid #1e2420; border-radius: 12px; }
                .dis-card { padding: 16px; }
                .dis-label { color: #777; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
                .dis-value { color: #fff; font-size: 28px; font-weight: 800; margin-top: 7px; }
                .dis-sub { color: #888; font-size: 12px; margin-top: 4px; }
                .dis-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 820px; }
                .dis-table th, .dis-table td { padding: 13px 16px; border-bottom: 1px solid #1e2420; text-align: left; }
                .dis-table th { color: #666; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
                .dis-table td { color: #aaa; }
                .dis-table tr:last-child td { border-bottom: 0; }
                .dis-pill { display: inline-flex; border-radius: 999px; padding: 3px 9px; font-size: 10px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; color: #fb923c; background: rgba(249,115,22,.08); border: 1px solid rgba(249,115,22,.22); }
                @media (max-width: 980px) { .dis-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 640px) { .dis-grid { grid-template-columns: 1fr; } }
            `}</style>
            <div className="adm-page-header">
                <h1>Disputes</h1>
                <p>Order problems, refunds, complaints, open support issues, and dollars at risk.</p>
            </div>
            <div className="adm-page-body">
                <div className="dis-grid">
                    <div className="dis-card"><div className="dis-label">Open support</div><div className="dis-value">{openChats.length}</div><div className="dis-sub">Unresolved chat/support rows</div></div>
                    <div className="dis-card"><div className="dis-label">Order issues</div><div className="dis-value">{(orders || []).length}</div><div className="dis-sub">Refunded, cancelled, disputed</div></div>
                    <div className="dis-card"><div className="dis-label">Dollars at risk</div><div className="dis-value">{money(dollarAtRisk)}</div><div className="dis-sub">Issue order totals</div></div>
                    <div className="dis-card"><div className="dis-label">Resolved</div><div className="dis-value">{supportChats.length - openChats.length}</div><div className="dis-sub">Closed support rows</div></div>
                </div>
                <div className="dis-table-wrap">
                    <table className="dis-table">
                        <thead><tr><th>Type</th><th>Status</th><th>Dollar amount</th><th>Customer</th><th>Restaurant</th><th>Created</th></tr></thead>
                        <tbody>
                            {(orders || []).map((order: any) => (
                                <tr key={order.id}>
                                    <td>Order issue</td>
                                    <td><span className="dis-pill">{order.status}</span></td>
                                    <td>{money(Number(order.totalAmount || 0))}</td>
                                    <td>{order.userId}</td>
                                    <td>{order.restaurantId}</td>
                                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}</td>
                                </tr>
                            ))}
                            {(orders || []).length === 0 ? <tr><td colSpan={6}>No refund, cancellation, or dispute rows found.</td></tr> : null}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminPortalWrapper>
    );
}
