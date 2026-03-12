
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export default async function OnboardingSuccessPage({
    searchParams
}: {
    searchParams: Promise<{ session_id?: string }>
}) {
    const { session_id: sessionId } = await searchParams;
    if (!sessionId) redirect('/merchant/dashboard');

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) redirect('/login');

    const supabase = await createClient();

    try {
        // 1. Verify Session with Stripe
        const session = await getStripe().checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid' || session.status === 'complete') {
            const restaurantId = session.metadata?.restaurantId;
            const subscriptionId = session.subscription as string;

            // 2. Update Restaurant Record
            if (restaurantId) {
                await supabase
                    .from('Restaurant')
                    .update({
                        plan: 'Pro Subscription',
                        stripeSubscriptionId: subscriptionId,
                        updatedAt: new Date().toISOString()
                    })
                    .eq('id', restaurantId);
            }
        }
    } catch (err) {
        console.error("Stripe Verification Error:", err);
    }

    redirect('/merchant/dashboard?welcome=pro');
}
