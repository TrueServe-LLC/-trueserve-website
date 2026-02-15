
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function checkColumns() {
    console.log('--- Order ---');
    const { data: orders, error } = await supabase
        .from('Order')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching Order:', error);
    } else {
        console.log('Order data keys:', orders && orders[0] ? Object.keys(orders[0]) : 'No data');
        if (orders && orders[0]) console.log('Sample Order:', JSON.stringify(orders[0], null, 2));
    }

    console.log('\n--- Restaurant ---');
    const { data: restaurants, error: rError } = await supabase
        .from('Restaurant')
        .select('*')
        .limit(1);

    if (rError) {
        console.error('Error fetching Restaurant:', rError);
    } else {
        console.log('Restaurant data keys:', restaurants && restaurants[0] ? Object.keys(restaurants[0]) : 'No data');
        if (restaurants && restaurants[0]) console.log('Sample Restaurant:', JSON.stringify(restaurants[0], null, 2));
    }
}

checkColumns()
