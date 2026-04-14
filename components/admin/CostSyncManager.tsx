"use client";

import React, { useState, useEffect } from "react";
import { syncAllServiceCosts, checkAndCreateAnomalies } from "@/app/admin/cost-management/actions";
import { RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface SyncStatus {
    isLoading: boolean;
    lastSyncTime?: string;
    lastSyncResult?: {
        success: boolean;
        message: string;
        synced?: number;
    };
    anomalyCheckResult?: {
        success: boolean;
        message: string;
        anomalies?: any[];
    };
}

export default function CostSyncManager() {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        isLoading: false,
        lastSyncTime: undefined,
        lastSyncResult: undefined,
    });

    // Load from localStorage on mount (client-side only)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedTime = localStorage.getItem("lastCostSyncTime");
            const savedResult = localStorage.getItem("lastCostSyncResult");

            setSyncStatus((prev) => ({
                ...prev,
                lastSyncTime: savedTime || undefined,
                lastSyncResult: savedResult ? JSON.parse(savedResult) : undefined,
            }));
        }
    }, []);

    async function handleSync() {
        setSyncStatus((prev) => ({ ...prev, isLoading: true }));

        try {
            const result = await syncAllServiceCosts();
            const timestamp = new Date().toLocaleString();

            // Store in localStorage for persistence across page reloads
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
        <div className="rounded-lg border border-white/10 bg-[#10131b] p-6">
            <div className="flex items-start justify-between gap-6 flex-wrap">
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-white mb-2">Data Synchronization</h2>
                    <p className="text-sm text-white/60">
                        Sync cost data from connected service APIs (Stripe, Google Cloud, Supabase, Mapbox, Resend, Vonage)
                    </p>

                    {syncStatus.lastSyncTime && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
                            <Clock className="h-4 w-4" />
                            Last synced: {syncStatus.lastSyncTime}
                        </div>
                    )}
                </div>

                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={handleSync}
                        disabled={syncStatus.isLoading}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#e8a230] hover:bg-[#d89020] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm font-semibold text-black transition"
                    >
                        <RefreshCw className={`h-4 w-4 ${syncStatus.isLoading ? "animate-spin" : ""}`} />
                        {syncStatus.isLoading ? "Syncing..." : "Sync Costs"}
                    </button>

                    <button
                        onClick={handleAnomalyCheck}
                        disabled={syncStatus.isLoading}
                        className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm font-semibold text-white transition"
                    >
                        <AlertCircle className="h-4 w-4" />
                        Check Anomalies
                    </button>
                </div>
            </div>

            {/* Sync Result */}
            {syncStatus.lastSyncResult && (
                <div
                    className={`mt-4 rounded-lg border ${
                        syncStatus.lastSyncResult.success
                            ? "border-green-500/30 bg-green-500/10"
                            : "border-red-500/30 bg-red-500/10"
                    } p-4`}
                >
                    <div className="flex items-start gap-3">
                        {syncStatus.lastSyncResult.success ? (
                            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                            <p
                                className={`text-sm font-medium ${
                                    syncStatus.lastSyncResult.success ? "text-green-300" : "text-red-300"
                                }`}
                            >
                                {syncStatus.lastSyncResult.success ? "Sync Successful" : "Sync Failed"}
                            </p>
                            <p
                                className={`mt-1 text-sm ${
                                    syncStatus.lastSyncResult.success
                                        ? "text-green-200/80"
                                        : "text-red-200/80"
                                }`}
                            >
                                {syncStatus.lastSyncResult.message}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Anomaly Check Result */}
            {syncStatus.anomalyCheckResult && (
                <div
                    className={`mt-3 rounded-lg border ${
                        syncStatus.anomalyCheckResult.success
                            ? "border-blue-500/30 bg-blue-500/10"
                            : "border-red-500/30 bg-red-500/10"
                    } p-4`}
                >
                    <div className="flex items-start gap-3">
                        {syncStatus.anomalyCheckResult.success ? (
                            <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                            <p
                                className={`text-sm font-medium ${
                                    syncStatus.anomalyCheckResult.success
                                        ? "text-blue-300"
                                        : "text-red-300"
                                }`}
                            >
                                {syncStatus.anomalyCheckResult.success
                                    ? "Anomaly Check Complete"
                                    : "Anomaly Check Failed"}
                            </p>
                            <p
                                className={`mt-1 text-sm ${
                                    syncStatus.anomalyCheckResult.success
                                        ? "text-blue-200/80"
                                        : "text-red-200/80"
                                }`}
                            >
                                {syncStatus.anomalyCheckResult.message}
                            </p>
                            {syncStatus.anomalyCheckResult.anomalies &&
                                syncStatus.anomalyCheckResult.anomalies.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {syncStatus.anomalyCheckResult.anomalies.map(
                                            (anomaly, idx) => (
                                                <div
                                                    key={idx}
                                                    className="rounded bg-white/5 p-2 text-xs text-white/70"
                                                >
                                                    <div className="font-semibold text-white">
                                                        {anomaly.service.toUpperCase()} -{" "}
                                                        {anomaly.month}
                                                    </div>
                                                    <div>{anomaly.description}</div>
                                                    <div>
                                                        Expected: ${anomaly.expectedCost.toFixed(2)} |
                                                        Actual: ${anomaly.actualCost.toFixed(2)} (
                                                        {anomaly.percentDeviation > 0 ? "+" : ""}
                                                        {anomaly.percentDeviation.toFixed(1)}%)
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            )}

            {/* Configuration Info */}
            <div className="mt-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                <h3 className="text-sm font-semibold text-blue-300 mb-2">📋 Setup Required</h3>
                <p className="text-xs text-blue-200/80 mb-3">
                    To enable real API integrations, add these environment variables:
                </p>
                <div className="space-y-1 font-mono text-xs text-blue-200/60 bg-black/20 p-3 rounded">
                    <div>STRIPE_SECRET_KEY=sk_...</div>
                    <div>GCP_PROJECT_ID=your-project-id</div>
                    <div>GCP_BILLING_ACCOUNT_ID=000000-000000-000000</div>
                    <div>SUPABASE_PROJECT_ID=your-project-id</div>
                    <div>SUPABASE_ACCESS_TOKEN=sbpa_...</div>
                    <div>MAPBOX_ACCESS_TOKEN=pk_...</div>
                    <div>MAPBOX_USERNAME=your-username</div>
                    <div>RESEND_API_KEY=re_...</div>
                    <div>VONAGE_API_KEY=your-api-key</div>
                    <div>VONAGE_API_SECRET=your-api-secret</div>
                </div>
                <p className="mt-3 text-xs text-blue-200/60">
                    Currently configured: Stripe only. Others will be skipped until credentials are added.
                </p>
            </div>
        </div>
    );
}
