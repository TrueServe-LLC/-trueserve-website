import dotenv from 'dotenv';
import * as Sentry from '@sentry/nextjs';
import { logger } from './logger';
import { normalizePhoneNumber } from './phoneUtils';

dotenv.config({ path: '.env.local' });

const vonageApiKey = process.env.VONAGE_API_KEY || process.env.NEXMO_API_KEY;
const vonageApiSecret = process.env.VONAGE_API_SECRET || process.env.NEXMO_API_SECRET;
const vonageFrom = process.env.VONAGE_FROM || process.env.VONAGE_FROM_NUMBER;
const telnyxApiKey = process.env.TELNYX_API_KEY;
const telnyxFrom = process.env.TELNYX_FROM_NUMBER || process.env.TELNYX_PHONE_NUMBER;
const telnyxMessagingProfileId = process.env.TELNYX_MESSAGING_PROFILE_ID;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
const smsProvider = (process.env.SMS_PROVIDER || 'vonage').toLowerCase();

function hasTwilioConfig() {
    return !!(twilioAccountSid && twilioAuthToken && twilioFrom);
}

function hasVonageConfig() {
    return !!(vonageApiKey && vonageApiSecret && vonageFrom);
}

function hasTelnyxConfig() {
    return !!(telnyxApiKey && telnyxFrom);
}

function isVonageAuthError(message: string) {
    return /bad credentials|authentication failed|unauthorized/i.test(message);
}

function getTelnyxError(data: any, status: number) {
    const firstError = Array.isArray(data?.errors) ? data.errors[0] : null;
    return firstError?.detail || firstError?.title || data?.message || `Telnyx HTTP ${status}`;
}

function getProviderOrder() {
    const fallback = ['vonage', 'telnyx', 'twilio'];
    if (smsProvider === 'telnyx') return ['telnyx', 'vonage', 'twilio'];
    if (smsProvider === 'twilio') return ['twilio', 'telnyx', 'vonage'];
    if (smsProvider === 'vonage') return fallback;
    return fallback;
}

export async function sendSMS(to: string, body: string) {
    const normalizedTo = normalizePhoneNumber(to);
    const normalizedVonageTo = normalizedTo.replace(/^\+/, '');

    const sendViaTelnyx = async () => {
        if (!hasTelnyxConfig()) {
            return { success: false, error: 'Telnyx not configured' };
        }

        try {
            logger.info({ to: normalizedTo }, '[SMS] Sending via Telnyx');

            const payload: Record<string, any> = {
                to: normalizedTo,
                from: telnyxFrom,
                text: body,
                type: 'SMS',
                use_profile_webhooks: true,
            };

            if (telnyxMessagingProfileId) {
                payload.messaging_profile_id = telnyxMessagingProfileId;
            }

            const res = await fetch('https://api.telnyx.com/v2/messages', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${telnyxApiKey}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(getTelnyxError(data, res.status));
            }

            return { success: true, sid: data?.data?.id || data?.id, provider: 'telnyx' };
        } catch (error: any) {
            logger.error({ err: error, to: normalizedTo }, '[SMS] Error sending via Telnyx');
            Sentry.captureException(error, {
                tags: { service: 'Telnyx' },
                extra: { to: normalizedTo }
            });
            return { success: false, error: error.message };
        }
    };

    const sendViaTwilio = async () => {
        if (!hasTwilioConfig()) {
            return { success: false, error: 'Twilio not configured' };
        }

        try {
            logger.info({ to: normalizedTo }, '[SMS] Sending via Twilio fallback');

            const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
            const params = new URLSearchParams({
                From: twilioFrom!,
                To: normalizedTo,
                Body: body
            });

            const res = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString(),
                }
            );

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || `Twilio HTTP ${res.status}`);
            }

            return { success: true, sid: data?.sid || data?.message_sid, provider: 'twilio' };
        } catch (error: any) {
            logger.error({ err: error, to: normalizedTo }, '[SMS] Error sending via Twilio fallback');
            Sentry.captureException(error, {
                tags: { service: 'Twilio' },
                extra: { to: normalizedTo }
            });
            return { success: false, error: error.message };
        }
    };

    const sendViaVonage = async () => {
        if (!hasVonageConfig()) {
            return { success: false, error: 'Vonage not configured' };
        }

        try {
            logger.info({ to: normalizedVonageTo }, '[SMS] Sending via Vonage Messages API');

            const auth = Buffer.from(`${vonageApiKey}:${vonageApiSecret}`).toString('base64');
            const res = await fetch('https://api.nexmo.com/v1/messages', {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    to: normalizedVonageTo,
                    from: vonageFrom!.replace(/^\+/, ''),
                    channel: 'sms',
                    message_type: 'text',
                    text: body,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                const errText = data?.detail || data?.title || data?.message || `Vonage HTTP ${res.status}`;
                throw new Error(errText);
            }

            return { success: true, sid: data?.message_uuid || data?.messageId, provider: 'vonage' };
        } catch (error: any) {
            logger.error({ err: error, to: normalizedVonageTo }, '[SMS] Error sending via Vonage');
            Sentry.captureException(error, {
                tags: { service: 'Vonage' },
                extra: { to: normalizedVonageTo }
            });

            if (isVonageAuthError(error?.message || '')) {
                logger.warn({ to: normalizedTo }, '[SMS] Vonage auth failed');
            }

            return { success: false, error: error.message };
        }
    };

    const senders: Record<string, () => Promise<{ success: boolean; sid?: string; provider?: string; error?: string }>> = {
        telnyx: sendViaTelnyx,
        vonage: sendViaVonage,
        twilio: sendViaTwilio,
    };

    const errors: string[] = [];
    for (const provider of getProviderOrder()) {
        const result = await senders[provider]();
        if (result.success) return result;

        errors.push(`${provider}: ${result.error}`);
        logger.warn({ to: normalizedTo, provider, error: result.error }, '[SMS] Provider failed, trying next provider');
    }

    return { success: false, error: errors.join(' | ') || 'No SMS provider configured' };
}
