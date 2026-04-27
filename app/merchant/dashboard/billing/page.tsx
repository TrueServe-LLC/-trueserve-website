import { cookies } from "next/headers";
import { getAuthSession } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import BillingClient from "./BillingClient";

export const dynamic = "force-dynamic";

export default async function MerchantBillingPage() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";

    if (isPreview) {
        return (
            <BillingClient
                restaurantName="Pilot Restaurant"
                currentPlan="Growth"
                stripeSubscriptionId={null}
                nextBillingDate={new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString()}
            />
        );
    }

    const cookieUserId = cookieStore.get("userId")?.value;
    const { userId } = await getAuthSession();
    const activeUserId = userId || cookieUserId;

    if (!activeUserId) {
        redirect("/merchant/login");
    }

    const { data: restaurant } = await supabaseAdmin
        .from("Restaurant")
        .select("id, name, plan, stripeSubscriptionId")
        .eq("ownerId", activeUserId)
        .order("createdAt", { ascending: true })
        .limit(1)
        .single();

    if (!restaurant) {
        return (
            <div style={{ padding: 24, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p style={{ margin: 0, color: '#f87171', fontSize: 13, fontWeight: 700 }}>No restaurant found. Please complete your account setup first.</p>
            </div>
        );
    }

    // Estimate next billing date (30 days from today if not on Stripe yet)
    const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    return (
        <BillingClient
            restaurantName={restaurant.name}
            currentPlan={restaurant.plan ?? null}
            stripeSubscriptionId={restaurant.stripeSubscriptionId ?? null}
            nextBillingDate={nextBillingDate}
        />
    );
}
