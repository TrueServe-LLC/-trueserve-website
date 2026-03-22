
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * QA TEST SCRIPT: setup_test_accounts.ts
 * 
 * PURPOSE: 
 * This script initializes basic MERCHANT and DRIVER accounts to allow 
 * QA testing of the portals without manual database entry.
 * 
 * HOW TO RUN:
 * `npx ts-node scripts/setup_test_accounts.ts`
 * 
 * VERIFICATION:
 * 1. Confirm you can login to /login as merchant@demo.test
 * 2. Confirm you can login to /login as driver@demo.test (must be on driver.trueserve.delivery)
 * 3. Verify driver@demo.test appears as "ONLINE" in the admin dashboard.
 */
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function fixSeedScripts() {
    const roles = [
        { email: 'merchant@demo.test', role: 'MERCHANT', name: 'Demo Merchant' },
        { email: 'driver@demo.test', role: 'DRIVER', name: 'Demo Driver' }
    ];

    for (const data of roles) {
        console.log(`Processing ${data.email}...`);

        // 1. Create or Find User
        const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
            email: data.email,
            password: 'password123',
            email_confirm: true,
            user_metadata: { role: data.role, name: data.name }
        });

        let userId = user?.id;

        if (createError && (createError as any).code === 'email_exists') {
            console.log(`User ${data.email} already exists, fetching...`);
            const { data: { users } } = await supabase.auth.admin.listUsers();
            const existing = users.find(u => u.email === data.email);
            if (existing) userId = existing.id;
        }

        if (!userId) {
            console.error(`Could not get ID for ${data.email}`);
            continue;
        }

        // 2. Sync Public User Table
        console.log(`Syncing public table for ${data.email}...`);
        await supabase.from('User').upsert({
            id: userId,
            email: data.email,
            name: data.name,
            role: data.role,
            updatedAt: new Date().toISOString()
        });

        // 3. Role-Specific Logic
        if (data.role === 'MERCHANT') {
            const { data: restaurant } = await supabase.from('Restaurant').select('id').ilike('name', '%Costa Del Sol%').maybeSingle();
            if (restaurant) {
                await supabase.from('Restaurant').update({ ownerId: userId }).eq('id', restaurant.id);
                console.log(`Linked ${data.email} to Costa Del Sol.`);
            } else {
                await supabase.from('Restaurant').upsert({
                    id: crypto.randomUUID(),
                    name: 'Demo Pizza',
                    ownerId: userId,
                    address: '123 Demo St, Charlotte, NC',
                    lat: 35.2271,
                    lng: -80.8431,
                    city: 'Charlotte',
                    state: 'NC'
                });
                console.log(`Created Demo Pizza for ${data.email}.`);
            }
        }

        if (data.role === 'DRIVER') {
            await supabase.from('Driver').upsert({
                userId: userId,
                status: 'ONLINE',
                vehicleType: 'CAR',
                currentLat: 35.2271,
                currentLng: -80.8431,
                updatedAt: new Date().toISOString()
            }, { onConflict: 'userId' });
            console.log(`Driver profile ready for ${data.email}.`);
        }
    }

    console.log('\n✅ TEST ACCOUNTS READY');
    console.log('---------------------------');
    console.log('MERCHANT: merchant@demo.test / password123');
    console.log('DRIVER:   driver@demo.test   / password123');
    console.log('---------------------------');
}

fixSeedScripts();
