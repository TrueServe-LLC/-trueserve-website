
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

async function check() {
    console.log("Checking Menu Items for Dhan's Kitchen...")
    const { data: rest } = await supabase.from('Restaurant').select('id').eq('name', "Dhan's Kitchen").single()
    
    if (rest) {
        const { data: items } = await supabase
            .from('MenuItem')
            .select('name, imageUrl')
            .eq('restaurantId', rest.id)
            .limit(5)
            
        console.log('Items:', items)
    }
}

check()
