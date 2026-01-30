"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function approveMenuItem(id: string) {
    try {
        await prisma.menuItem.update({
            where: { id },
            data: { status: "APPROVED" },
        });
        revalidatePath("/admin/dashboard");
        revalidatePath("/merchant/dashboard");
        return { success: true };
    } catch (e) {
        console.error("Failed to approve item:", e);
        return { success: false, error: "Failed to approve item." };
    }
}

export async function rejectMenuItem(id: string) {
    try {
        await prisma.menuItem.update({
            where: { id },
            data: { status: "REJECTED" },
        });
        revalidatePath("/admin/dashboard");
        revalidatePath("/merchant/dashboard");
        return { success: true };
    } catch (e) {
        console.error("Failed to reject item:", e);
        return { success: false, error: "Failed to reject item." };
    }
}

export async function flagMenuItem(id: string) {
    try {
        await prisma.menuItem.update({
            where: { id },
            data: { status: "FLAGGED" },
        });
        revalidatePath("/admin/dashboard");
        revalidatePath("/merchant/dashboard");
        return { success: true };
    } catch (e) {
        console.error("Failed to flag item:", e);
        return { success: false, error: "Failed to flag item." };
    }
}

export async function approveDriver(id: string) {
    try {
        await prisma.driver.update({
            where: { id },
            data: { status: "OFFLINE" }, // Or whatever starting status
        });
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (e) {
        console.error("Failed to approve driver:", e);
        return { success: false, error: "Failed to approve driver." };
    }
}

export async function connectStripe(_formData?: FormData) {
    const session = (await cookies()).get("admin_session");
    if (!session) {
        redirect("/admin/login");
    }
    redirect("https://dashboard.stripe.com/acct_1Sdd5I2XvtkOTi1j/payment-links/create");
}

export async function logout() {
    (await cookies()).delete("admin_session");
    redirect("/");
}
