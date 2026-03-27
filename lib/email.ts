
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
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'TrueServe <onboarding@trueserve.delivery>';
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [to],
            subject: subject,
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .container { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0A0A; border-radius: 12px; overflow: hidden; color: #FFFFFF; }
                    .header { background-color: #000000; padding: 40px 20px; text-align: center; border-bottom: 1px solid #1A1A1A; }
                    .content { padding: 40px 30px; line-height: 1.6; color: #E5E5E5; font-size: 16px; }
                    .footer { text-align: center; padding: 30px; font-size: 12px; color: #666; background-color: #050505; border-top: 1px solid #1A1A1A; }
                    .button { display: inline-block; padding: 14px 28px; background-color: #10B981; color: #000000; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; text-transform: uppercase; letter-spacing: 0.05em; }
                    .accent { color: #10B981; font-weight: bold; }
                    h1 { font-size: 24px; color: #FFFFFF; margin-bottom: 24px; font-weight: 700; letter-spacing: -0.02em; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="https://raw.githubusercontent.com/lcking992/-trueserve-website/main/public/logo.png" alt="TrueServe Logo" style="height: 48px;" />
                    </div>
                    <div class="content">
                        ${htmlBody.replace(/\n/g, '<br>')}
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} TrueServe | Premium Carrier Logisitics</p>
                        <p style="margin-top: 10px; font-size: 10px;">North Carolina & East Coast Operations | Powered by TrueServe Tech</p>
                    </div>
                </div>
            </body>
            </html>
            `,
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
