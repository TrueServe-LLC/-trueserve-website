import twilio from 'twilio';
import dotenv from 'dotenv';
import * as Sentry from '@sentry/nextjs';
import { logger } from './logger';
import { normalizePhoneNumber } from './phoneUtils';

dotenv.config({ path: '.env.local' });
if (!process.env.VONAGE_API_KEY && !process.env.TWILIO_ACCOUNT_SID) dotenv.config();

const vonageApiKey = process.env.VONAGE_API_KEY || process.env.NEXMO_API_KEY;
const vonageApiSecret = process.env.VONAGE_API_SECRET || process.env.NEXMO_API_SECRET;
const vonageFrom = process.env.VONAGE_FROM;

const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
const twilioClient = twilioSid && twilioToken ? twilio(twilioSid, twilioToken) : null;

async function sendViaVonage(to: string, body: string) {
    if (!vonageApiKey || !vonageApiSecret || !vonageFrom) {
        return { success: false, error: 'Vonage not configured' };
    }

    const normalizedTo = normalizePhoneNumber(to).replace(/^\+/, '');

    try {
        logger.info({ to: normalizedTo }, '[SMS] Sending message via Vonage');

        const params = new URLSearchParams({
            api_key: vonageApiKey,
            api_secret: vonageApiSecret,
            from: vonageFrom,
            to: normalizedTo,
            text: body
        });

        const res = await fetch('https://rest.nexmo.com/sms/json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        });

        const data = await res.json();
        const firstMessage = data?.messages?.[0];

        if (!res.ok || !firstMessage || firstMessage.status !== '0') {
            const errText = firstMessage?.['error-text'] || `Vonage HTTP ${res.status}`;
            throw new Error(errText);
        }

        return { success: true, sid: firstMessage['message-id'] };
    } catch (error: any) {
        logger.error({ err: error, to: normalizedTo }, '[SMS] Error sending via Vonage');
        Sentry.captureException(error, {
            tags: { service: 'Vonage' },
            extra: { to: normalizedTo }
        });
        return { success: false, error: error.message };
    }
}

async function sendViaTwilio(to: string, body: string) {
    if (!twilioClient || !twilioFrom) {
        return { success: false, error: 'Twilio not configured' };
    }

    try {
        const normalizedTo = normalizePhoneNumber(to);
        logger.info({ to: normalizedTo }, '[SMS] Sending message via Twilio fallback');
        const message = await twilioClient.messages.create({
            body,
            from: twilioFrom,
            to: normalizedTo
        });
        return { success: true, sid: message.sid };
    } catch (error: any) {
        logger.error({ err: error, to }, '[SMS] Error sending via Twilio fallback');
        Sentry.captureException(error, {
            tags: { service: 'Twilio' },
            extra: { to }
        });
        return { success: false, error: error.message };
    }
}

export async function sendSMS(to: string, body: string) {
    // Primary provider for production migration
    if (vonageApiKey && vonageApiSecret && vonageFrom) {
        return sendViaVonage(to, body);
    }

    // Fallback while cutover is in progress
    const fallbackResult = await sendViaTwilio(to, body);
    if (!fallbackResult.success) {
        logger.warn({ to }, '[SMS] No configured provider. Set VONAGE_API_KEY/VONAGE_API_SECRET/VONAGE_FROM.');
    }
    return fallbackResult;
}
