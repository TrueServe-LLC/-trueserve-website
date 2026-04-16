import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { supabase } from "@/lib/supabase";
import AdminPortalWrapper from "../AdminPortalWrapper";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && isInternalStaff(role));
    if (!isAuthorized) redirect("/admin/login");

    const [restaurantRes, driverRes, orderRes] = await Promise.all([
        supabase.from('Restaurant').select('*', { count: 'exact', head: true }),
        supabase.from('Driver').select('*', { count: 'exact', head: true }),
        supabase.from('Order').select('totalAmount, status, createdAt').order('createdAt', { ascending: false }).limit(500),
    ]);

    const totalRestaurants = restaurantRes.count || 0;
    const totalDrivers = driverRes.count || 0;
    const orders = orderRes.data || [];
    const completed = orders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.status));
    const totalRevenue = completed.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => o.createdAt?.startsWith(today)).length;

    const stats = [
        { icon: '🏪', label: 'Total Restaurants',       value: totalRestaurants },
        { icon: '🚗', label: 'Total Drivers',            value: totalDrivers },
        { icon: '📦', label: 'Orders (Last 500)',        value: orders.length },
        { icon: '✅', label: 'Completed Orders',         value: completed.length },
        { icon: '📅', label: 'Orders Today',             value: todayOrders },
        { icon: '💵', label: 'Revenue (Completed)',      value: `$${totalRevenue.toFixed(2)}` },
    ];

    return (
        <AdminPortalWrapper>
            <style>{`
                .an-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
                .an-stat { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 16px; }
                .an-stat-label { font-size: 12px; color: #777; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
                .an-stat-value { font-size: 26px; font-weight: 500; color: #fff; }
                @media (max-width: 900px) { .an-grid { grid-template-columns: repeat(2, 1fr); } }
            `}</style>

            <div className="adm-page-header">
                <h1>Analytics</h1>
                <p>Live platform metrics from the database</p>
            </div>
            <div className="adm-page-body">
                <div className="an-grid">
                    {stats.map((s, i) => (
                        <div key={i} className="an-stat">
                            <div className="an-stat-label"><span>{s.icon}</span>{s.label}</div>
                            <div className="an-stat-value">{s.value}</div>
                        </div>
                    ))}
                </div>
                <div className="adm-card">
                    <div className="adm-card-title">Coming Soon</div>
                    <p style={{ color: '#555', fontSize: 13 }}>
                        Full analytics dashboards with charts, trend lines, and breakdowns by state/cuisine are coming in a future update.
                    </p>
                </div>
            </div>
        </AdminPortalWrapper>
    );
}
