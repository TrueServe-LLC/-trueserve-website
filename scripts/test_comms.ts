
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function runTest() {
    const { sendEmail } = await import('../lib/email');
    const { sendSMS } = await import('../lib/sms');

    const testEmail = process.argv[2] || "lcking992@gmail.com"; // Default to your email found in environment
    const testPhone = process.argv[3] || process.env.TWILIO_PHONE_NUMBER; // Use environment phone if none provided

    console.log(`🚀 Starting TrueServe Production Connectivity Test...`);
    console.log(`-----------------------------------------------`);

    // 1. Test Resend Email
    console.log(`📧 Sending Premium Email to: ${testEmail}...`);
    const emailResult = await sendEmail(
        testEmail,
        "TrueServe Production Test 🚀",
        `<h1>Connectivity Success! ✅</h1>
        <p>This is a live test of the <strong>TrueServe Premium Dark Theme</strong>.</p>
        <p>If you see this with a dark background, the emerald green status indicator, and the brand footer, your email system is ready for production.</p>
        <a href="https://trueserve.delivery" class="button">Visit Portal</a>
        <p style="margin-top: 30px;">Best,<br>The TrueServe Systems Team</p>`
    );

    if (emailResult.success) {
        console.log(`✅ Email Sent Successfully! (Check your inbox)`);
    } else {
        console.log(`❌ Email Failed: ${emailResult.message}`);
    }

    // 2. Test Twilio SMS
    if (testPhone && testPhone !== process.env.TWILIO_PHONE_NUMBER) {
        console.log(`\n📱 Sending SMS to: ${testPhone}...`);
        const smsResult = await sendSMS(testPhone, "TrueServe: Production connectivity test successful! ✅ Systems are live and ready for dispatch.");
        
        if (smsResult.success) {
            console.log(`✅ SMS Sent Successfully! SID: ${smsResult.sid}`);
        } else {
            console.log(`❌ SMS Failed: ${smsResult.error}`);
        }
    } else {
        console.log(`\n⚠️ Skipping SMS test: No recipient phone number provided. (Usage: npx tsx scripts/test_comms.ts <email> <phone>)`);
    }

    console.log(`\n-----------------------------------------------`);
    console.log(`🏁 Test complete.`);
    process.exit(0);
}

runTest().catch(err => {
    console.error("Test process crashed:", err);
    process.exit(1);
});
