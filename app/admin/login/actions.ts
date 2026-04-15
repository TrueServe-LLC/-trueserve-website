"use server";

import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isStaffEmail } from "@/lib/admin-config";

export async function login(formData: FormData) {
    try {
        const email = (formData.get("email") as string)?.trim() || "";
        const password = (formData.get("password") as string)?.trim() || "";

        console.log("[Server] Login attempt for email:", email);

        if (!email || !password) {
            return { error: "Email and password are required." };
        }

        // PRIMARY: Try env-based credentials (master admin)
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim();
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim();

        if (ADMIN_EMAIL && ADMIN_PASSWORD &&
            email.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
            password === ADMIN_PASSWORD) {
            return createAdminSession();
        }

        // SECONDARY: Try Supabase auth (team admins)
        try {
            const supabase = await createClient();
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authData?.user && !authError) {
                const { supabaseAdmin } = await import("@/lib/supabase-admin");
                const { data: userData } = await supabaseAdmin
                    .from('User')
                    .select('role')
                    .eq('email', email)
                    .maybeSingle();

                let userRole = userData?.role;

                // Auto-grant admin role if whitelisted staff email
                if ((!userRole || userRole === 'CUSTOMER') && isStaffEmail(email)) {
                    userRole = 'ADMIN';
                    await supabaseAdmin.from('User').upsert({
                        id: authData.user.id,
                        email: email,
                        role: 'ADMIN',
                        updatedAt: new Date().toISOString()
                    });
                }

                // Check if user is admin
                if (userRole && ['ADMIN', 'PM', 'OPS', 'SUPPORT', 'FINANCE', 'QA_TESTER'].includes(userRole)) {
                    return createAdminSession();
                } else {
                    return { error: "Access denied. Admin role required." };
                }
            } else if (authError) {
                console.error("Supabase auth error:", authError.message);
            }
        } catch (error) {
            console.error("Database login error:", error);
        }

        return { error: "Invalid email or password." };
    } catch (err) {
        console.error("[Server] Unexpected login error:", err);
        return { error: "An unexpected error occurred. Please try again." };
    }
}

async function createAdminSession() {
    try {
        const cookieStore = await cookies();
        const headersList = await headers();
        const host = headersList.get("host") || "";
        const cleanHost = host.split(":")[0];

        let cookieDomain = "";
        const pieces = cleanHost.split(".");
        const isLocal = cleanHost.includes("localhost");
        const isVercel = cleanHost.endsWith(".vercel.app");

        if (!isLocal && !isVercel && pieces.length >= 2) {
            cookieDomain = `.${pieces.slice(-2).join(".")}`;
        }

        const isProd = process.env.NODE_ENV === "production";

        cookieStore.set("admin_session", "true", {
            httpOnly: true,
            secure: isProd,
            path: "/",
            ...(cookieDomain && { domain: cookieDomain }),
            maxAge: 60 * 60 * 24 * 7,
            sameSite: "lax",
        });

        return { success: true };
    } catch (err) {
        console.error("[Server] Failed to set cookie:", err);
        return { error: "Failed to create session. Please try again." };
    }
}
