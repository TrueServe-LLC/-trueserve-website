
import { getStripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event;

    try {
        event = getStripe().webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ""
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded":
            console.log(`PaymentIntent for ${session.amount} was successful!`);
            // Here you could update order status if you weren't doing it in the action
            break;

        case "account.updated":
            const account = event.data.object as any;
            if (account.details_submitted) {
                // Update restaurant status to onboarding complete
                const { error } = await supabase
                    .from('Restaurant')
                    .update({ stripeOnboardingComplete: true })
                    .eq('stripeAccountId', account.id);

                if (error) console.error("Failed to update merchant onboarding status:", error);
                else console.log(`Merchant account ${account.id} verified.`);
            }
            break;

        case "charge.refunded":
            // Handle order cancellation/refund in DB
            const charge = event.data.object as any;
            const paymentIntentId = charge.payment_intent;

            // Note: In a real app, you'd find the order by payment intent ID
            console.log(`Charge ${charge.id} was refunded.`);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
}
