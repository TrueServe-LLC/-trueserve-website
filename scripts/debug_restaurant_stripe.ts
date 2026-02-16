
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function check() {
    const { data: restaurants, error } = await supabase
        .from('Restaurant')
        .select('id, name, stripeAccountId')
        .limit(10)

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Restaurants and Stripe IDs:')
        restaurants.forEach(r => {
            console.log(`- ${r.name}: ${r.stripeAccountId || 'NONE'}`)
        })
    }
}

check()
