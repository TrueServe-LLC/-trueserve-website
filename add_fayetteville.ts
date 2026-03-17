
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: '/Users/lcking992/Documents/-trueserve-website/.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addFayetteville() {
    console.log('Adding Fayetteville to ServiceLocation table...')

    const serviceLocation = {
        city: 'Fayetteville',
        state: 'NC',
        isActive: true,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
    }

    const { data, error } = await supabase
        .from('ServiceLocation')
        .upsert(serviceLocation, { onConflict: 'city,state' })
        .select()

    if (error) {
        console.error('Error adding Fayetteville:', error)
        process.exit(1)
    }

    console.log('Successfully added Fayetteville:', data)
}

addFayetteville()
