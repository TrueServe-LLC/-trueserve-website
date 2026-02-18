"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function approveMenuItem(id: string) {
    try {
        const { error } = await supabase
            .from('MenuItem')
            .update({ status: "APPROVED" })
            .eq('id', id);

        if (error) {
            throw error;
        }

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
        const { error } = await supabase
            .from('MenuItem')
            .update({ status: "REJECTED" })
            .eq('id', id);

        if (error) {
            throw error;
        }

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
        const { error } = await supabase
            .from('MenuItem')
            .update({ status: "FLAGGED" })
            .eq('id', id);

        if (error) {
            throw error;
        }

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
        const { error } = await supabase
            .from('Driver')
            .update({ status: "OFFLINE" }) // Or whatever starting status
            .eq('id', id);

        if (error) {
            throw error;
        }

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

export async function toggleOrderingStatus(enabled: boolean) {
    try {
        const { error } = await supabase
            .from('SystemSettings')
            .upsert({ key: 'ordering_enabled', value: enabled });

        if (error) throw error;
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}
