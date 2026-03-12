require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
    // List tables using a common Supabase trick if possible, or just try lowercase
    const { data: users, error: userError } = await supabase.from('user').select('*').limit(5);
    if (userError) console.error('user (lower) error:', userError.message);
    else console.log('user (lower):', JSON.stringify(users, null, 2));

    const { data: Users, error: UsersError } = await supabase.from('User').select('*').limit(5);
    if (UsersError) console.error('User (Upper) error:', UsersError.message);
    else console.log('User (Upper):', JSON.stringify(Users, null, 2));
}
check();
