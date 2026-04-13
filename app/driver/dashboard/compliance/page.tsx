import { cookies } from "next/headers";
import { getDriverOrRedirect } from "@/lib/driver-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import DriverComplianceClient from "./DriverComplianceClient";

export const dynamic = "force-dynamic";

export default async function DriverCompliancePage() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";

    if (isPreview) {
        return (
            <DriverComplianceClient
                driver={{
                    id: "preview",
                    name: "Pilot Driver",
                    complianceScore: 90,
                    complianceStatus: "ACTIVE",
                    lastComplianceAttestationAt: new Date().toISOString(),
                    trainingStatus: "ACTIVE",
                    bagSanitationAcknowledged: true,
                    temperatureControlAcknowledged: true,
                    foodSafetyTrainingComplete: true,
                    notes: "Preview driver compliance setup for pilot use.",
                }}
                attestations={[
                    {
                        id: "preview-1",
                        checklistType: "driver_attestation",
                        status: "COMPLETE",
                        score: 90,
                        completedAt: new Date().toISOString(),
                    },
                    {
                        id: "preview-2",
                        checklistType: "bag_sanitation",
                        status: "COMPLETE",
                        score: 85,
                        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
                    },
                ]}
            />
        );
    }

    const driver = await getDriverOrRedirect();

    const { data: compliance } = await supabaseAdmin
        .from("DriverCompliance")
        .select("*")
        .eq("driverId", driver.id)
        .maybeSingle();

    const { data: attestations } = await supabaseAdmin
        .from("ComplianceChecklistRun")
        .select("id, checklistType, status, score, answers, completedAt, createdAt")
        .eq("driverId", driver.id)
        .order("createdAt", { ascending: false })
        .limit(10);

    return (
        <DriverComplianceClient
            driver={{
                id: driver.id,
                name: driver.name || "Driver",
                complianceScore: driver.complianceScore ?? 0,
                complianceStatus: driver.complianceStatus || "PENDING",
                lastComplianceAttestationAt: driver.lastComplianceAttestationAt || null,
                trainingStatus: compliance?.trainingStatus || "PENDING",
                bagSanitationAcknowledged: Boolean(compliance?.bagSanitationAcknowledged),
                temperatureControlAcknowledged: Boolean(compliance?.temperatureControlAcknowledged),
                foodSafetyTrainingComplete: Boolean(compliance?.foodSafetyTrainingComplete),
                notes: compliance?.notes || "",
            }}
            attestations={(attestations || []).map((entry: any) => ({
                id: entry.id,
                checklistType: entry.checklistType,
                status: entry.status,
                score: entry.score,
                completedAt: entry.completedAt || entry.createdAt,
            }))}
        />
    );
}
