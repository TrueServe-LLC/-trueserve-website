
import { Resend } from 'resend';
import * as Sentry from '@sentry/nextjs';
import { logger } from './logger';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export async function sendEmail(to: string, subject: string, htmlBody: string, attachments?: any[]) {
    // Fallback if no API key is set or if it's a dummy key
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('dummy')) {
        logger.warn("⚠️ [MOCK EMAIL] RESEND_API_KEY is missing or invalid (dummy) in .env");
        logger.info({ to, subject, attachments: attachments ? attachments.length : 0 }, '[MOCK EMAIL] details');
        return { success: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'TrueServe <onboarding@resend.dev>', // In production, set RESEND_FROM_EMAIL to a verified domain
            to: [to],
            subject: subject,
            html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; padding: 20px; background-color: #000;">
                    <img src="https://raw.githubusercontent.com/lcking992/-trueserve-website/main/public/logo.png" alt="TrueServe Logo" style="max-height: 50px;" />
                </div>
                <div style="padding: 20px; color: #333;">
                    ${htmlBody.replace(/\n/g, '<br>')}
                </div>
                <div style="text-align: center; padding: 20px; font-size: 12px; color: #888; border-top: 1px solid #eee;">
                    &copy; ${new Date().getFullYear()} TrueServe. All rights reserved.
                </div>
            </div>
            `, // Simple conversion for text emails
            attachments: attachments
        });

        if (error) {
            logger.error({ err: error, to, subject }, "Resend API Error");
            Sentry.captureException(new Error(error.message), {
                tags: { service: 'Resend' },
                extra: { to, subject }
            });
            return { error: true, message: error.message };
        }

        return { success: true, data };
    } catch (e: any) {
        logger.error({ err: e, to, subject }, "Email Service Full Error");
        Sentry.captureException(e, {
            tags: { service: 'Resend' },
            extra: { to, subject }
        });
        return { error: true, message: e.message };
    }
}
