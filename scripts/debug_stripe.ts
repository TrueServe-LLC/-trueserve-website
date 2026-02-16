
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
        const account = await stripe.accounts.retrieve();
        console.log(`Connected Account: ${account.id}, Email: ${account.email}, Name: ${account.settings?.dashboard?.display_name}`);
        const intents = await stripe.paymentIntents.list({ limit: 5 });
        console.log('Successfully connected to Stripe.');
        console.log('Recent Payment Intents count:', intents.data.length);
        intents.data.forEach(pi => {
            const date = new Date(pi.created * 1000).toLocaleString();
            console.log(`- ID: ${pi.id}, Status: ${pi.status}, Amount: ${pi.amount / 100} ${pi.currency.toUpperCase()}, Created: ${date}`);
        });
    } catch (e: any) {
        console.error('Stripe Connection Failed:', e.message);
    }
}

check();
