
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

async function checkOrders() {
    console.log("Checking Order table columns...")
    const { data: orderSample, error } = await supabase.from('Order').select('*').limit(1);
    
    if (error) {
        console.error("Order Table Error:", error.message);
        // Try camelCase if PascalCase fails
        const { data: orderSample2, error: error2 } = await supabase.from('order').select('*').limit(1);
        if (error2) console.error("order Table Error:", error2.message);
        else console.log("Order Columns:", Object.keys(orderSample2?.[0] || {}));
    } else {
        console.log("Order Columns:", Object.keys(orderSample?.[0] || {}));
    }
}

checkOrders()
