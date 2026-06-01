
const { sendSMS } = require("../lib/sms");
require('dotenv').config();

const phone = process.argv[2];
if (!phone) {
    console.error("Usage: node scripts/test_sms_direct.js <phone_number>");
    process.exit(1);
}

async function run() {
    console.log(`Sending test message to ${phone}...`);
    try {
        const result = await sendSMS(phone, "TrueServe: Production SMS connectivity test successful.");
        if (result.success) {
            console.log("✅ SMS Sent Successfully! SID:", result.sid);
            console.log("Provider:", result.provider || "unknown");
        } else {
            console.error("❌ SMS Failed:", result.error);
        }
    } catch (e) {
        console.error("❌ Execution Error:", e);
    }
}

run();
