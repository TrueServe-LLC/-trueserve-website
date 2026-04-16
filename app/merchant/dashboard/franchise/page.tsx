import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { calculateFranchiseMetrics, generateFranchiseInsights } from "@/lib/franchiseAnalytics";
import type { RestaurantComplianceMetrics } from "@/lib/complianceAnalytics";

export const dynamic = "force-dynamic";

function gradeToColor(grade: string): { bg: string; text: string; border: string } {
    switch (grade?.toUpperCase()) {
        case "A":
            return { bg: "#0d1a10", border: "#1a4a2a", text: "#2ee5a0" };
        case "B":
            return { bg: "#1c1508", border: "#57400f", text: "#f97316" };
        case "C":
            return { bg: "#1a1208", border: "#5c3a0f", text: "#fb923c" };
        case "D":
        default:
            return { bg: "#1a0d10", border: "#4a1a1a", text: "#f87171" };
    }
}

function getTrendEmoji(trend?: string): string {
    switch (trend) {
        case "improving":
            return "🔺";
        case "declining":
            return "🔻";
        default:
            return "➡️";
    }
}

function getStatusEmoji(status?: string): string {
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

export default async function FranchiseDashboard() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;
    const { userId } = await getAuthSession();
    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect("/login?role=merchant&next=/merchant/dashboard/franchise");
    }

    let restaurants: RestaurantComplianceMetrics[] = [];

    if (isPreview) {
        // Mock data for preview - multiple restaurants
        restaurants = [
            {
                restaurantId: "1",
                name: "Dhan's Kitchen - Downtown",
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
                name: "Dhan's Kitchen - Midtown",
                city: "Fayetteville",
                state: "NC",
                complianceScore: 87,
                healthGrade: "B",
                complianceStatus: "PASS",
                lastInspectionAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                trend: "stable",
                violationCount: 2,
                criticalViolations: 0,
            },
            {
                restaurantId: "3",
                name: "Dhan's Kitchen - West",
                city: "Springdale",
                state: "AR",
                complianceScore: 78,
                healthGrade: "C",
                complianceStatus: "IN_REVIEW",
                lastInspectionAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                trend: "declining",
                violationCount: 5,
                criticalViolations: 1,
            },
        ];
    } else {
        const supabase = await createClient();
        const { data } = await supabase
            .from("Restaurant")
            .select(
                "id, name, city, state, complianceScore, healthGrade, complianceStatus, lastInspectionAt"
            )
            .eq("ownerId", activeUserId!);

        if (data && data.length > 0) {
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

    // If only one restaurant, redirect to compliance-score page
    if (restaurants.length === 1 && !isPreview) {
        redirect("/merchant/dashboard/compliance-score");
    }

    const franchiseMetrics = calculateFranchiseMetrics(restaurants);
    const insights = generateFranchiseInsights(franchiseMetrics);

    return (
        <div className="md-body min-h-screen animate-fade-in-up">
            <div className="md-page-hd">
                <div>
                    <div className="md-page-title">Franchise Compliance</div>
                    <div className="md-page-sub">Multi-Location Overview</div>
                </div>
                <div className="grid gap-2 sm:grid-cols-1">
                    <Link href="/merchant/dashboard" className="btn btn-ghost justify-center">
                        Back to Dashboard
                    </Link>
                </div>
            </div>

            {/* Franchise-Level Metrics */}
            <div className="md-stat-grid">
                <div className="md-stat-block">
                    <div className="md-stat-name">Locations</div>
                    <div style={{ fontSize: "48px", fontWeight: "bold", color: "var(--gold)", marginTop: "12px" }}>
                        {franchiseMetrics.locationCount}
                    </div>
                </div>

                <div className="md-stat-block">
                    <div className="md-stat-name">Average Score</div>
                    <div style={{ fontSize: "48px", fontWeight: "bold", color: "var(--green)", marginTop: "12px" }}>
                        {franchiseMetrics.averageScore}/100
                    </div>
                </div>

                <div className="md-stat-block">
                    <div className="md-stat-name">Pass Rate</div>
                    <div style={{ fontSize: "48px", fontWeight: "bold", color: franchiseMetrics.passRate >= 80 ? "var(--green)" : "var(--red)", marginTop: "12px" }}>
                        {franchiseMetrics.passRate}%
                    </div>
                </div>

                <div className="md-stat-block">
                    <div className="md-stat-name">Flagged</div>
                    <div style={{ fontSize: "48px", fontWeight: "bold", color: franchiseMetrics.flaggedCount > 0 ? "var(--red)" : "var(--green)", marginTop: "12px" }}>
                        {franchiseMetrics.flaggedCount}
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className="md-stat-block">
                <div className="md-stat-name mb-4">Key Insights</div>
                <div className="grid gap-2">
                    {insights.map((insight, idx) => (
                        <div key={idx} style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)" }}>
                            <div style={{ fontSize: "13px", color: "var(--t2)", lineHeight: "1.6" }}>
                                {insight}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Locations Table */}
            <div className="md-stat-block">
                <div className="md-stat-name mb-4">All Locations</div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                <th style={{ textAlign: "left", padding: "12px", color: "var(--t2)", fontWeight: "600" }}>Location</th>
                                <th style={{ textAlign: "center", padding: "12px", color: "var(--t2)", fontWeight: "600" }}>Score</th>
                                <th style={{ textAlign: "center", padding: "12px", color: "var(--t2)", fontWeight: "600" }}>Grade</th>
                                <th style={{ textAlign: "center", padding: "12px", color: "var(--t2)", fontWeight: "600" }}>Status</th>
                                <th style={{ textAlign: "center", padding: "12px", color: "var(--t2)", fontWeight: "600" }}>Trend</th>
                                <th style={{ textAlign: "center", padding: "12px", color: "var(--t2)", fontWeight: "600" }}>Last Inspection</th>
                                <th style={{ textAlign: "center", padding: "12px", color: "var(--t2)", fontWeight: "600" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {restaurants.map((location) => {
                                const colors = gradeToColor(location.healthGrade);
                                const lastInspectionDate = location.lastInspectionAt
                                    ? new Date(location.lastInspectionAt).toLocaleDateString()
                                    : "No data";

                                return (
                                    <tr
                                        key={location.restaurantId}
                                        style={{
                                            borderBottom: "1px solid var(--border)",
                                            transition: "background 0.2s",
                                            cursor: "pointer",
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLTableRowElement).style.background =
                                                "rgba(255,255,255,0.03)";
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                                        }}
                                    >
                                        <td style={{ padding: "12px", fontWeight: "500" }}>
                                            <div>{location.name}</div>
                                            <div style={{ fontSize: "12px", color: "var(--t2)", marginTop: "4px" }}>
                                                📍 {location.city}, {location.state}
                                            </div>
                                        </td>
                                        <td style={{ padding: "12px", textAlign: "center", fontWeight: "bold", color: "var(--gold)" }}>
                                            {location.complianceScore}
                                        </td>
                                        <td style={{ padding: "12px", textAlign: "center" }}>
                                            <div
                                                style={{
                                                    display: "inline-block",
                                                    padding: "6px 12px",
                                                    borderRadius: "6px",
                                                    background: colors.bg,
                                                    border: `1px solid ${colors.border}`,
                                                    color: colors.text,
                                                    fontWeight: "bold",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                {location.healthGrade}
                                            </div>
                                        </td>
                                        <td style={{ padding: "12px", textAlign: "center", fontSize: "12px" }}>
                                            {getStatusEmoji(location.complianceStatus)} {location.complianceStatus}
                                        </td>
                                        <td style={{ padding: "12px", textAlign: "center", fontSize: "12px" }}>
                                            {getTrendEmoji(location.trend)} {location.trend}
                                        </td>
                                        <td style={{ padding: "12px", textAlign: "center", fontSize: "12px", color: "var(--t2)" }}>
                                            {lastInspectionDate}
                                        </td>
                                        <td style={{ padding: "12px", textAlign: "center" }}>
                                            <Link
                                                href={`/merchant/dashboard/compliance-score?restaurantId=${location.restaurantId}`}
                                                className="btn btn-ghost"
                                                style={{ fontSize: "11px", padding: "6px 12px" }}
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Grade Distribution */}
            <div className="md-stat-grid">
                <div className="md-stat-block">
                    <div className="md-stat-name mb-3">Grade Distribution</div>
                    <div style={{ display: "grid", gap: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: "#2ee5a0" }}></div>
                                <span>Grade A (90-100)</span>
                            </div>
                            <span style={{ fontWeight: "bold", color: "var(--gold)" }}>
                                {franchiseMetrics.aggregateGradeDistribution.a}
                            </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: "#f97316" }}></div>
                                <span>Grade B (80-89)</span>
                            </div>
                            <span style={{ fontWeight: "bold", color: "var(--gold)" }}>
                                {franchiseMetrics.aggregateGradeDistribution.b}
                            </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: "#fb923c" }}></div>
                                <span>Grade C (70-79)</span>
                            </div>
                            <span style={{ fontWeight: "bold", color: "var(--gold)" }}>
                                {franchiseMetrics.aggregateGradeDistribution.c}
                            </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: "#f87171" }}></div>
                            <span>Grade D (&lt;70)</span>
                            <span style={{ fontWeight: "bold", color: "var(--gold)" }}>
                                {franchiseMetrics.aggregateGradeDistribution.d}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="md-stat-block">
                    <div className="md-stat-name mb-3">Performance Summary</div>
                    <div style={{ display: "grid", gap: "12px" }}>
                        {franchiseMetrics.highestScoringLocation && (
                            <div style={{ padding: "10px", borderRadius: "6px", background: "rgba(46, 229, 160, 0.1)", border: "1px solid rgba(46, 229, 160, 0.2)" }}>
                                <div style={{ fontSize: "12px", color: "var(--t2)", marginBottom: "4px" }}>Top Performer</div>
                                <div style={{ fontSize: "13px", fontWeight: "600", color: "#2ee5a0" }}>
                                    {franchiseMetrics.highestScoringLocation.name}
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--t2)", marginTop: "4px" }}>
                                    Score: {franchiseMetrics.highestScoringLocation.complianceScore}
                                </div>
                            </div>
                        )}
                        {franchiseMetrics.lowestScoringLocation && (
                            <div style={{ padding: "10px", borderRadius: "6px", background: "rgba(248, 113, 113, 0.1)", border: "1px solid rgba(248, 113, 113, 0.2)" }}>
                                <div style={{ fontSize: "12px", color: "var(--t2)", marginBottom: "4px" }}>Needs Attention</div>
                                <div style={{ fontSize: "13px", fontWeight: "600", color: "#f87171" }}>
                                    {franchiseMetrics.lowestScoringLocation.name}
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--t2)", marginTop: "4px" }}>
                                    Score: {franchiseMetrics.lowestScoringLocation.complianceScore}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Help Section */}
            <div className="md-stat-block">
                <div className="md-stat-name mb-4">Need Help?</div>
                <div style={{ fontSize: "13px", color: "var(--t2)", lineHeight: "1.6", marginBottom: "12px" }}>
                    Questions about your franchise compliance or how to improve across all locations?
                </div>
                <div className="grid gap-2">
                    <div className="btn btn-ghost justify-between" style={{ cursor: "default" }}>
                        <span>📧 Email support</span>
                        <span style={{ color: "var(--gold)" }}>support@trueserve.delivery</span>
                    </div>
                    <div className="btn btn-ghost justify-between" style={{ cursor: "default" }}>
                        <span>📱 Phone support</span>
                        <span style={{ color: "var(--gold)" }}>1-800-TRUESERVE</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
