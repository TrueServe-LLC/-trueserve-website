import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { isComplianceLayerEnabled } from "@/lib/system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveDriverAccess(driverId: string) {
    const session = await getAuthSession();
    if (!session.isAuth) {
        return { authorized: false as const, status: 401 };
    }

    const { data: driver, error } = await supabaseAdmin
        .from("Driver")
        .select("id, userId, complianceScore, complianceStatus, lastComplianceAttestationAt")
        .eq("id", driverId)
        .maybeSingle();

    if (error || !driver) {
        return { authorized: false as const, status: 404 };
    }

    const isSelf = session.userId === driver.userId;
    const isStaff = isInternalStaff(session.role);
    if (!isSelf && !isStaff) {
        return { authorized: false as const, status: 403 };
    }

    return { authorized: true as const, driver, session };
}

export async function GET(_req: Request, context: { params: { id: string } }) {
    if (!(await isComplianceLayerEnabled())) {
        return NextResponse.json({ error: "Compliance layer is disabled" }, { status: 404 });
    }

    const { id } = context.params;
    const access = await resolveDriverAccess(id);
    if (!access.authorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: access.status });
    }

    const { data } = await supabaseAdmin
        .from("DriverCompliance")
        .select("*")
        .eq("driverId", id)
        .maybeSingle();

    const { data: attestations } = await supabaseAdmin
        .from("ComplianceChecklistRun")
        .select("*")
        .eq("driverId", id)
        .order("createdAt", { ascending: false })
        .limit(10);

    return NextResponse.json({
        driver: access.driver,
        compliance: data || null,
        attestations: attestations || [],
    });
}

export async function POST(req: Request, context: { params: { id: string } }) {
    if (!(await isComplianceLayerEnabled())) {
        return NextResponse.json({ error: "Compliance layer is disabled" }, { status: 404 });
    }

    const { id } = context.params;
    const access = await resolveDriverAccess(id);
    if (!access.authorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: access.status });
    }

    const body = await req.json();
    const checklistType = body.checklistType || "driver_attestation";
    const answers = body.answers || {};
    const score = typeof body.score === "number" ? body.score : 0;

    const { error: upsertError } = await supabaseAdmin
        .from("DriverCompliance")
        .upsert({
            driverId: id,
            trainingStatus: body.trainingStatus || "PENDING",
            bagSanitationAcknowledged: Boolean(body.bagSanitationAcknowledged),
            temperatureControlAcknowledged: Boolean(body.temperatureControlAcknowledged),
            foodSafetyTrainingComplete: Boolean(body.foodSafetyTrainingComplete),
            lastAttestationAt: new Date().toISOString(),
            complianceScore: score,
            notes: body.notes || null,
            updatedAt: new Date().toISOString(),
        }, { onConflict: "driverId" });

    if (upsertError) {
        return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    const restaurantId = isInternalStaff(access.session.role)
        ? (body.restaurantId || body.restaurant_id || null)
        : null;

    if (restaurantId) {
        const { error: checklistError } = await supabaseAdmin.from("ComplianceChecklistRun").insert({
            restaurantId,
            driverId: id,
            checklistType,
            checklistVersion: body.checklistVersion || "v1",
            status: "COMPLETE",
            score,
            answers,
            evidenceUrls: body.evidenceUrls || [],
            completedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        if (checklistError) {
            return NextResponse.json({ error: checklistError.message }, { status: 500 });
        }
    }

    const { error: scoreError } = await supabaseAdmin.rpc("recalculate_driver_compliance_score", {
        target_driver_id: id,
    });

    if (scoreError) {
        return NextResponse.json({
            success: true,
            warning: `Attestation stored, but score recalculation failed: ${scoreError.message}`,
        });
    }

    return NextResponse.json({
        success: true,
        driverId: id,
        checklistType,
        restaurantId,
    });
}
