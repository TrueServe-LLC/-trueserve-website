
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function check() {
    const { data: drivers, error } = await supabase.from('Driver').select('id, userId, stripeAccountId')
    if (error) {
        console.error('Error fetching Drivers:', error)
    } else {
        console.log('Drivers:', drivers)
    }
}

check()
