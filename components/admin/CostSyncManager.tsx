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
        body: "Tracks Google Workspace, Supabase, Vercel, Telnyx, Zoho, and one-off invoice emails so you do not check a personal inbox.",
    },
    {
        title: "Stripe",
        status: "Direct API",
        icon: ShieldCheck,
        tone: "text-[#ff6b35]",
        body: "Pulls structured hosted invoices and payment status from Stripe when the secret key is present.",
    },
    {
        title: "Cost analytics",
        status: "Optional",
        icon: Clock,
        tone: "text-[#8dc7ff]",
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
        <section className="adm-card space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex max-w-3xl gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#ff6b35]/25 bg-[#ff6b35]/10 text-[#ff8a2a]">
                        <RefreshCw className="h-5 w-5" />
                    </span>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Billing Monitor</h2>
                        <p className="mt-1 text-sm leading-6 text-white/55">
                            Use one billing inbox as the source of truth, then add direct provider APIs where they are reliable.
                            This keeps Google Workspace, Supabase, Telnyx, Zoho, Vercel, and one-off bills out of your personal email.
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-3">
                    <button
                        onClick={handleSync}
                        disabled={syncStatus.isLoading}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#ff6b35]/35 bg-[#ff6b35] px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_24px_rgba(255,107,53,0.18)] transition hover:bg-[#ff8155] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${syncStatus.isLoading ? "animate-spin" : ""}`} />
                        {syncStatus.isLoading ? "Syncing" : "Sync invoices"}
                    </button>

                    <button
                        onClick={handleAnomalyCheck}
                        disabled={syncStatus.isLoading}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <AlertCircle className="h-4 w-4" />
                        Check trends
                    </button>
                </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
                {sourceCards.map((source) => {
                    const Icon = source.icon;
                    return (
                        <div key={source.title} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <Icon className={`mt-0.5 h-4 w-4 ${source.tone}`} />
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/55">
                                    {source.status}
                                </span>
                            </div>
                            <div className="mt-3 text-sm font-semibold text-white">{source.title}</div>
                            <p className="mt-1 text-xs leading-5 text-white/45">{source.body}</p>
                        </div>
                    );
                })}
            </div>

            <div className="rounded-2xl border border-[#2dd4bf]/15 bg-[#2dd4bf]/[0.04] p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="text-sm font-semibold text-white">Recommended operating flow</div>
                        <p className="mt-1 text-xs leading-5 text-white/45">
                            This is how delivery apps usually avoid chasing invoices across every vendor dashboard.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-[#2dd4bf]/20 bg-[#2dd4bf]/10 px-3 py-1 text-xs font-semibold text-[#9ff7ea]">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Inbox first
                    </div>
                </div>
                <div className="grid gap-2 md:grid-cols-4">
                    {operatingSteps.map((step, index) => (
                        <div key={step} className="rounded-xl border border-white/[0.07] bg-black/20 p-3 text-xs leading-5 text-white/55">
                            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ff8a2a]">
                                Step {index + 1}
                            </span>
                            {step}
                        </div>
                    ))}
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

            <details className="group rounded-2xl border border-white/[0.08] bg-black/20">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-semibold text-white">
                    Show technical setup
                    <ChevronDown className="h-4 w-4 text-white/45 transition group-open:rotate-180" />
                </summary>
                <div className="border-t border-white/[0.08] p-4">
                    <p className="max-w-3xl text-xs leading-6 text-white/55">
                        The visible dashboard should stay simple. These variables are only needed to connect the inbox, Stripe,
                        and optional provider analytics. If the Supabase cost tables are missing, run
                        <code className="mx-1 rounded bg-white/10 px-1 py-0.5">db/cost_management_schema.sql</code>
                        once in Supabase.
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
