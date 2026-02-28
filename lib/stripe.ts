
import Stripe from 'stripe';
import * as Sentry from '@sentry/nextjs';
import { logger } from './logger';

const key = process.env.STRIPE_SECRET_KEY;

if (!key || key === 'sk_test_missing') {
    logger.error("CRITICAL: STRIPE_SECRET_KEY is missing from environment variables.");
    Sentry.captureMessage("STRIPE_SECRET_KEY is missing", 'fatal');
}

export const stripe = new Stripe(key || 'sk_test_missing', {
    apiVersion: '2026-01-28.clover',
});

export const getStripe = () => stripe;

