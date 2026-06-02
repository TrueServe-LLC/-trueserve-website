import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import AdminPortalWrapper from "@/app/admin/AdminPortalWrapper";
import { approveMerchant, rejectMerchant } from "@/app/admin/actions";
import MerchantApplicationActions from "@/components/admin/MerchantApplicationActions";
import { isMockAdminRecord, shouldHideMockAdminData } from "@/lib/admin-data";
import { canAccessAdminSection } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function money(value: number) {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const DEMO_RESTAURANT_PATTERN = /\b(mock|demo|test|seed|sandbox|preview|sample|qa|staging)\b/i;

function isDemoRestaurant(restaurant: any) {
    const text = [
        restaurant.name,
        restaurant.address,
        restaurant.city,
        restaurant.state,
        restaurant.owner?.name,
        restaurant.owner?.email,
    ]
        .filter(Boolean)
        .join(" ");

    return restaurant.isMock === true || DEMO_RESTAURANT_PATTERN.test(text);
}

function posHealth(restaurant: any) {
    const visible = String(restaurant.visibility || "").toUpperCase() === "VISIBLE";
    if (restaurant.posSystem && visible) return { label: "Connected", tone: "green" };
    if (restaurant.posSystem) return { label: "Pending", tone: "orange" };
    if (visible) return { label: "Broken", tone: "red" };
    return { label: "Not started", tone: "muted" };
}

function stage(restaurant: any) {
    const visible = String(restaurant.visibility || "").toUpperCase() === "VISIBLE";
    if (!visible) return "Application";
    if (restaurant.posSystem) return "Live";
    return "POS connected";
}

export default async function AdminMerchantsPage({
    searchParams,
}: {
    searchParams?: Promise<{ q?: string }>;
}) {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const query = (resolvedSearchParams.q || "").trim().toLowerCase();
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, "merchants"));
    if (!isAuthorized) redirect("/admin/login");

    const { data: restaurants } = await supabaseAdmin
        .from("Restaurant")
        .select(`
            id,
            ownerId,
            name,
            address,
            city,
            state,
            phone,
            visibility,
            isMock,
            plan,
            posSystem,
            createdAt,
            updatedAt,
            owner:User(id, name, email, phone, role, createdAt)
        `)
        .order("createdAt", { ascending: false })
        .limit(250);

    const { data: orders } = await supabaseAdmin
        .from("Order")
        .select("id, restaurantId, status, totalAmount, createdAt")
        .limit(2000);

    const realRestaurants = (restaurants || []).filter((restaurant: any) => !isDemoRestaurant(restaurant));

    const merchantRows = (shouldHideMockAdminData()
        ? realRestaurants.filter((restaurant: any) => !isMockAdminRecord(restaurant.owner))
        : realRestaurants
    ).filter((restaurant: any) => {
        if (!query) return true;
        return [restaurant.name, restaurant.address, restaurant.city, restaurant.state, restaurant.posSystem, restaurant.owner?.email].some((value) =>
            String(value || "").toLowerCase().includes(query)
        );
    });

    const ordersByRestaurant = new Map<string, any[]>();
    (orders || []).forEach((order: any) => {
        const list = ordersByRestaurant.get(order.restaurantId) || [];
        list.push(order);
        ordersByRestaurant.set(order.restaurantId, list);
    });

    const applications = merchantRows.filter((restaurant: any) => stage(restaurant) === "Application").length;
    const live = merchantRows.filter((restaurant: any) => stage(restaurant) === "Live").length;
    const brokenPos = merchantRows.filter((restaurant: any) => posHealth(restaurant).label === "Broken").length;
    const gmv = merchantRows.reduce((sum: number, restaurant: any) => {
        return sum + (ordersByRestaurant.get(restaurant.id) || []).reduce((orderSum, order) => orderSum + Number(order.totalAmount || 0), 0);
    }, 0);

    return (
        <AdminPortalWrapper role={role}>
            <style>{`
                .mer-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
                .mer-card, .mer-pipeline, .mer-table-wrap { background: #141a18; border: 1px solid #1e2420; border-radius: 12px; }
                .mer-card { padding: 16px; }
                .mer-label { color: #777; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
                .mer-value { color: #fff; font-size: 28px; font-weight: 800; margin-top: 7px; }
                .mer-sub { color: #888; font-size: 12px; margin-top: 4px; }
                .mer-search { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
                .mer-input { min-width: 280px; border: 1px solid #1e2420; background: #101512; color: #fff; border-radius: 8px; padding: 10px 12px; }
                .mer-btn { border: 1px solid #24302a; background: #0f1311; color: #fff; border-radius: 8px; padding: 10px 14px; text-decoration: none; cursor: pointer; }
                .mer-pipeline { display: grid; grid-template-columns: repeat(3, 1fr); overflow: hidden; margin-bottom: 16px; }
                .mer-stage { padding: 16px; border-right: 1px solid #1e2420; min-height: 150px; }
                .mer-stage:last-child { border-right: 0; }
                .mer-stage h2 { color: #fff; font-size: 14px; margin: 0 0 10px; }
                .mer-mini { border: 1px solid #24302a; border-radius: 10px; padding: 10px; margin-bottom: 8px; color: #aaa; font-size: 12px; }
                .mer-mini strong { color: #fff; display: block; margin-bottom: 3px; }
                .mer-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 1020px; }
                .mer-table th, .mer-table td { padding: 13px 16px; border-bottom: 1px solid #1e2420; text-align: left; }
                .mer-table th { color: #666; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
                .mer-table td { color: #aaa; vertical-align: top; }
                .mer-table tr:last-child td { border-bottom: 0; }
                .mer-name { color: #fff; font-weight: 800; }
                .mer-pill { display: inline-flex; border-radius: 999px; padding: 3px 9px; font-size: 10px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
                .mer-pill.green { color: #34d399; background: rgba(52,211,153,.08); border: 1px solid rgba(52,211,153,.22); }
                .mer-pill.orange { color: #fb923c; background: rgba(249,115,22,.08); border: 1px solid rgba(249,115,22,.22); }
                .mer-pill.red { color: #f87171; background: rgba(248,113,113,.08); border: 1px solid rgba(248,113,113,.22); }
                .mer-pill.muted { color: #999; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); }
                @media (max-width: 980px) { .mer-grid { grid-template-columns: repeat(2, 1fr); } .mer-pipeline { grid-template-columns: 1fr; } .mer-stage { border-right: 0; border-bottom: 1px solid #1e2420; } }
                @media (max-width: 640px) { .mer-grid { grid-template-columns: 1fr; } .mer-input { min-width: 0; width: 100%; } }
            `}</style>
            <div className="adm-page-header">
                <h1>Merchants</h1>
                <p>Restaurant onboarding, POS status, 7% commission tier, GMV, kitchen verification, and owner contact. Demo and test merchants are hidden from this operating view.</p>
                <form method="get" className="mer-search">
                    <input className="mer-input" name="q" defaultValue={resolvedSearchParams.q || ""} placeholder="Search restaurants, cities, POS..." />
                    <button className="mer-btn" type="submit">Search</button>
                    {resolvedSearchParams.q ? <a className="mer-btn" href="/admin/merchants">Clear</a> : null}
                </form>
            </div>
            <div className="adm-page-body">
                <div className="mer-grid">
                    <div className="mer-card"><div className="mer-label">Applications</div><div className="mer-value">{applications}</div><div className="mer-sub">Need review or approval</div></div>
                    <div className="mer-card"><div className="mer-label">POS issues</div><div className="mer-value">{brokenPos}</div><div className="mer-sub">Live restaurants missing POS</div></div>
                    <div className="mer-card"><div className="mer-label">Live restaurants</div><div className="mer-value">{live}</div><div className="mer-sub">Visible to customers</div></div>
                    <div className="mer-card"><div className="mer-label">GMV tracked</div><div className="mer-value">{money(gmv)}</div><div className="mer-sub">Order volume from database</div></div>
                </div>

                <div className="mer-pipeline">
                    {["Application", "POS connected", "Live"].map((column) => (
                        <section key={column} className="mer-stage">
                            <h2>{column}</h2>
                            {merchantRows.filter((restaurant: any) => stage(restaurant) === column).slice(0, 5).map((restaurant: any) => (
                                <div key={restaurant.id} className="mer-mini">
                                    <strong>{restaurant.name}</strong>
                                    {restaurant.city || "City pending"} · {restaurant.posSystem || "POS not selected"}
                                </div>
                            ))}
                            {merchantRows.filter((restaurant: any) => stage(restaurant) === column).length === 0 ? (
                                <div className="mer-mini">No restaurants in this stage.</div>
                            ) : null}
                        </section>
                    ))}
                </div>

                <div className="mer-table-wrap">
                    <table className="mer-table">
                        <thead><tr><th>Restaurant</th><th>Stage</th><th>POS</th><th>Commission</th><th>GMV / Orders</th><th>Kitchen verification</th><th>Contact</th><th>Actions</th></tr></thead>
                        <tbody>
                            {merchantRows.map((restaurant: any) => {
                                const restaurantOrders = ordersByRestaurant.get(restaurant.id) || [];
                                const restaurantGmv = restaurantOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
                                const pos = posHealth(restaurant);
                                const isVisible = String(restaurant.visibility || "").toUpperCase() === "VISIBLE";
                                return (
                                    <tr key={restaurant.id}>
                                        <td><div className="mer-name">{restaurant.name || "Restaurant"}</div><div>{[restaurant.address, restaurant.city, restaurant.state].filter(Boolean).join(", ") || "Address pending"}</div></td>
                                        <td><span className={`mer-pill ${isVisible ? "green" : "orange"}`}>{stage(restaurant)}</span></td>
                                        <td><span className={`mer-pill ${pos.tone}`}>{pos.label}</span><div>{restaurant.posSystem || "No POS selected"}</div></td>
                                        <td><span className="mer-pill green">7% flat</span><div>{restaurant.plan || "Standard"}</div></td>
                                        <td>{money(restaurantGmv)}<div>{restaurantOrders.length} orders</div></td>
                                        <td><span className={`mer-pill ${isVisible ? "green" : "orange"}`}>{isVisible ? "Verified" : "Pending"}</span><div>Health kitchen verification</div></td>
                                        <td><div>{restaurant.owner?.name || "No contact"}</div><div>{restaurant.owner?.email || restaurant.phone || "No email"}</div></td>
                                        <td>{!isVisible ? <MerchantApplicationActions restaurantId={restaurant.id} approveAction={approveMerchant} rejectAction={rejectMerchant} /> : <span className="mer-pill green">Live</span>}</td>
                                    </tr>
                                );
                            })}
                            {merchantRows.length === 0 ? <tr><td colSpan={8}>No merchants found.</td></tr> : null}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminPortalWrapper>
    );
}
