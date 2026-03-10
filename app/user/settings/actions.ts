"use server";

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getStripe } from "@/lib/stripe";
import { revalidatePath } from 'next/cache';

const getSupabaseAdmin = () => {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

async function getOrCreateStripeCustomer(userId: string): Promise<string> {
    const supabase = getSupabaseAdmin();

    // We mock the user creation if they are a dummy test account and gracefully fallback
    if (userId.startsWith('mock-')) {
        return "cus_mock123"; // Prevent Stripe crashes for demo bypassed users
    }

    const { data: user, error } = await supabase.from('User').select('email, name, stripeCustomerId').eq('id', userId).single();

    if (error || !user) throw new Error("User not found or database sync issue. " + (error?.message || ""));

    if (user.stripeCustomerId) {
        return user.stripeCustomerId;
    }

    const customer = await getStripe().customers.create({
        email: user.email || undefined,
        name: user.name || "TrueServe User",
        metadata: { userId }
    });

    await supabase.from('User').update({ stripeCustomerId: customer.id }).eq('id', userId);

    return customer.id;
}

export async function getPaymentMethods(userId: string) {
    if (userId.startsWith('mock-')) return []; // Skip for demo users

    const supabase = getSupabaseAdmin();
    const { data: user } = await supabase.from('User').select('stripeCustomerId').eq('id', userId).single();

    if (!user || !user.stripeCustomerId) {
        return [];
    }

    try {
        // Some payment method types might throw errors if not enabled on the stripe account, safely fetch what we can
        const cardRes = await getStripe().paymentMethods.list({ customer: user.stripeCustomerId, type: 'card' }).catch(() => ({ data: [] }));
        const cashappRes = await getStripe().paymentMethods.list({ customer: user.stripeCustomerId, type: 'cashapp' }).catch(() => ({ data: [] }));

        const allPms = [...cardRes.data, ...cashappRes.data];

        return allPms.map(pm => {
            let brand = "Card";
            let displayPrimary = "";
            let displaySecondary = "";

            if (pm.type === 'card') {
                brand = pm.card?.brand || "Card";
                displayPrimary = `•••• ${pm.card?.last4}`;
                displaySecondary = `Exp ${pm.card?.exp_month}/${pm.card?.exp_year}`;
            } else if (pm.type === 'cashapp') {
                brand = "CashApp";
                displayPrimary = pm.cashapp?.cashtag || "CashApp Pay";
                displaySecondary = "Connected";
            }

            return {
                id: pm.id,
                brand: brand,
                displayPrimary,
                displaySecondary,
            };
        });
    } catch (e: any) {
        console.error("[getPaymentMethods Stripe Error]:", e.message);
        return [];
    }
}

export async function createSetupIntent(userId: string) {
    if (userId.startsWith('mock-')) return null; // Prevent crashes for mock accounts

    try {
        const customerId = await getOrCreateStripeCustomer(userId);

        const intent = await getStripe().setupIntents.create({
            customer: customerId,
            automatic_payment_methods: { enabled: true },
            usage: 'off_session',
        });

        return intent.client_secret;
    } catch (e: any) {
        console.error("[createSetupIntent Error]:", e.message);
        return null;
    }
}

export async function detachPaymentMethod(userId: string, paymentMethodId: string) {
    const supabase = getSupabaseAdmin();
    const { data: user } = await supabase.from('User').select('stripeCustomerId').eq('id', userId).single();

    if (!user || !user.stripeCustomerId) throw new Error("User has no Stripe Customer ID");

    // Ensure the payment method actually belongs to this customer
    const pm = await getStripe().paymentMethods.retrieve(paymentMethodId);
    if (pm.customer !== user.stripeCustomerId) {
        throw new Error("Unauthorized");
    }

    await getStripe().paymentMethods.detach(paymentMethodId);
    revalidatePath('/user/settings');
    return { success: true };
}

export async function subscribeToPlus(userId: string) {
    const supabase = getSupabaseAdmin();
    // 1. Get user and ensure they have a Stripe Customer ID
    const { data: user } = await supabase.from('User').select('stripeCustomerId, email, name').eq('id', userId).single();
    if (!user) return { error: "User not found" };

    let customerId = user.stripeCustomerId;
    if (!customerId) {
        return { error: "Please add a payment method to your wallet first." };
    }

    // 2. We don't have a real Price ID because we haven't created one in Stripe for this demo yet, 
    // so we will just update the database directly to simulate a successful subscription!

    // In a real app we would do:
    // const subscription = await getStripe().subscriptions.create({
    //     customer: customerId,
    //     items: [{ price: 'price_abc123' }],
    //     default_payment_method: paymentMethodId,
    // });
    // await supabase.from('User').update({ plan: 'Plus', stripeSubscriptionId: subscription.id }).eq('id', userId);

    await supabase.from('User').update({ plan: 'Plus', stripeSubscriptionId: 'sub_mock123' }).eq('id', userId);

    revalidatePath('/user/settings');
    return { success: true };
}

export async function cancelMembership(userId: string) {
    const supabase = getSupabaseAdmin();
    const { data: user } = await supabase.from('User').select('stripeSubscriptionId').eq('id', userId).single();

    if (!user) return { error: "User not found" };

    // In a real app we would do:
    // if (user.stripeSubscriptionId && !user.stripeSubscriptionId.startsWith('sub_mock')) {
    //     await getStripe().subscriptions.cancel(user.stripeSubscriptionId);
    // }

    await supabase.from('User').update({ plan: 'Basic', stripeSubscriptionId: null }).eq('id', userId);

    revalidatePath('/user/settings');
    return { success: true };
}
