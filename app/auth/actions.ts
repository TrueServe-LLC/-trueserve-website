"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type AuthState = {
    message: string;
    success?: boolean;
    error?: boolean;
    role?: string;
};

export async function loginWithPassword(formData: FormData): Promise<AuthState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const cookieStore = await cookies();
    const supabase = await createClient();

    if (!email || !password) {
        return { message: "Email and Password are required", error: true };
    }

    try {
        // Mock Login enabled exclusively for Vercel Preview Deployments (Demos)
        if (process.env.VERCEL_ENV === "preview" && email.endsWith("@demo.test") && password === "password123") {
            // Use supabaseAdmin to bypass RLS when looking up the mock user
            const { data: publicUser } = await supabaseAdmin.from('User').select('id, role').eq('email', email).maybeSingle();

            if (publicUser) {
                cookieStore.set("userId", publicUser.id, { secure: true, httpOnly: true });
                return { message: "Demo Login successful!", success: true, role: publicUser.role };
            }

            // Absolute fallback so you can ALWAYS log in no matter what the DB state is locally
            const fallbackRole = email.startsWith("merchant") ? "MERCHANT" : email.startsWith("driver") ? "DRIVER" : "CUSTOMER";
            cookieStore.set("userId", "mock-user-id", { secure: true, httpOnly: true });
            return { message: "Demo Login successful (Fallback)!", success: true, role: fallbackRole };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error("Supabase Login Error:", error.message);
            return { message: error.message, error: true };
        }

        let role = 'CUSTOMER';

        if (data.user) {
            // Sync with public User table (Check if exists, if not, might need to create or it's a legacy user)
            const { data: publicUser } = await supabase.from('User').select('id, role').eq('id', data.user.id).maybeSingle();

            if (publicUser) {
                role = publicUser.role;
                // Set App Cookie for compatibility
                cookieStore.set("userId", publicUser.id, { secure: true, httpOnly: true });
            } else {
                // Fallback if public user missing but Auth exists (shouldn't happen often)
                cookieStore.set("userId", data.user.id, { secure: true, httpOnly: true });
            }
        }

        return { message: "Login successful!", success: true, role };

    } catch (e: any) {
        return { message: e.message || "Login failed", error: true };
    }
}

export async function signupWithPassword(formData: FormData): Promise<AuthState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = (formData.get("role") as string) || 'CUSTOMER';
    const name = (formData.get("name") as string) || email.split('@')[0];
    const address = formData.get("address") as string;
    const cookieStore = await cookies();
    const supabase = await createClient();

    if (!email || !password) {
        return { message: "Email and Password are required", error: true };
    }

    try {
        // 0. Check if User record already exists in Public table
        const { data: existingPublicUser } = await supabaseAdmin
            .from('User')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (existingPublicUser) {
            return { message: "This email is already registered. Please log in instead.", error: true };
        }

        // 1. Sign Up in Supabase Auth - Use Admin API to bypass "Sign up disabled" settings
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name, role }
        });

        if (error) {
            if (error.message.includes("already exists")) {
                return { message: "An account with this email already exists. Please log in.", error: true };
            }
            return { message: error.message, error: true };
        }

        if (data.user) {
            // 2. Create Public User Record - Use ADMIN to bypass RLS
            // We use the SAME ID as the Auth User for consistency
            const { error: dbError } = await supabaseAdmin.from('User').insert({
                id: data.user.id,
                email: email,
                name: name,
                role: role,
                address: address || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            if (dbError) {
                // If ID already exists (maybe duplicated email in public table but not auth), log it
                console.error("Public User Insert Error:", dbError);
                // We don't fail the auth, but sync might be off.
            }

            cookieStore.set("userId", data.user.id, { secure: true, httpOnly: true });
        }

        return { message: "Account created! Please check your email/login.", success: true };

    } catch (e: any) {
        return { message: e.message || "Signup failed", error: true };
    }
}

export async function resetPassword(formData: FormData): Promise<AuthState> {
    const email = formData.get("email") as string;
    const supabase = await createClient();

    if (!email) return { message: "Email is required", error: true };

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/update-password`,
    });

    if (error) {
        return { message: error.message, error: true };
    }

    return { message: "Password reset link sent!", success: true };
}

export async function logout() {
    const cookieStore = await cookies();
    const supabase = await createClient();
    await supabase.auth.signOut();
    cookieStore.delete("userId");
    redirect("/login");
}
