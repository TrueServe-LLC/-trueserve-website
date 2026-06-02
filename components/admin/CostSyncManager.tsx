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
        tone: "teal",
        body: "Tracks Google Workspace, Supabase, Vercel, Telnyx, Zoho, and one-off invoice emails.",
    },
    {
        title: "Stripe",
        status: "Direct API",
        icon: ShieldCheck,
        tone: "orange",
        body: "Pulls hosted invoices and payment status when the Stripe secret key is present.",
    },
    {
        title: "Cost analytics",
        status: "Optional",
        icon: Clock,
        tone: "muted",
        body: "Monthly charts appear after the optional ServiceCost analytics schema is installed.",
    },
];

const operatingSteps = [
    "Send every vendor invoice to billing@trueserve.delivery.",
    "Forward old personal email receipts into that inbox once.",
    "Use direct APIs only where reliable, starting with Stripe.",
    "Review imported bills here instead of hunting vendor portals.",
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
        <section className="cost-panel">
            <div className="cost-panel-head">
                <div className="cost-title-row">
                    <span className="cost-icon cost-icon-orange">
                        <RefreshCw size={18} />
                    </span>
                    <div>
                        <h2>Billing monitor</h2>
                        <p>One billing inbox as the source of truth for Google Workspace, Supabase, Vercel, Telnyx, Zoho, and one-off bills.</p>
                    </div>
                </div>

                <div className="cost-actions">
                    <button
                        onClick={handleSync}
                        disabled={syncStatus.isLoading}
                        className="cost-btn cost-btn-primary"
                    >
                        <RefreshCw size={15} className={syncStatus.isLoading ? "cost-spin" : ""} />
                        {syncStatus.isLoading ? "Syncing" : "Sync invoices"}
                    </button>

                    <button
                        onClick={handleAnomalyCheck}
                        disabled={syncStatus.isLoading}
                        className="cost-btn cost-btn-secondary"
                    >
                        <AlertCircle size={15} />
                        Check trends
                    </button>
                </div>
            </div>

            <div className="cost-source-grid">
                {sourceCards.map((source) => {
                    const Icon = source.icon;
                    return (
                        <div key={source.title} className="cost-source-card">
                            <span className={`cost-badge cost-badge-${source.tone}`}>{source.status}</span>
                            <div className="cost-source-title">
                                <Icon size={17} />
                                {source.title}
                            </div>
                            <p>{source.body}</p>
                        </div>
                    );
                })}
            </div>

            <div className="cost-flow">
                <div className="cost-flow-head">
                    <h3>Recommended operating flow</h3>
                    <span>Inbox first</span>
                </div>
                <div className="cost-flow-grid">
                    {operatingSteps.map((step, index) => (
                        <div key={step} className="cost-flow-step">
                            <span>Step {index + 1}</span>
                            <p>{step}</p>
                        </div>
                    ))}
                </div>
            </div>

            {(syncStatus.lastSyncResult || syncStatus.anomalyCheckResult) && (
                <div className="cost-message-stack">
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

            <details className="cost-details">
                <summary>
                    Setup details and environment variables
                    <ChevronDown size={15} />
                </summary>
                <div className="cost-details-body">
                    <p>
                        Keep the admin page simple. These variables are only needed for inbox, Stripe, and optional provider analytics. If the invoice tables are missing, run{" "}
                        <code>db/admin_cost_invoice_minimal_setup.sql</code> first.
                    </p>
                    <div className="cost-env-grid">
                        {envChecklist.map((item) => (
                            <div key={item.key} className="cost-env-item">
                                <span>{item.required ? "Required" : "Optional"}</span>
                                <code>
                                    {item.key}=<em>{item.example}</em>
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
        <div className={`cost-sync-message ${success ? "success" : "error"}`}>
            {success ? <CheckCircle size={17} /> : <AlertCircle size={17} />}
            <div>
                <strong>{title}</strong>
                <p>{message}</p>
            </div>
        </div>
    );
}
