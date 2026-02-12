
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, htmlBody: string, attachments?: any[]) {
    // Fallback if no API key is set
    if (!process.env.RESEND_API_KEY) {
        console.warn("⚠️ [MOCK EMAIL] RESEND_API_KEY is missing in .env");
        console.log(`
        ==================================================
        To: ${to}
        Subject: ${subject}
        Attachments: ${attachments ? attachments.length : 0} file(s)
        --------------------------------------------------
        ${htmlBody.replace(/<br>/g, '\n')}
        ==================================================
        `);
        return { success: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'TrueServe <onboarding@resend.dev>', // Use 'onboarding@resend.dev' for testing without a domain
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
            console.error("Resend API Error:", error);
            return { error: true, message: error.message };
        }

        return { success: true, data };
    } catch (e: any) {
        console.error("Email Service Error:", e);
        return { error: true, message: e.message };
    }
}
