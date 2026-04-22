"use server";

import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isStaffEmail, resolveStaffRole } from "@/lib/admin-config";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ADMIN_ROLES } from "@/lib/rbac";
import { v4 as uuidv4 } from "uuid";

async function ensureStaffUser(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const fallbackName = normalizedEmail.split('@')[0] || 'admin';
    const resolvedRole = resolveStaffRole(normalizedEmail);

    const { data: existingUser } = await supabaseAdmin
        .from('User')
        .select('id, role, name')
        .eq('email', normalizedEmail)
        .maybeSingle();

    if (existingUser?.id) {
        const targetRole = resolvedRole || (ADMIN_ROLES.includes(existingUser.role as any) ? existingUser.role : 'READONLY');

        if (existingUser.role !== targetRole) {
            await supabaseAdmin
                .from('User')
                .update({
                    role: targetRole,
                    updatedAt: new Date().toISOString(),
                })
                .eq('id', existingUser.id);
        }
        return existingUser.id;
    }

    const userId = uuidv4();
    await supabaseAdmin.from('User').insert({
        id: userId,
        email: normalizedEmail,
        name: fallbackName,
        role: resolvedRole || 'READONLY',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    return userId;
}

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
            const userId = await ensureStaffUser(email);
            const role = resolveStaffRole(email) || 'READONLY';
            return createAdminSession(userId, role);
        }

        if (ADMIN_PASSWORD &&
            password === ADMIN_PASSWORD &&
            isStaffEmail(email)) {
            const userId = await ensureStaffUser(email);
            const role = resolveStaffRole(email) || 'READONLY';
            return createAdminSession(userId, role);
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

                // Auto-sync internal staff roles if they have a known staff identity.
                const resolvedStaffRole = resolveStaffRole(email);
                if ((!userRole || userRole === 'CUSTOMER') && isStaffEmail(email)) {
                    userRole = resolvedStaffRole || 'READONLY';
                    await supabaseAdmin.from('User').upsert({
                        id: authData.user.id,
                        email: email,
                        role: userRole,
                        updatedAt: new Date().toISOString()
                    });
                } else if (resolvedStaffRole && userRole !== resolvedStaffRole) {
                    userRole = resolvedStaffRole;
                    await supabaseAdmin.from('User').upsert({
                        id: authData.user.id,
                        email: email,
                        role: resolvedStaffRole,
                        updatedAt: new Date().toISOString()
                    });
                }

                // Check if user is admin
                if (userRole && ADMIN_ROLES.includes(userRole as any)) {
                    return createAdminSession(authData.user.id, userRole);
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

async function createAdminSession(userId?: string, role?: string) {
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

        if (userId) {
            cookieStore.set("userId", userId, {
                httpOnly: true,
                secure: isProd,
                path: "/",
                ...(cookieDomain && { domain: cookieDomain }),
                maxAge: 60 * 60 * 24 * 7,
                sameSite: "lax",
            });
        }

        if (role) {
            cookieStore.set("admin_role", role, {
                httpOnly: true,
                secure: isProd,
                path: "/",
                ...(cookieDomain && { domain: cookieDomain }),
                maxAge: 60 * 60 * 24 * 7,
                sameSite: "lax",
            });
        }

        cookieStore.set("admin_session", "true", {
            httpOnly: true,
            secure: isProd,
            path: "/",
            ...(cookieDomain && { domain: cookieDomain }),
            maxAge: 60 * 60 * 24 * 7,
            sameSite: "lax",
        });

        console.log("[Server] admin_session cookie set, domain:", cookieDomain || "default");
        return { success: true };
    } catch (err) {
        console.error("[Server] Failed to set cookie:", err);
        return { error: "Failed to create session. Please try again." };
    }
}

export async function loginAndRedirect(formData: FormData) {
    const result = await login(formData);
    if (result && 'success' in result && result.success) {
        const { redirect } = await import("next/navigation");
        redirect("/admin/dashboard");
    }
    return result;
}

export async function loginWithGoogle() {
    try {
        const supabase = await createClient();
        const headersList = await headers();
        const host = headersList.get("host") || "";
        const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
        const adminCallbackHost = process.env.NODE_ENV === "production"
            ? "trueserve.delivery"
            : host;
        const redirectUrl = `${protocol}://${adminCallbackHost}/auth/callback?portal=admin&next=${encodeURIComponent("/admin/dashboard")}`;

        console.log("[Admin Google] Initiating OAuth with redirect:", redirectUrl);

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                queryParams: {
                    prompt: 'select_account',
                    access_type: 'offline'
                },
                scopes: 'profile email'
            }
        });

        if (error) {
            console.error("[Admin Google] OAuth error:", error.message);
            return { error: `OAuth error: ${error.message}` };
        }

        return { url: data.url };
    } catch (err) {
        console.error("[Server] OAuth initialization error:", err);
        return { error: "Failed to initialize Google login. Please try again." };
    }
}
