
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

/**
 * QA TEST SCRIPT: simulate_pickup_flow.ts
 * 
 * PURPOSE: 
 * This script dry-runs a full merchant/driver order cycle using existing DB 
 * records or creating a temporary one. This is crucial for verifying real-time 
 * websocket updates on the live delivery dashboard without real food!
 * 
 * HOW TO RUN:
 * `npx ts-node scripts/simulate_pickup_flow.ts`
 * 
 * VERIFICATION:
 * 1. Open http://localhost:3000/admin/dashboard (or admin.trueservedelivery.com)
 * 2. Run the script and observe the "Live Delivery Monitor" UI update as transitions occur.
 * 3. Verify order status ends in "PICKED_UP".
 */
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function simulatePickupFlow() {
    console.log('🚀 Starting Order Pickup Simulation...');

    // 1. Find or Create a Driver
    let { data: driver } = await supabase.from('Driver').select('id').limit(1).maybeSingle();
    if (!driver) {
        console.log('No driver found, please ensure you have at least one driver in the DB.');
        return;
    }
    console.log(`✅ Using Driver ID: ${driver.id}`);

    // 2. Find a PENDING order
    let { data: order } = await supabase
        .from('Order')
        .select('*')
        .eq('status', 'PENDING')
        .is('driverId', null)
        .order('createdAt', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!order) {
        console.log('No PENDING orders found. Creating a test order...');

        // Find a restaurant and user for the test order
        const { data: restaurant } = await supabase.from('Restaurant').select('id').limit(1).single();
        const { data: user } = await supabase.from('User').select('id').limit(1).single();

        if (!restaurant || !user) {
            console.error('Need at least one Restaurant and User in DB to create a test order.');
            return;
        }

        const newOrderId = uuidv4();
        const { error: insertError } = await supabase.from('Order').insert({
            id: newOrderId,
            userId: user.id,
            restaurantId: restaurant.id,
            total: 25.50,
            status: 'PENDING',
            deliveryAddress: '123 Pilot St, Charlotte, NC',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        if (insertError) {
            console.error('Failed to create test order:', insertError);
            return;
        }

        const { data: fetchedOrder } = await supabase.from('Order').select('*').eq('id', newOrderId).single();
        order = fetchedOrder;
        console.log(`📝 Created Test Order: ${order?.id}`);
    } else {
        console.log(`📦 Found Existing Order: ${order.id}`);
    }

    if (!order) return;

    // --- TRANSITION 1: MERCHANT ACCEPTS ---
    console.log('⏳ Transitioning: PENDING -> PREPARING (Merchant Accepts)');
    const { error: e1 } = await supabase.from('Order').update({
        status: 'PREPARING',
        updatedAt: new Date().toISOString()
    }).eq('id', order.id);
    if (e1) console.error('E1:', e1);
    await new Promise(r => setTimeout(r, 1000));

    // --- TRANSITION 2: MERCHANT FINISHES ---
    console.log('⏳ Transitioning: PREPARING -> READY_FOR_PICKUP (Merchant Finishes)');
    const { error: e2 } = await supabase.from('Order').update({
        status: 'READY_FOR_PICKUP',
        updatedAt: new Date().toISOString()
    }).eq('id', order.id);
    if (e2) console.error('E2:', e2);
    await new Promise(r => setTimeout(r, 1000));

    // --- TRANSITION 3: DRIVER ACCEPTS ---
    console.log(`⏳ Transitioning: ASSIGNING DRIVER ${driver.id}`);
    const { error: e3 } = await supabase.from('Order').update({
        driverId: driver.id,
        updatedAt: new Date().toISOString()
    }).eq('id', order.id);
    if (e3) console.error('E3:', e3);
    await new Promise(r => setTimeout(r, 1000));

    // --- TRANSITION 4: DRIVER PICKS UP ---
    console.log('⏳ Transitioning: READY_FOR_PICKUP -> PICKED_UP (Driver Arrived)');
    const { error: e4 } = await supabase.from('Order').update({
        status: 'PICKED_UP',
        updatedAt: new Date().toISOString()
    }).eq('id', order.id);
    if (e4) console.error('E4:', e4);

    console.log('✨ Simulation Complete! Order is now PICKED_UP.');
    console.log(`Order ID: ${order.id}`);
}

simulatePickupFlow();
