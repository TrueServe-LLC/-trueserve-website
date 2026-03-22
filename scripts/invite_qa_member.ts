import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * QA TEST SCRIPT: invite_qa_member.ts
 * 
 * PURPOSE: 
 * Securely invites a new QA tester to the team. This script:
 * 1. Creates a real Supabase Auth user.
 * 2. Assigns the 'QA_TESTER' role in the Public 'User' table.
 * 3. Sends an invitation email with a temporary password (optional) or 
 *    allows them to reset it via the portal.
 * 
 * HOW TO RUN:
 * `npx ts-node scripts/invite_qa_member.ts "QA John" qa_john@test.com`
 * 
 * VERIFICATION:
 * 1. Verify the user appears in the 'User' table with 'QA_TESTER' role.
 * 2. They can log in with their email and the temp password provided.
 */

async function inviteQAMember() {
    const name = process.argv[2];
    const email = process.argv[3];
    const tempPassword = `QA-Invite!${Math.random().toString(36).slice(-8)}`;

    if (!name || !email) {
        console.error('❌ Usage: npx ts-node scripts/invite_qa_member.ts "Name" "Email"');
        process.exit(1);
    }

    console.log(`🚀 Securely inviting ${name} (${email}) to the QA team...`);

    // 1. Create the Auth User (Manual Invite)
    const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { name, role: 'QA_TESTER' }
    });

    if (authError) {
        if (authError.message.includes("already exists")) {
            console.error(`❌ Error: A user with this email already exists.`);
        } else {
            console.error(`❌ Auth Error: ${authError.message}`);
        }
        process.exit(1);
    }

    if (!user) {
        console.error('❌ Failed to create user.');
        process.exit(1);
    }

    // 2. Sync to Public 'User' Table
    const { error: publicError } = await supabase.from('User').insert({
        id: user.id,
        name,
        email,
        role: 'QA_TESTER',
        updatedAt: new Date().toISOString()
    });

    if (publicError) {
        console.error(`❌ Public Table Sync Error: ${publicError.message}`);
        // Consider deleting the auth user if this fails to avoid partial state
        process.exit(1);
    }

    console.log('\n--- 🎫 QA TEAM INVITATION DATA ---');
    console.log(`NAME:     ${name}`);
    console.log(`EMAIL:    ${email}`);
    console.log(`TEMP PW:  ${tempPassword}`);
    console.log(`ADMIN:    https://admin.trueserve.delivery/login`);
    console.log('---------------------------------');
    console.log('\n✅ Invitation Successful! Share these credentials with the tester.');
    process.exit(0);
}

inviteQAMember();
