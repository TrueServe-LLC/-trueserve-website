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
    const { data: user } = await supabase.from('User').select('email, name, stripeCustomerId').eq('id', userId).single();

    if (!user) throw new Error("User not found");

    if (user.stripeCustomerId) {
        return user.stripeCustomerId;
    }

    const customer = await getStripe().customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId }
    });

    await supabase.from('User').update({ stripeCustomerId: customer.id }).eq('id', userId);

    return customer.id;
}

export async function getPaymentMethods(userId: string) {
    const supabase = getSupabaseAdmin();
    const { data: user } = await supabase.from('User').select('stripeCustomerId').eq('id', userId).single();

    if (!user || !user.stripeCustomerId) {
        return [];
    }

    const paymentMethods = await getStripe().paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
    });

    return paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
    }));
}

export async function createSetupIntent(userId: string) {
    const customerId = await getOrCreateStripeCustomer(userId);

    const intent = await getStripe().setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session',
    });

    return intent.client_secret;
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
