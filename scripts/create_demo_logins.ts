
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables in .env.local')
    process.exit(1)
}

/**
 * QA TEST SCRIPT: create_demo_logins.ts
 * 
 * PURPOSE: 
 * Generates valid Auth and Public user records for the Mount Airy 
 * pilot merchants. Use this if the demo accounts were deleted or 
 * if you need to reset merchant accessibility.
 * 
 * HOW TO RUN:
 * `npx ts-node scripts/create_demo_logins.ts`
 * 
 * VERIFICATION:
 * 1. Check the 'User' table in Supabase for merchant role accounts.
 * 2. Attempt login on the admin/merchant portal with: owner_13bones@trueserve.test / MountAiry2026!
 */
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const mountAiryRestaurants = [
    { name: "13 Bones", email: "owner_13bones@trueserve.test" },
    { name: "Snappy Lunch", email: "owner_snappylunch@trueserve.test" },
    { name: "Olympia Family Restaurant", email: "owner_olympiafamilyrestaurant@trueserve.test" },
    { name: "Little Richard's BBQ", email: "owner_littlerichardsbbq@trueserve.test" },
    { name: "Old North State Winery", email: "owner_oldnorthstatewinery@trueserve.test" },
    { name: "Barney's Cafe", email: "owner_barneyscafe@trueserve.test" }
];

async function createDemoAccounts() {
    console.log('--- MOUNT AIRY DEMO ACCOUNT GENERATION ---');
    const tempPassword = "MountAiry2026!";

    // 1. Create Restaurant Merchants
    for (const res of mountAiryRestaurants) {
        console.log(`Processing Merchant: ${res.name} (${res.email})...`);

        const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
            email: res.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { role: 'MERCHANT', name: `${res.name} Manager` }
        });

        if (createError) {
            if ((createError as any).code === 'email_exists') {
                console.log(`- User already exists, updating profile...`);
                // Find existing user ID
                const { data: { users } } = await supabase.auth.admin.listUsers();
                const existing = users.find(u => u.email === res.email);
                if (existing) {
                    await supabase.from('User').upsert({
                        id: existing.id,
                        email: res.email,
                        name: `${res.name} Manager`,
                        role: 'MERCHANT',
                        updatedAt: new Date().toISOString()
                    });
                    // Link restaurant
                    await supabase.from('Restaurant').update({ ownerId: existing.id }).eq('name', res.name);
                }
            } else {
                console.error(`- Error: ${createError.message}`);
            }
        } else if (user) {
            console.log(`- Created NEW Auth User: ${user.id}`);
            // Sync public table
            await supabase.from('User').upsert({
                id: user.id,
                email: res.email,
                name: `${res.name} Manager`,
                role: 'MERCHANT',
                updatedAt: new Date().toISOString()
            });
            // Update Restaurant ownerId
            await supabase.from('Restaurant').update({ ownerId: user.id }).eq('name', res.name);
        }
    }

    // 2. Create Demo Customer
    const customerEmail = "customer@demo.test";
    const customerPassword = "password123";
    console.log(`Processing Demo Customer: ${customerEmail}...`);

    const { data: { user: customerUser }, error: custError } = await supabase.auth.admin.createUser({
        email: customerEmail,
        password: customerPassword,
        email_confirm: true,
        user_metadata: { role: 'CUSTOMER', name: 'Andy Griffith (Demo)' }
    });

    if (!custError && customerUser) {
        await supabase.from('User').upsert({
            id: customerUser.id,
            email: customerEmail,
            name: 'Andy Griffith (Demo)',
            role: 'CUSTOMER',
            updatedAt: new Date().toISOString()
        });
        console.log(`- Created Demo Customer: ${customerUser.id}`);
    } else if (custError && (custError as any).code === 'email_exists') {
        console.log(`- Demo Customer already exists.`);
    }

    console.log('\n✅ ALL DEMO ACCOUNTS READY');
    process.exit(0);
}

createDemoAccounts();
