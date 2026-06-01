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
import { ArrowUpRight, Inbox, ReceiptText, ShieldCheck, TrendingUp } from "lucide-react";

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

async function getVendorInvoices() {
    try {
        const { data, error } = await supabaseAdmin
            .from("VendorInvoice")
            .select("*")
            .order("invoiceDate", { ascending: false })
            .limit(20);
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Error fetching vendor invoices:", e);
        return [];
    }
}

export default async function CostManagementPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, 'cost-management'));
    if (!isAuthorized) redirect("/admin/login");

    const realCosts = await getServiceCosts();
    const budgets = await getBudgetAlerts();
    const vendorInvoices = await getVendorInvoices();

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

    return (
        <AdminPortalWrapper role={role}>
            <div className="adm-page-header">
                <h1>Cost Management</h1>
                <p>Track real spending across service APIs and surface budget alerts when costs move outside the expected range.</p>
            </div>
            <div className="adm-page-body">
                <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-4">
                        <div className="adm-card">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
                                    Outstanding
                                </span>
                                <ReceiptText className="h-4 w-4 text-[#ff6b35]" />
                            </div>
                            <div className="mt-3 text-2xl font-semibold text-white">
                                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(outstandingTotal)}
                            </div>
                            <p className="mt-1 text-xs text-white/45">Bills that still need payment or review.</p>
                        </div>
                        <div className="adm-card">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
                                    Review Queue
                                </span>
                                <ShieldCheck className="h-4 w-4 text-[#8dc7ff]" />
                            </div>
                            <div className="mt-3 text-2xl font-semibold text-white">{reviewCount}</div>
                            <p className="mt-1 text-xs text-white/45">Imported invoices that need a human check.</p>
                        </div>
                        <div className="adm-card">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
                                    Tracked Invoices
                                </span>
                                <Inbox className="h-4 w-4 text-[#2dd4bf]" />
                            </div>
                            <div className="mt-3 text-2xl font-semibold text-white">{vendorInvoices.length}</div>
                            <p className="mt-1 text-xs text-white/45">Pulled from APIs, inboxes, and manual entries.</p>
                        </div>
                        <div className="adm-card">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
                                    Last Sync
                                </span>
                                <TrendingUp className="h-4 w-4 text-[#ff6b35]" />
                            </div>
                            <div className="mt-3 text-sm font-semibold text-white">
                                {latestInvoiceSync ? new Date(latestInvoiceSync).toLocaleString() : "Not synced yet"}
                            </div>
                            <p className="mt-1 text-xs text-white/45">Nightly inbox checks can keep this current.</p>
                        </div>
                    </div>

                    <CostSyncManager />

                    <VendorInvoiceLedger invoices={vendorInvoices as any} />

                    <div className="adm-card">
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="adm-card-title">Vendor Portals</div>
                                <p className="max-w-2xl text-sm leading-6 text-white/55">
                                    Use these only when the inbox import needs a manual check. The normal flow is: vendor sends invoice
                                    to the billing inbox, TrueServe imports it, then admins review status here.
                                </p>
                            </div>
                            <span className="rounded-full border border-[#2dd4bf]/25 bg-[#2dd4bf]/10 px-3 py-1 text-xs font-semibold text-[#9ff7ea]">
                                Delivery-app style ledger
                            </span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { name: "Stripe", link: "https://dashboard.stripe.com" },
                                { name: "Supabase", link: "https://supabase.com/dashboard" },
                                { name: "Vercel", link: "https://vercel.com/dashboard" },
                                { name: "Zoho Mail", link: "https://mail.zoho.com" },
                                { name: "Telnyx", link: "https://portal.telnyx.com" },
                                { name: "Google Cloud", link: "https://console.cloud.google.com" },
                                { name: "Resend", link: "https://resend.com/dashboard" },
                                { name: "Vonage", link: "https://dashboard.nexmo.com" },
                            ].map((s) => (
                                <a
                                    key={s.name}
                                    href={s.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white/75 transition hover:border-[#ff6b35]/35 hover:bg-[#ff6b35]/10 hover:text-white"
                                >
                                    {s.name}
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {monthlyCosts.length === 0 ? (
                        <div className="adm-card">
                            <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                                <div>
                                    <div className="adm-card-title">Cost Analytics</div>
                                    <p className="text-sm leading-6 text-white/55">
                                        Invoice tracking is the source of truth. Cost analytics will appear after the
                                        `ServiceCost` schema is installed and provider spend starts syncing.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/55">
                                    Setup needed: run <code className="rounded bg-white/10 px-1.5 py-0.5 text-white">db/cost_management_schema.sql</code>{" "}
                                    in Supabase SQL editor, then click <span className="font-semibold text-white">Sync costs</span>.
                                </div>
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
            </div>
        </AdminPortalWrapper>
    );
}
