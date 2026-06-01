import { ArrowUpRight, FileText, ReceiptText, RefreshCw } from "lucide-react";
import { refreshVendorInvoices } from "@/app/admin/cost-management/actions";

export interface VendorInvoice {
    id: string;
    provider: string;
    providerDisplayName: string;
    invoiceNumber: string;
    invoiceDate: string;
    periodStart?: string | null;
    periodEnd?: string | null;
    amount: number | string;
    currency: string;
    status: string;
    category?: string | null;
    description?: string | null;
    paymentUrl?: string | null;
    invoicePdfUrl?: string | null;
    lastSyncedAt?: string | null;
}

function money(value: number | string, currency = "USD") {
    const amount = typeof value === "string" ? Number(value) : value;
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(Number.isFinite(amount) ? amount : 0);
}

function dateLabel(value: string) {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    }).format(date);
}

function statusTone(status: string) {
    const normalized = status.toLowerCase();
    if (normalized === "paid") return "border-green-400/30 bg-green-500/10 text-green-200";
    if (normalized === "outstanding" || normalized === "open") return "border-[#ff6b35]/35 bg-[#ff6b35]/10 text-[#ffb08f]";
    if (normalized === "needs_review") return "border-yellow-300/30 bg-yellow-300/10 text-yellow-100";
    if (normalized === "voided") return "border-white/15 bg-white/5 text-white/50";
    return "border-[#8dc7ff]/25 bg-[#8dc7ff]/10 text-[#8dc7ff]";
}

const vendorPortals = [
    { name: "Stripe", link: "https://dashboard.stripe.com" },
    { name: "Supabase", link: "https://supabase.com/dashboard" },
    { name: "Vercel", link: "https://vercel.com/dashboard" },
    { name: "Zoho Mail", link: "https://mail.zoho.com" },
    { name: "Telnyx", link: "https://portal.telnyx.com" },
    { name: "Google Cloud", link: "https://console.cloud.google.com" },
    { name: "Resend", link: "https://resend.com/dashboard" },
    { name: "Vonage", link: "https://dashboard.nexmo.com" },
];

export default function VendorInvoiceLedger({
    invoices,
    showCostAnalyticsSetup = false,
}: {
    invoices: VendorInvoice[];
    showCostAnalyticsSetup?: boolean;
}) {
    const outstandingTotal = invoices
        .filter((invoice) => ["outstanding", "open"].includes(invoice.status.toLowerCase()))
        .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
    const paidTotal = invoices
        .filter((invoice) => invoice.status.toLowerCase() === "paid")
        .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
    const reviewCount = invoices.filter((invoice) => invoice.status.toLowerCase() === "needs_review").length;
    const latestSync = invoices
        .map((invoice) => invoice.lastSyncedAt)
        .filter(Boolean)
        .sort()
        .at(-1);

    return (
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="flex flex-wrap items-center justify-between gap-6 p-6 lg:p-8">
                <div className="flex max-w-3xl gap-4">
                    <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black/20 text-white/75">
                        <ReceiptText className="h-6 w-6" />
                    </span>
                    <div>
                        <h2 className="text-xl font-semibold text-white">Vendor invoice ledger</h2>
                        <p className="mt-2 text-base leading-7 text-white/65">
                            Platform bills, PDFs, paid status, inbox-imported invoices, and outstanding balances in one view.
                        </p>
                    </div>
                </div>

                <form action={refreshVendorInvoices}>
                    <button
                        type="submit"
                        className="inline-flex min-h-14 items-center gap-3 rounded-2xl border border-white/15 bg-transparent px-6 py-3 text-lg font-semibold text-white transition hover:border-[#ff6b35]/50 hover:bg-[#ff6b35]/15"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh invoices
                    </button>
                </form>
            </div>

            <div className="grid border-t border-white/10 md:grid-cols-4">
                <div className="border-white/10 p-6 md:border-r">
                    <div className="text-xs font-semibold uppercase tracking-[0.13em] text-white/55">Outstanding</div>
                    <div className="mt-3 text-3xl font-semibold text-white">{money(outstandingTotal)}</div>
                </div>
                <div className="border-white/10 p-6 md:border-r">
                    <div className="text-xs font-semibold uppercase tracking-[0.13em] text-white/55">Paid tracked</div>
                    <div className="mt-3 text-3xl font-semibold text-white">{money(paidTotal)}</div>
                </div>
                <div className="border-white/10 p-6 md:border-r">
                    <div className="text-xs font-semibold uppercase tracking-[0.13em] text-white/55">Needs review</div>
                    <div className="mt-3 text-3xl font-semibold text-white">{reviewCount}</div>
                </div>
                <div className="p-6">
                    <div className="text-xs font-semibold uppercase tracking-[0.13em] text-white/55">Last sync</div>
                    <div className="mt-3 text-xl font-semibold text-white">
                        {latestSync ? new Date(latestSync).toLocaleString() : "Not synced"}
                    </div>
                </div>
            </div>

            {invoices.length === 0 ? (
                <div className="border-t border-white/10 px-6 py-5 text-base leading-7 text-white/65">
                    No invoices are available yet. Run the Supabase SQL update for the VendorInvoice table, then click
                    <span className="font-semibold text-white"> Refresh invoices</span>.
                </div>
            ) : (
                <div className="overflow-x-auto border-t border-white/10">
                    <table className="min-w-[920px] w-full border-collapse text-left">
                        <thead className="bg-white/[0.04]">
                            <tr className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                                <th className="px-5 py-4 font-semibold">Date</th>
                                <th className="px-5 py-4 font-semibold">Provider</th>
                                <th className="px-5 py-4 font-semibold">Amount</th>
                                <th className="px-5 py-4 font-semibold">Invoice number</th>
                                <th className="px-5 py-4 font-semibold">Status</th>
                                <th className="px-5 py-4 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="border-t border-white/[0.07] text-sm text-white/75">
                                    <td className="px-5 py-4 font-medium text-white">{dateLabel(invoice.invoiceDate)}</td>
                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-white/90">{invoice.providerDisplayName}</div>
                                        <div className="mt-1 text-xs text-white/40">{invoice.description || invoice.category}</div>
                                    </td>
                                    <td className="px-5 py-4 font-semibold text-white">{money(invoice.amount, invoice.currency)}</td>
                                    <td className="px-5 py-4 font-mono text-white/55">{invoice.invoiceNumber}</td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${statusTone(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-2">
                                            {invoice.paymentUrl ? (
                                                <a
                                                    href={invoice.paymentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-green-500 px-3 text-xs font-semibold text-black transition hover:bg-green-400"
                                                >
                                                    Pay now
                                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                                </a>
                                            ) : null}
                                            {invoice.invoicePdfUrl ? (
                                                <a
                                                    href={invoice.invoicePdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/75 transition hover:bg-white/10"
                                                    aria-label={`Open invoice ${invoice.invoiceNumber}`}
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </a>
                                            ) : (
                                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/25">
                                                    <FileText className="h-4 w-4" />
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="border-t border-white/10 p-6 lg:p-8">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-semibold text-white">Vendor portals</h3>
                        <p className="mt-2 max-w-4xl text-base leading-7 text-white/65">
                            Use these only when inbox import needs a manual check. Normal flow: vendor sends invoice to
                            billing inbox, TrueServe imports it, then admins review status here.
                        </p>
                    </div>
                    <span className="rounded-lg border border-blue-400/20 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-200">
                        Delivery-app style ledger
                    </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {vendorPortals.map((vendor) => (
                        <a
                            key={vendor.name}
                            href={vendor.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-14 items-center justify-between rounded-2xl border border-white/15 bg-transparent px-5 text-lg font-semibold text-white transition hover:border-[#ff6b35]/45 hover:bg-[#ff6b35]/10"
                        >
                            {vendor.name}
                            <ArrowUpRight className="h-4 w-4 text-white/65" />
                        </a>
                    ))}
                </div>
            </div>

            {showCostAnalyticsSetup ? (
                <div className="grid border-t border-white/10 lg:grid-cols-2">
                    <div className="border-white/10 p-6 lg:border-r lg:p-8">
                        <h3 className="text-xl font-semibold text-white">Cost analytics</h3>
                        <p className="mt-2 max-w-xl text-base leading-7 text-white/65">
                            Invoice tracking is the source of truth. Monthly analytics are optional and appear after
                            the ServiceCost schema is installed and provider spend starts syncing.
                        </p>
                    </div>
                    <div className="p-6 lg:p-8">
                        <h3 className="text-xl font-semibold text-white">Setup needed</h3>
                        <p className="mt-2 text-base leading-7 text-white/65">
                            Run <code className="rounded bg-black/30 px-2 py-1 font-mono text-white">db/cost_management_schema.sql</code>{" "}
                            in the Supabase SQL editor, then click <span className="font-semibold text-white">Sync invoices</span>.
                        </p>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
