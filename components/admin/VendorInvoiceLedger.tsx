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
    if (normalized === "voided") return "border-white/15 bg-white/5 text-white/50";
    return "border-[#8dc7ff]/25 bg-[#8dc7ff]/10 text-[#8dc7ff]";
}

export default function VendorInvoiceLedger({ invoices }: { invoices: VendorInvoice[] }) {
    const outstandingTotal = invoices
        .filter((invoice) => ["outstanding", "open"].includes(invoice.status.toLowerCase()))
        .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
    const paidTotal = invoices
        .filter((invoice) => invoice.status.toLowerCase() === "paid")
        .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
    const latestSync = invoices
        .map((invoice) => invoice.lastSyncedAt)
        .filter(Boolean)
        .sort()
        .at(-1);

    return (
        <section className="adm-card overflow-hidden">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#ff6b35]/25 bg-[#ff6b35]/10 text-[#ff8a2a]">
                            <ReceiptText className="h-5 w-5" />
                        </span>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Vendor Invoice Ledger</h2>
                            <p className="mt-1 text-sm leading-6 text-white/55">
                                Track platform bills, PDFs, paid status, and outstanding balances in one admin view.
                            </p>
                        </div>
                    </div>
                </div>

                <form action={refreshVendorInvoices}>
                    <button
                        type="submit"
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh invoices
                    </button>
                </form>
            </div>

            <div className="mb-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">Outstanding</div>
                    <div className="mt-2 text-2xl font-semibold text-[#ffb08f]">{money(outstandingTotal)}</div>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">Paid tracked</div>
                    <div className="mt-2 text-2xl font-semibold text-green-200">{money(paidTotal)}</div>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">Last sync</div>
                    <div className="mt-2 text-sm font-semibold text-white">
                        {latestSync ? new Date(latestSync).toLocaleString() : "Not synced yet"}
                    </div>
                </div>
            </div>

            {invoices.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm leading-6 text-white/55">
                    No invoices are available yet. Run the Supabase SQL update for the VendorInvoice table, then click
                    <span className="font-semibold text-white"> Refresh invoices</span>.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
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
        </section>
    );
}
