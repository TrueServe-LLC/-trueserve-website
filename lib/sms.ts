
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
if (!process.env.TWILIO_ACCOUNT_SID) dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendSMS(to: string, body: string) {
    if (!client || !fromPhone) {
        console.warn('[SMS] Twilio not configured. Skipping message:', body);
        return { success: false, error: 'Twilio not configured' };
    }

    try {
        console.log(`[SMS] Sending to ${to}: ${body}`);
        const message = await client.messages.create({
            body,
            from: fromPhone,
            to: to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}` // Ensure E.164 format for US
        });
        return { success: true, sid: message.sid };
    } catch (error: any) {
        console.error('[SMS] Error sending message:', error.message);
        return { success: false, error: error.message };
    }
}
