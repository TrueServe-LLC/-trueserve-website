import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const users = [
    { email: 'dhanskitchen@trueserve.test', role: 'MERCHANT', password: 'TrueServeMerchant2026!' },
    { email: 'mockdriver@trueserve.test', role: 'DRIVER', password: 'TrueServeDriver2026!' },
    { email: 'lcking992@gmail.com', role: 'ADMIN', password: 'TrueServeAdmin2026!' }
  ];

  for (const user of users) {
    console.log(`Setting up ${user.role}: ${user.email}...`);

    // 1. Ensure user exists in Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true
    });

    if (authError && !authError.message.includes('already exists')) {
      console.error(`Auth Error for ${user.email}:`, authError.message);
      continue;
    }

    // 2. Fetch User ID
    const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
    const foundUser = userData.users.find(u => u.email === user.email);
    if (!foundUser) {
        console.error(`Could not find user ${user.email} after Auth setup.`);
        continue;
    }

    // 3. Update Password (in case they already existed with a different one)
    await supabaseAdmin.auth.admin.updateUserById(foundUser.id, { password: user.password });

    // 4. Upsert into public.User
    await supabaseAdmin.from('User').upsert({
        id: foundUser.id,
        email: user.email,
        name: user.email.split('@')[0],
        role: user.role,
        updatedAt: new Date().toISOString()
    });

    // 5. If it's a driver, make sure there's a Driver row
    if (user.role === 'DRIVER') {
        await supabaseAdmin.from('Driver').upsert({
            userId: foundUser.id,
            status: 'OFFLINE',
            vehicleVerified: true,
            firstName: 'Master',
            lastName: 'Driver',
            phoneIndex: '+15551234567',
            updatedAt: new Date().toISOString()
        }, { onConflict: 'userId' });
    }

    console.log(`Successfully set up ${user.email} ✅`);
  }
}

run();
