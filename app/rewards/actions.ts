"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/app/auth/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getStripe } from "@/lib/stripe";

const ALLOWED_TIERS = new Set(["Basic", "Plus", "Premium"]);

async function customerHasSavedMethod(customerId: string): Promise<boolean> {
    try {
        const cards = await getStripe().paymentMethods.list({
            customer: customerId,
            type: "card",
            limit: 1
        });
        return cards.data.length > 0;
    } catch {
        return false;
    }
}

export async function joinRewardsTier(formData: FormData) {
    const tier = String(formData.get("tier") || "Basic");
    if (!ALLOWED_TIERS.has(tier)) {
        redirect("/rewards?update=error");
    }

    const { isAuth, userId } = await getAuthSession();
    if (!isAuth || !userId) {
        redirect("/login");
    }

    const { data: user, error } = await supabaseAdmin
        .from("User")
        .select("id, stripeCustomerId")
        .eq("id", userId)
        .maybeSingle();

    if (error || !user) {
        redirect("/rewards?update=error");
    }

    const isPaidTier = tier !== "Basic";
    if (isPaidTier) {
        if (!user.stripeCustomerId) {
            redirect("/rewards?update=needs_wallet");
        }
        const hasSavedMethod = await customerHasSavedMethod(user.stripeCustomerId);
        if (!hasSavedMethod) {
            redirect("/rewards?update=needs_wallet");
        }
    }

    const updatePayload: Record<string, unknown> = {
        plan: tier,
        isMember: tier !== "Basic",
        updatedAt: new Date().toISOString()
    };

    if (tier === "Basic") {
        updatePayload.stripeSubscriptionId = null;
    } else {
        // Pilot-mode placeholder until live subscription provisioning is wired.
        updatePayload.stripeSubscriptionId = "sub_mock123";
    }

    const { error: updateError } = await supabaseAdmin
        .from("User")
        .update(updatePayload)
        .eq("id", userId);

    if (updateError) {
        redirect("/rewards?update=error");
    }

    revalidatePath("/rewards");
    revalidatePath("/user/settings");
    revalidatePath("/");

    redirect(`/rewards?update=success&tier=${encodeURIComponent(tier)}`);
}
