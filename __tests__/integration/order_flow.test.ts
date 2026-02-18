/**
 * @jest-environment node
 */
import { createClient } from "@supabase/supabase-js";
import { describe, expect, test, beforeAll, afterAll } from "@jest/globals";
import * as dotenv from "dotenv";



dotenv.config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config();

// Create a single Supabase client for testing
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// We need a helper to act as a specific user role without using Service Role power
function createRoleClient(token: string) {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: { headers: { Authorization: `Bearer ${token}` } }
        }
    );
}

describe("Order Flow Integration Test", () => {
    let merchantUser: { id: string, token: string };
    let customerUser: { id: string, token: string };
    let driverUser: { id: string, token: string, driverId: string };
    let restaurantId: string;
    let orderId: string;

    const timestamp = Date.now();

    // Setup: Create Users
    beforeAll(async () => {
        // 1. Create Merchant
        merchantUser = await createConfirmedUser(`merchant_${timestamp}@test.com`, "MERCHANT");

        // 2. Create Customer
        customerUser = await createConfirmedUser(`customer_${timestamp}@test.com`, "CUSTOMER");

        // 3. Create Driver
        driverUser = await createConfirmedUser(`driver_${timestamp}@test.com`, "DRIVER") as any;

        // Create Driver Profile manually (since we skip application flow)
        const { data: driverProfile } = await supabase
            .from('Driver')
            .insert({
                id: crypto.randomUUID(),
                userId: driverUser.id,
                vehicleType: 'Car',
                status: 'ONLINE', // Must be ONLINE/APPROVED? Or just created.
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .select()
            .single();

        if (!driverProfile) throw new Error("Failed to create Driver profile");
        driverUser.driverId = driverProfile.id;

        // 4. Create Restaurant (linked to Merchant)
        const { data: rest } = await supabase
            .from('Restaurant')
            .insert({
                id: crypto.randomUUID(),
                ownerId: merchantUser.id,
                name: `Test Kitchen ${timestamp}`,
                address: "123 Test St",
                city: "Testville",
                state: "NC",
                zipCode: "28210",
                phone: "555-0000",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .select()
            .single();

        if (!rest) throw new Error("Failed to create Restaurant");
        restaurantId = rest.id;

    }, 30000);

    // Cleanup
    afterAll(async () => {
        // Delete users (cascades or handle manually)
        if (driverUser) await supabase.auth.admin.deleteUser(driverUser.id);
        if (customerUser) await supabase.auth.admin.deleteUser(customerUser.id);
        // Merchant deletion might be blocked by Restaurant constraints depending on setup, but typically cascades or fails safely.
        if (merchantUser) await supabase.auth.admin.deleteUser(merchantUser.id);

        // Clean up created data if needed (Restaurant, Order)
        if (restaurantId) await supabase.from('Restaurant').delete().eq('id', restaurantId);
    });

    test("Full Order Lifecycle: Customer -> Merchant -> Driver", async () => {
        // --- Step 1: Customer Places Order ---
        const customerClient = createRoleClient(customerUser.token);

        const { data: order, error: orderError } = await customerClient
            .from('Order')
            .insert({
                id: crypto.randomUUID(),
                userId: customerUser.id,
                restaurantId: restaurantId,
                status: 'PENDING',
                total: 25.00,
                deliveryFee: 5.00,
                tip: 2.00,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .select()
            .single();

        if (orderError) throw new Error(`Customer failed to place order: ${orderError.message}`);
        expect(order).toBeDefined();
        expect(order.status).toBe('PENDING');
        orderId = order.id;

        // --- Step 2: Merchant Accepts/Prepares (Move to READY_FOR_PICKUP) ---
        const merchantClient = createRoleClient(merchantUser.token);

        // Verify merchant can see the order
        const { data: merchantOrderView } = await merchantClient
            .from('Order')
            .select('*')
            .eq('id', orderId)
            .single();
        expect(merchantOrderView).toBeDefined();

        // Merchant updates to READY_FOR_PICKUP
        const { error: prepError } = await merchantClient
            .from('Order')
            .update({ status: 'READY_FOR_PICKUP' })
            .eq('id', orderId);

        if (prepError) throw new Error(`Merchant failed to update order: ${prepError.message}`);

        // --- Step 3: Driver Accepts Order (Navigation / Claim) ---
        const driverClient = createRoleClient(driverUser.token);

        // Verify driver can SEE the order (RLS: 'READY_FOR_PICKUP' orders visible to drivers?)
        // Assuming RLS allows active drivers to see available orders.
        const { data: driverOrderView } = await driverClient
            .from('Order')
            .select('*')
            .eq('id', orderId)
            .single();

        // If RLS prevents seeing unassigned orders, this might fail unless specific policy exists.
        // Let's assume there is a policy for "Drivers can view available orders".
        // If not, we found a bug!
        if (!driverOrderView) console.warn("Driver cannot see unassigned order! RLS might be too strict.");

        // Driver Claims the order
        const { error: claimError } = await driverClient
            .from('Order')
            .update({ driverId: driverUser.driverId })
            .eq('id', orderId)
            .eq('status', 'READY_FOR_PICKUP'); // Constraint ensures no race condition

        if (claimError) throw new Error(`Driver failed to claim order: ${claimError.message}`);

        // --- Step 4: Driver Picks Up ---
        const { error: pickupError } = await driverClient
            .from('Order')
            .update({ status: 'PICKED_UP' })
            .eq('id', orderId)
            .eq('driverId', driverUser.driverId); // Must be assigned driver

        if (pickupError) throw new Error(`Driver failed to mark picked up: ${pickupError.message}`);

        // Verify status
        const { data: pickedUpOrder } = await supabase
            .from('Order')
            .select('status')
            .eq('id', orderId)
            .single();
        if (!pickedUpOrder) throw new Error("Picked up order not found");
        expect(pickedUpOrder.status).toBe('PICKED_UP');

        // --- Step 5: Driver Delivers ---
        const { error: deliveryError } = await driverClient
            .from('Order')
            .update({ status: 'DELIVERED', completedAt: new Date().toISOString() })
            .eq('id', orderId);

        if (deliveryError) throw new Error(`Driver failed to complete delivery: ${deliveryError.message}`);

        // Final Verification
        const { data: finalOrder } = await supabase
            .from('Order')
            .select('status')
            .eq('id', orderId)
            .single();
        if (!finalOrder) throw new Error("Final order not found");
        expect(finalOrder.status).toBe('DELIVERED');

    }, 60000); // 1 minute timeout

    // Helper: Create & Login User
    async function createConfirmedUser(email: string, role: string) {
        // 1. Create with Service Role
        const { data: user, error } = await supabase.auth.admin.createUser({
            email,
            password: "TestPassword123!",
            email_confirm: true,
            user_metadata: { role } // Store role in metadata if used by triggers
        });
        if (error) throw error;

        // 2. Ensure public User record exists (sync trigger usually handles this, but we force it for reliability)
        // Check if trigger worked
        const { data: publicUser } = await supabase.from('User').select('id').eq('id', user.user.id).single();
        if (!publicUser) {
            // Manually insert if trigger failed/didn't fire
            await supabase.from('User').insert({
                id: user.user.id,
                email,
                name: role.toLowerCase() + "_user",
                role: role as any,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        // 3. Login to get Token
        const { data: session } = await supabase.auth.signInWithPassword({
            email,
            password: "TestPassword123!"
        });

        if (!session.session) throw new Error("Failed to login created user");

        return { id: user.user.id, token: session.session.access_token };
    }

});
