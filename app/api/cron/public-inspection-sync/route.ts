import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isComplianceLayerEnabled } from "@/lib/system";
import { getHealthInspections, calculateComplianceScore } from "@/lib/healthInspectionAPIs";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    if (!(await isComplianceLayerEnabled())) {
        return NextResponse.json({ error: "Compliance layer is disabled" }, { status: 404 });
    }

    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data: restaurants, error } = await supabase
        .from("Restaurant")
        .select("id, name, address, city, state, publicInspectionUrl")
        .order("updatedAt", { ascending: false })
        .limit(50);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const synced: Array<{ restaurantId: string; summary: string; recordsFound: number }> = [];

    for (const restaurant of restaurants || []) {
        try {
            // Fetch real health inspections from NC/SC health departments
            const inspectionRecords = await getHealthInspections(
                restaurant.name || "Unknown",
                restaurant.city || "Unknown",
                restaurant.state || "NC"
            );

            if (inspectionRecords.length === 0) {
                logger.warn({ restaurantId: restaurant.id, name: restaurant.name }, '[Sync] No inspection records found');
                synced.push({ restaurantId: restaurant.id, summary: "No records found", recordsFound: 0 });
                continue;
            }

            // Delete old public-health records
            await supabase
                .from("ComplianceInspection")
                .delete()
                .eq("restaurantId", restaurant.id)
                .eq("provider", "public-health");

            // Insert new records
            for (const record of inspectionRecords) {
                await supabase.from("ComplianceInspection").insert({
                    restaurantId: restaurant.id,
                    provider: "public-health",
                    externalInspectionId: record.inspectionId,
                    inspectionDate: record.inspectionDate,
                    score: record.score,
                    grade: record.grade,
                    status: record.status,
                    violations: record.violations,
                    rawPayload: record,
                    sourceUrl: record.sourceUrl,
                    inspectorName: record.inspector,
                    nextInspectionDue: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),
                    createdAt: new Date(record.inspectionDate).toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }

            // Calculate compliance score from all records
            const complianceScore = calculateComplianceScore(inspectionRecords);
            const latest = inspectionRecords[0];

            // Update integration status
            await supabase
                .from("ComplianceIntegration")
                .upsert({
                    restaurantId: restaurant.id,
                    provider: "public-health",
                    status: "ACTIVE",
                    syncMode: "CRON",
                    config: {
                        source: `${restaurant.state}-health-department`,
                        recordsCount: inspectionRecords.length,
                        lastSyncTimestamp: new Date().toISOString(),
                    },
                    lastSyncAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }, { onConflict: "restaurantId,provider" });

            // Update restaurant with latest inspection data
            await supabase
                .from("Restaurant")
                .update({
                    healthGrade: latest.grade,
                    lastInspectionAt: latest.inspectionDate,
                    lastInspectionSource: "public-health",
                    publicInspectionUrl: latest.sourceUrl,
                    complianceStatus: latest.status === 'FAIL' ? 'FLAGGED' : latest.status === 'CONDITIONAL' ? 'IN_REVIEW' : 'PASS',
                    complianceScore: complianceScore,
                    updatedAt: new Date().toISOString(),
                })
                .eq("id", restaurant.id);

            synced.push({
                restaurantId: restaurant.id,
                summary: `${latest.grade} · ${complianceScore}/100 · ${latest.inspectionDate}`,
                recordsFound: inspectionRecords.length,
            });

            logger.info(
                { restaurantId: restaurant.id, name: restaurant.name, score: complianceScore, grade: latest.grade },
                '[Sync] Inspection records synced'
            );
        } catch (error) {
            logger.error({ error, restaurantId: restaurant.id }, '[Sync] Error syncing inspections');
            synced.push({ restaurantId: restaurant.id, summary: "Sync failed", recordsFound: 0 });
        }
    }

    return NextResponse.json({
        success: true,
        checked: restaurants?.length || 0,
        synced,
        timestamp: new Date().toISOString(),
    });
}
