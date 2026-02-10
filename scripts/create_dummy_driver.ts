
import { createClient } from '@/lib/supabase/server' // use server client? no, script runs in node
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

import { v4 as uuidv4 } from 'uuid'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service key to bypass email checks if needed, but signup should work

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables (URL or Service Key)')
    process.exit(1)
}

const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function seed() {
    console.log('Starting seed...')

    // 1. Create Driver User
    console.log('Creating Driver User...')
    const email = `driver${Math.floor(Math.random() * 10000)}@example.com` // specific domain just in case
    const password = 'password123'

    console.log(`Attempting to create user: ${email}`)

    // Create Supabase Auth User with Admin API to verify email immediately if needed
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
            role: 'DRIVER',
            name: 'Test Driver'
        }
    })

    if (authError) {
        console.error('Error creating auth user:', authError)
        return
    }

    if (!authUser.user) {
        console.error('Auth user created but no user object returned')
        return
    }

    console.log(`Driver Auth User created: ${authUser.user.email}`)

    // 2. Create Public User Record
    const { error: driverUserError } = await supabase
        .from('User')
        .upsert({
            id: authUser.user.id,
            email: email,
            name: 'Test Driver',
            role: 'DRIVER',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        })


    if (driverUserError) {
        console.error('Error creating public driver user:', driverUserError)
        return
    }
    console.log('Driver Public User created (or updated):', authUser.user.id)

    // 3. Create Driver Profile
    console.log('Creating Driver Profile...')
    const { data: driver, error: driverProfileError } = await supabase
        .from('Driver')
        .upsert({
            id: uuidv4(),
            userId: authUser.user.id,
            status: 'ONLINE',
            vehicleType: 'CAR',
            currentLat: 35.2271,
            currentLng: -80.8431,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        }, { onConflict: 'userId' })
        .select()
        .single()

    if (driverProfileError) {
        console.error('Error creating driver profile:', driverProfileError)
    } else {
        console.log('Driver Profile created:', driver.id)
    }

    console.log('\n--- LOGIN CREDENTIALS ---')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log('-------------------------')

}

seed()
