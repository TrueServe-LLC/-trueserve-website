
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_building';

export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2026-01-28.clover' as any,
});
