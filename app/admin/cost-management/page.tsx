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
                if (budget && cost >= (budget.monthlyLimit * budget.alertThreshold) / 100) {
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
            <style>{`
                .cost-wrap { max-width: 1180px; margin: 0 auto; display: grid; gap: 16px; }
                .cost-alert { display: flex; gap: 12px; align-items: flex-start; border: 1px solid rgba(248,113,113,.35); background: rgba(127,29,29,.36); color: #fecaca; border-radius: 12px; padding: 16px; }
                .cost-alert h2 { margin: 0; color: #fecaca; font-size: 16px; font-weight: 850; }
                .cost-alert p { margin: 5px 0 0; color: rgba(254,202,202,.86); font-size: 13px; line-height: 1.55; }
                .cost-alert code, .cost-details code, .cost-analytics-note code { background: rgba(0,0,0,.28); border: 1px solid rgba(255,255,255,.08); border-radius: 6px; color: #fff; padding: 2px 6px; }
                .cost-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
                .cost-metric { background: #141a18; border: 1px solid #1e2420; border-radius: 12px; padding: 16px; min-height: 112px; }
                .cost-metric-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: #777; font-size: 11px; font-weight: 850; letter-spacing: .12em; text-transform: uppercase; }
                .cost-metric-top svg { color: #f97316; }
                .cost-metric strong { display: block; margin-top: 10px; color: #fff; font-size: 26px; line-height: 1.1; }
                .cost-metric p { margin: 6px 0 0; color: #888; font-size: 12px; line-height: 1.45; }
                .cost-panel { overflow: hidden; background: #141a18; border: 1px solid #1e2420; border-radius: 12px; }
                .cost-panel-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px; border-bottom: 1px solid #1e2420; }
                .cost-title-row { display: flex; gap: 14px; align-items: flex-start; min-width: 0; }
                .cost-title-row h2 { margin: 0; color: #fff; font-size: 18px; font-weight: 850; }
                .cost-title-row p { margin: 5px 0 0; max-width: 690px; color: #999; font-size: 13px; line-height: 1.55; }
                .cost-icon { display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; flex: 0 0 auto; color: #a7f3d0; border: 1px solid rgba(255,255,255,.08); background: rgba(255,255,255,.04); border-radius: 10px; }
                .cost-icon-orange { color: #f97316; background: rgba(249,115,22,.09); border-color: rgba(249,115,22,.22); }
                .cost-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; flex: 0 0 auto; }
                .cost-btn, .cost-small-btn, .cost-icon-btn { border: 1px solid #24302a; border-radius: 10px; min-height: 40px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-weight: 850; cursor: pointer; text-decoration: none; transition: background .18s ease, border-color .18s ease, transform .18s ease; }
                .cost-btn { padding: 0 14px; font-size: 13px; }
                .cost-btn:hover, .cost-small-btn:hover, .cost-icon-btn:hover { transform: translateY(-1px); }
                .cost-btn:disabled { cursor: not-allowed; opacity: .55; transform: none; }
                .cost-btn-primary { color: #111; background: #f97316; border-color: #f97316; }
                .cost-btn-secondary { color: #fff; background: #0f1311; }
                .cost-spin { animation: cost-spin 1s linear infinite; }
                @keyframes cost-spin { to { transform: rotate(360deg); } }
                .cost-source-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
                .cost-source-card { padding: 16px; border-right: 1px solid #1e2420; }
                .cost-source-card:last-child { border-right: 0; }
                .cost-badge { display: inline-flex; border-radius: 999px; padding: 3px 9px; font-size: 10px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; border: 1px solid rgba(255,255,255,.1); }
                .cost-badge-teal { color: #99f6e4; background: rgba(20,184,166,.1); border-color: rgba(20,184,166,.22); }
                .cost-badge-orange { color: #fdba74; background: rgba(249,115,22,.1); border-color: rgba(249,115,22,.24); }
                .cost-badge-muted { color: #bbb; background: rgba(255,255,255,.04); }
                .cost-source-title { margin-top: 12px; display: flex; align-items: center; gap: 9px; color: #fff; font-size: 15px; font-weight: 850; }
                .cost-source-card p { margin: 7px 0 0; color: #999; font-size: 12.5px; line-height: 1.5; }
                .cost-flow, .cost-portals, .cost-details-body, .cost-analytics-note { border-top: 1px solid #1e2420; padding: 16px; }
                .cost-flow-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px; }
                .cost-flow-head h3, .cost-portals h3, .cost-analytics-note h3 { margin: 0; color: #fff; font-size: 15px; font-weight: 850; }
                .cost-flow-head span { color: #888; font-size: 12px; font-weight: 750; }
                .cost-flow-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
                .cost-flow-step span { display: block; color: #f97316; font-size: 11px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 5px; }
                .cost-flow-step p, .cost-portals p, .cost-analytics-note p, .cost-details-body p { margin: 0; color: #999; font-size: 12.5px; line-height: 1.55; }
                .cost-message-stack { display: grid; gap: 10px; border-top: 1px solid #1e2420; padding: 16px; }
                .cost-sync-message { display: flex; gap: 10px; align-items: flex-start; border-radius: 10px; padding: 12px; border: 1px solid; }
                .cost-sync-message strong { display: block; font-size: 13px; }
                .cost-sync-message p { margin: 4px 0 0; font-size: 12.5px; line-height: 1.5; }
                .cost-sync-message.success { color: #bbf7d0; background: rgba(22,101,52,.2); border-color: rgba(74,222,128,.22); }
                .cost-sync-message.error { color: #fecaca; background: rgba(127,29,29,.25); border-color: rgba(248,113,113,.25); }
                .cost-details summary { list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 13px 16px; color: #ddd; font-size: 13px; font-weight: 850; cursor: pointer; }
                .cost-env-grid { margin-top: 12px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; }
                .cost-env-item { border: 1px solid #24302a; background: #101512; border-radius: 9px; padding: 10px; min-width: 0; }
                .cost-env-item span { display: block; color: #777; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 5px; }
                .cost-env-item code { display: block; overflow-wrap: anywhere; background: transparent; border: 0; padding: 0; color: #ddd; font-size: 11px; }
                .cost-env-item em { color: #777; font-style: normal; }
                .cost-ledger-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-bottom: 1px solid #1e2420; }
                .cost-ledger-stats div { padding: 15px 16px; border-right: 1px solid #1e2420; }
                .cost-ledger-stats div:last-child { border-right: 0; }
                .cost-ledger-stats span { display: block; color: #777; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .12em; }
                .cost-ledger-stats strong { display: block; color: #fff; font-size: 20px; margin-top: 6px; }
                .cost-empty { padding: 16px; color: #999; font-size: 13px; border-bottom: 1px solid #1e2420; }
                .cost-empty strong { color: #fff; }
                .cost-table-wrap { overflow-x: auto; border-bottom: 1px solid #1e2420; }
                .cost-table { width: 100%; min-width: 860px; border-collapse: collapse; font-size: 13px; }
                .cost-table th, .cost-table td { padding: 13px 16px; border-bottom: 1px solid #1e2420; text-align: left; vertical-align: middle; }
                .cost-table th { color: #777; font-size: 10px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
                .cost-table td { color: #ddd; }
                .cost-table td strong { display: block; color: #fff; }
                .cost-table td span { display: block; color: #777; font-size: 12px; margin-top: 2px; }
                .cost-table code { color: #aaa; font-size: 12px; }
                .cost-status { display: inline-flex; border: 1px solid; border-radius: 999px; padding: 3px 8px; font-size: 10px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
                .cost-status.green { color: #34d399; background: rgba(52,211,153,.08); border-color: rgba(52,211,153,.24); }
                .cost-status.orange { color: #fb923c; background: rgba(249,115,22,.08); border-color: rgba(249,115,22,.26); }
                .cost-status.yellow { color: #fde68a; background: rgba(234,179,8,.09); border-color: rgba(234,179,8,.25); }
                .cost-status.blue { color: #93c5fd; background: rgba(59,130,246,.09); border-color: rgba(59,130,246,.24); }
                .cost-status.muted { color: #999; background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.09); }
                .cost-row-actions { display: flex; justify-content: flex-end; gap: 7px; }
                .cost-small-btn { min-height: 34px; padding: 0 10px; font-size: 12px; }
                .cost-small-btn.pay { color: #03120a; background: #34d399; border-color: #34d399; }
                .cost-icon-btn { width: 34px; height: 34px; color: #ddd; background: #0f1311; }
                .cost-icon-btn.disabled { color: #555; cursor: default; }
                .cost-portals { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, .9fr); gap: 18px; align-items: start; }
                .cost-portal-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
                .cost-portal-grid a { min-height: 40px; display: flex; align-items: center; justify-content: space-between; gap: 10px; border: 1px solid #24302a; background: #101512; color: #fff; border-radius: 10px; padding: 0 12px; text-decoration: none; font-size: 13px; font-weight: 850; }
                .cost-analytics-note { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
                @media (max-width: 980px) { .cost-metrics, .cost-source-grid, .cost-flow-grid, .cost-ledger-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } .cost-source-card:nth-child(2n), .cost-ledger-stats div:nth-child(2n) { border-right: 0; } .cost-source-card { border-bottom: 1px solid #1e2420; } .cost-portals, .cost-analytics-note { grid-template-columns: 1fr; } .cost-env-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
                @media (max-width: 640px) { .cost-metrics, .cost-source-grid, .cost-flow-grid, .cost-ledger-stats, .cost-env-grid { grid-template-columns: 1fr; } .cost-panel-head { align-items: stretch; flex-direction: column; } .cost-actions, .cost-btn { width: 100%; } .cost-btn { justify-content: center; } .cost-source-card, .cost-ledger-stats div { border-right: 0; border-bottom: 1px solid #1e2420; } .cost-portal-grid { grid-template-columns: 1fr; } }
            `}</style>
            <div className="adm-page-header">
                <h1>Cost Management</h1>
                <p>Track vendor invoices from the billing inbox first, then add direct API cost analytics where providers support it cleanly.</p>
            </div>
            <div className="adm-page-body">
                <div className="cost-wrap">
                    {schemaErrors.length > 0 ? (
                        <div className="cost-alert">
                            <AlertCircle size={19} />
                            <div>
                                <h2>Sync needs attention</h2>
                                <p>
                                    Database setup is missing {schemaErrors.join(" and ")}. Run{" "}
                                    <code>db/admin_cost_invoice_minimal_setup.sql</code> in Supabase, then click Sync invoices.
                                </p>
                            </div>
                        </div>
                    ) : null}

                    <div className="cost-metrics">
                        {metrics.map((metric) => {
                            const Icon = metric.icon;
                            return (
                                <div key={metric.label} className="cost-metric">
                                    <div className="cost-metric-top">
                                        <span>{metric.label}</span>
                                        <Icon size={16} />
                                    </div>
                                    <strong>{metric.value}</strong>
                                    <p>{metric.note}</p>
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
