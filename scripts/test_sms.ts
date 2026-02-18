import { sendSMS } from "../lib/sms";
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter phone number to test (e.g. +17045550199): ', async (phone) => {
    console.log(`Sending test message to ${phone}...`);
    const result = await sendSMS(phone, "TrueServe Test: Twilio Upgrade Verified ✅");

    if (result.success) {
        console.log("✅ SMS Sent Successfully! SID:", result.sid);
    } else {
        console.error("❌ SMS Failed:", result.error);
        if (result.error?.includes("unverified")) {
            console.log("\nTIP: Since you upgraded, ensure you are using your LIVE credentials, not Test credentials.");
        }
    }
    rl.close();
    process.exit(0);
});
