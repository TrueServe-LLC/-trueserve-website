
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

async function checkUserTable() {
    console.log("Checking User table columns...")
    const { data: userSample } = await supabase.from('User').select('*').limit(1);
    console.log("User Columns:", Object.keys(userSample?.[0] || {}));
    
    // Check type of 'id' by checking if it's a UUID format or general string
    if (userSample && userSample[0]) {
        const id = userSample[0].id;
        console.log("Sample ID:", id, "Type:", typeof id);
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        console.log("Is UUID Format:", isUUID);
    }
}

checkUserTable()
