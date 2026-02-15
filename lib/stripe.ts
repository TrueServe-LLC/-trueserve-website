
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    console.warn('WARNING: STRIPE_SECRET_KEY is missing from environment variables. Stripe calls will fail.');
}

// The stripe SDK version ^20.3.0 requires the '2026-01-28.clover' API version types.
export const stripe = new Stripe(stripeSecretKey || '', {
    apiVersion: '2026-01-28.clover',
});
