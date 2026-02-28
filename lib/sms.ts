
import twilio from 'twilio';
import dotenv from 'dotenv';
import * as Sentry from '@sentry/nextjs';
import { logger } from './logger';

dotenv.config({ path: '.env.local' });
if (!process.env.TWILIO_ACCOUNT_SID) dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendSMS(to: string, body: string) {
    if (!client || !fromPhone) {
        logger.warn({ body }, '[SMS] Twilio not configured. Skipping message');
        return { success: false, error: 'Twilio not configured' };
    }

    try {
        logger.info({ to }, `[SMS] Sending message`);
        const message = await client.messages.create({
            body,
            from: fromPhone,
            to: to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}` // Ensure E.164 format for US
        });
        return { success: true, sid: message.sid };
    } catch (error: any) {
        logger.error({ err: error, to }, '[SMS] Error sending message');
        Sentry.captureException(error, {
            tags: { service: 'Twilio' },
            extra: { to }
        });
        return { success: false, error: error.message };
    }
}
