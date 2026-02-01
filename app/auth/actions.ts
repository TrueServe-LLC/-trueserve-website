"use server";

import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export async function login(email: string) {
    const cookieStore = await cookies();

    try {
        // Simple "Auth" - check if user exists, if not create 'CUSTOMER'
        let { data: user } = await supabase
            .from('User')
            .select('id, role')
            .eq('email', email)
            .maybeSingle();

        if (!user) {
            // Register
            const { data: newUser, error } = await supabase
                .from('User')
                .insert({
                    id: uuidv4(),
                    email,
                    name: email.split('@')[0],
                    role: 'CUSTOMER',
                    updatedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            user = newUser;
        }

        // Set Cookie
        if (user) {
            cookieStore.set("userId", user.id, { secure: true, httpOnly: true });
        }

    } catch (e) {
        console.error("Login failed:", e);
        return { success: false, message: "Login failed" };
    }

    redirect("/restaurants");
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("userId");
    redirect("/login");
}
