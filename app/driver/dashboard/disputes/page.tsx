import { cookies } from "next/headers";
import { getDriverOrRedirect } from "@/lib/driver-auth";
import DriverDisputesClient from "./DriverDisputesClient";

export const dynamic = "force-dynamic";

const MOCK_PAST_DISPUTES = [
    {
        id: "d1",
        date: "2026-04-20",
        issueType: "Customer unreachable",
        status: "RESOLVED" as const,
        description: "Attempted delivery at address, customer did not answer phone or door after 5 minutes.",
        urgency: "LOW" as const,
    },
    {
        id: "d2",
        date: "2026-04-15",
        issueType: "Order not ready",
        status: "RESOLVED" as const,
        description: "Restaurant stated order would be 25 extra minutes past expected prep time.",
        urgency: "HIGH" as const,
    },
    {
        id: "d3",
        date: "2026-04-09",
        issueType: "Wrong address",
        status: "OPEN" as const,
        description: "GPS pin was placed in wrong location — correct address was 2 blocks away.",
        urgency: "LOW" as const,
    },
];

export default async function DriverDisputesPage() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";

    const driver = isPreview
        ? { id: "preview", name: "Jordan Rivers" }
        : await getDriverOrRedirect();

    return (
        <DriverDisputesClient
            driverName={driver.name || "Driver"}
            pastDisputes={isPreview ? MOCK_PAST_DISPUTES : []}
        />
    );
}
