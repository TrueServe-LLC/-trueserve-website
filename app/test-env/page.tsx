
import { stripe } from "@/lib/stripe";

export default function TestEnvPage() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    return (
        <div style={{ padding: '2rem', background: '#111', color: '#fff' }}>
            <h1>Environment Test</h1>
            <p>
                <strong>Secret Key:</strong> {secretKey ? `Present (Starts with ${secretKey.substring(0, 7)}...)` : 'MISSING ❌'}
            </p>
            <p>
                <strong>Publishable Key:</strong> {publishableKey ? `Present (Starts with ${publishableKey.substring(0, 7)}...)` : 'MISSING ❌'}
            </p>
            <hr />
            <p>Try clicking the button to test a Stripe call (check terminal logs):</p>
            <form action={async () => {
                'use server';
                try {
                    console.log("Testing Stripe Secret Key...");
                    // @ts-ignore
                    const list = await stripe.paymentIntents.list({ limit: 1 });
                    console.log("Stripe Connection Success!");
                } catch (e: any) {
                    console.error("Stripe Connection Failed:", e.message);
                }
            }}>
                <button type="submit" style={{ padding: '0.5rem 1rem' }}>Test Connection</button>
            </form>
        </div>
    );
}
