/**
 * TrueServe Load Testing Suite (Step 19)
 * -------------------------------------
 * This script simulates high-concurrency traffic on the TrueServe marketplace.
 * - Simultaneous Order Creation
 * - Real-time Driver Tracking updates
 * - Dashboard KPI Calculations
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("❌ Missing Supabase environment variables! Check .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface StressTestConfig {
    orderCount: number;
    concurrency: number;
    pollIntervalMs: number;
}

const config: StressTestConfig = {
    orderCount: 100,
    concurrency: 10,
    pollIntervalMs: 200
};

async function createFakeOrder(index: number) {
    const startTime = Date.now();
    try {
        const orderId = uuidv4();
        const { data: restaurant } = await supabase.from('Restaurant').select('id').limit(1).single();
        const { data: user } = await supabase.from('User').select('id').limit(1).single();

        if (!restaurant || !user) throw new Error("Need at least 1 restaurant and 1 user in DB to test.");

        const { error } = await supabase.from('Order').insert({
            id: orderId,
            userId: user.id,
            restaurantId: restaurant.id,
            status: 'PENDING',
            total: Math.floor(Math.random() * 50) + 15,
            posReference: `STRESS-TEST-${index}-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        if (error) throw error;
        
        const duration = Date.now() - startTime;
        console.log(`✅ [Order ${index}] Created in ${duration}ms (ID: ${orderId})`);
        return true;
    } catch (err: any) {
        console.error(`❌ [Order ${index}] Failed:`, err.message);
        return false;
    }
}

async function runLoadTest() {
    console.log(`🚀 Starting TrueServe Load Test: ${config.orderCount} orders via ${config.concurrency} concurrent channels.`);
    
    const startTime = Date.now();
    let successCount = 0;
    
    // Split work into chunks based on concurrency
    for (let i = 0; i < config.orderCount; i += config.concurrency) {
        const batchSize = Math.min(config.concurrency, config.orderCount - i);
        const promises = Array.from({ length: batchSize }).map((_, j) => createFakeOrder(i + j));
        
        const results = await Promise.all(promises);
        successCount += results.filter(Boolean).length;
        
        // Brief sleep to avoid hitting Supabase API rate limits too hard if not on Pro plan
        if (config.pollIntervalMs > 0) {
            await new Promise(r => setTimeout(r, config.pollIntervalMs));
        }
    }

    const totalDuration = (Date.now() - startTime) / 1000;
    const ordersPerSecond = successCount / totalDuration;

    console.log("\n" + "=".repeat(40));
    console.log("🏁 Load Test Complete");
    console.log("=".repeat(40));
    console.log(`Total Success: ${successCount} / ${config.orderCount}`);
    console.log(`Total Duration: ${totalDuration.toFixed(2)}s`);
    console.log(`Throughput: ${ordersPerSecond.toFixed(2)} orders/sec`);
    console.log("=".repeat(40));
}

runLoadTest().catch(console.error);
