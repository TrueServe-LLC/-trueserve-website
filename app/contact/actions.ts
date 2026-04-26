"use server";

import { sendEmail } from "@/lib/email";

export async function submitContactForm(formData: FormData) {
    const name = (formData.get("name") as string || "").trim();
    const email = (formData.get("email") as string || "").trim();
    const role = (formData.get("role") as string || "other").trim();
    const subject = (formData.get("subject") as string || "").trim();
    const message = (formData.get("message") as string || "").trim();

    if (!name || !email || !message) {
        return { error: "Name, email, and message are required." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { error: "Please enter a valid email address." };
    }

    if (message.length < 10) {
        return { error: "Please write a bit more so we can help you." };
    }

    try {
        // Send to internal team
        await sendEmail(
            "support@trueserve.delivery",
            `[Contact Form] ${subject || "New inquiry"} — ${name} (${role})`,
            `
            <div style="font-family: sans-serif; max-width: 600px;">
                <h2 style="color: #f97316;">New Contact Form Submission</h2>
                <table style="width:100%; border-collapse:collapse;">
                    <tr><td style="padding:8px; font-weight:bold; color:#666;">Name</td><td style="padding:8px;">${name}</td></tr>
                    <tr><td style="padding:8px; font-weight:bold; color:#666;">Email</td><td style="padding:8px;"><a href="mailto:${email}">${email}</a></td></tr>
                    <tr><td style="padding:8px; font-weight:bold; color:#666;">Role</td><td style="padding:8px;">${role}</td></tr>
                    <tr><td style="padding:8px; font-weight:bold; color:#666;">Subject</td><td style="padding:8px;">${subject || "—"}</td></tr>
                </table>
                <div style="margin-top:16px; padding:16px; background:#f9f9f9; border-radius:8px;">
                    <p style="font-weight:bold; color:#666; margin:0 0 8px;">Message:</p>
                    <p style="white-space:pre-wrap; margin:0;">${message}</p>
                </div>
                <p style="margin-top:16px; color:#999; font-size:12px;">Submitted via trueserve.delivery/contact</p>
            </div>
            `
        );

        // Auto-reply to sender
        await sendEmail(
            email,
            "We got your message — TrueServe",
            `
            <div style="font-family: sans-serif; max-width: 600px; color:#111;">
                <h2 style="color:#f97316;">Thanks, ${name}!</h2>
                <p>We received your message and will get back to you within 1 business day.</p>
                <p style="margin-top:16px; padding:16px; background:#f9f9f9; border-radius:8px; white-space:pre-wrap; font-size:14px; color:#555;">${message}</p>
                <p style="margin-top:24px;">— The TrueServe Team<br/><a href="mailto:support@trueserve.delivery">support@trueserve.delivery</a></p>
            </div>
            `
        );

        return { success: true };
    } catch (e: any) {
        console.error("Contact form error:", e);
        return { error: "Failed to send message. Please email us directly at support@trueserve.delivery" };
    }
}
