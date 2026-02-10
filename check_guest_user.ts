
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing keys");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkGuest() {
    console.log("Checking Guest User...");
    const GUEST_ID = '20a8a062-6f89-4582-8559-2a8131e0bb39';

    const { data: user, error } = await supabase.from('User').select('*').eq('id', GUEST_ID).maybeSingle();

    if (error) {
        console.error("Error fetching guest:", error);
        return;
    }

    if (user) {
        console.log("Guest User Found:", user.email);
    } else {
        console.log("Guest User NOT Found. Creating...");
        const { error: createError } = await supabase.from('User').insert({
            id: GUEST_ID,
            email: 'guest@trueserve.test',
            name: 'Guest User',
            role: 'CUSTOMER',
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        });

        if (createError) {
            console.error("Failed to create guest user:", createError);
        } else {
            console.log("Guest User Created Successfully.");
        }
    }
}

checkGuest();
