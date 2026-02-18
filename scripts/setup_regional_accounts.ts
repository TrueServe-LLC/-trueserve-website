
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const TEST_PHONE = '2147628569';

const LOCATIONS = [
    { city: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431, prefix: 'charlotte' },
    { city: 'Pineville', state: 'NC', lat: 35.0833, lng: -80.8872, prefix: 'pineville' },
    { city: 'Rock Hill', state: 'SC', lat: 34.9249, lng: -81.0251, prefix: 'rockhill' }
];

async function setupRegionalAccounts() {
    console.log('🚀 Setting up regional test accounts for Charlotte, Pineville, and Rock Hill...');

    const { data: { users: allUsers } } = await supabase.auth.admin.listUsers();

    for (const loc of LOCATIONS) {
        console.log(`\n📍 Processing Region: ${loc.city}...`);

        // --- 1. MERCHANT SETUPS ---
        const mEmail = `merchant.${loc.prefix}@demo.test`;
        console.log(`Setting up Merchant: ${mEmail}`);

        const existingM = allUsers.find(u => u.email === mEmail);
        let mId = existingM?.id;

        if (!mId) {
            const { data: newUser } = await supabase.auth.admin.createUser({
                email: mEmail,
                password: 'password123',
                email_confirm: true,
                user_metadata: { role: 'MERCHANT', name: `${loc.city} Kitchen` }
            });
            mId = newUser.user?.id;
        }

        if (mId) {
            await supabase.from('User').upsert({
                id: mId,
                email: mEmail,
                name: `${loc.city} Kitchen`,
                role: 'MERCHANT',
                updatedAt: new Date().toISOString()
            });

            // Create/Link Restaurant
            // Need to check if a restaurant for this owner already exists to preserve ID
            const { data: existingRest } = await supabase.from('Restaurant').select('id').eq('ownerId', mId).maybeSingle();

            const { error: restErr } = await supabase.from('Restaurant').upsert({
                id: existingRest?.id || crypto.randomUUID(),
                name: `${loc.city} Local Grill`,
                ownerId: mId,
                address: `123 ${loc.city} Main St`,
                city: loc.city,
                state: loc.state,
                lat: loc.lat,
                lng: loc.lng,
                imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9',
                updatedAt: new Date().toISOString()
            }, { onConflict: 'ownerId' });
            if (restErr) console.error(`Error with ${loc.city} Restaurant:`, restErr);
        }

        // --- 2. DRIVER SETUPS ---
        const dEmail = `driver.${loc.prefix}@demo.test`;
        console.log(`Setting up Driver: ${dEmail}`);

        const existingD = allUsers.find(u => u.email === dEmail);
        let dId = existingD?.id;

        if (!dId) {
            const { data: newUser } = await supabase.auth.admin.createUser({
                email: dEmail,
                password: 'password123',
                email_confirm: true,
                phone: TEST_PHONE,
                user_metadata: { role: 'DRIVER', name: `${loc.city} Driver`, phone: TEST_PHONE }
            });
            dId = newUser.user?.id;
        } else {
            // Update existing user with phone
            await supabase.auth.admin.updateUserById(dId, { phone: TEST_PHONE, user_metadata: { phone: TEST_PHONE } });
        }

        if (dId) {
            await supabase.from('User').upsert({
                id: dId,
                email: dEmail,
                name: `${loc.city} Driver`,
                role: 'DRIVER',
                updatedAt: new Date().toISOString()
            });

            await supabase.from('Driver').upsert({
                userId: dId,
                status: 'ONLINE',
                vehicleType: 'CAR',
                currentLat: loc.lat,
                currentLng: loc.lng,
                updatedAt: new Date().toISOString()
            }, { onConflict: 'userId' });
        }
    }

    console.log('\n✨ ALL REGIONAL ACCOUNTS READY');
    console.log('---------------------------------------------------------');
    console.log('CHARLOTTE: merchant.charlotte@demo.test / password123');
    console.log('PINEVILLE: merchant.pineville@demo.test / password123');
    console.log('ROCK HILL: merchant.rockhill@demo.test  / password123');
    console.log('---------------------------------------------------------');
    console.log('Drivers follow the same pattern (driver.city@demo.test)');
    console.log('---------------------------------------------------------');
}

setupRegionalAccounts();
