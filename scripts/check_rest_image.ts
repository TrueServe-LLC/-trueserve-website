
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
    const { data, error } = await supabase
        .from('Restaurant')
        .select('name, imageUrl')
        .eq('name', "Dhan's Kitchen")
        .single()
    
    if (error) {
        console.error('Check failed:', error.message)
    } else {
        console.log(`Restaurant: ${data.name}`)
        console.log(`Image URL: ${data.imageUrl}`)
    }
}

check()
