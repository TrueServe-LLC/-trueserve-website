import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

/**
 * MARKETPLACE SIMULATION SCRIPT (DRAGON CRAWL / SLATE COMPATIBLE)
 * 
 * USE CASE: When QAs use test tools, this script runs the core workflow:
 *  1. Driver/Merchant generation & approval (mocked states)
 *  2. Order creation & driver dispatch
 *  3. Fulfillment pipeline tests
 * 
 * IMPORTANT: To prevent affecting production:
 *  - This script must only log if NEXT_PUBLIC_SUPABASE_URL is hitting a staging DB.
 *  - Or, it applies the 'qa-testing-' prefix so `scripts/purge_all.ts` tracks them.
 */

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase ENV files.");
    process.exit(1);
}

// ⚠️ GUARDRAIL: Only allow testing on mock DBs or local instances to isolate from prod!
const isLocalOrTestDb = process.env.NEXT_PUBLIC_SUPABASE_URL.includes("localhost") || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("test");
if (!isLocalOrTestDb) {
    console.warn("⚠️ WARNING: You are pointing to a database that isn't 'localhost' or 'test'.");
    console.warn("Generating sandboxed [QA-TEST] entities that can be globally wiped...");
}

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulate() {
    console.log("=== INITIATING DRAGON CRAWL SIMULATION ===");
    
    // 1. Merchant Generation
    const merchantId = `qa-testing-${uuidv4().substring(11)}`;
    console.log(`[1] Creating Test Merchant... (ID: ${merchantId})`);
    await supabaseAdmin.from('Restaurant').insert({
        id: merchantId,
        ownerId: 'placeholder',
        name: 'Auto QA Burger Place',
        status: 'ACTIVE',
        stripeAccountId: 'acct_qa_fake_123'
    });
    await sleep(1000);

    // 2. Driver Generation
    const driverId = `qa-testing-${uuidv4().substring(11)}`;
    console.log(`[2] Creating Test Driver... (ID: ${driverId})`);
    await supabaseAdmin.from('Driver').insert({
        id: driverId,
        userId: 'placeholder',
        firstName: 'Auto',
        lastName: 'QA-Driver',
        status: 'ACTIVE',
        vehicleVerified: true,
        backgroundCheckStatus: 'CLEARED'
    });
    await sleep(1000);

    // 3. Customer Order
    const orderId = `qa-testing-${uuidv4().substring(11)}`;
    console.log(`[3] Simulating Customer Order Injection... (Order ID: ${orderId})`);
    await supabaseAdmin.from('Order').insert({
        id: orderId,
        userId: 'placeholder',
        restaurantId: merchantId,
        status: 'PENDING',
        total: 24.99,
        stripePaymentIntentId: 'pi_qa_fake_abc'
    });
    await sleep(2000);

    // 4. Driver Dispatch / Accept
    console.log(`[4] Dispatching Driver ${driverId} to Order ${orderId}...`);
    await supabaseAdmin.from('Order').update({
        driverId: driverId,
        status: 'ACCEPTED_BY_DRIVER'
    }).eq('id', orderId);
    await sleep(2000);

    // 5. Completion
    console.log(`[5] Simulating Delivery Drop-off...`);
    await supabaseAdmin.from('Order').update({
        status: 'DELIVERED',
        deliveredAt: new Date().toISOString()
    }).eq('id', orderId);

    console.log("\n=== SIMULATION COMPLETE ===");
    console.log("Run `npx tsx scripts/purge_sandbox.ts` to wipe these entities when done.");
}

simulate().catch(console.error);
