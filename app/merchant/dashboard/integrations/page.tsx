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
        <div className="p-10 max-w-6xl mx-auto animate-fade-in-up">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,700;1,800&display=swap');
                .page-title { font-family: 'Barlow Condensed', sans-serif; font-size: 32px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: 0.01em; line-height: 1; }
                .page-sub { font-size: 13px; color: #444; margin-top: 5px; font-weight: 600; letter-spacing: 0.02em; }
            `}} />
            
            <div className="mb-10">
                <h1 className="page-title">Integrations</h1>
                <p className="page-sub">Manage your POS systems and API protocols.</p>
            </div>
            
            <POSIntegration 
                currentApiKey={restaurant.apiKey} 
                posType={restaurant.posType || "None"} 
            />
        </div>
    );
}
