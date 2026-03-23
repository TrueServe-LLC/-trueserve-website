"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

            if (userData && ['ADMIN', 'OPS', 'SUPPORT', 'FINANCE'].includes(userData.role)) {
                // Success - Set System-wide Cookies manually as fallback
                const cookieStore = await cookies();
                const isProd = process.env.NODE_ENV === "production";
                
                cookieStore.set("admin_session", "true", {
                    httpOnly: true,
                    secure: isProd,
                    path: "/",
                    domain: isProd ? '.trueservedelivery.com' : undefined
                });
                
                cookieStore.set("userId", authData.user.id, {
                    httpOnly: true,
                    secure: isProd,
                    path: "/",
                    domain: isProd ? '.trueservedelivery.com' : undefined
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
        redirect("/admin/dashboard");
    }

    // Strategy 2: Legacy Env Fallback (Safety Net)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (ADMIN_EMAIL && ADMIN_PASSWORD && email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const cookieStore = await cookies();
        const isProd = process.env.NODE_ENV === "production";
        
        cookieStore.set("admin_session", "true", {
            httpOnly: true,
            secure: isProd,
            path: "/",
            domain: isProd ? '.trueservedelivery.com' : undefined
        });
        redirect("/admin/dashboard");
    }

    return { error: "Invalid credentials" };
}

export async function resetAdminPassword(formData: FormData) {
    const email = formData.get("email") as string;
    if (!email) return { error: "Email is required" };

    try {
        const supabase = await createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://admin.trueservedelivery.com'}/auth/callback?next=/admin/dashboard`
        });

        if (error) return { error: error.message };
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}
