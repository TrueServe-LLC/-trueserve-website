import { supabaseAdmin } from "@/lib/supabase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { canAccessAdminSection } from "@/lib/rbac";
import AdminDashboard from "./admin-dashboard";
import { isMockAdminRecord } from "@/lib/admin-data";

async function getRestaurantCount() {
    try {
        const { data, error } = await supabaseAdmin
            .from('Restaurant')
            .select('visibility, isMock, owner:User(email, name, isMock)');

        if (error || !data) return 0;

        return data.filter((restaurant: any) =>
            restaurant.visibility === 'VISIBLE' &&
            !restaurant.isMock &&
            !isMockAdminRecord(restaurant.owner)
        ).length;
    } catch (e) {
        console.log("Error fetching restaurant count:", e);
        return 0;
    }
}

async function getDriverCount() {
    try {
        const { data, error } = await supabaseAdmin
            .from('Driver')
            .select('status, vehicleVerified, backgroundCheckStatus, user:User(email, name, isMock)');

        if (error || !data) return 0;

        return data.filter((driver: any) =>
            driver.vehicleVerified === true &&
            driver.status !== 'REJECTED' &&
            !isMockAdminRecord(driver.user)
        ).length;
    } catch (e) {
        console.log("Error fetching driver count:", e);
        return 0;
    }
}

async function getTodayOrderCount() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count } = await supabase
            .from('Order')
            .select('*', { count: 'exact', head: true })
            .gte('createdAt', today.toISOString());
        return count || 0;
    } catch (e) {
        console.log("Error fetching today's orders:", e);
        return 0;
    }
}

async function getTodayRevenue() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('Order')
            .select('totalAmount')
            .gte('createdAt', today.toISOString())
            .in('status', ['COMPLETED', 'DELIVERED']);

        if (error || !data) return 0;

        return data.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
    } catch (e) {
        console.log("Error fetching today's revenue:", e);
        return 0;
    }
}

async function getRecentActivity() {
    try {
        const { data, error } = await supabase
            .from('AuditLog')
            .select('*')
            .order('createdAt', { ascending: false })
            .limit(8);

        if (error || !data) return [];

        return data.map(log => ({
            id: log.id,
            message: `${log.action.replace(/_/g, ' ')} on ${log.entityType}`,
            timestamp: new Date(log.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                month: 'short',
                day: 'numeric'
            }),
            type: log.action.includes('APPROVE') ? 'merchant' :
                  log.action.includes('REJECT') ? 'order' :
                  log.action.includes('CREATE') ? 'driver' : 'system'
        }));
    } catch (e) {
        console.log("Error fetching recent activity:", e);
        return [];
    }
}

export default async function AdminDashboardPage({ searchParams }: { searchParams: { stripe_connected?: string } }) {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();

    let isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, 'dashboard'));

    if (!isAuthorized) {
        redirect("/admin/login");
    }

    // Fetch dashboard stats
    const [activeMerchants, activeDrivers, ordersToday, revenueToday, recentActivity] = await Promise.all([
        getRestaurantCount(),
        getDriverCount(),
        getTodayOrderCount(),
        getTodayRevenue(),
        getRecentActivity()
    ]);

    const stats = {
        activeMerchants,
        activeDrivers,
        ordersToday,
        revenueToday
    };

    return <AdminDashboard role={role} stats={stats} recentActivity={recentActivity} />;
}
