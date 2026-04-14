import { cookies } from "next/headers";
import { getMerchantOrRedirect } from "@/lib/merchant-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
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
                driverStats={{
                    totalDrivers: 12,
                    activeDrivers: 10,
                    pendingTraining: 2,
                    suspended: 0,
                }}
            />
        );
    }

    const merchant = await getMerchantOrRedirect();

    // Fetch merchant's first restaurant (or primary)
    const { data: restaurants } = await supabaseAdmin
        .from("Restaurant")
        .select("id, name, complianceScore, complianceStatus, healthGrade, lastInspectionAt, city, state")
        .eq("ownerId", merchant.id)
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

    // Fetch inspection history
    const { data: inspections } = await supabaseAdmin
        .from("ComplianceInspection")
        .select("id, inspectionDate, violations, followUpRequired, score")
        .eq("restaurantId", restaurant.id)
        .order("inspectionDate", { ascending: false })
        .limit(10);

    // Fetch driver compliance stats
    const { data: drivers } = await supabaseAdmin
        .from("Driver")
        .select("complianceStatus, complianceScore")
        .eq("restaurantId", restaurant.id);

    const driverStats = {
        totalDrivers: drivers?.length || 0,
        activeDrivers: drivers?.filter((d: any) => d.complianceStatus === "ACTIVE").length || 0,
        pendingTraining: drivers?.filter((d: any) => d.complianceStatus === "PENDING").length || 0,
        suspended: drivers?.filter((d: any) => d.complianceStatus === "SUSPENDED").length || 0,
    };

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
            inspections={(inspections || []).map((insp: any) => ({
                id: insp.id,
                inspectionDate: insp.inspectionDate,
                violations: insp.violations || [],
                followUpRequired: insp.followUpRequired || false,
                score: insp.score || 0,
            }))}
            driverStats={driverStats}
        />
    );
}
