import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * QA TEST SCRIPT: set_qa_role.ts
 * 
 * PURPOSE: 
 * Upgrades a standard user account to have the 'QA_TESTER' role. 
 * This gives them access to the Admin Dashboard and the QA Toolbox 
 * without full 'ADMIN' privileges.
 * 
 * HOW TO RUN:
 * `npx ts-node scripts/set_qa_role.ts your_email@test.com`
 * 
 * VERIFICATION:
 * 1. Log in as that user on admin.trueserve.delivery.
 * 2. Confirm the 🛠️ QA Toolbox is visible but 'Pricing' and 'Settings' are hidden.
 */

async function setQARole() {
    const email = process.argv[2];
    
    if (!email) {
        console.error('❌ Please provide an email address.');
        process.exit(1);
    }

    console.log(`🚀 Upgrading ${email} to QA_TESTER role...`);

    const { data: user, error: findError } = await supabase
        .from('User')
        .select('id')
        .eq('email', email)
        .single();

    if (findError || !user) {
        console.error(`❌ User with email ${email} not found in the 'User' table.`);
        process.exit(1);
    }

    const { error: updateError } = await supabase
        .from('User')
        .update({ role: 'QA_TESTER' })
        .eq('id', user.id);

    if (updateError) {
        console.error(`❌ Failed to update role: ${updateError.message}`);
        process.exit(1);
    }

    // Sync Auth metadata if they have an auth account
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const authUser = users.find(u => u.email === email);
    
    if (authUser) {
        await supabase.auth.admin.updateUserById(authUser.id, {
            user_metadata: { ...authUser.user_metadata, role: 'QA_TESTER' }
        });
        console.log(`✅ Auth Metadata synced for: ${authUser.id}`);
    }

    console.log(`\n✨ SUCCESS! ${email} is now a QA_TESTER.`);
    process.exit(0);
}

setQARole();
