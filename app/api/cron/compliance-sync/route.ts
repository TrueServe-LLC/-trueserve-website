import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isComplianceLayerEnabled } from "@/lib/system";

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

    const { data: integrations, error } = await supabase
        .from("ComplianceIntegration")
        .select("id, restaurantId, provider, status, syncMode, lastSyncAt, config")
        .eq("status", "ACTIVE")
        .order("updatedAt", { ascending: false })
        .limit(100);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const summary = {
        checkedIntegrations: integrations?.length || 0,
        syncedIntegrations: 0,
        skippedIntegrations: 0,
        notes: [
            "This endpoint is the scheduled sync entry point for public inspection feeds and vendor polling.",
            "Phase 1 can operate via SafetyCulture webhooks only; phase 2 adds county/city inspection polling."
        ]
    };

    const integrationIds = (integrations || []).map((integration: any) => integration.id);
    if (integrationIds.length > 0) {
        await supabase
            .from("ComplianceIntegration")
            .update({ lastSyncAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
            .in("id", integrationIds);
    }

    return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        integrations: integrations || [],
        summary,
    });
}
