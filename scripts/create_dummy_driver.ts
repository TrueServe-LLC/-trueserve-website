
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

dotenv.config({ path: '.env.local' }) // Next.js specific env file location usually
// Fallback to .env
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables (URL or Service Key)')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function seed() {
    console.log('Starting seed...')

    const email = 'driver@demo.test'
    const password = 'password123'
    let userId = '';

    console.log(`Checking/Creating user: ${email}`)

    // 1. Create or Get Auth User
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { role: 'DRIVER', name: 'Demo Driver' }
    })

    if (createError) {
        if (createError.message.includes('already registered')) {
            console.log('User already exists, fetching ID...')
            // Fetch user ID by email (Admin function needed usually, or listUsers)
            const { data: { users } } = await supabase.auth.admin.listUsers()
            const existingUser = users.find(u => u.email === email)
            if (existingUser) {
                userId = existingUser.id
                // Update password to be sure
                await supabase.auth.admin.updateUserById(userId, { password: password })
                console.log('Password updated.')
            } else {
                console.error("Could not find existing user ID despite 'already registered' error.")
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
            name: 'Demo Driver',
            role: 'DRIVER',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        })

    if (publicUserError) console.error('Error upserting User record:', publicUserError)
    else console.log('Public User record upserted.')

    // 3. Upsert Driver Record
    // Check if driver exists to keep ID stable if possible, or just upsert on userId
    const { data: existingDriver } = await supabase.from('Driver').select('id').eq('userId', userId).maybeSingle()

    const driverId = existingDriver?.id || uuidv4()

    const { error: driverError } = await supabase
        .from('Driver')
        .upsert({
            id: driverId,
            userId: userId,
            status: 'ONLINE',
            vehicleType: 'CAR',
            currentLat: 35.2271,
            currentLng: -80.8431,
            updatedAt: new Date().toISOString(),
            createdAt: existingDriver ? undefined : new Date().toISOString() // only set createdAt on insert
        })

    if (driverError) console.error('Error upserting Driver profile:', driverError)
    else console.log('Driver Profile upserted.')

    console.log('\n--- LOGIN CREDENTIALS ---')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log('-------------------------')
}

seed()
