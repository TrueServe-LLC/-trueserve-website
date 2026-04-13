import { sendSMS } from "../lib/sms";
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter phone number to test (e.g. +17045550199): ', async (phone) => {
    console.log(`\n📱 Sending test message via Vonage to ${phone}...`);
    console.log(`Note: Vonage keys (VONAGE_API_KEY, VONAGE_API_SECRET, VONAGE_FROM) must be set in environment.\n`);

    const result = await sendSMS(phone, "TrueServe: Test message via Vonage SMS ✅");

    if (result.success) {
        console.log("✅ SMS Sent Successfully!");
        console.log("   Message ID:", result.sid);
    } else {
        console.error("❌ SMS Failed:", result.error);
        if (result.error?.includes("Authentication failed")) {
            console.log("\n⚠️  TIP: Ensure VONAGE_API_KEY and VONAGE_API_SECRET are correct.");
        }
        if (result.error?.includes("Invalid 'from'")) {
            console.log("\n⚠️  TIP: Ensure VONAGE_FROM is set to your registered Vonage sender ID.");
        }
    }
    rl.close();
    process.exit(0);
});
