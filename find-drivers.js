require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data: users, error } = await supabase.from('User').select('id, name, email, phone, role').eq('role', 'DRIVER').limit(5);
    if (error) console.error(error);
    console.log('Drivers:', JSON.stringify(users, null, 2));
}
check();
