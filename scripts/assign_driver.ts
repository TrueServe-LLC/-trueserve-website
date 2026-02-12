
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function assignDriver() {
    console.log('Finding a pending order...');

    // 1. Find a Pending Order
    const { data: order, error: orderError } = await supabase
        .from('Order')
        .select('*')
        .is('driverId', null)
        .neq('status', 'DELIVERED')
        .neq('status', 'COMPLETED')
        .order('createdAt', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (orderError) {
        console.error('Error fetching order:', orderError);
        return;
    }

    if (!order) {
        console.log('No pending orders found.');
        return;
    }

    console.log(`Found Order: ${order.id} (Status: ${order.status})`);

    // 2. Find a Driver
    const { data: driver, error: driverError } = await supabase
        .from('Driver')
        .select('*')
        .limit(1)
        .maybeSingle();

    if (driverError || !driver) {
        console.error('Error fetching driver or no drivers exist:', driverError);
        return;
    }

    console.log(`Found Service Driver: ${driver.id}`);

    // 3. Assign Driver & Set Status
    const { error: updateError } = await supabase
        .from('Order')
        .update({
            driverId: driver.id,
            status: 'OUT_FOR_DELIVERY'
        })
        .eq('id', order.id);

    if (updateError) {
        console.error('Failed to assign driver:', updateError);
    } else {
        console.log('SUCCESS: Driver assigned and order set to OUT_FOR_DELIVERY.');
    }
}

assignDriver();
