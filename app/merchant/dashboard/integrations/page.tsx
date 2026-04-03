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
            .single();

        if (error || !data) {
            redirect("/merchant-signup");
        }
        restaurant = data;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto animate-fade-in-up">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Integrations</h1>
                <p className="text-slate-500 text-sm font-bold italic">Manage your POS systems and API protocols.</p>
            </div>
            
            <POSIntegration 
                currentApiKey={restaurant.apiKey} 
                posType={restaurant.posType || "None"} 
            />
        </div>
    );
}
