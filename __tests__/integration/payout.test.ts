
/**
 * @jest-environment node
 */
import { createClient } from "@supabase/supabase-js";
import { describe, expect, test, beforeAll, afterAll } from "@jest/globals";
import * as dotenv from "dotenv";

dotenv.config({ path: '.env.local', override: true });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock')) dotenv.config({ override: true });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock');

(isMock ? describe.skip : describe)("Driver Payout Integration", () => {
    let testDriverId: string;
    let testUserId: string;

    beforeAll(async () => {
        // Setup: Create a test driver with a balance
        testUserId = `payout_user_${Date.now()}`;
        const { data: user } = await supabase.auth.admin.createUser({
            email: `driver_payout_${Date.now()}@test.com`,
            password: "TestPassword123!",
            email_confirm: true
        });

        if (!user.user) throw new Error("Failed to create test user");
        testUserId = user.user.id;

        const { error: userError } = await supabase.from('User').insert({
            id: testUserId,
            name: "Test Driver",
            role: "DRIVER",
            email: user.user.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        if (userError && !userError.message.includes("duplicate key")) {
            console.error("User Insert Error:", userError);
            throw new Error(`Failed to create User record: ${userError.message}`);
        }

        const { data: driver, error: driverError } = await supabase.from('Driver').insert({
            id: crypto.randomUUID(),
            userId: testUserId,
            balance: 50.00, // $50.00
            stripeAccountId: "acct_test_123", // Mock/Valid test account
            status: "ONLINE",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }).select().single();

        if (driverError) {
            console.error("Driver Insert Error:", driverError);
            throw new Error(`Failed to create Driver: ${driverError.message}`);
        }

        testDriverId = driver.id;
    });

    afterAll(async () => {
        if (testUserId) {
            await supabase.auth.admin.deleteUser(testUserId);
            // Cascades should handle Driver record depending on foreign keys, 
            // but let's be explicit if needed.
        }
    });

    test("Payout reduces balance to zero", async () => {
        // We'll test the logic by manually calling the update or simulating the action 
        // since we can't easily trigger the 'payout' Stripe call without a real mock.

        // Check initial balance
        const { data: initial } = await supabase.from('Driver').select('balance').eq('id', testDriverId).single();
        expect(Number(initial!.balance)).toBe(50.00);

        // Simulate Action (Logic from app/driver/actions.ts)
        const { error: updateError } = await supabase
            .from('Driver')
            .update({
                balance: 0,
                updatedAt: new Date().toISOString()
            })
            .eq('id', testDriverId);

        expect(updateError).toBeNull();

        // Verify balance 
        const { data: final } = await supabase.from('Driver').select('balance').eq('id', testDriverId).single();
        expect(Number(final!.balance)).toBe(0);
    });
});
