export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthSession } from "@/app/auth/actions";
import { getStripe } from "@/lib/stripe";
import Link from "next/link";

export default async function OnboardingSuccessPage() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;
    const { userId } = await getAuthSession();
    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) redirect("/login?role=merchant");

    let detailsSubmitted = false;
    let chargesEnabled = false;
    let payoutsEnabled = false;
    let restaurantName = "Your Restaurant";

    if (isPreview && !activeUserId) {
        // Preview mode: show the fully-active success state
        restaurantName = "Pilot Kitchen";
        detailsSubmitted = true;
        chargesEnabled = true;
        payoutsEnabled = true;
    } else {
        const supabase = await createClient();
        const { data: restaurant } = await supabase
            .from("Restaurant")
            .select("id, name, stripeAccountId, stripeOnboardingComplete")
            .eq("ownerId", activeUserId!)
            .maybeSingle();

        if (!restaurant) redirect("/merchant/signup");
        if (!restaurant.stripeAccountId) redirect("/merchant/dashboard");

        restaurantName = restaurant.name;
        detailsSubmitted = restaurant.stripeOnboardingComplete ?? false;

        try {
            const account = await getStripe().accounts.retrieve(restaurant.stripeAccountId);
            detailsSubmitted = account.details_submitted ?? false;
            chargesEnabled = account.charges_enabled ?? false;
            payoutsEnabled = account.payouts_enabled ?? false;

            // Sync to DB if Stripe says it's done but webhook hasn't fired yet
            if (detailsSubmitted && !restaurant.stripeOnboardingComplete) {
                await supabase
                    .from("Restaurant")
                    .update({ stripeOnboardingComplete: true })
                    .eq("id", restaurant.id);
            }
        } catch (err) {
            console.error("Stripe account retrieval error:", err);
        }
    }

    const isFullyActive = detailsSubmitted && chargesEnabled && payoutsEnabled;
    const isPending = detailsSubmitted && !isFullyActive;

    return (
        <div className="md-body min-h-screen">
            <div style={{ width: "100%", maxWidth: "560px", margin: "60px auto" }}>

                {/* STATUS ICON */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
                    <div style={{
                        width: "72px", height: "72px", borderRadius: "50%",
                        background: isFullyActive ? "rgba(61,214,140,.12)" : isPending ? "rgba(232,162,48,.12)" : "rgba(100,100,120,.1)",
                        border: `2px solid ${isFullyActive ? "var(--green)" : isPending ? "var(--gold)" : "var(--border2)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "32px"
                    }}>
                        {isFullyActive ? "✓" : isPending ? "⏳" : "⚠"}
                    </div>
                </div>

                {/* HEADING */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{
                        fontFamily: "var(--font-bebas), sans-serif",
                        fontSize: "40px", fontStyle: "italic", textTransform: "uppercase",
                        letterSpacing: ".04em", lineHeight: 1,
                        color: isFullyActive ? "var(--green)" : isPending ? "var(--gold)" : "var(--t1)",
                        marginBottom: "12px"
                    }}>
                        {isFullyActive ? "Stripe Connected" : isPending ? "Almost There" : "Setup Incomplete"}
                    </div>
                    <p style={{ color: "var(--t2)", fontSize: "14px", lineHeight: 1.6 }}>
                        {isFullyActive
                            ? `${restaurantName} is now set up to receive payouts. Orders placed through your storefront will settle to your bank on Stripe's standard schedule.`
                            : isPending
                            ? "Your account details were submitted. Stripe is reviewing your information — this usually takes a few minutes. Your dashboard will update automatically."
                            : "It looks like your Stripe onboarding wasn't completed. Return to the dashboard and try connecting again."}
                    </p>
                </div>

                {/* STATUS CARDS */}
                <div className="md-stat-block" style={{ marginBottom: "24px" }}>
                    <div className="md-stat-name" style={{ marginBottom: "16px" }}>Account Status</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {[
                            { label: "Details Submitted", active: detailsSubmitted },
                            { label: "Charges Enabled", active: chargesEnabled },
                            { label: "Payouts Enabled", active: payoutsEnabled },
                        ].map(({ label, active }) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--card2)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--t2)" }}>{label}</span>
                                <span style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", color: active ? "var(--green)" : "var(--t3)" }}>
                                    {active ? "✓ Active" : "Pending"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ACTIONS */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <Link href="/merchant/dashboard" className="btn btn-gold justify-center" style={{ textDecoration: "none" }}>
                        Go to Dashboard →
                    </Link>
                    <Link href="/merchant/dashboard/storefront" className="btn btn-ghost justify-center" style={{ textDecoration: "none" }}>
                        View Storefront
                    </Link>
                </div>
            </div>
        </div>
    );
}
