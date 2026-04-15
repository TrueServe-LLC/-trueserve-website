"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isStaffEmail } from "@/lib/admin-config";

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required." };
    }

    // PRIMARY: Legacy Env Fallback (for initial admin setup)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    console.log("Login attempt:", {
        email,
        emailMatch: email.toLowerCase() === ADMIN_EMAIL?.toLowerCase(),
        passwordMatch: password === ADMIN_PASSWORD,
        hasEnvEmail: !!ADMIN_EMAIL,
        hasEnvPassword: !!ADMIN_PASSWORD,
        adminEmailEnv: ADMIN_EMAIL
    });

    if (ADMIN_EMAIL && ADMIN_PASSWORD && email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
        try {
            const cookieStore = await cookies();
            const headersList = await headers();
            const host = headersList.get('host') || "";
            const cleanHost = host.split(':')[0];
            const isLocal = cleanHost.includes("localhost");
            const isVercel = cleanHost.endsWith(".vercel.app");

            let cookieDomain = "";
            const pieces = cleanHost.split('.');
            if (!isLocal && !isVercel && pieces.length >= 2) {
                cookieDomain = `.${pieces.slice(-2).join('.')}`;
            }

            const isProd = process.env.NODE_ENV === "production";

            cookieStore.set("admin_session", "true", {
                httpOnly: true,
                secure: isProd,
                path: "/",
                domain: cookieDomain ? cookieDomain : undefined,
                maxAge: 60 * 60 * 24 * 7, // 7 days
                sameSite: 'lax'
            });

            return { success: true };
        } catch (err) {
            console.error("Session creation error:", err);
            return { error: "Failed to create session. Please try again." };
        }
    }

    // SECONDARY: Supabase Auth (for registered admin users)
    try {
        const supabase = await createClient();

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authData?.user && !authError) {
            // Check if user has admin role
            const { supabaseAdmin } = await import("@/lib/supabase-admin");
            const { data: userData } = await supabaseAdmin
                .from('User')
                .select('role')
                .eq('email', email)
                .maybeSingle();

            let userRole = userData?.role;

            // AUTO-GRANT admin role if they're a whitelisted staff email
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
                const cookieStore = await cookies();
                const headersList = await headers();
                const host = headersList.get('host') || "";
                const cleanHost = host.split(':')[0];
                const isLocal = cleanHost.includes("localhost");
                const isVercel = cleanHost.endsWith(".vercel.app");

                let cookieDomain = "";
                const pieces = cleanHost.split('.');
                if (!isLocal && !isVercel && pieces.length >= 2) {
                    cookieDomain = `.${pieces.slice(-2).join('.')}`;
                }

                const isProd = process.env.NODE_ENV === "production";

                cookieStore.set("admin_session", "true", {
                    httpOnly: true,
                    secure: isProd,
                    path: "/",
                    domain: cookieDomain ? cookieDomain : undefined
                });

                return { success: true };
            } else {
                return { error: "Access denied. Admin role required." };
            }
        } else if (authError) {
            console.error("Supabase auth error:", authError.message);
            // Don't expose Supabase errors, they're not helpful
        }
    } catch (error) {
        console.error("Database login error:", error);
    }

    return { error: "Invalid email or password. Please check your credentials and try again." };
}

export async function resetAdminPassword(formData: FormData) {
    const email = formData.get("email") as string;
    if (!email) return { error: "Email is required" };

    try {
        const supabase = await createClient();

        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
            console.error("Password reset error:", error);
            return { error: "Failed to send reset email. Please try again." };
        }

        return { success: true };
    } catch (error) {
        console.error("Reset password error:", error);
        return { error: "An error occurred. Please try again." };
    }
}
