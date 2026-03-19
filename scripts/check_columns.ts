
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkColumns() {
    console.log("Checking Driver and Restaurant columns...")
    const { data: driverSample, error: dError } = await supabase.from('Driver').select('*').limit(1);
    const { data: restSample, error: rError } = await supabase.from('Restaurant').select('*').limit(1);
    
    if (dError) console.error("Driver Table Error:", dError.message);
    else console.log("Driver Columns:", Object.keys(driverSample?.[0] || {}));
    
    if (rError) console.error("Restaurant Table Error:", rError.message);
    else console.log("Restaurant Columns:", Object.keys(restSample?.[0] || {}));
}

checkColumns()
