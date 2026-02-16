
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

    console.log('\n--- Driver ---');
    const { data: drivers, error: dError } = await supabase
        .from('Driver')
        .select('*')
        .limit(1);

    if (dError) {
        console.error('Error fetching Driver:', dError);
    } else {
        console.log('Driver data keys:', drivers && drivers[0] ? Object.keys(drivers[0]) : 'No data');
        if (drivers && drivers[0]) console.log('Sample Driver:', JSON.stringify(drivers[0], null, 2));
    }
}

checkColumns()
