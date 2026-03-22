/**
 * QA TEST SCRIPT: test_checkout.js
 * 
 * PURPOSE: 
 * Tests the initial "Setup Intent" for Stripe. This verifies that our 
 * Stripe private keys are correctly configured and that we can communicate 
 * with the Stripe API to begin a checkout session.
 * 
 * HOW TO RUN:
 * `node scripts/test_checkout.js`
 * 
 * VERIFICATION:
 * 1. Confirm the output says "Success!" followed by a `client_secret`.
 */
require('dotenv').config({ path: '.env.local' });
const { Stripe } = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function create() {
    try {
        const intent = await stripe.setupIntents.create({
            automatic_payment_methods: { enabled: true },
            usage: 'off_session',
        });
        console.log("Success!", intent.client_secret);
    } catch (e) {
        console.error("FAIL:", e.message);
    }
}
create();
