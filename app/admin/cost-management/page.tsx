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
                .cost-wrap,
                .cost-wrap * {
                    box-sizing: border-box;
                    min-width: 0;
                }
                .cost-wrap {
                    width: 100%;
                    max-width: 1120px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                    font-size: 13px;
                }
                .cost-alert {
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                    border: 1px solid rgba(248,113,113,.34);
                    background: rgba(127,29,29,.3);
                    color: #fecaca;
                    border-radius: 16px;
                    padding: 16px;
                }
                .cost-alert h2 {
                    margin: 0;
                    color: #fecaca;
                    font-size: 15px !important;
                    line-height: 1.25;
                    font-weight: 800;
                }
                .cost-alert p {
                    margin: 5px 0 0;
                    color: rgba(254,202,202,.86);
                    font-size: 12.5px !important;
                    line-height: 1.55;
                }
                .cost-alert code,
                .cost-details code,
                .cost-analytics-note code {
                    background: rgba(0,0,0,.28);
                    border: 1px solid rgba(255,255,255,.08);
                    border-radius: 6px;
                    color: #fff;
                    padding: 2px 6px;
                    overflow-wrap: anywhere;
                }
                .cost-metrics {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
                    gap: 12px;
                }
                .cost-metric {
                    background: rgba(20,26,24,.92);
                    border: 1px solid #24302a;
                    border-radius: 16px;
                    padding: 15px;
                    min-height: 0;
                }
                .cost-metric-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    color: #8b918d;
                    font-size: 10px !important;
                    font-weight: 800;
                    letter-spacing: .11em;
                    text-transform: uppercase;
                }
                .cost-metric-top svg {
                    color: #f97316;
                    flex: 0 0 auto;
                }
                .cost-metric strong {
                    display: block;
                    margin-top: 9px;
                    color: #fff;
                    font-size: 22px !important;
                    line-height: 1.12;
                    overflow-wrap: anywhere;
                }
                .cost-metric p {
                    margin: 5px 0 0;
                    color: #9a9f9b;
                    font-size: 12px !important;
                    line-height: 1.45;
                }
                .cost-panel {
                    overflow: hidden;
                    background: rgba(20,26,24,.92);
                    border: 1px solid #24302a;
                    border-radius: 18px;
                    box-shadow: 0 12px 32px rgba(0,0,0,.16);
                }
                .cost-panel-head {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 18px;
                    border-bottom: 1px solid #24302a;
                }
                .cost-title-row {
                    display: flex;
                    gap: 13px;
                    align-items: flex-start;
                    min-width: 0;
                }
                .cost-title-row h2 {
                    margin: 0;
                    color: #fff;
                    font-size: 16px !important;
                    line-height: 1.25;
                    font-weight: 800;
                }
                .cost-title-row p {
                    margin: 5px 0 0;
                    max-width: 680px;
                    color: #9a9f9b;
                    font-size: 12.5px !important;
                    line-height: 1.55;
                }
                .cost-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    flex: 0 0 auto;
                    color: #a7f3d0;
                    border: 1px solid rgba(255,255,255,.08);
                    background: rgba(255,255,255,.04);
                    border-radius: 12px;
                }
                .cost-icon-orange {
                    color: #f97316;
                    background: rgba(249,115,22,.1);
                    border-color: rgba(249,115,22,.24);
                }
                .cost-actions {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    justify-content: flex-end;
                    flex: 0 0 auto;
                }
                .cost-btn,
                .cost-small-btn,
                .cost-icon-btn {
                    border: 1px solid #2d3932;
                    border-radius: 12px;
                    min-height: 38px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-weight: 800;
                    cursor: pointer;
                    text-decoration: none;
                    transition: background .18s ease, border-color .18s ease, transform .18s ease;
                }
                .cost-btn {
                    padding: 0 14px;
                    font-size: 13px !important;
                    white-space: nowrap;
                }
                .cost-btn:hover,
                .cost-small-btn:hover,
                .cost-icon-btn:hover {
                    transform: translateY(-1px);
                }
                .cost-btn:disabled {
                    cursor: not-allowed;
                    opacity: .55;
                    transform: none;
                }
                .cost-btn-primary {
                    color: #111;
                    background: #f97316;
                    border-color: #f97316;
                }
                .cost-btn-secondary {
                    color: #fff;
                    background: #0f1311;
                }
                .cost-spin {
                    animation: cost-spin 1s linear infinite;
                }
                @keyframes cost-spin { to { transform: rotate(360deg); } }
                .cost-source-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 12px;
                    padding: 16px;
                    border-bottom: 1px solid #24302a;
                }
                .cost-source-card {
                    padding: 14px;
                    border: 1px solid #24302a;
                    border-radius: 14px;
                    background: #101512;
                }
                .cost-badge {
                    display: inline-flex;
                    border-radius: 999px;
                    padding: 3px 9px;
                    font-size: 9.5px !important;
                    font-weight: 900;
                    letter-spacing: .1em;
                    text-transform: uppercase;
                    border: 1px solid rgba(255,255,255,.1);
                }
                .cost-badge-teal {
                    color: #99f6e4;
                    background: rgba(20,184,166,.1);
                    border-color: rgba(20,184,166,.22);
                }
                .cost-badge-orange {
                    color: #fdba74;
                    background: rgba(249,115,22,.1);
                    border-color: rgba(249,115,22,.24);
                }
                .cost-badge-muted {
                    color: #bbb;
                    background: rgba(255,255,255,.04);
                }
                .cost-source-title {
                    margin-top: 11px;
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    color: #fff;
                    font-size: 14px !important;
                    line-height: 1.3;
                    font-weight: 800;
                }
                .cost-source-card p {
                    margin: 7px 0 0;
                    color: #9a9f9b;
                    font-size: 12px !important;
                    line-height: 1.52;
                }
                .cost-flow,
                .cost-portals,
                .cost-details-body,
                .cost-analytics-note {
                    padding: 16px;
                }
                .cost-flow,
                .cost-portals,
                .cost-details,
                .cost-analytics-note {
                    border-top: 1px solid #24302a;
                }
                .cost-flow-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;
                }
                .cost-flow-head h3,
                .cost-portals h3,
                .cost-analytics-note h3 {
                    margin: 0;
                    color: #fff;
                    font-size: 14px !important;
                    line-height: 1.35;
                    font-weight: 800;
                }
                .cost-flow-head span {
                    color: #9a9f9b;
                    font-size: 12px !important;
                    font-weight: 750;
                }
                .cost-flow-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
                    gap: 10px;
                }
                .cost-flow-step {
                    border: 1px solid #24302a;
                    border-radius: 12px;
                    background: rgba(16,21,18,.74);
                    padding: 12px;
                }
                .cost-flow-step span {
                    display: block;
                    color: #f97316;
                    font-size: 10px !important;
                    font-weight: 900;
                    letter-spacing: .1em;
                    text-transform: uppercase;
                    margin-bottom: 5px;
                }
                .cost-flow-step p,
                .cost-portals p,
                .cost-analytics-note p,
                .cost-details-body p {
                    margin: 0;
                    color: #9a9f9b;
                    font-size: 12px !important;
                    line-height: 1.55;
                }
                .cost-message-stack {
                    display: grid;
                    gap: 10px;
                    padding: 16px;
                    border-top: 1px solid #24302a;
                }
                .cost-sync-message {
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                    border-radius: 14px;
                    padding: 12px;
                    border: 1px solid;
                }
                .cost-sync-message strong {
                    display: block;
                    font-size: 13px !important;
                    line-height: 1.25;
                }
                .cost-sync-message p {
                    margin: 4px 0 0;
                    font-size: 12px !important;
                    line-height: 1.5;
                }
                .cost-sync-message.success {
                    color: #bbf7d0;
                    background: rgba(22,101,52,.18);
                    border-color: rgba(74,222,128,.22);
                }
                .cost-sync-message.error {
                    color: #fecaca;
                    background: rgba(127,29,29,.24);
                    border-color: rgba(248,113,113,.25);
                }
                .cost-details summary {
                    list-style: none;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    padding: 13px 16px;
                    color: #ddd;
                    font-size: 13px !important;
                    font-weight: 800;
                    cursor: pointer;
                }
                .cost-details summary::-webkit-details-marker {
                    display: none;
                }
                .cost-env-grid {
                    margin-top: 12px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
                    gap: 9px;
                }
                .cost-env-item {
                    border: 1px solid #24302a;
                    background: #101512;
                    border-radius: 10px;
                    padding: 10px;
                    min-width: 0;
                }
                .cost-env-item span {
                    display: block;
                    color: #7e8580;
                    font-size: 9px !important;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: .12em;
                    margin-bottom: 5px;
                }
                .cost-env-item code {
                    display: block;
                    overflow-wrap: anywhere;
                    background: transparent;
                    border: 0;
                    padding: 0;
                    color: #ddd;
                    font-size: 11px !important;
                }
                .cost-env-item em {
                    color: #7e8580;
                    font-style: normal;
                }
                .cost-ledger-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 10px;
                    padding: 16px;
                    border-bottom: 1px solid #24302a;
                }
                .cost-ledger-stats div {
                    padding: 13px;
                    border: 1px solid #24302a;
                    border-radius: 12px;
                    background: #101512;
                }
                .cost-ledger-stats span {
                    display: block;
                    color: #7e8580;
                    font-size: 10px !important;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: .12em;
                }
                .cost-ledger-stats strong {
                    display: block;
                    color: #fff;
                    font-size: 20px !important;
                    line-height: 1.18;
                    margin-top: 6px;
                    overflow-wrap: anywhere;
                }
                .cost-empty {
                    padding: 16px;
                    color: #9a9f9b;
                    font-size: 12.5px !important;
                    line-height: 1.55;
                    border-bottom: 1px solid #24302a;
                }
                .cost-empty strong {
                    color: #fff;
                }
                .cost-table-wrap {
                    overflow-x: auto;
                    border-bottom: 1px solid #24302a;
                }
                .cost-table {
                    width: 100%;
                    min-width: 760px;
                    border-collapse: collapse;
                    font-size: 12.5px !important;
                }
                .cost-table th,
                .cost-table td {
                    padding: 12px 14px;
                    border-bottom: 1px solid #24302a;
                    text-align: left;
                    vertical-align: middle;
                }
                .cost-table th {
                    color: #7e8580;
                    font-size: 9.5px !important;
                    font-weight: 900;
                    letter-spacing: .12em;
                    text-transform: uppercase;
                }
                .cost-table td {
                    color: #ddd;
                }
                .cost-table td strong {
                    display: block;
                    color: #fff;
                    font-size: 12.5px !important;
                }
                .cost-table td span {
                    display: block;
                    color: #7e8580;
                    font-size: 11px !important;
                    margin-top: 2px;
                }
                .cost-table code {
                    color: #aaa;
                    font-size: 11px !important;
                }
                .cost-status {
                    display: inline-flex;
                    border: 1px solid;
                    border-radius: 999px;
                    padding: 3px 8px;
                    font-size: 9.5px !important;
                    font-weight: 900;
                    letter-spacing: .1em;
                    text-transform: uppercase;
                }
                .cost-status.green { color: #34d399; background: rgba(52,211,153,.08); border-color: rgba(52,211,153,.24); }
                .cost-status.orange { color: #fb923c; background: rgba(249,115,22,.08); border-color: rgba(249,115,22,.26); }
                .cost-status.yellow { color: #fde68a; background: rgba(234,179,8,.09); border-color: rgba(234,179,8,.25); }
                .cost-status.blue { color: #93c5fd; background: rgba(59,130,246,.09); border-color: rgba(59,130,246,.24); }
                .cost-status.muted { color: #999; background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.09); }
                .cost-row-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 7px;
                }
                .cost-small-btn {
                    min-height: 34px;
                    padding: 0 10px;
                    font-size: 12px !important;
                }
                .cost-small-btn.pay {
                    color: #03120a;
                    background: #34d399;
                    border-color: #34d399;
                }
                .cost-icon-btn {
                    width: 34px;
                    height: 34px;
                    color: #ddd;
                    background: #0f1311;
                }
                .cost-icon-btn.disabled {
                    color: #555;
                    cursor: default;
                }
                .cost-portals {
                    display: grid;
                    grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
                    gap: 18px;
                    align-items: start;
                }
                .cost-portal-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 9px;
                }
                .cost-portal-grid a {
                    min-height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    border: 1px solid #24302a;
                    background: #101512;
                    color: #fff;
                    border-radius: 10px;
                    padding: 0 12px;
                    text-decoration: none;
                    font-size: 12.5px !important;
                    font-weight: 800;
                }
                .cost-analytics-note {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 16px;
                }
                /*
                 * Final admin-console pass: keep this page aligned with the rest of the
                 * admin portal instead of letting the cost widgets crowd into each other.
                 */
                .cost-wrap {
                    max-width: none !important;
                    gap: 20px !important;
                    isolation: isolate;
                }
                .cost-wrap h2,
                .cost-wrap h3,
                .cost-wrap p,
                .cost-wrap span,
                .cost-wrap strong,
                .cost-wrap button,
                .cost-wrap a {
                    line-height: 1.35;
                }
                .cost-metrics {
                    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                    gap: 14px !important;
                }
                .cost-metric {
                    min-height: 126px;
                    padding: 17px !important;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    background: #141a18 !important;
                    border-color: #1e2420 !important;
                    box-shadow: none;
                }
                .cost-metric strong {
                    margin-top: 12px !important;
                    font-size: clamp(22px, 2.2vw, 30px) !important;
                    letter-spacing: -.02em;
                }
                .cost-panel {
                    display: flex;
                    flex-direction: column;
                    background: #141a18 !important;
                    border-color: #1e2420 !important;
                    border-radius: 16px !important;
                    box-shadow: none !important;
                }
                .cost-panel-head {
                    display: grid !important;
                    grid-template-columns: minmax(0, 1fr) auto;
                    align-items: center !important;
                    gap: 18px !important;
                    padding: 18px 20px !important;
                    border-bottom-color: #1e2420 !important;
                }
                .cost-title-row {
                    display: grid !important;
                    grid-template-columns: 44px minmax(0, 1fr);
                    align-items: center !important;
                    gap: 14px !important;
                }
                .cost-title-row h2 {
                    font-size: 18px !important;
                    letter-spacing: -.01em;
                }
                .cost-title-row p {
                    max-width: 840px !important;
                    font-size: 13px !important;
                    color: #a5aaa6 !important;
                }
                .cost-actions {
                    align-items: center;
                    justify-content: flex-end !important;
                    gap: 10px !important;
                }
                .cost-btn {
                    min-height: 42px !important;
                    padding: 0 16px !important;
                    border-radius: 12px !important;
                    font-size: 13px !important;
                }
                .cost-source-grid {
                    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                    gap: 0 !important;
                    padding: 0 !important;
                    border-bottom-color: #1e2420 !important;
                }
                .cost-source-card {
                    min-height: 168px;
                    padding: 20px !important;
                    border-width: 0 1px 0 0 !important;
                    border-color: #1e2420 !important;
                    border-radius: 0 !important;
                    background: transparent !important;
                }
                .cost-source-card:last-child {
                    border-right-width: 0 !important;
                }
                .cost-source-title {
                    font-size: 16px !important;
                    margin-top: 12px !important;
                }
                .cost-source-card p {
                    font-size: 13px !important;
                    line-height: 1.55 !important;
                    max-width: 440px;
                }
                .cost-flow {
                    padding: 20px !important;
                    border-top: 0 !important;
                }
                .cost-flow-grid {
                    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                    gap: 18px !important;
                }
                .cost-flow-step {
                    padding: 0 !important;
                    border: 0 !important;
                    border-radius: 0 !important;
                    background: transparent !important;
                }
                .cost-flow-step p {
                    font-size: 13px !important;
                    color: #b5bab6 !important;
                }
                .cost-message-stack {
                    padding: 0 20px 20px !important;
                    border-top: 0 !important;
                }
                .cost-sync-message {
                    padding: 14px 16px !important;
                    border-radius: 14px !important;
                }
                .cost-details {
                    border-top-color: #1e2420 !important;
                }
                .cost-ledger-stats {
                    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                    gap: 0 !important;
                    padding: 0 !important;
                    border-bottom-color: #1e2420 !important;
                }
                .cost-ledger-stats div {
                    min-height: 118px;
                    padding: 18px 20px !important;
                    border-width: 0 1px 0 0 !important;
                    border-color: #1e2420 !important;
                    border-radius: 0 !important;
                    background: transparent !important;
                }
                .cost-ledger-stats div:last-child {
                    border-right-width: 0 !important;
                }
                .cost-ledger-stats strong {
                    font-size: clamp(21px, 2.1vw, 28px) !important;
                }
                .cost-empty {
                    padding: 18px 20px !important;
                    border-bottom-color: #1e2420 !important;
                    font-size: 13px !important;
                }
                .cost-portals {
                    grid-template-columns: minmax(260px, .85fr) minmax(0, 1.15fr) !important;
                    gap: 22px !important;
                    padding: 20px !important;
                    border-top-color: #1e2420 !important;
                }
                .cost-portals h3,
                .cost-analytics-note h3,
                .cost-flow-head h3 {
                    font-size: 15px !important;
                }
                .cost-portals p,
                .cost-analytics-note p {
                    font-size: 13px !important;
                    color: #a5aaa6 !important;
                }
                .cost-portal-grid {
                    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                    gap: 10px !important;
                }
                .cost-portal-grid a {
                    min-height: 44px !important;
                    border-color: #2b332f !important;
                    background: #111614 !important;
                    font-size: 13px !important;
                }
                .cost-analytics-note {
                    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    padding: 20px !important;
                    border-top-color: #1e2420 !important;
                }
                .cost-table th,
                .cost-table td {
                    padding: 14px 16px !important;
                }
                @media (max-width: 1180px) {
                    .cost-metrics,
                    .cost-ledger-stats,
                    .cost-flow-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    }
                    .cost-source-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .cost-source-card {
                        min-height: 0;
                        border-width: 0 0 1px 0 !important;
                    }
                    .cost-source-card:last-child {
                        border-bottom-width: 0 !important;
                    }
                    .cost-portal-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    }
                }
                @media (max-width: 860px) {
                    .cost-panel-head,
                    .cost-portals {
                        grid-template-columns: 1fr;
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .cost-actions,
                    .cost-actions form,
                    .cost-actions .cost-btn,
                    .cost-panel-head form,
                    .cost-panel-head form .cost-btn {
                        width: 100%;
                    }
                    .cost-btn {
                        justify-content: center;
                    }
                }
                @media (max-width: 640px) {
                    .cost-wrap {
                        gap: 14px;
                    }
                    .cost-metrics,
                    .cost-source-grid,
                    .cost-flow-grid,
                    .cost-ledger-stats,
                    .cost-env-grid {
                        grid-template-columns: 1fr;
                    }
                    .cost-title-row {
                        gap: 10px;
                    }
                    .cost-icon {
                        width: 36px;
                        height: 36px;
                    }
                    .cost-panel-head,
                    .cost-source-grid,
                    .cost-flow,
                    .cost-portals,
                    .cost-details-body,
                    .cost-analytics-note,
                    .cost-message-stack,
                    .cost-ledger-stats {
                        padding: 14px;
                    }
                }

                /*
                 * Definitive console layout reset. The billing widgets share classes
                 * across child components, so this final pass keeps the whole page in
                 * the same compact admin-card language as Merchants, Payouts, and Users.
                 */
                .adm-page-body .cost-wrap,
                .adm-page-body .cost-wrap * {
                    box-sizing: border-box !important;
                    min-width: 0 !important;
                }
                .adm-page-body .cost-wrap {
                    width: 100% !important;
                    max-width: none !important;
                    margin: 0 !important;
                    display: grid !important;
                    grid-template-columns: minmax(0, 1fr) !important;
                    gap: 16px !important;
                    font-size: 13px !important;
                }
                .adm-page-body .cost-metrics {
                    display: grid !important;
                    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                    gap: 12px !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    align-items: stretch !important;
                }
                .adm-page-body .cost-metric,
                .adm-page-body .cost-panel {
                    background: rgba(20, 26, 24, .92) !important;
                    border: 1px solid rgba(255, 255, 255, .07) !important;
                    border-radius: 16px !important;
                    box-shadow: none !important;
                    position: relative !important;
                    z-index: 0 !important;
                    overflow: hidden !important;
                }
                .adm-page-body .cost-metric {
                    min-height: 104px !important;
                    padding: 14px !important;
                    display: grid !important;
                    align-content: space-between !important;
                }
                .adm-page-body .cost-metric-top,
                .adm-page-body .cost-ledger-stats span,
                .adm-page-body .cost-table th {
                    color: rgba(255, 255, 255, .46) !important;
                    font-size: 10px !important;
                    font-weight: 800 !important;
                    letter-spacing: .11em !important;
                    line-height: 1.2 !important;
                    text-transform: uppercase !important;
                }
                .adm-page-body .cost-metric strong,
                .adm-page-body .cost-ledger-stats strong {
                    color: #fff !important;
                    display: block !important;
                    font-size: clamp(21px, 2vw, 27px) !important;
                    line-height: 1.05 !important;
                    margin: 8px 0 0 !important;
                    overflow-wrap: anywhere !important;
                }
                .adm-page-body .cost-metric p,
                .adm-page-body .cost-title-row p,
                .adm-page-body .cost-source-card p,
                .adm-page-body .cost-flow-step p,
                .adm-page-body .cost-portals p,
                .adm-page-body .cost-analytics-note p,
                .adm-page-body .cost-empty,
                .adm-page-body .cost-details-body p {
                    color: rgba(255, 255, 255, .58) !important;
                    font-size: 12.5px !important;
                    line-height: 1.5 !important;
                    margin: 0 !important;
                }
                .adm-page-body .cost-panel {
                    display: grid !important;
                    grid-template-columns: minmax(0, 1fr) !important;
                    margin: 0 !important;
                    clear: both !important;
                }
                .adm-page-body .cost-panel-head {
                    display: grid !important;
                    grid-template-columns: minmax(0, 1fr) auto !important;
                    gap: 16px !important;
                    align-items: center !important;
                    padding: 16px 18px !important;
                    border-bottom: 1px solid rgba(255, 255, 255, .07) !important;
                }
                .adm-page-body .cost-title-row {
                    display: grid !important;
                    grid-template-columns: 42px minmax(0, 1fr) !important;
                    gap: 12px !important;
                    align-items: center !important;
                }
                .adm-page-body .cost-icon {
                    width: 42px !important;
                    height: 42px !important;
                    border-radius: 12px !important;
                    background: rgba(255, 255, 255, .04) !important;
                    border: 1px solid rgba(255, 255, 255, .07) !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    flex: 0 0 auto !important;
                }
                .adm-page-body .cost-title-row h2,
                .adm-page-body .cost-flow-head h3,
                .adm-page-body .cost-portals h3,
                .adm-page-body .cost-analytics-note h3 {
                    color: #fff !important;
                    font-size: 15px !important;
                    line-height: 1.25 !important;
                    margin: 0 0 4px !important;
                    font-weight: 800 !important;
                    letter-spacing: -.01em !important;
                }
                .adm-page-body .cost-actions {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: flex-end !important;
                    gap: 9px !important;
                    flex-wrap: wrap !important;
                }
                .adm-page-body .cost-btn,
                .adm-page-body .cost-small-btn,
                .adm-page-body .cost-icon-btn,
                .adm-page-body .cost-portal-grid a {
                    min-height: 38px !important;
                    border-radius: 10px !important;
                    font-size: 12.5px !important;
                    font-weight: 800 !important;
                    line-height: 1.15 !important;
                }
                .adm-page-body .cost-btn {
                    padding: 0 14px !important;
                }
                .adm-page-body .cost-source-grid {
                    display: grid !important;
                    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                    gap: 0 !important;
                    padding: 0 !important;
                    border-bottom: 1px solid rgba(255, 255, 255, .07) !important;
                }
                .adm-page-body .cost-source-card {
                    min-height: 136px !important;
                    padding: 16px 18px !important;
                    border: 0 !important;
                    border-right: 1px solid rgba(255, 255, 255, .07) !important;
                    border-radius: 0 !important;
                    background: transparent !important;
                    display: flex !important;
                    flex-direction: column !important;
                    justify-content: flex-start !important;
                }
                .adm-page-body .cost-source-card:last-child {
                    border-right: 0 !important;
                }
                .adm-page-body .cost-badge {
                    width: fit-content !important;
                    padding: 3px 8px !important;
                    border-radius: 8px !important;
                    font-size: 10px !important;
                    font-weight: 900 !important;
                    letter-spacing: .08em !important;
                    line-height: 1.2 !important;
                    text-transform: uppercase !important;
                }
                .adm-page-body .cost-source-title {
                    color: #fff !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    font-size: 15px !important;
                    font-weight: 800 !important;
                    line-height: 1.25 !important;
                    margin: 10px 0 6px !important;
                }
                .adm-page-body .cost-flow {
                    padding: 16px 18px !important;
                    border: 0 !important;
                }
                .adm-page-body .cost-flow-head {
                    display: flex !important;
                    justify-content: space-between !important;
                    gap: 12px !important;
                    align-items: center !important;
                    margin: 0 0 12px !important;
                }
                .adm-page-body .cost-flow-head span {
                    color: rgba(255, 255, 255, .52) !important;
                    font-size: 12px !important;
                    font-weight: 800 !important;
                }
                .adm-page-body .cost-flow-grid {
                    display: grid !important;
                    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                    gap: 14px !important;
                }
                .adm-page-body .cost-flow-step {
                    padding: 0 !important;
                    border: 0 !important;
                    background: transparent !important;
                }
                .adm-page-body .cost-flow-step span {
                    color: #f97316 !important;
                    display: block !important;
                    font-size: 10px !important;
                    font-weight: 900 !important;
                    letter-spacing: .1em !important;
                    margin: 0 0 4px !important;
                    text-transform: uppercase !important;
                }
                .adm-page-body .cost-message-stack {
                    display: grid !important;
                    gap: 10px !important;
                    padding: 0 18px 16px !important;
                    border: 0 !important;
                }
                .adm-page-body .cost-sync-message,
                .adm-page-body .cost-alert {
                    display: grid !important;
                    grid-template-columns: 18px minmax(0, 1fr) !important;
                    gap: 10px !important;
                    align-items: start !important;
                    border-radius: 14px !important;
                    padding: 12px 14px !important;
                }
                .adm-page-body .cost-details {
                    border-top: 1px solid rgba(255, 255, 255, .07) !important;
                }
                .adm-page-body .cost-details summary {
                    padding: 12px 18px !important;
                    color: rgba(255, 255, 255, .78) !important;
                    font-size: 12.5px !important;
                    font-weight: 800 !important;
                    line-height: 1.25 !important;
                }
                .adm-page-body .cost-details-body {
                    padding: 0 18px 16px !important;
                }
                .adm-page-body .cost-env-grid {
                    display: grid !important;
                    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                    gap: 8px !important;
                    margin-top: 10px !important;
                }
                .adm-page-body .cost-env-item {
                    background: rgba(255, 255, 255, .025) !important;
                    border: 1px solid rgba(255, 255, 255, .07) !important;
                    border-radius: 10px !important;
                    padding: 9px !important;
                }
                .adm-page-body .cost-env-item span {
                    color: rgba(255, 255, 255, .42) !important;
                    display: block !important;
                    font-size: 9px !important;
                    font-weight: 900 !important;
                    letter-spacing: .1em !important;
                    margin-bottom: 5px !important;
                    text-transform: uppercase !important;
                }
                .adm-page-body .cost-env-item code,
                .adm-page-body .cost-alert code,
                .adm-page-body .cost-details code,
                .adm-page-body .cost-analytics-note code {
                    background: rgba(0, 0, 0, .28) !important;
                    border: 1px solid rgba(255, 255, 255, .08) !important;
                    border-radius: 6px !important;
                    color: rgba(255, 255, 255, .86) !important;
                    font-size: 11px !important;
                    padding: 2px 6px !important;
                    overflow-wrap: anywhere !important;
                }
                .adm-page-body .cost-ledger-stats {
                    display: grid !important;
                    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                    gap: 0 !important;
                    padding: 0 !important;
                    border-bottom: 1px solid rgba(255, 255, 255, .07) !important;
                }
                .adm-page-body .cost-ledger-stats div {
                    min-height: 94px !important;
                    padding: 15px 18px !important;
                    border: 0 !important;
                    border-right: 1px solid rgba(255, 255, 255, .07) !important;
                    border-radius: 0 !important;
                    background: transparent !important;
                }
                .adm-page-body .cost-ledger-stats div:last-child {
                    border-right: 0 !important;
                }
                .adm-page-body .cost-empty {
                    padding: 15px 18px !important;
                    border-bottom: 1px solid rgba(255, 255, 255, .07) !important;
                }
                .adm-page-body .cost-table-wrap {
                    overflow-x: auto !important;
                    border-bottom: 1px solid rgba(255, 255, 255, .07) !important;
                }
                .adm-page-body .cost-table {
                    width: 100% !important;
                    min-width: 760px !important;
                    border-collapse: collapse !important;
                    font-size: 12.5px !important;
                }
                .adm-page-body .cost-table th,
                .adm-page-body .cost-table td {
                    padding: 12px 14px !important;
                    border-bottom: 1px solid rgba(255, 255, 255, .07) !important;
                    text-align: left !important;
                    vertical-align: middle !important;
                }
                .adm-page-body .cost-table tbody tr:last-child td {
                    border-bottom: 0 !important;
                }
                .adm-page-body .cost-table td,
                .adm-page-body .cost-table td strong {
                    color: rgba(255, 255, 255, .9) !important;
                    font-size: 12.5px !important;
                }
                .adm-page-body .cost-table td span {
                    color: rgba(255, 255, 255, .5) !important;
                    display: block !important;
                    font-size: 11px !important;
                    margin-top: 2px !important;
                }
                .adm-page-body .cost-row-actions {
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    justify-content: flex-start !important;
                }
                .adm-page-body .cost-portals {
                    display: grid !important;
                    grid-template-columns: minmax(240px, .85fr) minmax(0, 1.15fr) !important;
                    gap: 16px !important;
                    padding: 16px 18px !important;
                    border-top: 1px solid rgba(255, 255, 255, .07) !important;
                }
                .adm-page-body .cost-portal-grid {
                    display: grid !important;
                    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                    gap: 8px !important;
                }
                .adm-page-body .cost-portal-grid a {
                    background: rgba(255, 255, 255, .025) !important;
                    border: 1px solid rgba(255, 255, 255, .08) !important;
                    color: rgba(255, 255, 255, .9) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    padding: 0 11px !important;
                    text-decoration: none !important;
                }
                .adm-page-body .cost-analytics-note {
                    display: grid !important;
                    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    gap: 14px !important;
                    padding: 16px 18px !important;
                    border-top: 1px solid rgba(255, 255, 255, .07) !important;
                }
                @media (max-width: 1180px) {
                    .adm-page-body .cost-metrics,
                    .adm-page-body .cost-ledger-stats,
                    .adm-page-body .cost-flow-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    }
                    .adm-page-body .cost-source-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .adm-page-body .cost-source-card {
                        min-height: 0 !important;
                        border-right: 0 !important;
                        border-bottom: 1px solid rgba(255, 255, 255, .07) !important;
                    }
                    .adm-page-body .cost-source-card:last-child {
                        border-bottom: 0 !important;
                    }
                    .adm-page-body .cost-portal-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    }
                }
                @media (max-width: 860px) {
                    .adm-page-body .cost-panel-head,
                    .adm-page-body .cost-portals,
                    .adm-page-body .cost-analytics-note {
                        grid-template-columns: 1fr !important;
                    }
                    .adm-page-body .cost-actions,
                    .adm-page-body .cost-actions form,
                    .adm-page-body .cost-actions .cost-btn,
                    .adm-page-body .cost-panel-head form,
                    .adm-page-body .cost-panel-head form .cost-btn {
                        width: 100% !important;
                    }
                    .adm-page-body .cost-btn {
                        justify-content: center !important;
                    }
                }
                @media (max-width: 640px) {
                    .adm-page-body .cost-wrap {
                        gap: 12px !important;
                    }
                    .adm-page-body .cost-metrics,
                    .adm-page-body .cost-flow-grid,
                    .adm-page-body .cost-ledger-stats,
                    .adm-page-body .cost-env-grid,
                    .adm-page-body .cost-portal-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .adm-page-body .cost-panel-head,
                    .adm-page-body .cost-source-card,
                    .adm-page-body .cost-flow,
                    .adm-page-body .cost-portals,
                    .adm-page-body .cost-details-body,
                    .adm-page-body .cost-analytics-note,
                    .adm-page-body .cost-message-stack,
                    .adm-page-body .cost-empty {
                        padding: 14px !important;
                    }
                    .adm-page-body .cost-ledger-stats div {
                        border-right: 0 !important;
                        border-bottom: 1px solid rgba(255, 255, 255, .07) !important;
                        min-height: 84px !important;
                    }
                    .adm-page-body .cost-ledger-stats div:last-child {
                        border-bottom: 0 !important;
                    }
                }
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
