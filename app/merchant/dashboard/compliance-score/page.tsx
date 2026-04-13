import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calculateNetworkMetrics, generateInsights, type RestaurantComplianceMetrics } from "@/lib/complianceAnalytics";

export const dynamic = "force-dynamic";

function gradeToColor(grade: string): { bg: string; text: string; border: string } {
    switch (grade?.toUpperCase()) {
        case "A":
            return { bg: "#0d1a10", border: "#1a4a2a", text: "#2ee5a0" };
        case "B":
            return { bg: "#1c1508", border: "#57400f", text: "#f1b243" };
        case "C":
            return { bg: "#1a1208", border: "#5c3a0f", text: "#fb923c" };
        default:
            return { bg: "#1a0d10", border: "#4a1a1a", text: "#f87171" };
    }
}

function statusIcon(status: string): string {
    switch (status) {
        case "PASS":
            return "✅";
        case "IN_REVIEW":
            return "⚠️";
        case "FLAGGED":
            return "🚨";
        default:
            return "—";
    }
}

export default async function ComplianceScorePage() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;
    const { userId } = await getAuthSession();
    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect("/login?role=merchant&next=/merchant/dashboard/compliance-score");
    }

    // Fetch all restaurants with compliance data
    let restaurants: RestaurantComplianceMetrics[] = [];

    if (isPreview) {
        // Mock data for preview
        restaurants = [
            {
                restaurantId: "1",
                name: "Dhan's Kitchen",
                city: "Fayetteville",
                state: "NC",
                complianceScore: 94,
                healthGrade: "A",
                complianceStatus: "PASS",
                lastInspectionAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                trend: "improving",
                violationCount: 0,
                criticalViolations: 0,
            },
            {
                restaurantId: "2",
                name: "Krave 489",
                city: "Rock Hill",
                state: "SC",
                complianceScore: 88,
                healthGrade: "B",
                complianceStatus: "PASS",
                lastInspectionAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                trend: "stable",
                violationCount: 2,
                criticalViolations: 0,
            },
            {
                restaurantId: "3",
                name: "Snappy Lunch",
                city: "Mount Airy",
                state: "NC",
                complianceScore: 85,
                healthGrade: "B",
                complianceStatus: "IN_REVIEW",
                lastInspectionAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                trend: "stable",
                violationCount: 1,
                criticalViolations: 0,
            },
            {
                restaurantId: "4",
                name: "13 Bones",
                city: "Mount Airy",
                state: "NC",
                complianceScore: 92,
                healthGrade: "A",
                complianceStatus: "PASS",
                lastInspectionAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                trend: "improving",
                violationCount: 1,
                criticalViolations: 0,
            },
            {
                restaurantId: "5",
                name: "Pimento Bay Kitchen",
                city: "Monroe",
                state: "NC",
                complianceScore: 78,
                healthGrade: "C",
                complianceStatus: "IN_REVIEW",
                lastInspectionAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                trend: "declining",
                violationCount: 4,
                criticalViolations: 1,
            },
        ];
    } else {
        const { data } = await supabaseAdmin
            .from("Restaurant")
            .select("id, name, city, state, complianceScore, healthGrade, complianceStatus, lastInspectionAt")
            .not("complianceScore", "is", null)
            .order("complianceScore", { ascending: false });

        if (data) {
            restaurants = data.map((r: any) => ({
                restaurantId: r.id,
                name: r.name,
                city: r.city,
                state: r.state,
                complianceScore: r.complianceScore || 0,
                healthGrade: r.healthGrade || "—",
                complianceStatus: r.complianceStatus || "—",
                lastInspectionAt: r.lastInspectionAt || "",
                trend: "stable" as const,
                violationCount: 0,
                criticalViolations: 0,
            }));
        }
    }

    const metrics = calculateNetworkMetrics(restaurants);
    const insights = generateInsights(metrics);

    return (
        <div className="md-body min-h-screen animate-fade-in-up">
            <div className="md-page-hd">
                <div>
                    <div className="md-page-title">Compliance Score</div>
                    <div className="md-page-sub">Network-wide health inspection metrics and analytics</div>
                </div>
                <div className="grid gap-2 sm:grid-cols-1">
                    <Link href="/merchant/dashboard/compliance" className="btn btn-ghost justify-center">
                        Individual Compliance
                    </Link>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="md-stat-grid">
                <div className="md-stat-block">
                    <div className="md-stat-name">Network Average</div>
                    <div className="md-stat-value">{metrics.averageScore}/100</div>
                    <div style={{ color: "var(--t2)", fontSize: "12px", marginTop: "8px" }}>
                        Median: {metrics.medianScore}/100
                    </div>
                </div>
                <div className="md-stat-block">
                    <div className="md-stat-name">Pass Rate</div>
                    <div className="md-stat-value">{metrics.passRate}%</div>
                    <div style={{ color: "var(--t2)", fontSize: "12px", marginTop: "8px" }}>
                        {metrics.totalRestaurants - metrics.flaggedCount} of {metrics.totalRestaurants} passing
                    </div>
                </div>
                <div className="md-stat-block">
                    <div className="md-stat-name">Flagged</div>
                    <div className="md-stat-value" style={{ color: "#f87171" }}>
                        {metrics.flaggedCount}
                    </div>
                    <div style={{ color: "var(--t2)", fontSize: "12px", marginTop: "8px" }}>
                        Need immediate attention
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className="md-stat-block" style={{ borderColor: "#2a3140", background: "linear-gradient(180deg, #121826 0%, #0d1320 100%)" }}>
                <div className="md-stat-name mb-4">Network Insights</div>
                <div className="grid gap-3">
                    {insights.map((insight, idx) => (
                        <div
                            key={idx}
                            style={{
                                padding: "12px",
                                borderRadius: "8px",
                                background: "rgba(255,255,255,0.02)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                fontSize: "13px",
                                color: "var(--t1)",
                                lineHeight: "1.5",
                            }}
                        >
                            {insight}
                        </div>
                    ))}
                </div>
            </div>

            {/* Score Distribution */}
            <div className="md-two-col">
                <div className="md-stat-block">
                    <div className="md-stat-name mb-4">Score Distribution</div>
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div
                                    style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "6px",
                                        background: "#2ee5a0",
                                    }}
                                />
                                <span>A (90-100)</span>
                            </div>
                            <span style={{ color: "var(--gold)", fontWeight: "bold" }}>{metrics.scoreDistribution.a}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div
                                    style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "6px",
                                        background: "#f1b243",
                                    }}
                                />
                                <span>B (80-89)</span>
                            </div>
                            <span style={{ color: "var(--gold)", fontWeight: "bold" }}>{metrics.scoreDistribution.b}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div
                                    style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "6px",
                                        background: "#fb923c",
                                    }}
                                />
                                <span>C (70-79)</span>
                            </div>
                            <span style={{ color: "var(--gold)", fontWeight: "bold" }}>{metrics.scoreDistribution.c}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div
                                    style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "6px",
                                        background: "#f87171",
                                    }}
                                />
                                <span>D (&lt;70)</span>
                            </div>
                            <span style={{ color: "var(--gold)", fontWeight: "bold" }}>{metrics.scoreDistribution.d}</span>
                        </div>
                    </div>
                </div>

                <div className="md-stat-block">
                    <div className="md-stat-name mb-4">Common Violations</div>
                    <div className="grid gap-2">
                        {metrics.mostCommonViolations.slice(0, 4).map((violation, idx) => (
                            <div
                                key={idx}
                                className="btn btn-ghost justify-between"
                                style={{ cursor: "default", fontSize: "12px" }}
                            >
                                <span style={{ flex: 1, textAlign: "left" }}>{violation.violation}</span>
                                <span style={{ color: "var(--gold)", fontWeight: "bold", minWidth: "24px", textAlign: "right" }}>
                                    {violation.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Performers */}
            <div className="md-stat-block">
                <div className="md-stat-name mb-4">🏆 Top Performers</div>
                <div className="grid gap-2">
                    {metrics.topPerformers.slice(0, 3).map((restaurant) => {
                        const colors = gradeToColor(restaurant.healthGrade);
                        return (
                            <div
                                key={restaurant.restaurantId}
                                className="btn btn-ghost justify-between"
                                style={{ cursor: "default" }}
                            >
                                <div>
                                    <div style={{ fontWeight: "bold" }}>{restaurant.name}</div>
                                    <div style={{ fontSize: "11px", color: "var(--t2)" }}>
                                        {restaurant.city}, {restaurant.state}
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div
                                        style={{
                                            display: "inline-block",
                                            padding: "4px 12px",
                                            borderRadius: "6px",
                                            background: colors.bg,
                                            border: `1px solid ${colors.border}`,
                                            color: colors.text,
                                            fontWeight: "bold",
                                            fontSize: "12px",
                                        }}
                                    >
                                        {restaurant.healthGrade}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "var(--gold)", fontWeight: "bold", marginTop: "4px" }}>
                                        {restaurant.complianceScore}/100
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Needs Attention */}
            {metrics.needsAttention.length > 0 && (
                <div className="md-stat-block" style={{ borderColor: "#4a1a1a", background: "rgba(248, 113, 113, 0.08)" }}>
                    <div className="md-stat-name mb-4">⚠️ Needs Attention</div>
                    <div className="grid gap-2">
                        {metrics.needsAttention.slice(0, 3).map((restaurant) => {
                            const colors = gradeToColor(restaurant.healthGrade);
                            return (
                                <div
                                    key={restaurant.restaurantId}
                                    className="btn btn-ghost justify-between"
                                    style={{ cursor: "default" }}
                                >
                                    <div>
                                        <div style={{ fontWeight: "bold" }}>
                                            {statusIcon(restaurant.complianceStatus)} {restaurant.name}
                                        </div>
                                        <div style={{ fontSize: "11px", color: "var(--t2)" }}>
                                            {restaurant.city}, {restaurant.state}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div
                                            style={{
                                                display: "inline-block",
                                                padding: "4px 12px",
                                                borderRadius: "6px",
                                                background: colors.bg,
                                                border: `1px solid ${colors.border}`,
                                                color: colors.text,
                                                fontWeight: "bold",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {restaurant.healthGrade}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#f87171", fontWeight: "bold", marginTop: "4px" }}>
                                            {restaurant.complianceScore}/100
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* All Restaurants Table */}
            <div className="md-stat-block">
                <div className="md-stat-name mb-4">All Restaurants</div>
                <div className="grid gap-2" style={{ maxHeight: "500px", overflowY: "auto" }}>
                    {restaurants.map((restaurant) => {
                        const colors = gradeToColor(restaurant.healthGrade);
                        return (
                            <div
                                key={restaurant.restaurantId}
                                className="btn btn-ghost justify-between"
                                style={{ cursor: "default", fontSize: "13px" }}
                            >
                                <div style={{ flex: 1, textAlign: "left" }}>
                                    <div style={{ fontWeight: "bold" }}>{restaurant.name}</div>
                                    <div style={{ fontSize: "11px", color: "var(--t2)" }}>
                                        {restaurant.city}, {restaurant.state}
                                    </div>
                                </div>
                                <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div
                                        style={{
                                            display: "inline-block",
                                            padding: "4px 10px",
                                            borderRadius: "6px",
                                            background: colors.bg,
                                            border: `1px solid ${colors.border}`,
                                            color: colors.text,
                                            fontWeight: "bold",
                                            fontSize: "11px",
                                        }}
                                    >
                                        {restaurant.healthGrade}
                                    </div>
                                    <div style={{ minWidth: "40px", color: "var(--gold)", fontWeight: "bold", textAlign: "right" }}>
                                        {restaurant.complianceScore}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
