
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export default async function AuthOnboardingSuccessPage({
    searchParams
}: {
    searchParams: { session_id?: string; type?: string }
}) {
    const sessionId = searchParams.session_id;
    if (!sessionId) redirect('/');

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) redirect('/login');

    const supabase = await createClient();

    try {
        // 1. Verify Session with Stripe
        const session = await getStripe().checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid' || session.status === 'complete') {
            const subscriptionId = session.subscription as string;
            const plan = session.metadata?.plan || 'Plus';

            // 2. Update User Record
            await supabase
                .from('User')
                .update({
                    plan: plan,
                    stripeSubscriptionId: subscriptionId,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', userId);
        }
    } catch (err) {
        console.error("Auth Stripe Verification Error:", err);
    }

    redirect('/restaurants?welcome=member');
}
