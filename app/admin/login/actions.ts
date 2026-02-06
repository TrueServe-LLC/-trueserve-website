"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@supabase/supabase-js";

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    let shouldRedirect = false;

    // Strategy 1: Database Auth (IAM)
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        // Create a fresh client for this request context
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authData.user && !authError) {
            // Check Role
            const { data: userData, error: userError } = await supabase
                .from('User')
                .select('role')
                .eq('id', authData.user.id)
                .single();

            if (userData && userData.role === 'ADMIN') {
                // Success - Set Session
                (await cookies()).set("admin_session", "true", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    path: "/",
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
        (await cookies()).set("admin_session", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });
        redirect("/admin/dashboard");
    }

    return { error: "Invalid credentials" };
}
