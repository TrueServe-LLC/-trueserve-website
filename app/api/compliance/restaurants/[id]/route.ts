import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { isComplianceLayerEnabled } from "@/lib/system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveRestaurantAccess(restaurantId: string) {
    const session = await getAuthSession();
    if (!session.isAuth) {
        return { authorized: false as const, status: 401 };
    }

    const { data: restaurant, error } = await supabaseAdmin
        .from("Restaurant")
        .select("id, ownerId, name, complianceScore, healthGrade, complianceStatus, lastInspectionAt, lastInspectionSource, publicInspectionUrl, complianceNotes, complianceTier")
        .eq("id", restaurantId)
        .maybeSingle();

    if (error || !restaurant) {
        return { authorized: false as const, status: 404 };
    }

    const isOwner = session.userId === restaurant.ownerId;
    const isStaff = isInternalStaff(session.role);
    if (!isOwner && !isStaff) {
        return { authorized: false as const, status: 403 };
    }

    return { authorized: true as const, restaurant, session };
}

export async function GET(_req: Request, context: { params: { id: string } }) {
    if (!(await isComplianceLayerEnabled())) {
        return NextResponse.json({ error: "Compliance layer is disabled" }, { status: 404 });
    }

    const { id } = context.params;
    const access = await resolveRestaurantAccess(id);
    if (!access.authorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: access.status });
    }

    const [integrations, inspections, checklistRuns, scoreHistory] = await Promise.all([
        supabaseAdmin.from("ComplianceIntegration").select("*").eq("restaurantId", id).order("createdAt", { ascending: false }),
        supabaseAdmin.from("ComplianceInspection").select("*").eq("restaurantId", id).order("inspectionDate", { ascending: false }).limit(10),
        supabaseAdmin.from("ComplianceChecklistRun").select("*").eq("restaurantId", id).order("createdAt", { ascending: false }).limit(10),
        supabaseAdmin.from("ComplianceScoreHistory").select("*").eq("restaurantId", id).order("createdAt", { ascending: false }).limit(10),
    ]);

    return NextResponse.json({
        restaurant: access.restaurant,
        integrations: integrations.data || [],
        inspections: inspections.data || [],
        checklistRuns: checklistRuns.data || [],
        scoreHistory: scoreHistory.data || [],
    });
}

export async function PATCH(req: Request, context: { params: { id: string } }) {
    if (!(await isComplianceLayerEnabled())) {
        return NextResponse.json({ error: "Compliance layer is disabled" }, { status: 404 });
    }

    const { id } = context.params;
    const access = await resolveRestaurantAccess(id);
    if (!access.authorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: access.status });
    }

    const body = await req.json();
    const updatePayload = {
        complianceStatus: body.complianceStatus,
        complianceNotes: body.complianceNotes,
        complianceTier: body.complianceTier,
        publicInspectionUrl: body.publicInspectionUrl,
        healthGrade: body.healthGrade,
        updatedAt: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
        .from("Restaurant")
        .update(updatePayload)
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, restaurantId: id, updated: updatePayload });
}
