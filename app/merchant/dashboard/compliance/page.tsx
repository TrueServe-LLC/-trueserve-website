import { cookies } from "next/headers";
import { getAuthSession } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getRestaurantInspections } from "@/lib/stateInspectionQueries";
import { getInspectionAlertMetadata } from "@/lib/inspectionAlertQueries";
import { aggregateViolationsBySeverity } from "@/lib/violationAnalytics";
import { getBenchmarkComparison } from "@/lib/restaurantBenchmarking";
import MerchantComplianceClient from "./MerchantComplianceClient";

export const dynamic = "force-dynamic";

export default async function MerchantCompliancePage() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";

    if (isPreview) {
        return (
            <MerchantComplianceClient
                restaurant={{
                    id: "preview",
                    name: "Pilot Restaurant",
                    complianceScore: 85,
                    complianceStatus: "PASS",
                    healthGrade: "A",
                    lastInspectionAt: new Date().toISOString(),
                    city: "Charlotte",
                    state: "NC",
                }}
                inspections={[
                    {
                        id: "preview-1",
                        inspectionDate: new Date().toISOString(),
                        violations: ["Minor temperature control issue"],
                        followUpRequired: false,
                        score: 85,
                    },
                ]}
                liveInspections={[
                    {
                        inspectionDate: new Date().toISOString(),
                        grade: "A",
                        score: 95,
                        status: "PASS",
                        violations: [],
                        sourceAPI: "ncAPI",
                        externalURL: "https://www.nc.gov/food-inspection-reports/demo",
                        notes: "Sample live inspection data",
                    },
                ]}
                inspectionMetadata={{
                    lastSyncedAt: new Date().toISOString(),
                    recordCount: 1,
                    isStale: false,
                }}
                inspectionAlertMetadata={{
                    nextInspectionDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    daysUntilDue: 30,
                    alertStatus: 'PENDING',
                    isOverdue: false,
                    requiresAttention: true,
                }}
                driverStats={{
                    totalDrivers: 12,
                    activeDrivers: 10,
                    pendingTraining: 2,
                    suspended: 0,
                }}
                violationAggregate={{
                    id: "preview-agg",
                    restaurantId: "preview",
                    criticalCount: 2,
                    majorCount: 3,
                    minorCount: 5,
                    totalViolations: 10,
                    criticalPercentage: 20,
                    lastUpdatedAt: new Date().toISOString(),
                }}
                benchmarkComparison={{
                    restaurantId: "preview",
                    restaurantName: "Pilot Restaurant",
                    complianceScore: 85,
                    percentileRank: 72,
                    percentileLabel: "Above Average",
                    networkAverage: 74,
                    similarRestaurantAverage: 78,
                    performanceGap: 7,
                    peerCount: 24,
                    topPerformers: [
                        { id: "1", name: "The Great Kitchen", score: 98, state: "NC" },
                        { id: "2", name: "Fresh Fare Bistro", score: 95, state: "NC" },
                        { id: "3", name: "Quality Diner", score: 92, state: "NC" },
                    ],
                }}
            />
        );
    }

    const cookieUserId = cookieStore.get("userId")?.value;
    const { isAuth, userId } = await getAuthSession();
    const activeUserId = userId || cookieUserId;

    if (!activeUserId) {
        redirect("/merchant/login");
    }

    // Fetch merchant's first restaurant directly by ownerId (same pattern as main dashboard)
    const { data: restaurants } = await supabaseAdmin
        .from("Restaurant")
        .select("id, name, complianceScore, complianceStatus, healthGrade, lastInspectionAt, city, state")
        .eq("ownerId", activeUserId)
        .order("createdAt", { ascending: true });

    const restaurant = restaurants?.[0];
    if (!restaurant) {
        return (
            <div className="min-h-screen bg-[#0a0c09] p-4 md:p-6">
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center">
                    <h2 className="font-bold text-red-300">No Restaurant Found</h2>
                    <p className="mt-2 text-sm text-red-200/80">
                        Please set up your restaurant first to view compliance information.
                    </p>
                </div>
            </div>
        );
    }

    // Fetch all compliance data — each call is guarded so a single missing table
    // or DB error cannot crash the page and eject the merchant from the portal.
    let inspections: any[] = [];
    let liveInspections: any[] = [];
    let inspectionMetadata = { lastSyncedAt: null as string | null, recordCount: 0, isStale: true };
    let inspectionAlertMetadata: any = null;
    let violationAggregate: any = null;
    let benchmarkComparison: any = null;
    let driverStats = { totalDrivers: 0, activeDrivers: 0, pendingTraining: 0, suspended: 0 };

    try {
        const { data } = await supabaseAdmin
            .from("ComplianceInspection")
            .select("id, inspectionDate, violations, followUpRequired, score")
            .eq("restaurantId", restaurant.id)
            .order("inspectionDate", { ascending: false })
            .limit(10);
        inspections = (data || []).map((insp: any) => ({
            id: insp.id,
            inspectionDate: insp.inspectionDate,
            violations: insp.violations || [],
            followUpRequired: insp.followUpRequired || false,
            score: insp.score || 0,
        }));
    } catch (e) {
        console.warn("[Compliance] ComplianceInspection fetch failed:", e);
    }

    try {
        const result = await getRestaurantInspections(restaurant.id, restaurant.state);
        liveInspections = result.inspections;
        inspectionMetadata = result.metadata;
    } catch (e) {
        console.warn("[Compliance] getRestaurantInspections failed:", e);
    }

    try {
        inspectionAlertMetadata = await getInspectionAlertMetadata(restaurant.id);
    } catch (e) {
        console.warn("[Compliance] getInspectionAlertMetadata failed:", e);
    }

    try {
        violationAggregate = await aggregateViolationsBySeverity(restaurant.id);
    } catch (e) {
        console.warn("[Compliance] aggregateViolationsBySeverity failed:", e);
    }

    try {
        benchmarkComparison = await getBenchmarkComparison(restaurant.id);
    } catch (e) {
        console.warn("[Compliance] getBenchmarkComparison failed:", e);
    }

    try {
        const { data: drivers } = await supabaseAdmin
            .from("Driver")
            .select("complianceStatus, complianceScore")
            .eq("restaurantId", restaurant.id);
        driverStats = {
            totalDrivers: drivers?.length || 0,
            activeDrivers: drivers?.filter((d: any) => d.complianceStatus === "ACTIVE").length || 0,
            pendingTraining: drivers?.filter((d: any) => d.complianceStatus === "PENDING").length || 0,
            suspended: drivers?.filter((d: any) => d.complianceStatus === "SUSPENDED").length || 0,
        };
    } catch (e) {
        console.warn("[Compliance] Driver fetch failed:", e);
    }

    return (
        <MerchantComplianceClient
            restaurant={{
                id: restaurant.id,
                name: restaurant.name,
                complianceScore: restaurant.complianceScore || 0,
                complianceStatus: restaurant.complianceStatus || "NOT_STARTED",
                healthGrade: restaurant.healthGrade || "C",
                lastInspectionAt: restaurant.lastInspectionAt,
                city: restaurant.city,
                state: restaurant.state,
            }}
            inspections={inspections}
            liveInspections={liveInspections}
            inspectionMetadata={inspectionMetadata}
            inspectionAlertMetadata={inspectionAlertMetadata}
            driverStats={driverStats}
            violationAggregate={violationAggregate}
            benchmarkComparison={benchmarkComparison}
        />
    );
}
