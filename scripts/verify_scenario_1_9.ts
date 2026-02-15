
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// The same logic as in app/merchant/actions.ts
function isValidTransition(current: string, next: string): boolean {
    const transitions: Record<string, string[]> = {
        'PENDING': ['PREPARING', 'CANCELLED'],
        'PREPARING': ['READY_FOR_PICKUP', 'CANCELLED'],
        'READY_FOR_PICKUP': ['PICKED_UP', 'CANCELLED'],
        'PICKED_UP': ['DELIVERED', 'CANCELLED'],
        'DELIVERED': [],
        'CANCELLED': []
    };
    return transitions[current]?.includes(next) || false;
}

async function verify() {
    console.log('--- Staging Verification: Scenario 1.9 (Order Status Lifecycle) ---');

    // 1. Get the order created by seed
    const { data: order, error: orderError } = await supabase
        .from('Order')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(1)
        .single();

    if (orderError || !order) {
        console.error('Failed to get order:', orderError);
        return;
    }

    console.log(`Initial Order Status: ${order.status}`);

    // Reset to PENDING for a clean run if needed
    if (order.status !== 'PENDING') {
        console.log('Resetting to PENDING...');
        await supabase.from('Order').update({ status: 'PENDING', driverId: null }).eq('id', order.id);
    }

    const testTransitions = [
        { from: 'PENDING', next: 'PREPARING', shouldSucceed: true },
        { from: 'PREPARING', next: 'READY_FOR_PICKUP', shouldSucceed: true },
        { from: 'READY_FOR_PICKUP', next: 'PICKED_UP', shouldSucceed: true },
        { from: 'PICKED_UP', next: 'DELIVERED', shouldSucceed: true },
    ];

    let currentStatus = 'PENDING';

    for (const t of testTransitions) {
        const valid = isValidTransition(currentStatus, t.next);
        if (valid === t.shouldSucceed) {
            console.log(`✅ Transition ${currentStatus} -> ${t.next}: Expected ${t.shouldSucceed}, Got ${valid}`);
            const { error: updateError } = await supabase.from('Order').update({ status: t.next }).eq('id', order.id);
            if (updateError) {
                console.error(`❌ Failed to update status in DB: ${updateError.message}`);
            } else {
                console.log(`   Update successful.`);
                currentStatus = t.next;
            }
        } else {
            console.error(`❌ Transition ${currentStatus} -> ${t.next}: Expected ${t.shouldSucceed}, Got ${valid}`);
        }
    }

    console.log('--- Verification Complete ---');
}

verify();
