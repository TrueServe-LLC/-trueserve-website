
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, htmlBody: string) {
    // Fallback if no API key is set
    if (!process.env.RESEND_API_KEY) {
        console.warn("⚠️ [MOCK EMAIL] RESEND_API_KEY is missing in .env");
        console.log(`
        ==================================================
        To: ${to}
        Subject: ${subject}
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
            html: htmlBody.replace(/\n/g, '<br>'), // Simple conversion for text emails
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
