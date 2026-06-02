import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { connectStripe } from "@/app/admin/actions";
import AdminPortalWrapper from "@/app/admin/AdminPortalWrapper";
import { canAccessAdminSection } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function money(value: number) {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function AdminPayoutsPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, "payouts"));
    if (!isAuthorized) redirect("/admin/login");

    const { data: restaurants } = await supabaseAdmin
        .from("Restaurant")
        .select("id, name, city, state, visibility, posSystem, stripeAccountId, owner:User(id, name, email)")
        .order("name", { ascending: true })
        .limit(250);

    const { data: orders } = await supabaseAdmin
        .from("Order")
        .select("id, restaurantId, status, totalAmount, createdAt")
        .limit(2000);

    const rows = (restaurants || []).map((restaurant: any) => {
        const restaurantOrders = (orders || []).filter((order: any) => order.restaurantId === restaurant.id);
        const payableOrders = restaurantOrders.filter((order: any) => !["CANCELLED", "REFUNDED", "DISPUTED"].includes(String(order.status || "").toUpperCase()));
        const gmv = payableOrders.reduce((sum: number, order: any) => sum + Number(order.totalAmount || 0), 0);
        const platformFee = gmv * 0.07;
        const owed = gmv - platformFee;
        const held = restaurantOrders
            .filter((order: any) => ["PENDING", "CANCELLED", "REFUNDED", "DISPUTED"].includes(String(order.status || "").toUpperCase()))
            .reduce((sum: number, order: any) => sum + Number(order.totalAmount || 0), 0);
        return { restaurant, orderCount: restaurantOrders.length, gmv, platformFee, owed, held };
    });

    const totalOwed = rows.reduce((sum, row) => sum + row.owed, 0);
    const totalHeld = rows.reduce((sum, row) => sum + row.held, 0);
    const needsStripe = rows.filter((row) => !row.restaurant.stripeAccountId).length;

    return (
        <AdminPortalWrapper role={role}>
            <style>{`
                .pay-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
                .pay-card, .pay-table-wrap, .pay-note { background: #141a18; border: 1px solid #1e2420; border-radius: 12px; }
                .pay-card { padding: 16px; }
                .pay-label { color: #777; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
                .pay-value { color: #fff; font-size: 28px; font-weight: 800; margin-top: 7px; }
                .pay-sub { color: #888; font-size: 12px; margin-top: 4px; }
                .pay-note { padding: 16px; margin-bottom: 16px; display: flex; justify-content: space-between; gap: 16px; align-items: center; }
                .pay-note h2 { color: #fff; font-size: 15px; margin: 0 0 5px; }
                .pay-note p { color: #999; font-size: 12px; line-height: 1.5; margin: 0; }
                .pay-btn { border: 0; background: #f97316; color: #0b0f0d; border-radius: 8px; padding: 10px 14px; font-weight: 900; cursor: pointer; white-space: nowrap; }
                .pay-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 960px; }
                .pay-table th, .pay-table td { padding: 13px 16px; border-bottom: 1px solid #1e2420; text-align: left; }
                .pay-table th { color: #666; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
                .pay-table td { color: #aaa; }
                .pay-table tr:last-child td { border-bottom: 0; }
                .pay-name { color: #fff; font-weight: 800; }
                .pay-pill { display: inline-flex; border-radius: 999px; padding: 3px 9px; font-size: 10px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
                .pay-pill.green { color: #34d399; background: rgba(52,211,153,.08); border: 1px solid rgba(52,211,153,.22); }
                .pay-pill.orange { color: #fb923c; background: rgba(249,115,22,.08); border: 1px solid rgba(249,115,22,.22); }
                @media (max-width: 980px) { .pay-grid { grid-template-columns: repeat(2, 1fr); } .pay-note { flex-direction: column; align-items: flex-start; } }
                @media (max-width: 640px) { .pay-grid { grid-template-columns: 1fr; } }
            `}</style>
            <div className="adm-page-header">
                <h1>Payouts</h1>
                <p>Stripe payout wrapper for merchant balances, transfer state, and held dollars.</p>
            </div>
            <div className="adm-page-body">
                <div className="pay-grid">
                    <div className="pay-card"><div className="pay-label">Estimated owed</div><div className="pay-value">{money(totalOwed)}</div><div className="pay-sub">After 7% platform commission</div></div>
                    <div className="pay-card"><div className="pay-label">Held / at risk</div><div className="pay-value">{money(totalHeld)}</div><div className="pay-sub">Pending, cancelled, refunded, disputed</div></div>
                    <div className="pay-card"><div className="pay-label">Needs Stripe</div><div className="pay-value">{needsStripe}</div><div className="pay-sub">Merchants without connected accounts</div></div>
                    <div className="pay-card"><div className="pay-label">Commission tier</div><div className="pay-value">7%</div><div className="pay-sub">Flat restaurant commission</div></div>
                </div>
                <div className="pay-note">
                    <div>
                        <h2>Stripe remains the settlement source of truth</h2>
                        <p>This screen gives operators the delivery-app view: who is owed, what is held, and which merchants still need a connected payout account.</p>
                    </div>
                    <form action={connectStripe}><button className="pay-btn" type="submit">Open Stripe Dashboard</button></form>
                </div>
                <div className="pay-table-wrap">
                    <table className="pay-table">
                        <thead><tr><th>Merchant</th><th>Transfer status</th><th>GMV</th><th>Platform fee</th><th>Estimated owed</th><th>Held</th><th>Orders</th></tr></thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.restaurant.id}>
                                    <td><div className="pay-name">{row.restaurant.name}</div><div>{row.restaurant.owner?.email || [row.restaurant.city, row.restaurant.state].filter(Boolean).join(", ") || "No contact"}</div></td>
                                    <td><span className={`pay-pill ${row.restaurant.stripeAccountId ? "green" : "orange"}`}>{row.restaurant.stripeAccountId ? "Connected" : "Needs Stripe"}</span></td>
                                    <td>{money(row.gmv)}</td>
                                    <td>{money(row.platformFee)}</td>
                                    <td>{money(row.owed)}</td>
                                    <td>{money(row.held)}</td>
                                    <td>{row.orderCount}</td>
                                </tr>
                            ))}
                            {rows.length === 0 ? <tr><td colSpan={7}>No merchant payout rows yet.</td></tr> : null}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminPortalWrapper>
    );
}
