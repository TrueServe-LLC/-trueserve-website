import crypto from "crypto";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

export interface BillingInboxInvoice {
    provider: string;
    providerDisplayName: string;
    invoiceNumber: string;
    invoiceDate: string;
    periodStart?: string | null;
    periodEnd?: string | null;
    amount: number;
    currency: string;
    status: string;
    category?: string | null;
    description?: string | null;
    paymentUrl?: string | null;
    invoicePdfUrl?: string | null;
    externalId?: string | null;
    apiSource: string;
    metadata?: Record<string, unknown>;
}

interface BillingInboxConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    secure: boolean;
    folder: string;
}

function getInboxConfig(): BillingInboxConfig | null {
    const host = process.env.BILLING_INBOX_HOST;
    const user = process.env.BILLING_INBOX_USER;
    const password = process.env.BILLING_INBOX_PASSWORD;

    if (!host || !user || !password) return null;

    return {
        host,
        user,
        password,
        port: Number(process.env.BILLING_INBOX_PORT || 993),
        secure: process.env.BILLING_INBOX_SECURE !== "false",
        folder: process.env.BILLING_INBOX_FOLDER || "INBOX",
    };
}

function normalizeText(value: string) {
    return value.replace(/\s+/g, " ").trim();
}

function stripHtml(value = "") {
    return normalizeText(value.replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " "));
}

function hash(value: string) {
    return crypto.createHash("sha256").update(value).digest("hex").slice(0, 12).toUpperCase();
}

function isoDate(value?: Date | string | null) {
    const date = value instanceof Date ? value : value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
    return date.toISOString().slice(0, 10);
}

function parseDateFromText(text: string, fallback?: Date | null) {
    const patterns = [
        /invoice date\s*[:#-]?\s*([A-Z][a-z]{2,8}\s+\d{1,2},?\s+\d{4})/i,
        /billing date\s*[:#-]?\s*([A-Z][a-z]{2,8}\s+\d{1,2},?\s+\d{4})/i,
        /date\s*[:#-]?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
        /date\s*[:#-]?\s*(\d{4}-\d{2}-\d{2})/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match?.[1]) return isoDate(match[1]);
    }

    return isoDate(fallback || null);
}

function parseInvoiceNumber(text: string) {
    const patterns = [
        /invoice\s*(?:number|#|no\.?)\s*[:#-]?\s*([A-Z0-9][A-Z0-9._-]{3,})/i,
        /receipt\s*(?:number|#|no\.?)\s*[:#-]?\s*([A-Z0-9][A-Z0-9._-]{3,})/i,
        /bill\s*(?:number|#|no\.?)\s*[:#-]?\s*([A-Z0-9][A-Z0-9._-]{3,})/i,
        /payment\s*(?:number|#|no\.?)\s*[:#-]?\s*([A-Z0-9][A-Z0-9._-]{3,})/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match?.[1]) return match[1].replace(/[.,;:]+$/, "");
    }

    return null;
}

function parseAmount(text: string) {
    const scopedPatterns = [
        /(?:total|amount due|balance due|amount paid|charged|payment)\s*(?:in\s+[A-Z]{3})?\s*[:#-]?\s*(?:USD|US\$|\$)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]+(?:\.[0-9]{2}))/i,
        /(?:USD|US\$|\$)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]+(?:\.[0-9]{2}))\s*(?:total|due|paid|charged)/i,
    ];

    for (const pattern of scopedPatterns) {
        const match = text.match(pattern);
        if (match?.[1]) return Number(match[1].replace(/,/g, ""));
    }

    const loose = text.match(/(?:USD|US\$|\$)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]+(?:\.[0-9]{2}))/i);
    return loose?.[1] ? Number(loose[1].replace(/,/g, "")) : 0;
}

function detectProvider(from: string, subject: string, text: string) {
    const haystack = `${from} ${subject} ${text.slice(0, 1000)}`.toLowerCase();
    const providers = [
        ["google-workspace", "Google Workspace", ["google workspace", "google llc", "workspace-noreply", "payments-noreply@google"]],
        ["vercel", "Vercel", ["vercel", "vercel.com"]],
        ["telnyx", "Telnyx", ["telnyx"]],
        ["zoho", "Zoho", ["zoho", "zohomail"]],
        ["stripe", "Stripe", ["stripe"]],
        ["vonage", "Vonage", ["vonage", "nexmo"]],
        ["clickup", "ClickUp", ["clickup"]],
    ] as const;

    for (const [provider, displayName, needles] of providers) {
        if (needles.some((needle) => haystack.includes(needle))) {
            return { provider, providerDisplayName: displayName };
        }
    }

    const domain = from.match(/@([^>\s]+)/)?.[1]?.replace(/[>)]/g, "");
    const inferred = domain ? domain.split(".").slice(-2, -1)[0] : "vendor";
    return {
        provider: inferred || "vendor",
        providerDisplayName: inferred ? inferred[0].toUpperCase() + inferred.slice(1) : "Vendor",
    };
}

function isInvoiceLike(subject: string, text: string) {
    const haystack = `${subject} ${text.slice(0, 1500)}`.toLowerCase();
    return [
        "invoice",
        "receipt",
        "payment received",
        "amount due",
        "your bill",
        "billing statement",
        "subscription renewal",
        "charged",
    ].some((needle) => haystack.includes(needle));
}

function parseStatus(text: string) {
    const lower = text.toLowerCase();
    if (/\b(overdue|past due|amount due|balance due|pay now|payment failed|unpaid)\b/.test(lower)) {
        return "outstanding";
    }
    if (/\b(paid|payment received|receipt|automatically charged|charged to|has been charged)\b/.test(lower)) {
        return "paid";
    }
    return "needs_review";
}

function parsePaymentUrl(text: string) {
    const urls = text.match(/https?:\/\/[^\s<>"')]+/gi) || [];
    return urls.find((url) => /pay|billing|invoice|stripe|vercel|telnyx|zoho|google/i.test(url)) || null;
}

export async function syncBillingInboxInvoices(limit = 50): Promise<BillingInboxInvoice[]> {
    const config = getInboxConfig();
    if (!config) return [];

    const client = new ImapFlow({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.password,
        },
        logger: false,
    });

    const invoices: BillingInboxInvoice[] = [];
    const since = new Date();
    since.setDate(since.getDate() - 120);

    await client.connect();
    try {
        const lock = await client.getMailboxLock(config.folder);
        try {
            const uids = await client.search({ since });
            const recentUids = uids.slice(-limit);

            for await (const message of client.fetch(recentUids, {
                source: true,
                envelope: true,
                internalDate: true,
                uid: true,
            })) {
                if (!message.source) continue;

                const parsed = await simpleParser(message.source);
                const subject = parsed.subject || message.envelope?.subject || "";
                const from = parsed.from?.text || message.envelope?.from?.map((entry) => `${entry.name || ""} <${entry.address}>`).join(", ") || "";
                const text = normalizeText(`${parsed.text || ""} ${stripHtml(parsed.html?.toString() || "")}`);

                if (!isInvoiceLike(subject, text)) continue;

                const provider = detectProvider(from, subject, text);
                const amount = parseAmount(text);
                const invoiceDate = parseDateFromText(text, message.internalDate);
                const externalId = parsed.messageId || `imap-${message.uid}`;
                const invoiceNumber = parseInvoiceNumber(text) || `EMAIL-${hash(`${externalId}:${subject}:${invoiceDate}:${amount}`)}`;
                const attachmentNames = parsed.attachments.map((attachment) => attachment.filename).filter(Boolean);

                invoices.push({
                    ...provider,
                    invoiceNumber,
                    invoiceDate,
                    amount,
                    currency: "USD",
                    status: parseStatus(text),
                    category: "vendor_bill",
                    description: subject || `${provider.providerDisplayName} billing email`,
                    paymentUrl: parsePaymentUrl(text),
                    invoicePdfUrl: null,
                    externalId,
                    apiSource: "billing_inbox_imap",
                    metadata: {
                        from,
                        subject,
                        mailbox: config.user,
                        imapUid: message.uid,
                        internalDate: message.internalDate?.toISOString() || null,
                        attachmentNames,
                        parserConfidence: amount > 0 ? "medium" : "needs_review",
                    },
                });
            }
        } finally {
            lock.release();
        }
    } finally {
        await client.logout();
    }

    return invoices;
}
