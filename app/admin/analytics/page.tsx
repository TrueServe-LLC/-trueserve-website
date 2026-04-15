import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && isInternalStaff(role));
    if (!isAuthorized) redirect("/admin/login");

    // Fetch basic platform metrics
    const [restaurantRes, driverRes, orderRes] = await Promise.all([
        supabase.from('Restaurant').select('*', { count: 'exact', head: true }),
        supabase.from('Driver').select('*', { count: 'exact', head: true }),
        supabase.from('Order').select('totalAmount, status, createdAt').order('createdAt', { ascending: false }).limit(500),
    ]);

    const totalRestaurants = restaurantRes.count || 0;
    const totalDrivers = driverRes.count || 0;
    const orders = orderRes.data || [];
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.status)).length;
    const totalRevenue = orders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.status))
        .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => o.createdAt?.startsWith(today)).length;

    const stats = [
        { icon: '🏪', label: 'Total Restaurants', value: totalRestaurants },
        { icon: '🚗', label: 'Total Drivers', value: totalDrivers },
        { icon: '📦', label: 'Total Orders (Last 500)', value: totalOrders },
        { icon: '✅', label: 'Completed Orders', value: completedOrders },
        { icon: '📦', label: 'Orders Today', value: todayOrders },
        { icon: '💵', label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}` },
    ];

    return (
        <>
            <style>{`
                .an-page { min-height: 100vh; background: #0a0c09; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #e0e0e0; padding: 24px; }
                .an-title { font-size: 22px; font-weight: 600; color: #fff; margin-bottom: 4px; }
                .an-sub { font-size: 13px; color: #666; margin-bottom: 24px; }
                .an-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
                .an-card { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 20px; }
                .an-label { font-size: 12px; color: #777; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
                .an-value { font-size: 28px; font-weight: 500; color: #fff; }
                .an-note { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 16px; font-size: 13px; color: #666; }
                @media (max-width: 768px) { .an-grid { grid-template-columns: repeat(2, 1fr); } }
            `}</style>
            <div className="an-page">
                <div className="an-title">Analytics</div>
                <div className="an-sub">Platform-wide metrics and performance data</div>
                <div className="an-grid">
                    {stats.map((s, i) => (
                        <div key={i} className="an-card">
                            <div className="an-label"><span>{s.icon}</span>{s.label}</div>
                            <div className="an-value">{s.value}</div>
                        </div>
                    ))}
                </div>
                <div className="an-note">
                    Full analytics dashboards with charts, trends, and breakdowns are coming soon. For now, these metrics reflect live data from the database.
                </div>
            </div>
        </>
    );
}
