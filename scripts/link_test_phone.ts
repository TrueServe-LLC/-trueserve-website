
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const TEST_PHONE = '2147628569';
const EMAILS = [
    'driver.charlotte@demo.test',
    'driver.pineville@demo.test',
    'driver.rockhill@demo.test',
    'driver@demo.test'
];

async function updateTestPhone() {
    console.log(`🚀 Linking test phone ${TEST_PHONE} to dummy driver accounts...`);

    for (const email of EMAILS) {
        const { error } = await supabase
            .from('User')
            .update({ phone: TEST_PHONE })
            .eq('email', email);

        if (error) {
            console.error(`❌ Failed to update ${email}:`, error.message);
        } else {
            console.log(`✅ Updated ${email}`);
        }
    }

    console.log('\n✨ DONE! All regional drivers will now send SMS alerts to:', TEST_PHONE);
}

updateTestPhone();
