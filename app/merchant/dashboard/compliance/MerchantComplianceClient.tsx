"use client";

import { useState, useRef } from "react";
import { getComplianceHelp } from "@/lib/complianceHelpBot";
import { getStateInspectionInfo } from "@/lib/stateInspectionReports";
import ChatBot from "@/components/ChatBot";
import type { BotMessage, ComplianceContext } from "@/lib/complianceHelpBot";
import { AlertCircle, CheckCircle, Clock, ChevronDown, ExternalLink } from "lucide-react";

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
    driverStats: DriverStats;
}

export default function MerchantComplianceClient({
    restaurant,
    inspections,
    driverStats,
}: MerchantComplianceClientProps) {
    const [chatOpen, setChatOpen] = useState(false);
    const [expandedInspection, setExpandedInspection] = useState<string | null>(null);

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

    return (
        <div className="md-body min-h-screen bg-[#0a0c09]">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 md:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <a href="/merchant/dashboard" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-[#f1b243] transition hover:border-[#f1b243]/40 hover:bg-white/10">
                        ←
                    </a>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-white">
                            {restaurant.name} Compliance
                        </h1>
                        <p className="text-sm text-white/50 mt-1">
                            {restaurant.city}, {restaurant.state}
                        </p>
                    </div>
                </div>

                {/* Score Card - Mobile Optimized */}
                <div className="rounded-lg border border-white/10 bg-[#10131b] p-4 md:p-6">
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                        {/* Compliance Score */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Score</span>
                            <div className="text-2xl md:text-3xl font-black text-white">
                                {restaurant.complianceScore}
                                <span className="text-base text-white/50">/100</span>
                            </div>
                        </div>

                        {/* Health Grade */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Grade</span>
                            <div className={`rounded-lg border px-3 py-1 text-center font-black ${getGradeColor(restaurant.healthGrade)}`}>
                                {restaurant.healthGrade}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Status</span>
                            <div className={`rounded-lg border px-3 py-1 text-center text-sm font-bold ${getStatusColor(restaurant.complianceStatus)}`}>
                                {restaurant.complianceStatus}
                            </div>
                        </div>

                        {/* Last Inspection */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Last Inspect</span>
                            <div className="text-xs md:text-sm font-medium text-white/70">
                                {restaurant.lastInspectionAt
                                    ? new Date(restaurant.lastInspectionAt).toLocaleDateString()
                                    : 'No inspection'}
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-green-500 to-yellow-500"
                            style={{ width: `${restaurant.complianceScore}%` }}
                        />
                    </div>
                </div>

                {/* Driver Compliance Summary */}
                <div className="rounded-lg border border-white/10 bg-[#10131b] p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold text-white mb-4">Driver Compliance</h2>
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                        <div className="rounded-lg bg-white/5 p-3 text-center">
                            <div className="text-sm md:text-lg font-bold text-white">{driverStats.activeDrivers}</div>
                            <div className="text-[10px] md:text-xs text-white/50 mt-1">Active Drivers</div>
                        </div>
                        <div className="rounded-lg bg-white/5 p-3 text-center">
                            <div className="text-sm md:text-lg font-bold text-yellow-400">{driverStats.pendingTraining}</div>
                            <div className="text-[10px] md:text-xs text-white/50 mt-1">Pending Training</div>
                        </div>
                        <div className="rounded-lg bg-white/5 p-3 text-center">
                            <div className="text-sm md:text-lg font-bold text-red-400">{driverStats.suspended}</div>
                            <div className="text-[10px] md:text-xs text-white/50 mt-1">Suspended</div>
                        </div>
                        <div className="rounded-lg bg-white/5 p-3 text-center">
                            <div className="text-sm md:text-lg font-bold text-[#e8a230]">{driverStats.totalDrivers}</div>
                            <div className="text-[10px] md:text-xs text-white/50 mt-1">Total</div>
                        </div>
                    </div>
                </div>

                {/* Inspection History - Mobile Optimized */}
                <div className="rounded-lg border border-white/10 bg-[#10131b] p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold text-white mb-4">Inspection History</h2>
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
                                                <span className="text-xs md:text-sm font-bold text-[#e8a230]">
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
                    <div className="rounded-lg border border-white/10 bg-[#10131b] p-4 md:p-6">
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
                                    className="flex items-center gap-2 bg-[#e8a230] hover:bg-[#d99620] text-black px-3 py-2 rounded text-xs md:text-sm font-semibold transition-colors"
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
                        className="w-full rounded-lg bg-[#e8a230] hover:bg-[#d99620] text-black px-4 py-3 font-bold transition-colors text-sm md:text-base"
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
        </div>
    );
}
