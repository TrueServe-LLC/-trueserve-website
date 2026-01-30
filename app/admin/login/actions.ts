"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Dummy validation
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@trueserve.com";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        (await cookies()).set("admin_session", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            // No maxAge means it's a session cookie (deleted when browser closes)
        });
        redirect("/admin/dashboard");
    }

    return { error: "Invalid credentials" };
}
