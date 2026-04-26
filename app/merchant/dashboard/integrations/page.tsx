import { createClient } from "@/lib/supabase/server";
import { getAuthSession } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import POSIntegration from "../POSIntegration";

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
            apiKey: "ts_test_pk_12345",
            posType: "Toast"
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
                Manage POS systems, iframes, and API protocols.
            </p>
            <POSIntegration
                currentApiKey={restaurant.apiKey}
                posType={restaurant.posType || "None"}
            />
        </>
    );
}
