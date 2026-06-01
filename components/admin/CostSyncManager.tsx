"use client";

import React, { useEffect, useState } from "react";
import { syncAllServiceCosts, checkAndCreateAnomalies } from "@/app/admin/cost-management/actions";
import {
    AlertCircle,
    CheckCircle,
    ChevronDown,
    Clock,
    Inbox,
    PlugZap,
    RefreshCw,
    ShieldCheck,
} from "lucide-react";

interface SyncStatus {
    isLoading: boolean;
    lastSyncTime?: string;
    lastSyncResult?: {
        success: boolean;
        message: string;
        synced?: number;
        invoicesSynced?: number;
        setupRequired?: boolean;
    };
    anomalyCheckResult?: {
        success: boolean;
        message: string;
        anomalies?: any[];
    };
}

const providers = [
    { name: "Stripe", active: true, note: "Direct API invoices and payment billing" },
    { name: "Billing Inbox", active: true, note: "Reads Zoho invoice emails nightly" },
    { name: "Telnyx", active: false, note: "SMS invoices when API access is added" },
    { name: "Supabase", active: false, note: "Needs management access token" },
    { name: "Google Workspace", active: false, note: "Tracked from billing inbox" },
    { name: "Google Cloud", active: false, note: "Needs billing export" },
    { name: "Mapbox", active: false, note: "Needs API token and username" },
    { name: "Resend", active: false, note: "Needs API key" },
    { name: "Vonage", active: false, note: "Needs API key and secret" },
];

const envChecklist = [
    { key: "STRIPE_SECRET_KEY", example: "sk_...", required: true },
    { key: "BILLING_INBOX_HOST", example: "imap.zoho.com", required: true },
    { key: "BILLING_INBOX_PORT", example: "993", required: true },
    { key: "BILLING_INBOX_USER", example: "billing@trueserve.delivery", required: true },
    { key: "BILLING_INBOX_PASSWORD", example: "Zoho app password", required: true },
    { key: "BILLING_INBOX_SECURE", example: "true", required: true },
    { key: "BILLING_INBOX_FOLDER", example: "INBOX" },
    { key: "GCP_PROJECT_ID", example: "your-project-id" },
    { key: "GCP_BILLING_ACCOUNT_ID", example: "000000-000000-000000" },
    { key: "SUPABASE_PROJECT_ID", example: "your-project-id" },
    { key: "SUPABASE_ACCESS_TOKEN", example: "sbpa_..." },
    { key: "MAPBOX_ACCESS_TOKEN", example: "pk_..." },
    { key: "MAPBOX_USERNAME", example: "your-username" },
    { key: "RESEND_API_KEY", example: "re_..." },
    { key: "TELNYX_API_KEY", example: "KEY..." },
    { key: "TELNYX_FROM_NUMBER", example: "+18337231112" },
    { key: "VONAGE_API_KEY", example: "your-api-key" },
    { key: "VONAGE_API_SECRET", example: "your-api-secret" },
];

const activeProviders = providers.filter((provider) => provider.active);
const queuedProviders = providers.filter((provider) => !provider.active);

export default function CostSyncManager() {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        isLoading: false,
        lastSyncTime: undefined,
        lastSyncResult: undefined,
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        const savedTime = localStorage.getItem("lastCostSyncTime");
        const savedResult = localStorage.getItem("lastCostSyncResult");

        setSyncStatus((prev) => ({
            ...prev,
            lastSyncTime: savedTime || undefined,
            lastSyncResult: savedResult ? JSON.parse(savedResult) : undefined,
        }));
    }, []);

    async function handleSync() {
        setSyncStatus((prev) => ({ ...prev, isLoading: true }));

        try {
            const result = await syncAllServiceCosts();
            const timestamp = new Date().toLocaleString();

            if (typeof window !== "undefined") {
                localStorage.setItem("lastCostSyncTime", timestamp);
                localStorage.setItem("lastCostSyncResult", JSON.stringify(result));
            }

            setSyncStatus({
                isLoading: false,
                lastSyncTime: timestamp,
                lastSyncResult: result,
            });
        } catch (error) {
            setSyncStatus({
                isLoading: false,
                lastSyncTime: new Date().toLocaleString(),
                lastSyncResult: {
                    success: false,
                    message: error instanceof Error ? error.message : "Unknown error occurred",
                },
            });
        }
    }

    async function handleAnomalyCheck() {
        setSyncStatus((prev) => ({ ...prev, isLoading: true }));

        try {
            const result = await checkAndCreateAnomalies();
            setSyncStatus((prev) => ({
                ...prev,
                isLoading: false,
                anomalyCheckResult: result,
            }));
        } catch (error) {
            setSyncStatus((prev) => ({
                ...prev,
                isLoading: false,
                anomalyCheckResult: {
                    success: false,
                    message: error instanceof Error ? error.message : "Unknown error occurred",
                },
            }));
        }
    }

    return (
        <section className="adm-card">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                <div>
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#ff6b35]/25 bg-[#ff6b35]/10 text-[#ff8a2a]">
                                    <RefreshCw className="h-5 w-5" />
                                </span>
                                <div>
                                    <h2 className="text-base font-semibold text-white">Billing Sync</h2>
                                    <p className="mt-1 text-sm leading-6 text-white/55">
                                        Pull invoices first, then layer cost analytics on top when provider billing APIs are available.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-3">
                            <button
                                onClick={handleSync}
                                disabled={syncStatus.isLoading}
                                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#ff6b35]/35 bg-[#ff6b35] px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_24px_rgba(255,107,53,0.18)] transition hover:bg-[#ff8155] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${syncStatus.isLoading ? "animate-spin" : ""}`} />
                                {syncStatus.isLoading ? "Syncing" : "Sync now"}
                            </button>

                            <button
                                onClick={handleAnomalyCheck}
                                disabled={syncStatus.isLoading}
                                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <AlertCircle className="h-4 w-4" />
                                Check trends
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
                                <Inbox className="h-3.5 w-3.5 text-[#2dd4bf]" />
                                Primary Source
                            </div>
                            <div className="mt-2 text-sm font-semibold text-white">Billing inbox</div>
                            <p className="mt-1 text-xs leading-5 text-white/45">Best for Google, Telnyx, Zoho, Vercel, and one-off bills.</p>
                        </div>
                        <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
                                <PlugZap className="h-3.5 w-3.5 text-[#ff6b35]" />
                                Direct APIs
                            </div>
                            <div className="mt-2 text-sm font-semibold text-white">Stripe active</div>
                            <p className="mt-1 text-xs leading-5 text-white/45">Adds structured hosted invoices and payment status.</p>
                        </div>
                        <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
                                <Clock className="h-3.5 w-3.5 text-[#8dc7ff]" />
                                Last Run
                            </div>
                            <div className="mt-2 text-sm font-semibold text-white">
                                {syncStatus.lastSyncTime || "Not synced yet"}
                            </div>
                            <p className="mt-1 text-xs leading-5 text-white/45">Run manually here or from the nightly cron endpoint.</p>
                        </div>
                    </div>

                    {syncStatus.lastSyncResult && (
                        <SyncMessage
                            success={syncStatus.lastSyncResult.success}
                            title={syncStatus.lastSyncResult.setupRequired ? "Invoices synced, analytics pending" : syncStatus.lastSyncResult.success ? "Sync complete" : "Sync needs attention"}
                            message={syncStatus.lastSyncResult.message}
                        />
                    )}

                    {syncStatus.anomalyCheckResult && (
                        <SyncMessage
                            success={syncStatus.anomalyCheckResult.success}
                            title={syncStatus.anomalyCheckResult.success ? "Trend check complete" : "Trend check needs attention"}
                            message={syncStatus.anomalyCheckResult.message}
                        />
                    )}
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <div className="text-sm font-semibold text-white">Provider Health</div>
                            <p className="mt-1 text-xs text-white/45">Connected sources stay active; missing ones remain queued.</p>
                        </div>
                        <span className="rounded-full border border-green-400/25 bg-green-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-green-200">
                            {activeProviders.length} active
                        </span>
                    </div>

                    <div className="space-y-2">
                        {activeProviders.map((provider) => (
                            <ProviderRow key={provider.name} provider={provider} active />
                        ))}
                        {queuedProviders.slice(0, 4).map((provider) => (
                            <ProviderRow key={provider.name} provider={provider} active={false} />
                        ))}
                    </div>
                </div>
            </div>

            <details className="group mt-5 rounded-2xl border border-white/[0.08] bg-black/20">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-semibold text-white">
                    Setup details and environment variables
                    <ChevronDown className="h-4 w-4 text-white/45 transition group-open:rotate-180" />
                </summary>
                <div className="border-t border-white/[0.08] p-4">
                    <p className="max-w-3xl text-xs leading-6 text-white/55">
                        Delivery apps usually track bills through a billing inbox plus direct APIs. The inbox catches invoices from
                        vendors that do not expose clean billing APIs; direct integrations add richer status when available.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {envChecklist.map((item) => (
                            <div key={item.key} className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-3">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                                        {item.required ? "Required" : "Optional"}
                                    </span>
                                    <span className={`h-2 w-2 rounded-full ${item.required ? "bg-[#ff6b35]" : "bg-white/25"}`} />
                                </div>
                                <code className="block break-all font-mono text-[11px] leading-5 text-white/70">
                                    {item.key}=<span className="text-white/35">{item.example}</span>
                                </code>
                            </div>
                        ))}
                    </div>
                </div>
            </details>
        </section>
    );
}

function SyncMessage({ success, title, message }: { success: boolean; title: string; message: string }) {
    return (
        <div
            className={`mt-4 rounded-2xl border p-4 ${
                success ? "border-green-400/20 bg-green-500/10" : "border-red-400/20 bg-red-500/10"
            }`}
        >
            <div className="flex items-start gap-3">
                {success ? (
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-300" />
                ) : (
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-300" />
                )}
                <div className="min-w-0">
                    <p className={`text-sm font-semibold ${success ? "text-green-200" : "text-red-200"}`}>{title}</p>
                    <p className={`mt-1 text-sm leading-6 ${success ? "text-green-100/75" : "text-red-100/75"}`}>{message}</p>
                </div>
            </div>
        </div>
    );
}

function ProviderRow({
    provider,
    active,
}: {
    provider: { name: string; note: string };
    active: boolean;
}) {
    return (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2.5">
            <div className="min-w-0">
                <div className="text-sm font-semibold text-white/85">{provider.name}</div>
                <div className="mt-0.5 text-xs leading-5 text-white/40">{provider.note}</div>
            </div>
            <span
                className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                    active
                        ? "border border-green-400/25 bg-green-500/10 text-green-200"
                        : "border border-white/10 bg-white/5 text-white/45"
                }`}
            >
                {active ? "Active" : "Queued"}
            </span>
        </div>
    );
}
