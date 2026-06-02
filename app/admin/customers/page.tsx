import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import AdminPortalWrapper from "@/app/admin/AdminPortalWrapper";
import { canAccessAdminSection } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { filterAdminUsers } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

function money(value: number) {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function AdminCustomersPage({
    searchParams,
}: {
    searchParams?: Promise<{ q?: string }>;
}) {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const query = (resolvedSearchParams.q || "").trim().toLowerCase();
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, "customers"));
    if (!isAuthorized) redirect("/admin/login");

    const { data: users } = await supabaseAdmin
        .from("User")
        .select("id, email, name, phone, role, createdAt")
        .eq("role", "CUSTOMER")
        .order("createdAt", { ascending: false })
        .limit(250);

    const { data: orders } = await supabaseAdmin
        .from("Order")
        .select("id, userId, status, totalAmount, createdAt")
        .order("createdAt", { ascending: false })
        .limit(1000);

    const customers = filterAdminUsers(users || []).filter((user: any) => {
        if (!query) return true;
        return [user.name, user.email, user.phone].some((value) =>
            String(value || "").toLowerCase().includes(query)
        );
    });

    const ordersByUser = new Map<string, any[]>();
    (orders || []).forEach((order: any) => {
        const list = ordersByUser.get(order.userId) || [];
        list.push(order);
        ordersByUser.set(order.userId, list);
    });

    const totalLifetimeValue = customers.reduce((sum: number, customer: any) => {
        const customerOrders = ordersByUser.get(customer.id) || [];
        return sum + customerOrders.reduce((orderSum, order) => orderSum + Number(order.totalAmount || 0), 0);
    }, 0);
    const issueCount = (orders || []).filter((order: any) =>
        ["REFUNDED", "CANCELLED", "DISPUTED"].includes(String(order.status || "").toUpperCase())
    ).length;

    return (
        <AdminPortalWrapper role={role}>
            <style>{`
                .ops-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
                .ops-card, .ops-table-wrap { background: #141a18; border: 1px solid #1e2420; border-radius: 12px; }
                .ops-card { padding: 16px; }
                .ops-label { color: #777; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
                .ops-value { color: #fff; font-size: 28px; font-weight: 800; margin-top: 7px; }
                .ops-sub { color: #888; font-size: 12px; margin-top: 4px; }
                .ops-search { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
                .ops-input { min-width: 280px; border: 1px solid #1e2420; background: #101512; color: #fff; border-radius: 8px; padding: 10px 12px; }
                .ops-btn { border: 1px solid #24302a; background: #0f1311; color: #fff; border-radius: 8px; padding: 10px 14px; text-decoration: none; cursor: pointer; }
                .ops-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 860px; }
                .ops-table th, .ops-table td { padding: 13px 16px; border-bottom: 1px solid #1e2420; text-align: left; }
                .ops-table th { color: #666; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
                .ops-table td { color: #aaa; }
                .ops-table tr:last-child td { border-bottom: 0; }
                .ops-name { color: #fff; font-weight: 800; }
                .ops-pill { display: inline-flex; border-radius: 999px; padding: 3px 9px; font-size: 10px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
                .ops-pill.green { color: #34d399; background: rgba(52,211,153,.08); border: 1px solid rgba(52,211,153,.22); }
                .ops-pill.orange { color: #fb923c; background: rgba(249,115,22,.08); border: 1px solid rgba(249,115,22,.22); }
                @media (max-width: 980px) { .ops-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 640px) { .ops-grid { grid-template-columns: 1fr; } .ops-input { min-width: 0; width: 100%; } }
            `}</style>
            <div className="adm-page-header">
                <h1>Customers</h1>
                <p>Ordering accounts, contact history, lifetime value, and refund risk.</p>
                <form method="get" className="ops-search">
                    <input className="ops-input" name="q" defaultValue={resolvedSearchParams.q || ""} placeholder="Search customers..." />
                    <button className="ops-btn" type="submit">Search</button>
                    {resolvedSearchParams.q ? <a className="ops-btn" href="/admin/customers">Clear</a> : null}
                </form>
            </div>
            <div className="adm-page-body">
                <div className="ops-grid">
                    <div className="ops-card"><div className="ops-label">Customers</div><div className="ops-value">{customers.length}</div><div className="ops-sub">Active customer records</div></div>
                    <div className="ops-card"><div className="ops-label">Lifetime value</div><div className="ops-value">{money(totalLifetimeValue)}</div><div className="ops-sub">Visible customer orders</div></div>
                    <div className="ops-card"><div className="ops-label">Refund / dispute history</div><div className="ops-value">{issueCount}</div><div className="ops-sub">Orders needing support context</div></div>
                    <div className="ops-card"><div className="ops-label">Suspended</div><div className="ops-value">0</div><div className="ops-sub">Account suspension field not enabled yet</div></div>
                </div>
                <div className="ops-table-wrap">
                    <table className="ops-table">
                        <thead><tr><th>Customer</th><th>Status</th><th>Orders</th><th>Lifetime value</th><th>Refund / dispute</th><th>Contact</th><th>Joined</th></tr></thead>
                        <tbody>
                            {customers.map((customer: any) => {
                                const customerOrders = ordersByUser.get(customer.id) || [];
                                const ltv = customerOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
                                const issues = customerOrders.filter((order) => ["REFUNDED", "CANCELLED", "DISPUTED"].includes(String(order.status || "").toUpperCase())).length;
                                return (
                                    <tr key={customer.id}>
                                        <td><div className="ops-name">{customer.name || "Customer"}</div><div>{customer.email || "No email"}</div></td>
                                        <td><span className="ops-pill green">Active</span></td>
                                        <td>{customerOrders.length}</td>
                                        <td>{money(ltv)}</td>
                                        <td><span className={issues ? "ops-pill orange" : "ops-pill green"}>{issues}</span></td>
                                        <td>{customer.phone || customer.email || "No contact"}</td>
                                        <td>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "—"}</td>
                                    </tr>
                                );
                            })}
                            {customers.length === 0 ? <tr><td colSpan={7}>No customers found.</td></tr> : null}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminPortalWrapper>
    );
}
