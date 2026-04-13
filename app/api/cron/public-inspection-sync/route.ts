import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isComplianceLayerEnabled } from "@/lib/system";
import { buildPublicInspectionFeed } from "@/lib/publicInspectionFeed";

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

    const synced: Array<{ restaurantId: string; summary: string }> = [];

    for (const restaurant of restaurants || []) {
        const feed = buildPublicInspectionFeed(restaurant);
        const latest = feed.items[0];

        await supabase
            .from("ComplianceInspection")
            .delete()
            .eq("restaurantId", restaurant.id)
            .eq("provider", "public-health");

        await supabase.from("ComplianceInspection").insert({
            restaurantId: restaurant.id,
            provider: "public-health",
            externalInspectionId: `${restaurant.id}-public-health-latest`,
            inspectionDate: latest.inspectionDate,
            score: latest.score,
            grade: latest.grade,
            status: latest.status,
            violations: latest.notes.map((note) => ({ note })),
            rawPayload: {
                feed,
                restaurant,
            },
            sourceUrl: latest.sourceUrl,
            inspectorName: latest.source,
            nextInspectionDue: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),
            createdAt: latest.inspectionDate,
            updatedAt: new Date().toISOString(),
        });

        await supabase
            .from("ComplianceIntegration")
            .upsert({
                restaurantId: restaurant.id,
                provider: "public-health",
                status: "ACTIVE",
                syncMode: "CRON",
                config: {
                    locationLabel: feed.locationLabel,
                    source: "pilot-public-health-feed",
                    summary: feed.summary,
                },
                lastSyncAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }, { onConflict: "restaurantId,provider" });

        await supabase
            .from("Restaurant")
            .update({
                healthGrade: latest.grade,
                lastInspectionAt: latest.inspectionDate,
                lastInspectionSource: "public-health",
                publicInspectionUrl: latest.sourceUrl,
                complianceStatus: latest.status,
                updatedAt: new Date().toISOString(),
            })
            .eq("id", restaurant.id);

        synced.push({ restaurantId: restaurant.id, summary: feed.summary });
    }

    return NextResponse.json({
        success: true,
        checked: restaurants?.length || 0,
        synced,
        timestamp: new Date().toISOString(),
    });
}
