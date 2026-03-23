const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * QA TEAM INVITATION SCRIPT (JavaScript Version)
 * 
 * PURPOSE: 
 * Securely invites a new QA tester to the team. This script:
 * 1. Creates a real Supabase Auth user.
 * 2. Assigns the 'QA_TESTER' role in the Public 'User' table.
 * 
 * HOW TO RUN:
 * `node scripts/invite_qa_member.js "QA Tester" user@gmail.com`
 */

async function inviteQAMember() {
    const name = process.argv[2];
    const email = process.argv[3];
    const tempPassword = `QA-Invite!${Math.random().toString(36).slice(-8)}`;

    if (!name || !email) {
        console.error('❌ Usage: node scripts/invite_qa_member.js "Name" "Email"');
        process.exit(1);
    }

    console.log(`🚀 Securely inviting ${name} (${email}) to the QA team...`);

    // 1. Create the Auth User
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
    const { error: publicError } = await supabase.from('User').upsert({
        id: user.id,
        name,
        email,
        role: 'QA_TESTER',
        updatedAt: new Date().toISOString()
    });

    if (publicError) {
        console.error(`❌ Public Table Sync Error: ${publicError.message}`);
        process.exit(1);
    }

    console.log('\n--- 🎫 QA TEAM INVITATION DATA ---');
    console.log(`NAME:     ${name}`);
    console.log(`EMAIL:    ${email}`);
    console.log(`TEMP PW:  ${tempPassword}`);
    console.log(`ADMIN PORTAL: https://admin.trueservedelivery.com/login`);
    console.log('---------------------------------');
    console.log('\n✅ Invitation Successful! Share these credentials with the tester.');
    process.exit(0);
}

inviteQAMember();
