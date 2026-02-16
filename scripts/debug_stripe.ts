
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
if (!process.env.STRIPE_SECRET_KEY) dotenv.config();

const key = process.env.STRIPE_SECRET_KEY;
console.log('Using Stripe Key:', key ? `${key.substring(0, 7)}...` : 'MISSING');

const stripe = new Stripe(key || '', {
    apiVersion: '2026-01-28.clover' as any,
});

async function check() {
    try {
        const intents = await stripe.paymentIntents.list({ limit: 5 });
        console.log('Successfully connected to Stripe.');
        console.log('Recent Payment Intents count:', intents.data.length);
        intents.data.forEach(intent => {
            console.log(`- ID: ${intent.id}, Status: ${intent.status}, Amount: ${intent.amount / 100} ${intent.currency.toUpperCase()}`);
        });
    } catch (e: any) {
        console.error('Stripe Connection Failed:', e.message);
    }
}

check();
