import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthSession } from "@/app/auth/actions";
import { canAccessAdminSection } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import CostDashboard from "@/components/admin/CostDashboard";
import CostSyncManager from "@/components/admin/CostSyncManager";
import VendorInvoiceLedger from "@/components/admin/VendorInvoiceLedger";
import { analyzeCosts } from "@/lib/costAnalytics";
import type { MonthlyCost } from "@/lib/costAnalytics";
import AdminPortalWrapper from "../AdminPortalWrapper";
import { AlertCircle, Inbox, ReceiptText, ShieldCheck, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

type DbResult<T> = {
    data: T[];
    error?: string;
    missingSchema?: boolean;
};

function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    if (error && typeof error === "object" && "message" in error) {
        return String((error as { message?: unknown }).message);
    }
    return String(error || "");
}

function isMissingSchemaError(error: unknown) {
    const message = getErrorMessage(error);
    return /could not find the table|does not exist|schema cache|pgrst205/i.test(message);
}

async function getServiceCosts(): Promise<DbResult<any>> {
    try {
        const { data, error } = await supabaseAdmin
            .from("ServiceCost")
            .select("*")
            .order("month", { ascending: false })
            .limit(24);
        if (error) throw error;
        return { data: data || [] };
    } catch (e) {
        console.error("Error fetching service costs:", e);
        return {
            data: [],
            error: getErrorMessage(e),
            missingSchema: isMissingSchemaError(e),
        };
    }
}

async function getBudgetAlerts(): Promise<DbResult<any>> {
    try {
        const { data, error } = await supabaseAdmin.from("BudgetAlert").select("*");
        if (error) throw error;
        return { data: data || [] };
    } catch (e) {
        console.error("Error fetching budget alerts:", e);
        return {
            data: [],
            error: getErrorMessage(e),
            missingSchema: isMissingSchemaError(e),
        };
    }
}

async function getVendorInvoices(): Promise<DbResult<any>> {
    try {
        const { data, error } = await supabaseAdmin
            .from("VendorInvoice")
            .select("*")
            .order("invoiceDate", { ascending: false })
            .limit(20);
        if (error) throw error;
        return { data: data || [] };
    } catch (e) {
        console.error("Error fetching vendor invoices:", e);
        return {
            data: [],
            error: getErrorMessage(e),
            missingSchema: isMissingSchemaError(e),
        };
    }
}

export default async function CostManagementPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, 'cost-management'));
    if (!isAuthorized) redirect("/admin/login");

    const serviceCostResult = await getServiceCosts();
    const budgetResult = await getBudgetAlerts();
    const vendorInvoiceResult = await getVendorInvoices();
    const realCosts = serviceCostResult.data;
    const budgets = budgetResult.data;
    const vendorInvoices = vendorInvoiceResult.data;

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
            entry.byService[cost.service as keyof typeof entry.byService] = cost.cost;
            entry.totalCost += cost.cost;
        });
        monthlyCosts = Array.from(costMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    }

    const analysis = analyzeCosts(monthlyCosts, budgets as any);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const outstandingTotal = (vendorInvoices as any[])
        .filter((invoice) => ["outstanding", "open"].includes(String(invoice.status).toLowerCase()))
        .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
    const reviewCount = (vendorInvoices as any[]).filter(
        (invoice) => String(invoice.status).toLowerCase() === "needs_review"
    ).length;
    const latestInvoiceSync = (vendorInvoices as any[])
        .map((invoice) => invoice.lastSyncedAt)
        .filter(Boolean)
        .sort()
        .at(-1);

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
    const schemaErrors = [
        serviceCostResult.missingSchema ? "ServiceCost" : null,
        vendorInvoiceResult.missingSchema ? "VendorInvoice" : null,
    ].filter(Boolean);

    const metrics = [
        {
            label: "Outstanding",
            value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(outstandingTotal),
            note: "Bills needing payment",
            icon: ReceiptText,
        },
        {
            label: "Review Queue",
            value: String(reviewCount),
            note: "Need human check",
            icon: ShieldCheck,
        },
        {
            label: "Tracked Invoices",
            value: String(vendorInvoices.length),
            note: "From inbox, APIs, manual",
            icon: Inbox,
        },
        {
            label: "Last Sync",
            value: latestInvoiceSync ? new Date(latestInvoiceSync).toLocaleString() : "Not synced",
            note: "Nightly checks available",
            icon: TrendingUp,
        },
    ];

    return (
        <AdminPortalWrapper role={role}>
            <div className="adm-page-header">
                <h1>Cost Management</h1>
                <p>Track vendor invoices from the billing inbox first, then add direct API cost analytics where providers support it cleanly.</p>
            </div>
            <div className="adm-page-body">
                <div className="mx-auto max-w-[1180px] space-y-8">
                    {schemaErrors.length > 0 ? (
                        <div className="rounded-3xl border border-red-400/30 bg-red-500/20 px-6 py-5 text-red-100 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                            <div className="flex gap-4">
                                <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-red-200" />
                                <div>
                                    <h2 className="text-lg font-semibold text-red-100">Sync needs attention</h2>
                                    <p className="mt-2 max-w-4xl text-sm leading-7 text-red-100/80">
                                        Database setup is missing {schemaErrors.join(" and ")}. Run{" "}
                                        <code className="rounded bg-black/20 px-2 py-1 font-mono text-red-50">
                                            db/cost_management_schema.sql
                                        </code>{" "}
                                        in Supabase, then refresh invoices.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {metrics.map((metric) => {
                            const Icon = metric.icon;
                            return (
                                <div key={metric.label} className="rounded-3xl border border-white/[0.04] bg-white/[0.06] p-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/60">
                                            {metric.label}
                                        </span>
                                        <Icon className="h-4 w-4 text-[#ff6b35]/80" />
                                    </div>
                                    <div className="mt-3 text-3xl font-semibold leading-none text-white">{metric.value}</div>
                                    <p className="mt-2 text-sm font-medium text-white/65">{metric.note}</p>
                                </div>
                            );
                        })}
                    </div>

                    <CostSyncManager />

                    <VendorInvoiceLedger invoices={vendorInvoices as any} showCostAnalyticsSetup={monthlyCosts.length === 0} />

                    {monthlyCosts.length > 0 ? (
                        <CostDashboard
                            analysis={analysis}
                            currentMonth={currentMonth}
                            budgetWarnings={budgetWarnings}
                        />
                    ) : null}
                </div>
            </div>
        </AdminPortalWrapper>
    );
}
