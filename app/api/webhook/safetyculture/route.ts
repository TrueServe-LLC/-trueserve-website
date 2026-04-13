import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isComplianceLayerEnabled } from "@/lib/system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    return NextResponse.json({
        success: true,
        service: "safetyculture-webhook",
        status: "ready",
        secretConfigured: Boolean(process.env.SAFETYCULTURE_WEBHOOK_SECRET),
    });
}

export async function POST(req: Request) {
    if (!(await isComplianceLayerEnabled())) {
        return NextResponse.json({ error: "Compliance layer is disabled" }, { status: 404 });
    }

    try {
        const payload = await req.json();
        const webhook = payload.webhook || {};
        const restaurantId = payload.restaurantId || payload.locationId || payload.externalLocationId;
        if (!restaurantId) {
            return NextResponse.json({ error: "restaurantId or locationId is required" }, { status: 400 });
        }

        const provider = "safetyculture";
        const inspectionDate = payload.inspectionDate || payload.completedAt || new Date().toISOString();
        const score = typeof payload.score === "number" ? payload.score : (typeof payload.rating === "number" ? payload.rating : null);
        const grade = payload.grade || payload.result || null;

        const { error: insertError } = await supabaseAdmin.from("ComplianceInspection").insert({
            restaurantId,
            provider,
            externalInspectionId: payload.inspectionId || payload.id || null,
            inspectionDate,
            score,
            grade,
            status: payload.status || "PASS",
            violations: payload.violations || payload.findings || [],
            rawPayload: payload,
            sourceUrl: payload.sourceUrl || payload.url || null,
            inspectorName: payload.inspectorName || payload.inspector || null,
            nextInspectionDue: payload.nextInspectionDue || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        const integrationConfig = {
            webhookId: webhook.webhook_id || payload.webhook_id || null,
            organisationId: webhook.organisation_id || payload.organisation_id || null,
            userId: webhook.user_id || payload.user_id || null,
            triggerEvents: webhook.trigger_events || payload.trigger_events || [],
            lastPayloadType: payload.type || payload.eventType || "inspection",
        };

        const { error: integrationError } = await supabaseAdmin
            .from("ComplianceIntegration")
            .upsert({
                restaurantId,
                provider,
                externalLocationId: payload.locationId || payload.externalLocationId || null,
                externalAccountId: payload.accountId || payload.externalAccountId || null,
                status: "ACTIVE",
                syncMode: "WEBHOOK",
                config: integrationConfig,
                lastSyncAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }, { onConflict: "restaurantId,provider" });

        if (integrationError) {
            return NextResponse.json({ error: integrationError.message }, { status: 500 });
        }

        const { error: updateError } = await supabaseAdmin
            .from("Restaurant")
            .update({
                healthGrade: grade,
                lastInspectionAt: inspectionDate,
                lastInspectionSource: provider,
                publicInspectionUrl: payload.sourceUrl || payload.url || null,
                complianceStatus: payload.status === "FAIL" ? "FLAGGED" : "PASS",
                updatedAt: new Date().toISOString(),
            })
            .eq("id", restaurantId);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        const { error: scoreError } = await supabaseAdmin.rpc("recalculate_restaurant_compliance_score", {
            target_restaurant_id: restaurantId,
        });

        if (scoreError) {
            return NextResponse.json({
                success: true,
                warning: `Inspection stored, but score recalculation failed: ${scoreError.message}`,
            });
        }

        return NextResponse.json({
            success: true,
            provider,
            restaurantId,
            webhookId: integrationConfig.webhookId,
            organisationId: integrationConfig.organisationId,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
    }
}
