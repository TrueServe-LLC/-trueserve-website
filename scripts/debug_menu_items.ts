
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function check() {
    const { data, error } = await supabase.from('MenuItem').select('*').limit(1)
    if (error) {
        console.error('Error fetching MenuItem:', error)
    } else {
        console.log('MenuItem columns:', Object.keys(data[0] || {}))
        console.log('Sample item:', data[0])
    }

    const { data: countData } = await supabase.from('MenuItem').select('id', { count: 'exact' })
    console.log('Total MenuItems:', countData?.length)
}

check()
