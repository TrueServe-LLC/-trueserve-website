"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Dummy validation
    // Dummy validation
    if (email === "admin@trueserve.com" && password === "admin") {
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
