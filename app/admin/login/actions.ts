"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isStaffEmail } from "@/lib/admin-config";

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    let shouldRedirect = false;

    // Strategy 1: Database Auth (IAM)
    try {
        const supabase = await createClient();

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authData.user && !authError) {
            // Check Role by Email (To handle ID mismatches) - MUST use Admin client to bypass RLS
            const { supabaseAdmin } = await import("@/lib/supabase-admin");
            const { data: userData, error: userError } = await supabaseAdmin
                .from('User')
                .select('role')
                .eq('email', email)
                .maybeSingle();

            let userRole = userData?.role;

            // AUTO-GRANT: If user is in whitelist but role is missing/customer, upgrade them
            if ((!userRole || userRole === 'CUSTOMER') && isStaffEmail(email)) {
                userRole = 'ADMIN';
                const { supabaseAdmin } = await import("@/lib/supabase-admin");
                await supabaseAdmin.from('User').upsert({
                    id: authData.user.id,
                    email: email,
                    role: 'ADMIN',
                    updatedAt: new Date().toISOString()
                });
            }

            if (userRole && ['ADMIN', 'PM', 'OPS', 'SUPPORT', 'FINANCE', 'QA_TESTER'].includes(userRole)) {
                // Success - Set System-wide Cookies manually as fallback
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
                
                cookieStore.set("userId", authData.user.id, {
                    httpOnly: true,
                    secure: isProd,
                    path: "/",
                    domain: cookieDomain ? cookieDomain : undefined
                });

                shouldRedirect = true;
            } else if (userData) {
                return { error: "Access denied. Admin privileges required." };
            }
        }
    } catch (e) {
        // Fallthrough to legacy check
        console.error("Supabase Auth Login Error:", e);
    }

    if (shouldRedirect) {
        const headersList = await headers();
        const host = headersList.get('host') || "";
        const cleanHost = host.split(':')[0];
        const pieces = cleanHost.split('.');
        const isLocal = cleanHost.includes("localhost");
        const isVercel = cleanHost.endsWith(".vercel.app");
        const isProdDomain = cleanHost.endsWith("trueservedelivery.com");
        const isSub = isVercel ? pieces.length > 3 : pieces.length > (isLocal ? 1 : 2);
        const protocol = isLocal ? "http" : "https";

        // Return success instead of redirecting - let client handle it
        return { success: true };
    }

    // Strategy 2: Legacy Env Fallback (Safety Net)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (ADMIN_EMAIL && ADMIN_PASSWORD && email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
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
    }

    return { error: "Invalid credentials" };
}

export async function resetAdminPassword(formData: FormData) {
    const email = formData.get("email") as string;
    if (!email) return { error: "Email is required" };

    try {
        const supabase = await createClient();
        const headersList = await headers();
        const host = headersList.get('host') || "";
        const protocol = host.includes('localhost') ? 'http' : 'https';
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${protocol}://${host}/auth/callback?next=/admin/dashboard`
        });

        if (error) return { error: error.message };
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}
