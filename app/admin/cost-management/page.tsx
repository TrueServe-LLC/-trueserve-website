import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import CostDashboard from "@/components/admin/CostDashboard";
import CostSyncManager from "@/components/admin/CostSyncManager";
import { analyzeCosts } from "@/lib/costAnalytics";
import type { MonthlyCost } from "@/lib/costAnalytics";
import AdminPortalWrapper from "../AdminPortalWrapper";

export const dynamic = "force-dynamic";

async function getServiceCosts() {
    try {
        const { data, error } = await supabaseAdmin
            .from("ServiceCost")
            .select("*")
            .order("month", { ascending: false })
            .limit(24);
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Error fetching service costs:", e);
        return [];
    }
}

async function getBudgetAlerts() {
    try {
        const { data, error } = await supabaseAdmin.from("BudgetAlert").select("*");
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Error fetching budget alerts:", e);
        return [];
    }
}

export default async function CostManagementPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && isInternalStaff(role));
    if (!isAuthorized) redirect("/admin/login");

    const realCosts = await getServiceCosts();
    const budgets = await getBudgetAlerts();

    // Build monthly costs from real data only — no mock fallback
    let monthlyCosts: MonthlyCost[] = [];
    if (realCosts.length > 0) {
        const costMap = new Map<string, MonthlyCost>();
        realCosts.forEach((cost: any) => {
            const month = cost.month;
            if (!costMap.has(month)) {
                costMap.set(month, {
                    month,
                    totalCost: 0,
                    byService: { stripe: 0, supabase: 0, "google-cloud": 0, mapbox: 0, resend: 0, vonage: 0 },
                });
            }
            const entry = costMap.get(month)!;
            entry.byService[cost.service as any] = cost.cost;
            entry.totalCost += cost.cost;
        });
        monthlyCosts = Array.from(costMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    }

    const analysis = analyzeCosts(monthlyCosts, budgets as any);
    const currentMonth = new Date().toISOString().slice(0, 7);

    const budgetWarnings = monthlyCosts.length > 0 && budgets.length > 0
        ? Object.entries(monthlyCosts.find((m) => m.month === currentMonth)?.byService || {})
            .map(([service, cost]) => {
                const budget = budgets.find((b: any) => b.service === service);
                if (budget && cost >= (budget.monthlyLimit * budget.alert_threshold) / 100) {
                    return { service, spent: cost, limit: budget.monthlyLimit };
                }
                return null;
            })
            .filter(Boolean) as any[]
        : [];

    return (
        <AdminPortalWrapper>
            <div className="adm-page-header">
                <h1>Cost Management</h1>
                <p>Track real spending across all services — Stripe, Supabase, Google Cloud, Resend, Vonage</p>
            </div>
            <div className="adm-page-body">
                {/* Sync Manager */}
                <div style={{ marginBottom: 20 }}>
                    <CostSyncManager />
                </div>

                {monthlyCosts.length === 0 ? (
                    <div className="adm-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
                        <div style={{ color: '#fff', fontWeight: 600, marginBottom: 8 }}>No cost data yet</div>
                        <div style={{ color: '#555', fontSize: 13, marginBottom: 20 }}>
                            Use the sync manager above to import spending data from your service providers.
                        </div>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {[
                                { name: "Stripe", link: "https://dashboard.stripe.com" },
                                { name: "Supabase", link: "https://supabase.com/dashboard" },
                                { name: "Google Cloud", link: "https://console.cloud.google.com" },
                                { name: "Resend", link: "https://resend.com/dashboard" },
                                { name: "Vonage", link: "https://dashboard.nexmo.com" },
                            ].map((s) => (
                                <a key={s.name} href={s.link} target="_blank" rel="noopener noreferrer"
                                   style={{ color: '#f97316', fontSize: 13, textDecoration: 'none', background: 'rgba(249,115,22,0.08)', padding: '6px 14px', borderRadius: 4, border: '1px solid rgba(249,115,22,0.2)' }}>
                                    {s.name} →
                                </a>
                            ))}
                        </div>
                    </div>
                ) : (
                    <CostDashboard
                        analysis={analysis}
                        currentMonth={currentMonth}
                        budgetWarnings={budgetWarnings}
                    />
                )}
            </div>
        </AdminPortalWrapper>
    );
}
