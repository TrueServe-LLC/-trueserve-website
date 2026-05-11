import { createClient } from "@/lib/supabase/server";
import { getAuthSession } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import POSIntegration from "../POSIntegration";
import AggregatorSection from "../AggregatorSection";
import POSPartnershipGuide from "../POSPartnershipGuide";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;
    const { isAuth, userId } = await getAuthSession();
    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect("/login?role=merchant");
    }

    let restaurant: any = null;

    if (isPreview) {
        restaurant = {
            id: "preview",
            apiKey: "ts_test_pk_12345",
            posType: "Toast",
            aggregatorType: null,
            aggregatorApiKey: null,
            aggregatorLocationId: null,
        };
    } else {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("Restaurant")
            .select('*')
            .eq("ownerId", activeUserId!)
            .maybeSingle();

        if (error || !data) {
            redirect("/merchant/signup");
        }
        restaurant = data;
    }

    return (
        <>
            <p style={{ fontSize: 11, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20, marginTop: -4 }}>
                Manage POS systems, aggregators, and API protocols.
            </p>
            <AggregatorSection
                restaurantId={restaurant.id}
                currentAggregatorType={restaurant.aggregatorType}
                currentAggregatorApiKey={restaurant.aggregatorApiKey}
                currentAggregatorLocationId={restaurant.aggregatorLocationId}
            />
            <POSPartnershipGuide />
            <POSIntegration
                currentApiKey={restaurant.apiKey}
                posType={restaurant.posType || "None"}
            />
        </>
    );
}
