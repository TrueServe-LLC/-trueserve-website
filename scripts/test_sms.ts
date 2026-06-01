import { sendSMS } from "../lib/sms";
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter phone number to test (e.g. +17045550199): ', async (phone) => {
    console.log(`\n📱 Sending test message to ${phone}...`);
    console.log(`Note: SMS_PROVIDER controls the primary provider. Supported providers: telnyx, vonage, twilio.\n`);

    const result = await sendSMS(phone, "TrueServe: Production SMS connectivity test successful.");

    if (result.success) {
        console.log("✅ SMS Sent Successfully!");
        console.log("   Message ID:", result.sid);
        console.log("   Provider:", result.provider || "unknown");
    } else {
        console.error("❌ SMS Failed:", result.error);
        if (result.error?.includes("Telnyx")) {
            console.log("\n⚠️  TIP: Ensure TELNYX_API_KEY, TELNYX_FROM_NUMBER, TELNYX_MESSAGING_PROFILE_ID, and SMS_PROVIDER=telnyx are set.");
        }
        if (result.error?.includes("Authentication failed")) {
            console.log("\n⚠️  TIP: Ensure VONAGE_API_KEY and VONAGE_API_SECRET are correct, or confirm Twilio fallback is configured.");
        }
        if (result.error?.includes("Invalid 'from'")) {
            console.log("\n⚠️  TIP: Ensure VONAGE_FROM is set to your registered Vonage sender ID.");
        }
    }
    rl.close();
    process.exit(0);
});
