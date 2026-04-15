"use server";

import { cookies, headers } from "next/headers";

export async function login(formData: FormData) {
    try {
        const email = (formData.get("email") as string)?.trim() || "";
        const password = (formData.get("password") as string)?.trim() || "";

        console.log("[Server] Login attempt for email:", email);

        // Validate input
        if (!email || !password) {
            console.log("[Server] Missing email or password");
            return { error: "Email and password are required." };
        }

        // Get admin credentials from environment
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim();
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim();

        console.log("[Server] Credentials check:", {
            emailMatch: email.toLowerCase() === ADMIN_EMAIL?.toLowerCase(),
            passwordMatch: password === ADMIN_PASSWORD,
            hasEmail: !!ADMIN_EMAIL,
            hasPassword: !!ADMIN_PASSWORD,
        });

        // Check credentials
        if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
            console.error("[Server] Admin credentials not configured in environment");
            return { error: "Server configuration error. Please contact support." };
        }

        const emailMatch = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const passwordMatch = password === ADMIN_PASSWORD;

        if (!emailMatch || !passwordMatch) {
            console.log("[Server] Credentials do not match");
            return { error: "Invalid email or password." };
        }

        // Credentials are valid - create session
        console.log("[Server] Credentials valid, creating session...");

        try {
            const cookieStore = await cookies();
            const headersList = await headers();
            const host = headersList.get("host") || "";
            const cleanHost = host.split(":")[0];

            // Determine cookie domain for subdomain sharing
            let cookieDomain = "";
            const pieces = cleanHost.split(".");
            const isLocal = cleanHost.includes("localhost");
            const isVercel = cleanHost.endsWith(".vercel.app");

            if (!isLocal && !isVercel && pieces.length >= 2) {
                cookieDomain = `.${pieces.slice(-2).join(".")}`;
            }

            const isProd = process.env.NODE_ENV === "production";

            // Set admin session cookie
            cookieStore.set("admin_session", "true", {
                httpOnly: true,
                secure: isProd,
                path: "/",
                ...(cookieDomain && { domain: cookieDomain }),
                maxAge: 60 * 60 * 24 * 7, // 7 days
                sameSite: "lax",
            });

            console.log("[Server] Admin session cookie set successfully");
            return { success: true };
        } catch (err) {
            console.error("[Server] Failed to set cookie:", err);
            return { error: "Failed to create session. Please try again." };
        }
    } catch (err) {
        console.error("[Server] Unexpected login error:", err);
        return { error: "An unexpected error occurred. Please try again." };
    }
}
