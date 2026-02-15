
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_building';

// The stripe SDK version ^20.3.0 requires the '2026-01-28.clover' API version types.
export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2026-01-28.clover',
});
