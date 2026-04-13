import dotenv from 'dotenv';
import * as Sentry from '@sentry/nextjs';
import { logger } from './logger';
import { normalizePhoneNumber } from './phoneUtils';

dotenv.config({ path: '.env.local' });

const vonageApiKey = process.env.VONAGE_API_KEY || process.env.NEXMO_API_KEY;
const vonageApiSecret = process.env.VONAGE_API_SECRET || process.env.NEXMO_API_SECRET;
const vonageFrom = process.env.VONAGE_FROM;

export async function sendSMS(to: string, body: string) {
    if (!vonageApiKey || !vonageApiSecret || !vonageFrom) {
        logger.warn({ to }, '[SMS] Vonage not configured. Set VONAGE_API_KEY, VONAGE_API_SECRET, VONAGE_FROM.');
        return { success: false, error: 'SMS provider not configured' };
    }

    const normalizedTo = normalizePhoneNumber(to).replace(/^\+/, '');

    try {
        logger.info({ to: normalizedTo }, '[SMS] Sending via Vonage');

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
