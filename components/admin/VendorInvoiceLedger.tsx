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
    if (normalized === "paid") return "green";
    if (normalized === "outstanding" || normalized === "open") return "orange";
    if (normalized === "needs_review") return "yellow";
    if (normalized === "voided") return "muted";
    return "blue";
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
        <section className="cost-panel">
            <div className="cost-panel-head">
                <div className="cost-title-row">
                    <span className="cost-icon">
                        <ReceiptText size={18} />
                    </span>
                    <div>
                        <h2>Vendor invoice ledger</h2>
                        <p>Platform bills, PDFs, paid status, inbox-imported invoices, and outstanding balances in one view.</p>
                    </div>
                </div>

                <form action={refreshVendorInvoices}>
                    <button type="submit" className="cost-btn cost-btn-secondary">
                        <RefreshCw size={15} />
                        Refresh invoices
                    </button>
                </form>
            </div>

            <div className="cost-ledger-stats">
                <div>
                    <span>Outstanding</span>
                    <strong>{money(outstandingTotal)}</strong>
                </div>
                <div>
                    <span>Paid tracked</span>
                    <strong>{money(paidTotal)}</strong>
                </div>
                <div>
                    <span>Needs review</span>
                    <strong>{reviewCount}</strong>
                </div>
                <div>
                    <span>Last sync</span>
                    <strong>{latestSync ? new Date(latestSync).toLocaleString() : "Not synced"}</strong>
                </div>
            </div>

            {invoices.length === 0 ? (
                <div className="cost-empty">
                    No invoices are available yet. Run the Supabase SQL update for the invoice tables, then click <strong>Refresh invoices</strong>.
                </div>
            ) : (
                <div className="cost-table-wrap">
                    <table className="cost-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Provider</th>
                                <th>Amount</th>
                                <th>Invoice number</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td>{dateLabel(invoice.invoiceDate)}</td>
                                    <td>
                                        <strong>{invoice.providerDisplayName}</strong>
                                        <span>{invoice.description || invoice.category}</span>
                                    </td>
                                    <td>{money(invoice.amount, invoice.currency)}</td>
                                    <td>
                                        <code>{invoice.invoiceNumber}</code>
                                    </td>
                                    <td>
                                        <span className={`cost-status ${statusTone(invoice.status)}`}>{invoice.status}</span>
                                    </td>
                                    <td>
                                        <div className="cost-row-actions">
                                            {invoice.paymentUrl ? (
                                                <a href={invoice.paymentUrl} target="_blank" rel="noopener noreferrer" className="cost-small-btn pay">
                                                    Pay
                                                    <ArrowUpRight size={13} />
                                                </a>
                                            ) : null}
                                            {invoice.invoicePdfUrl ? (
                                                <a href={invoice.invoicePdfUrl} target="_blank" rel="noopener noreferrer" className="cost-icon-btn" aria-label={`Open invoice ${invoice.invoiceNumber}`}>
                                                    <FileText size={15} />
                                                </a>
                                            ) : (
                                                <span className="cost-icon-btn disabled">
                                                    <FileText size={15} />
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

            <div className="cost-portals">
                <div>
                    <h3>Vendor portals</h3>
                    <p>Use these only when inbox import needs a manual check. Normal flow: vendor sends invoice, TrueServe imports it, admins review status here.</p>
                </div>
                <div className="cost-portal-grid">
                    {vendorPortals.map((vendor) => (
                        <a key={vendor.name} href={vendor.link} target="_blank" rel="noopener noreferrer">
                            {vendor.name}
                            <ArrowUpRight size={14} />
                        </a>
                    ))}
                </div>
            </div>

            {showCostAnalyticsSetup ? (
                <div className="cost-analytics-note">
                    <div>
                        <h3>Cost analytics</h3>
                        <p>Invoice tracking is the source of truth. Monthly analytics appear after the optional ServiceCost schema is installed and provider spend starts syncing.</p>
                    </div>
                    <div>
                        <h3>Setup needed</h3>
                        <p>
                            Run <code>db/cost_management_schema.sql</code> in Supabase only if you want provider spend charts beyond the invoice ledger.
                        </p>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
