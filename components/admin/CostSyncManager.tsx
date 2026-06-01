"use client";

import React, { useEffect, useState } from "react";
import { syncAllServiceCosts, checkAndCreateAnomalies } from "@/app/admin/cost-management/actions";
import {
    AlertCircle,
    CheckCircle,
    ChevronDown,
    Clock,
    Inbox,
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

const sourceCards = [
    {
        title: "Billing inbox",
        status: "Primary",
        icon: Inbox,
        tone: "text-[#2dd4bf]",
        badge: "border-blue-400/20 bg-blue-500/20 text-blue-200",
        body: "Tracks Google Workspace, Supabase, Vercel, Telnyx, Zoho, and one-off invoice emails so you do not check a personal inbox.",
    },
    {
        title: "Stripe",
        status: "Direct API",
        icon: ShieldCheck,
        tone: "text-[#ff6b35]",
        badge: "border-[#ffb020]/20 bg-[#ffb020]/20 text-[#ffd889]",
        body: "Pulls structured hosted invoices and payment status from Stripe when the secret key is present.",
    },
    {
        title: "Cost analytics",
        status: "Optional",
        icon: Clock,
        tone: "text-[#8dc7ff]",
        badge: "border-white/10 bg-black/25 text-white/70",
        body: "Monthly charts turn on after the Supabase cost schema is installed. Invoice tracking can work before that.",
    },
];

const operatingSteps = [
    "Send every vendor invoice to billing@trueserve.delivery.",
    "Forward old personal email receipts into that inbox once.",
    "Use direct APIs only where they are reliable, starting with Stripe.",
    "Review imported bills here instead of hunting across vendor portals.",
];

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
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="flex flex-wrap items-center justify-between gap-6 p-6 lg:p-8">
                <div className="flex max-w-3xl gap-4">
                    <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#ffb020]/20 bg-[#ffb020]/20 text-[#ffb020]">
                        <RefreshCw className="h-5 w-5" />
                    </span>
                    <div>
                        <h2 className="text-xl font-semibold text-white">Billing monitor</h2>
                        <p className="mt-2 text-base leading-7 text-white/65">
                            One billing inbox as source of truth keeps Google Workspace, Supabase, Telnyx, Zoho,
                            Vercel, and one-off bills out of personal email.
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-3">
                    <button
                        onClick={handleSync}
                        disabled={syncStatus.isLoading}
                        className="inline-flex min-h-14 items-center gap-3 rounded-2xl border border-white/15 bg-transparent px-6 py-3 text-lg font-semibold text-white transition hover:border-[#ff6b35]/50 hover:bg-[#ff6b35]/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${syncStatus.isLoading ? "animate-spin" : ""}`} />
                        {syncStatus.isLoading ? "Syncing" : "Sync invoices"}
                    </button>

                    <button
                        onClick={handleAnomalyCheck}
                        disabled={syncStatus.isLoading}
                        className="inline-flex min-h-14 items-center gap-3 rounded-2xl border border-white/15 bg-transparent px-6 py-3 text-lg font-semibold text-white transition hover:border-white/25 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <AlertCircle className="h-4 w-4" />
                        Check trends
                    </button>
                </div>
            </div>

            <div className="grid border-t border-white/10 lg:grid-cols-3">
                {sourceCards.map((source) => {
                    const Icon = source.icon;
                    return (
                        <div key={source.title} className="border-white/10 p-6 lg:border-r lg:last:border-r-0">
                            <span className={`inline-flex rounded-lg border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${source.badge}`}>
                                {source.status}
                            </span>
                            <div className="mt-5 flex items-center gap-3 text-xl font-semibold text-white">
                                <Icon className={`h-5 w-5 ${source.tone}`} />
                                {source.title}
                            </div>
                            <p className="mt-3 max-w-sm text-sm leading-6 text-white/62">{source.body}</p>
                        </div>
                    );
                })}
            </div>

            <div className="border-t border-white/10 p-6 lg:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-lg font-semibold text-white">Recommended operating flow</div>
                    <div className="text-sm font-semibold text-white/65">Inbox first</div>
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {operatingSteps.map((step, index) => (
                        <div key={step} className="text-sm leading-6 text-white/65">
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#ff6b35]">
                                Step {index + 1}
                            </span>
                            {step}
                        </div>
                    ))}
                </div>
            </div>

            {(syncStatus.lastSyncResult || syncStatus.anomalyCheckResult) && (
                <div className="space-y-4 border-t border-white/10 p-6">
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
            )}

            <details className="group border-t border-white/10">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-sm font-semibold text-white">
                    Setup details and environment variables
                    <ChevronDown className="h-4 w-4 text-white/45 transition group-open:rotate-180" />
                </summary>
                <div className="border-t border-white/[0.08] p-6">
                    <p className="max-w-3xl text-sm leading-6 text-white/60">
                        The visible dashboard should stay simple. These variables are only needed to connect the inbox, Stripe,
                        and optional provider analytics. If the Supabase cost tables are missing, run
                        <code className="mx-1 rounded bg-black/30 px-1.5 py-0.5 text-white">db/cost_management_schema.sql</code>
                        once in Supabase.
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {envChecklist.map((item) => (
                            <div key={item.key} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
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
            className={`rounded-2xl border p-4 ${
                success ? "border-green-400/20 bg-green-500/10" : "border-red-400/25 bg-red-500/15"
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
