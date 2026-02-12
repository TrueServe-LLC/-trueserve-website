
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createMerchant() {
    console.log('🚀 Creating dummy merchant...')

    const email = 'merchant@trueserve.test'
    const password = 'Password123!'
    const name = 'Charlotte Eats'

    // 1. Create User in Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role: 'MERCHANT' }
    })

    if (authError) {
        if (authError.message.includes('already been registered')) {
            console.log('✔️ Merchant already exists in Auth.')
        } else {
            console.error('❌ Auth Error:', authError.message)
            return
        }
    }

    // Get ID (either new or existing)
    let userId = authUser?.user?.id
    if (!userId) {
        const { data: existingUser } = await supabase.from('User').select('id').eq('email', email).single()
        userId = existingUser?.id
    }

    if (!userId) {
        console.error('❌ Could not find or create User ID')
        return
    }

    // 2. Sync with Public User table
    const { error: dbError } = await supabase.from('User').upsert({
        id: userId,
        email,
        name,
        role: 'MERCHANT',
        updatedAt: new Date().toISOString()
    })

    if (dbError) {
        console.error('❌ public.User Error:', dbError.message)
        return
    }

    // 3. Create/Update Restaurant for this merchant
    const { data: existingRest } = await supabase.from('Restaurant').select('id').eq('ownerId', userId).maybeSingle()

    if (!existingRest) {
        console.log('🍟 Creating restaurant for merchant...')
        const { error: restError } = await supabase.from('Restaurant').insert({
            id: uuidv4(),
            name,
            address: '101 S Tryon St, Charlotte, NC 28280',
            ownerId: userId,
            city: 'Charlotte',
            state: 'NC',
            lat: 35.2271,
            lng: -80.8431,
            description: 'Gourmet local cuisine for testing.',
            imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop',
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        })
        if (restError) console.error('❌ Restaurant Error:', restError.message)
    }

    console.log('\n✅ Success! You can now log in.')
    console.log('-----------------------------------')
    console.log(`Email:    ${email}`)
    console.log(`Password: ${password}`)
    console.log('-----------------------------------')
}

createMerchant()
