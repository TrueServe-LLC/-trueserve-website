
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

async function verify() {
    console.log("Verifying Dhan's Kitchen in database...")
    const { data, error } = await supabase
        .from('Restaurant')
        .select('id, name, city')
        .eq('name', "Dhan's Kitchen")
        .single()
    
    if (error) {
        console.error('Verify failed:', error.message)
    } else {
        console.log('✅ Found:', data)
        const { count } = await supabase.from('MenuItem').select('*', { count: 'exact', head: true }).eq('restaurantId', data.id)
        console.log(`✅ Menu Items: ${count}`)
    }
}

verify()
