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
  const email = 'lcking992@gmail.com';
  console.log(`Checking status for ${email}...`);

  const { data: user, error } = await supabaseAdmin
    .from('User')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user:', error.message);
    return;
  }

  if (!user) {
    console.log(`User ${email} not found in public.User table.`);
    // Let's also check Auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = authUsers?.users.find(u => u.email === email);
    if (authUser) {
      console.log(`User exists in Auth (ID: ${authUser.id}) but is missing from public.User table.`);
    } else {
      console.log(`User not found in Supabase Auth either.`);
    }
  } else {
    console.log('User found in database:', JSON.stringify(user, null, 2));
  }
}

run();
