
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function seedMerchant() {
    console.log('Starting Merchant Seed...')

    const email = 'merchant@demo.test'
    const password = 'password123'
    let userId = '';

    console.log(`Checking/Creating user: ${email}`)

    // 1. Create or Get Auth User
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { role: 'MERCHANT', name: 'Demo Merchant' }
    })

    if (createError) {
        if (createError.message.includes('already registered')) {
            console.log('User already exists, fetching ID...')
            const { data: { users } } = await supabase.auth.admin.listUsers()
            const existingUser = users.find(u => u.email === email)
            if (existingUser) {
                userId = existingUser.id
                await supabase.auth.admin.updateUserById(userId, { password: password })
                console.log('Password updated.')
            } else {
                console.error("Could not find existing user ID.")
                return;
            }
        } else {
            console.error('Error creating auth user:', createError)
            return
        }
    } else if (user) {
        userId = user.id
        console.log('Auth user created.')
    }

    if (!userId) {
        console.error('Failed to obtain User ID.')
        return
    }

    // 2. Upsert Public User Record
    const { error: publicUserError } = await supabase
        .from('User')
        .upsert({
            id: userId,
            email: email,
            name: 'Demo Merchant',
            role: 'MERCHANT',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        })

    if (publicUserError) console.error('Error upserting User record:', publicUserError)
    else console.log('Public User record upserted.')

    // 3. Link to "Costa Del Sol" Restaurant
    console.log('Linking to Costa Del Sol...')

    // Find Costa Del Sol
    const { data: restaurant } = await supabase.from('Restaurant')
        .select('id, name')
        .ilike('name', '%Costa Del Sol%')
        .maybeSingle()

    if (restaurant) {
        const { error: linkError } = await supabase
            .from('Restaurant')
            .update({ ownerId: userId })
            .eq('id', restaurant.id)

        if (linkError) console.error('Error linking restaurant:', linkError)
        else console.log(`Successfully linked "Costa Del Sol" (${restaurant.id}) to Merchant ${userId}`)
    } else {
        console.warn('Costa Del Sol not found. Creating a new Demo Restaurant...')
        // Create new if not found
        const { error: newRestError } = await supabase.from('Restaurant').insert({
            id: crypto.randomUUID(), // Node 18+ or uuid
            name: 'Demo Pizza',
            address: '123 Demo St',
            city: 'Charlotte',
            state: 'NC',
            ownerId: userId,
            lat: 35.2271,
            lng: -80.8431,
            description: 'Authentic Demo Pizza',
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        })
        if (newRestError) console.error('Error creating Demo Pizza:', newRestError)
        else console.log('Created "Demo Pizza" for merchant.')
    }

    console.log('\n--- MERCHANT LOGIN CREDENTIALS ---')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log('----------------------------------')
}

seedMerchant()
