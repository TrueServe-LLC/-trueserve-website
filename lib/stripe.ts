
import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;

if (!key || key === 'sk_test_missing') {
    console.error("CRITICAL: STRIPE_SECRET_KEY is missing from environment variables.");
}

export const stripe = new Stripe(key || 'sk_test_missing', {
    apiVersion: '2026-01-28.clover',
});

export const getStripe = () => stripe;

