
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function detect() {
    console.log('--- Detecting OrderStatus Enum Values ---');

    // Create a dummy order to test updates on
    const orderId = uuidv4();
    const now = new Date().toISOString();

    // We need a restaurant and user ID to create an order. 
    // Let's grab existing ones.
    const { data: restaurant } = await supabase.from('Restaurant').select('id').limit(1).single();
    const { data: user } = await supabase.from('User').select('id').limit(1).single();

    if (!restaurant || !user) {
        console.error('Need at least one restaurant and one user in DB to test.');
        return;
    }

    console.log('Creating test order...');
    await supabase.from('Order').insert({
        id: orderId,
        userId: user.id,
        restaurantId: restaurant.id,
        status: 'PENDING',
        total: 0,
        posReference: 'ENUM-TEST',
        updatedAt: now,
        createdAt: now
    });

    const candidates = [
        'PENDING', 'ACCEPTED', 'CONFIRMED', 'ORDER_ACCEPTED', 'PREPARING',
        'READY', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY',
        'EN_ROUTE', 'ARRIVED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REJECTED'
    ];

    const validValues = [];

    for (const status of candidates) {
        const { error } = await supabase
            .from('Order')
            .update({ status })
            .eq('id', orderId);

        if (!error) {
            console.log(`✅ ${status} is VALID`);
            validValues.push(status);
        } else {
            console.log(`❌ ${status} is INVALID: ${error.message}`);
        }
    }

    console.log('\nSummary of Valid OrderStatus values:', validValues);

    // Cleanup
    await supabase.from('Order').delete().eq('id', orderId);
}

detect();
