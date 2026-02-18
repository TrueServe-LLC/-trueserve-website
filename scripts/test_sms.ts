
import { sendSMS } from '../lib/sms';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
if (!process.env.TWILIO_ACCOUNT_SID) dotenv.config();

async function testTwilio() {
    console.log('Testing Twilio SMS...');
    // Replace with your real phone number if you want to verify reception
    const testPhone = '2147628569';
    const result = await sendSMS(testPhone, 'TrueServe SMS System is ACTIVE! Ready for order notifications.');
    console.log('Result:', result);
}

testTwilio();
