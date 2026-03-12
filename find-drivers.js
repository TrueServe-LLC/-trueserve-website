require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const userId = "a18a0115-5238-4e82-a2e1-0020e2c40ba1";
    console.log('Checking records for userId:', userId);

    const { data: user, error: userError } = await supabase.from('User').select('*').eq('id', userId).maybeSingle();
    console.log('User Record:', JSON.stringify(user, null, 2));

    const { data: driver, error: driverError } = await supabase.from('Driver').select('*').eq('userId', userId).maybeSingle();
    console.log('Driver Record:', JSON.stringify(driver, null, 2));
}
check();
