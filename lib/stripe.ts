
import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY || 'sk_test_missing';

export const stripe = new Stripe(key, {
    apiVersion: '2026-01-28.clover',
});

export const getStripe = () => stripe;

