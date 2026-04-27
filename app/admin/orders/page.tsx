import { supabaseAdmin } from "@/lib/supabase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { canAccessAdminSection } from "@/lib/rbac";
import AdminPortalWrapper from "../AdminPortalWrapper";
import AdminOrderBoard from "./AdminOrderBoard";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, "dashboard"));
    if (!isAuthorized) redirect("/admin/login");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: orders } = await supabaseAdmin
        .from("Order")
        .select(`
            id, status, total, createdAt, posReference, deliveryAddress,
            restaurant:Restaurant(id, name, imageUrl),
            user:User(id, name, email, phone),
            driver:Driver(id, user:User(name, phone))
        `)
        .gte("createdAt", today.toISOString())
        .order("createdAt", { ascending: false });

    return (
        <AdminPortalWrapper role={role}>
            <div style={{ padding: "0 0 40px" }}>
                <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 11, color: "#f97316", fontWeight: 800, letterSpacing: ".15em", textTransform: "uppercase", margin: "0 0 6px" }}>
                        Admin · Live View
                    </p>
                    <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: 0 }}>Today&apos;s Orders</h1>
                    <p style={{ fontSize: 13, color: "#555", margin: "4px 0 0" }}>
                        All orders placed today across every restaurant — refreshes in real-time.
                    </p>
                </div>
                <AdminOrderBoard initialOrders={orders || []} />
            </div>
        </AdminPortalWrapper>
    );
}
