"use client";

import { useState, useRef } from "react";
import { getComplianceHelp } from "@/lib/complianceHelpBot";
import { getStateInspectionInfo } from "@/lib/stateInspectionReports";
import { refreshStateInspectionsAction } from "./actions";
import ChatBot from "@/components/ChatBot";
import type { BotMessage, ComplianceContext } from "@/lib/complianceHelpBot";
import type { InspectionDataWithMetadata, InspectionMetadata } from "@/lib/stateInspectionQueries";
import { AlertCircle, CheckCircle, Clock, ChevronDown, ExternalLink, RefreshCw, Calendar, AlertTriangle, TrendingDown, TrendingUp, Award } from "lucide-react";
import type { ViolationAggregate } from "@/lib/violationAnalytics";
import type { BenchmarkComparison } from "@/lib/restaurantBenchmarking";

type InspectionAlertMetadata = {
  nextInspectionDueDate: string | null;
  daysUntilDue: number | null;
  alertStatus: string | null;
  isOverdue: boolean;
  requiresAttention: boolean;
};

type RestaurantInfo = {
    id: string;
    name: string;
    complianceScore: number;
    complianceStatus: string;
    healthGrade: string;
    lastInspectionAt?: string;
    city: string;
    state: string;
};

type Inspection = {
    id: string;
    inspectionDate: string;
    violations: string[];
    followUpRequired: boolean;
    score: number;
};

type DriverStats = {
    totalDrivers: number;
    activeDrivers: number;
    pendingTraining: number;
    suspended: number;
};

interface MerchantComplianceClientProps {
    restaurant: RestaurantInfo;
    inspections: Inspection[];
    liveInspections: InspectionDataWithMetadata[];
    inspectionMetadata: InspectionMetadata;
    inspectionAlertMetadata?: InspectionAlertMetadata | null;
    driverStats: DriverStats;
    violationAggregate?: ViolationAggregate | null;
    benchmarkComparison?: BenchmarkComparison | null;
}

export default function MerchantComplianceClient({
    restaurant,
    inspections,
    liveInspections,
    inspectionMetadata,
    inspectionAlertMetadata,
    driverStats,
    violationAggregate,
    benchmarkComparison,
}: MerchantComplianceClientProps) {
    const [chatOpen, setChatOpen] = useState(false);
    const [expandedInspection, setExpandedInspection] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

    // Get state-specific inspection info
    const stateInspectionInfo = getStateInspectionInfo(restaurant.state);

    const getStatusColor = (status: string) => {
        if (status === 'PASS') return 'bg-green-500/20 text-green-300 border-green-500/30';
        if (status === 'WARNING') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        if (status === 'FLAGGED') return 'bg-red-500/20 text-red-300 border-red-500/30';
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    };

    const getGradeColor = (grade: string) => {
        if (grade === 'A') return 'bg-green-500/30 text-green-300 border-green-500/40';
        if (grade === 'B') return 'bg-blue-500/30 text-blue-300 border-blue-500/40';
        if (grade === 'C') return 'bg-yellow-500/30 text-yellow-300 border-yellow-500/40';
        return 'bg-red-500/30 text-red-300 border-red-500/40';
    };

    const handleBotMessage = async (userMessage: string): Promise<BotMessage> => {
        return getComplianceHelp(userMessage, {
            userType: 'MERCHANT',
            complianceScore: restaurant.complianceScore,
            complianceStatus: restaurant.complianceStatus,
            incompleteItems: [],
            recentViolations: inspections[0]?.violations || [],
            lastInspectionDate: restaurant.lastInspectionAt,
        } as ComplianceContext);
    };

    const handleRefreshInspections = async () => {
        setRefreshing(true);
        setRefreshMessage(null);
        try {
            const result = await refreshStateInspectionsAction(restaurant.state, restaurant.id);
            setRefreshMessage(result.message);
            if (result.status === 'success') {
                // Refresh the page after a short delay
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error: any) {
            setRefreshMessage(`Error: ${error?.message || 'Failed to refresh'}`);
        } finally {
            setRefreshing(false);
        }
    };

    const getStateHealthDeptUrl = (state: string): string => {
        const urls: Record<string, string> = {
            'NC': 'https://www.dhhs.nc.gov/about/divisions/public-health/food-protection',
            'NY': 'https://www.health.ny.gov/environmental/food/',
            'FL': 'https://www.myfloridaeh.com/environmental-health/food-safety/',
            'PA': 'https://www.dep.pa.gov/Business/Air/Pages/default.aspx',
        };
        return urls[state] || '#';
    };

    return (
        <>
            <style>{`
                .mc-panel {
                    background: #141a18;
                    border: 1px solid #1e2420;
                    border-radius: 8px;
                    padding: 14px;
                    margin-bottom: 14px;
                }
                .mc-section-hd {
                    font-size: 10px;
                    font-weight: 800;
                    color: #555;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    margin-bottom: 10px;
                }
                .mc-score-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                }
                .mc-score-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .mc-score-label {
                    font-size: 10px;
                    font-weight: 800;
                    color: #555;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                }
                .mc-driver-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                }
                .mc-driver-card {
                    background: #0f1210;
                    border: 1px solid #1e2420;
                    border-radius: 6px;
                    padding: 12px;
                    text-align: center;
                }
                @media (max-width: 768px) {
                    .mc-score-grid, .mc-driver-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 480px) {
                    .mc-score-grid, .mc-driver-grid { grid-template-columns: 1fr 1fr; }
                }
            `}</style>
        <div>
                {/* Sub-description */}
                <p style={{ fontSize: 11, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20, marginTop: -4 }}>
                    {restaurant.name} · {restaurant.city}, {restaurant.state}
                </p>

                {/* Score Card */}
                <div className="mc-panel">
                    <div className="mc-section-hd">Compliance Overview</div>
                    <div className="mc-score-grid" style={{ marginBottom: 14 }}>
                        {/* Score */}
                        <div className="mc-score-cell">
                            <span className="mc-score-label">Score</span>
                            <div style={{ fontSize: 27, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>
                                {restaurant.complianceScore}
                                <span style={{ fontSize: 14, color: '#555', fontWeight: 400 }}>/100</span>
                            </div>
                        </div>
                        {/* Grade */}
                        <div className="mc-score-cell">
                            <span className="mc-score-label">Grade</span>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 6, fontSize: 20, fontWeight: 900, background: restaurant.healthGrade === 'A' ? 'rgba(61,214,140,0.1)' : restaurant.healthGrade === 'B' ? 'rgba(249,115,22,0.1)' : 'rgba(226,75,74,0.1)', border: restaurant.healthGrade === 'A' ? '1px solid rgba(61,214,140,0.25)' : restaurant.healthGrade === 'B' ? '1px solid rgba(249,115,22,0.25)' : '1px solid rgba(226,75,74,0.25)', color: restaurant.healthGrade === 'A' ? '#3dd68c' : restaurant.healthGrade === 'B' ? '#f97316' : '#e24b4a' }}>
                                {restaurant.healthGrade}
                            </div>
                        </div>
                        {/* Status */}
                        <div className="mc-score-cell">
                            <span className="mc-score-label">Status</span>
                            <div style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 10px', borderRadius: 5, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', background: restaurant.complianceStatus === 'PASS' ? 'rgba(61,214,140,0.1)' : 'rgba(226,75,74,0.1)', border: restaurant.complianceStatus === 'PASS' ? '1px solid rgba(61,214,140,0.25)' : '1px solid rgba(226,75,74,0.25)', color: restaurant.complianceStatus === 'PASS' ? '#3dd68c' : '#e24b4a' }}>
                                {restaurant.complianceStatus}
                            </div>
                        </div>
                        {/* Last Inspection */}
                        <div className="mc-score-cell">
                            <span className="mc-score-label">Last Inspect</span>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#888', marginTop: 2 }}>
                                {restaurant.lastInspectionAt
                                    ? new Date(restaurant.lastInspectionAt).toLocaleDateString()
                                    : 'None on record'}
                            </div>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div style={{ height: 5, background: '#1c1f28', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${restaurant.complianceScore}%`, background: restaurant.complianceScore >= 80 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#f97316,#fb923c)', borderRadius: 3, transition: 'width 0.8s ease', boxShadow: restaurant.complianceScore >= 80 ? '0 0 8px rgba(16,185,129,0.4)' : '0 0 8px rgba(249,115,22,0.4)' }} />
                    </div>
                </div>

                {/* Driver Compliance */}
                <div className="mc-panel">
                    <div className="mc-section-hd">Driver Compliance</div>
                    <div className="mc-driver-grid">
                        {[
                            { label: 'Active',          value: driverStats.activeDrivers,  color: '#3dd68c' },
                            { label: 'Pending Training', value: driverStats.pendingTraining, color: '#f97316' },
                            { label: 'Suspended',        value: driverStats.suspended,       color: '#e24b4a' },
                            { label: 'Total',            value: driverStats.totalDrivers,    color: '#fff'    },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="mc-driver-card">
                                <div style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 5 }}>{value}</div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live State Inspection Data */}
                {liveInspections.length > 0 && (
                    <div className="mc-panel">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                                    <span>🔄 Live State Inspection Data</span>
                                    {!inspectionMetadata.isStale && (
                                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded border border-green-500/30">
                                            Live
                                        </span>
                                    )}
                                </h2>
                                {inspectionMetadata.lastSyncedAt && (
                                    <p className="text-xs text-white/50 mt-1">
                                        Last synced: {new Date(inspectionMetadata.lastSyncedAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={handleRefreshInspections}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-3 py-2 rounded text-xs md:text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white/10 hover:bg-white/20 text-white"
                            >
                                <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${refreshing ? 'animate-spin' : ''}`} />
                                {refreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>

                        {refreshMessage && (
                            <div className={`mb-4 p-3 rounded text-xs md:text-sm border ${
                                refreshMessage.startsWith('✓') || refreshMessage.startsWith('Error')
                                    ? 'bg-red-500/10 border-red-500/30 text-red-300'
                                    : 'bg-green-500/10 border-green-500/30 text-green-300'
                            }`}>
                                {refreshMessage}
                            </div>
                        )}

                        <div className="space-y-3">
                            {liveInspections.map((inspection, idx) => (
                                <div
                                    key={`live-${idx}`}
                                    className="border border-white/10 rounded-lg bg-white/5 p-3 md:p-4"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="text-xs md:text-sm font-bold text-white/70">
                                                    {new Date(inspection.inspectionDate).toLocaleDateString()}
                                                </span>
                                                {inspection.grade && (
                                                    <span className={`text-xs md:text-sm font-bold px-2 py-0.5 rounded ${getGradeColor(inspection.grade)}`}>
                                                        Grade: {inspection.grade}
                                                    </span>
                                                )}
                                                {inspection.score !== null && (
                                                    <span className="text-xs md:text-sm font-bold text-[#f97316]">
                                                        Score: {inspection.score}/100
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-white/50">
                                                Source: {inspection.sourceAPI} ({inspection.status})
                                            </div>
                                        </div>
                                        {inspection.externalURL && (
                                            <a
                                                href={inspection.externalURL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-xs md:text-sm text-[#f97316] hover:text-[#d99620] transition-colors flex-shrink-0"
                                            >
                                                View Report
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                    {inspection.violations && inspection.violations.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-white/10">
                                            <p className="text-xs md:text-sm text-white/70 font-bold mb-1">Violations:</p>
                                            <ul className="space-y-0.5 text-white/60 text-xs">
                                                {inspection.violations.map((violation: any, vidx: number) => (
                                                    <li key={vidx} className="flex gap-2">
                                                        <span>•</span>
                                                        <span>{typeof violation === 'string' ? violation : violation.description || JSON.stringify(violation)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {(!inspection.violations || inspection.violations.length === 0) && (
                                        <div className="mt-2 pt-2 border-t border-white/10 text-xs md:text-sm text-green-400 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                                            No violations found
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Violation Severity Breakdown */}
                {violationAggregate && violationAggregate.totalViolations > 0 && (
                    <div className="mc-panel">
                        <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
                            {violationAggregate.criticalCount > 0 ? '⚠️' : '📊'} Violation Severity Breakdown
                        </h2>

                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-6">
                            {/* Critical Violations */}
                            <div className={`rounded-lg border p-4 ${
                                violationAggregate.criticalCount > 0
                                    ? 'bg-red-500/20 border-red-500/40'
                                    : 'bg-white/5 border-white/10'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className={`h-5 w-5 ${
                                        violationAggregate.criticalCount > 0 ? 'text-red-400' : 'text-white/50'
                                    }`} />
                                    <span className="text-xs md:text-sm font-bold uppercase text-white/70">Critical</span>
                                </div>
                                <div className={`text-2xl md:text-3xl font-black ${
                                    violationAggregate.criticalCount > 0 ? 'text-red-300' : 'text-green-300'
                                }`}>
                                    {violationAggregate.criticalCount}
                                </div>
                                <p className="text-xs text-white/50 mt-1">Food safety hazards</p>
                            </div>

                            {/* Major Violations */}
                            <div className={`rounded-lg border p-4 ${
                                violationAggregate.majorCount > 0
                                    ? 'bg-yellow-500/20 border-yellow-500/40'
                                    : 'bg-white/5 border-white/10'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className={`h-5 w-5 ${
                                        violationAggregate.majorCount > 0 ? 'text-yellow-400' : 'text-white/50'
                                    }`} />
                                    <span className="text-xs md:text-sm font-bold uppercase text-white/70">Major</span>
                                </div>
                                <div className={`text-2xl md:text-3xl font-black ${
                                    violationAggregate.majorCount > 0 ? 'text-yellow-300' : 'text-gray-400'
                                }`}>
                                    {violationAggregate.majorCount}
                                </div>
                                <p className="text-xs text-white/50 mt-1">Significant non-compliance</p>
                            </div>

                            {/* Minor Violations */}
                            <div className={`rounded-lg border p-4 ${
                                violationAggregate.minorCount > 0
                                    ? 'bg-blue-500/20 border-blue-500/40'
                                    : 'bg-white/5 border-white/10'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className={`h-5 w-5 ${
                                        violationAggregate.minorCount > 0 ? 'text-blue-400' : 'text-white/50'
                                    }`} />
                                    <span className="text-xs md:text-sm font-bold uppercase text-white/70">Minor</span>
                                </div>
                                <div className={`text-2xl md:text-3xl font-black ${
                                    violationAggregate.minorCount > 0 ? 'text-blue-300' : 'text-gray-400'
                                }`}>
                                    {violationAggregate.minorCount}
                                </div>
                                <p className="text-xs text-white/50 mt-1">Low impact issues</p>
                            </div>
                        </div>

                        {/* Violation Percentage */}
                        <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-white">Critical Violations Percentage</span>
                                <span className={`text-sm font-bold ${
                                    violationAggregate.criticalPercentage > 25
                                        ? 'text-red-400'
                                        : violationAggregate.criticalPercentage > 10
                                        ? 'text-yellow-400'
                                        : 'text-green-400'
                                }`}>
                                    {violationAggregate.criticalPercentage.toFixed(1)}%
                                </span>
                            </div>
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${
                                        violationAggregate.criticalPercentage > 25
                                            ? 'bg-red-500'
                                            : violationAggregate.criticalPercentage > 10
                                            ? 'bg-yellow-500'
                                            : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(violationAggregate.criticalPercentage, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Remediation Guidance */}
                        {violationAggregate.criticalCount > 0 && (
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-red-300 mb-1">Immediate Action Required</p>
                                        <p className="text-xs text-red-200">Critical violations must be corrected immediately. Develop an action plan, assign responsibility, and set deadlines for each violation.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Benchmarking Card */}
                {benchmarkComparison && (
                    <div className="mc-panel">
                        <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            📊 Network Benchmarking
                        </h2>

                        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
                            {/* Percentile Rank */}
                            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="h-4 w-4 text-[#f97316]" />
                                    <span className="text-xs font-bold uppercase text-white/70">Percentile Rank</span>
                                </div>
                                <div className="text-2xl md:text-3xl font-black text-white">
                                    {benchmarkComparison.percentileRank}%
                                </div>
                                <p className="text-xs text-white/50 mt-1">{benchmarkComparison.percentileLabel}</p>
                            </div>

                            {/* Network Average */}
                            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="h-4 w-4 text-blue-400" />
                                    <span className="text-xs font-bold uppercase text-white/70">Network Avg</span>
                                </div>
                                <div className="text-2xl md:text-3xl font-black text-blue-300">
                                    {benchmarkComparison.networkAverage}
                                </div>
                                <p className="text-xs text-white/50 mt-1">
                                    {benchmarkComparison.complianceScore > benchmarkComparison.networkAverage
                                        ? `+${benchmarkComparison.complianceScore - benchmarkComparison.networkAverage} above`
                                        : `${benchmarkComparison.complianceScore - benchmarkComparison.networkAverage} below`}
                                </p>
                            </div>

                            {/* Peer Comparison */}
                            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-4 w-4 text-green-400" />
                                    <span className="text-xs font-bold uppercase text-white/70">Peer Avg</span>
                                </div>
                                <div className="text-2xl md:text-3xl font-black text-green-300">
                                    {benchmarkComparison.similarRestaurantAverage}
                                </div>
                                <p className="text-xs text-white/50 mt-1">
                                    {benchmarkComparison.peerCount} similar restaurants
                                </p>
                            </div>
                        </div>

                        {/* Performance Gap */}
                        {benchmarkComparison.performanceGap !== 0 && (
                            <div className={`mb-4 p-4 rounded-lg border-l-4 ${
                                benchmarkComparison.performanceGap > 0
                                    ? 'bg-green-500/10 border-green-500'
                                    : 'bg-yellow-500/10 border-yellow-500'
                            }`}>
                                <div className="flex items-start gap-3">
                                    {benchmarkComparison.performanceGap > 0 ? (
                                        <TrendingUp className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <TrendingDown className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <p className={`text-sm font-bold ${
                                            benchmarkComparison.performanceGap > 0
                                                ? 'text-green-300'
                                                : 'text-yellow-300'
                                        }`}>
                                            {benchmarkComparison.performanceGap > 0
                                                ? `✓ Above Peer Average by ${benchmarkComparison.performanceGap} points`
                                                : `⚠️ Below Peer Average by ${Math.abs(benchmarkComparison.performanceGap)} points`}
                                        </p>
                                        <p className="text-xs text-white/60 mt-1">
                                            {benchmarkComparison.performanceGap > 0
                                                ? `You're performing better than ${benchmarkComparison.peerCount} similar restaurants in ${restaurant.state}.`
                                                : `There's room for improvement. Focus on what similar restaurants are doing well.`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top Performers to Learn From */}
                        {benchmarkComparison.topPerformers.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-sm font-bold text-white mb-3">🏆 Learn from Top Performers</h3>
                                <div className="space-y-2">
                                    {benchmarkComparison.topPerformers.map((performer, idx) => (
                                        <div key={performer.id} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/10">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs md:text-sm font-bold text-[#f97316]">#{idx + 1}</span>
                                                <div>
                                                    <p className="text-xs md:text-sm font-bold text-white">{performer.name}</p>
                                                    <p className="text-xs text-white/50">{performer.state}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-black text-green-300">{performer.score}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="p-3 rounded bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200">
                            💡 <strong>Tip:</strong> Focus on matching or exceeding your peer group's average score. Review the top performers' practices to identify improvement opportunities.
                        </div>
                    </div>
                )}

                {/* Inspection Due Alert - Predictive Alerts */}
                {inspectionAlertMetadata?.nextInspectionDueDate && (
                    <div className="mc-panel">
                        <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            📅 Next Scheduled Inspection
                        </h2>

                        <div className={`rounded-lg p-4 border-l-4 ${
                            inspectionAlertMetadata.isOverdue
                                ? 'bg-red-500/10 border-red-500'
                                : inspectionAlertMetadata.daysUntilDue && inspectionAlertMetadata.daysUntilDue <= 7
                                ? 'bg-yellow-500/10 border-yellow-500'
                                : inspectionAlertMetadata.daysUntilDue && inspectionAlertMetadata.daysUntilDue <= 30
                                ? 'bg-blue-500/10 border-blue-500'
                                : 'bg-green-500/10 border-green-500'
                        }`}>
                            <div className="space-y-3">
                                <div>
                                    <p className={`text-base md:text-lg font-bold ${
                                        inspectionAlertMetadata.isOverdue
                                            ? 'text-red-300'
                                            : inspectionAlertMetadata.daysUntilDue && inspectionAlertMetadata.daysUntilDue <= 7
                                            ? 'text-yellow-300'
                                            : inspectionAlertMetadata.daysUntilDue && inspectionAlertMetadata.daysUntilDue <= 30
                                            ? 'text-blue-300'
                                            : 'text-green-300'
                                    }`}>
                                        Due: {new Date(inspectionAlertMetadata.nextInspectionDueDate).toLocaleDateString()}
                                    </p>
                                    {inspectionAlertMetadata.daysUntilDue !== null && (
                                        <p className={`text-sm md:text-base font-semibold mt-1 ${
                                            inspectionAlertMetadata.isOverdue
                                                ? 'text-red-200'
                                                : inspectionAlertMetadata.daysUntilDue <= 7
                                                ? 'text-yellow-200'
                                                : inspectionAlertMetadata.daysUntilDue <= 30
                                                ? 'text-blue-200'
                                                : 'text-green-200'
                                        }`}>
                                            {inspectionAlertMetadata.isOverdue
                                                ? `🚨 OVERDUE by ${Math.abs(inspectionAlertMetadata.daysUntilDue)} ${
                                                    Math.abs(inspectionAlertMetadata.daysUntilDue) === 1 ? 'day' : 'days'
                                                }`
                                                : inspectionAlertMetadata.daysUntilDue === 0
                                                ? '⚠️ DUE TODAY'
                                                : `⏱️ In ${inspectionAlertMetadata.daysUntilDue} ${
                                                    inspectionAlertMetadata.daysUntilDue === 1 ? 'day' : 'days'
                                                }`}
                                        </p>
                                    )}
                                </div>

                                {inspectionAlertMetadata.isOverdue && (
                                    <div className="flex items-start gap-2 p-3 rounded bg-red-500/20 border border-red-500/40">
                                        <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs md:text-sm text-red-300">
                                            Your inspection is overdue. Contact your local health department immediately to schedule.
                                        </p>
                                    </div>
                                )}

                                {!inspectionAlertMetadata.isOverdue && inspectionAlertMetadata.requiresAttention && (
                                    <div className="flex items-start gap-2 p-3 rounded bg-yellow-500/20 border border-yellow-500/40">
                                        <AlertCircle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs md:text-sm text-yellow-300">
                                            Ensure all documentation and facilities are ready for inspection. Schedule with your health department if not yet arranged.
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-2 flex-wrap">
                                    <a
                                        href={getStateHealthDeptUrl(restaurant.state)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#d99620] text-black rounded text-xs md:text-sm font-semibold transition-colors"
                                    >
                                        Schedule Now
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Inspection History - Mobile Optimized */}
                <div className="mc-panel">
                    <h2 className="text-lg md:text-xl font-bold text-white mb-4">
                        {liveInspections.length > 0 ? 'Additional' : ''} Inspection History
                    </h2>
                    <div className="space-y-3">
                        {inspections.length === 0 ? (
                            <p className="text-sm text-white/50">No inspections recorded yet.</p>
                        ) : (
                            inspections.map((inspection) => (
                                <div
                                    key={inspection.id}
                                    className="border border-white/10 rounded-lg bg-white/5 p-3 md:p-4"
                                >
                                    <button
                                        onClick={() => setExpandedInspection(
                                            expandedInspection === inspection.id ? null : inspection.id
                                        )}
                                        className="w-full flex items-center justify-between gap-2 text-left"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs md:text-sm font-bold text-white/70">
                                                    {new Date(inspection.inspectionDate).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs md:text-sm font-bold text-[#f97316]">
                                                    Score: {inspection.score}/100
                                                </span>
                                            </div>
                                            {inspection.followUpRequired && (
                                                <div className="flex items-center gap-1 text-xs text-red-400">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Follow-up required
                                                </div>
                                            )}
                                        </div>
                                        <ChevronDown
                                            className={`h-4 w-4 text-white/50 flex-shrink-0 transition-transform ${
                                                expandedInspection === inspection.id ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>

                                    {/* Expanded Content */}
                                    {expandedInspection === inspection.id && (
                                        <div className="mt-3 border-t border-white/10 pt-3 text-sm">
                                            {inspection.violations.length > 0 ? (
                                                <div className="space-y-2">
                                                    <p className="text-white/70 font-bold">Violations:</p>
                                                    <ul className="space-y-1 text-white/60">
                                                        {inspection.violations.map((violation, idx) => (
                                                            <li key={idx} className="flex gap-2">
                                                                <span>•</span>
                                                                <span>{violation}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : (
                                                <p className="text-green-400 flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4" />
                                                    No violations found
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* State Inspection Requirements */}
                {stateInspectionInfo && (
                    <div className="mc-panel">
                        <h2 className="text-lg md:text-xl font-bold text-white mb-4">
                            {stateInspectionInfo.state} Inspection Requirements
                        </h2>

                        {/* Health Department Info */}
                        <div className="mb-6 rounded-lg bg-white/5 p-4 border border-white/10">
                            <h3 className="font-bold text-white mb-3">Health Department Contact</h3>
                            <p className="text-sm text-gray-300 mb-2"><strong>{stateInspectionInfo.healthDept}</strong></p>
                            <p className="text-sm text-gray-300 mb-4">📞 {stateInspectionInfo.phoneNumber}</p>

                            {/* Quick Links */}
                            <div className="flex flex-col sm:flex-row gap-2">
                                <a
                                    href={stateInspectionInfo.inspectionURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-[#f97316] hover:bg-[#d99620] text-black px-3 py-2 rounded text-xs md:text-sm font-semibold transition-colors"
                                >
                                    📋 View Inspection Reports
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                                <a
                                    href={stateInspectionInfo.requirementsURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded text-xs md:text-sm font-semibold transition-colors"
                                >
                                    📖 View Requirements
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </div>

                        {/* Requirements List */}
                        <h3 className="font-bold text-white mb-3">Key Requirements</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {stateInspectionInfo.requirements.map((req, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>{req}</span>
                                </div>
                            ))}
                        </div>

                        {/* Info Box */}
                        <div className="mt-4 p-3 rounded bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200">
                            💡 <strong>Tip:</strong> Visit your state's health department website to review the latest inspection standards, complete any required training, and submit documentation.
                        </div>
                    </div>
                )}

                {/* Help Bot Section */}
                <div className="mt-4">
                    <button
                        onClick={() => setChatOpen(!chatOpen)}
                        className="w-full rounded-lg bg-[#f97316] hover:bg-[#d99620] text-black px-4 py-3 font-bold transition-colors text-sm md:text-base"
                    >
                        {chatOpen ? '✕ Close Help Bot' : '💬 Ask Compliance Help'}
                    </button>
                </div>

                {chatOpen && (
                    <div className="rounded-lg border border-white/10 overflow-hidden h-96 md:h-[500px]">
                        <ChatBot
                            title="Compliance Help"
                            placeholder="Ask about violations, improvements, inspections..."
                            onSendMessage={handleBotMessage}
                            initialMessage="Hi! I'm your compliance assistant. Ask me about health inspections, violations, compliance requirements, or ways to improve your score."
                        />
                    </div>
                )}
        </div>
        </>
    );
}
