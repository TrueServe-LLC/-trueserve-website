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
