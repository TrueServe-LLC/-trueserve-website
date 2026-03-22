const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = process.env.RESEND_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = resendKey && !resendKey.includes('dummy') ? new Resend(resendKey) : null;

/**
 * QA ROLE UPGRADER & NOTIFIER (JavaScript Version)
 * 
 * PURPOSE: 
 * Upgrades an existing user to 'QA_TESTER' and sends an automated notification email.
 * 
 * HOW TO RUN:
 * `node scripts/set_qa_role.js user@gmail.com`
 */

async function setQARole() {
    const email = process.argv[2];
    
    if (!email) {
        console.error('❌ Usage: node scripts/set_qa_role.js "Email"');
        process.exit(1);
    }

    console.log(`🚀 Upgrading ${email} to QA_TESTER...`);

    // 1. Update Database Role
    const { data: user, error: findError } = await supabase
        .from('User')
        .select('id, name')
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

    // 2. Sync Auth Metadata
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const authUser = users.find(u => u.email === email);
    if (authUser) {
        await supabase.auth.admin.updateUserById(authUser.id, {
            user_metadata: { ...authUser.user_metadata, role: 'QA_TESTER' }
        });
        console.log(`✅ Auth Metadata synced.`);
    }

    // 3. Send Automated Notification Email via Resend
    if (resend) {
        console.log(`✉️ Sending notification email to ${email}...`);
        const name = user.name || 'Team Member';
        const { error: mailError } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'TrueServe <onboarding@resend.dev>',
            to: [email],
            subject: 'Your TrueServe QA Access is Live',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                    <h2 style="color: #000;">TrueServe QA Onboarding</h2>
                    <p>Hi ${name},</p>
                    <p>Your TrueServe account has been upgraded with <strong>QA Tester</strong> privileges. You now have access to the Admin Dashboard for pilot testing.</p>
                    <div style="background: #f4f4f4; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin-top: 0;"><strong>What's New:</strong></p>
                        <ul style="margin-bottom: 0;">
                            <li>🛰️ Live Delivery Monitoring</li>
                            <li>🛠️ Integrated QA Toolbox (Mock order generator, batch approvals)</li>
                            <li>📋 Menu Item & Driver Review tools</li>
                        </ul>
                    </div>
                    <p><strong>Log in here:</strong> <a href="https://admin.trueserve.delivery/admin/dashboard" style="color: #007bff; font-weight: bold;">https://admin.trueserve.delivery/admin/dashboard</a></p>
                    <p>Use your existing account credentials to get started.</p>
                    <p>Best regards,<br>The TrueServe Engineering Team</p>
                </div>
            `
        });

        if (mailError) console.error(`⚠️ Email failed to send: ${mailError.message}`);
        else console.log(`✅ Automated notification sent successfully!`);
    } else {
        console.warn(`⚠️ [MOCK MODE] Resend API key missing. User upgraded but no email sent.`);
    }

    console.log(`\n✨ SUCCESS! ${email} is now an official QA_TESTER.`);
    process.exit(0);
}

setQARole();
