"use server";

import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { sendEmail } from "@/lib/email";

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
        // 1. Get Driver Info
        const { data: driver, error: fetchError } = await supabaseAdmin
            .from('Driver')
            .select('*, user:User(*)')
            .eq('id', id)
            .single();

        if (fetchError || !driver) throw new Error("Driver not found");

        const email = driver.user.email;
        const name = driver.user.name;
        const tempPassword = `TrueServe!${Math.random().toString(36).slice(-8)}`;

        // 2. Create Auth User if not exists
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                displayName: name,
                role: 'DRIVER'
            }
        });

        // If user already exists, just proceed to status update (maybe they signed up as customer)
        if (authError && !authError.message.includes("already exists")) {
            console.error("Auth Creation Error:", authError);
            throw authError;
        }

        // 3. Update Driver Status
        const { error: statusError } = await supabaseAdmin
            .from('Driver')
            .update({ status: "OFFLINE", updatedAt: new Date().toISOString() })
            .eq('id', id);

        if (statusError) throw statusError;

        // 4. Send Approval Email
        await sendEmail(
            email,
            "Your TrueServe Driver Application - APPROVED",
            `Hi ${name.split(' ')[0]},\n\nGreat news! Your driver application for TrueServe has been approved.\n\nYou can now log in to the driver portal and start accepting orders.\n\n**Email:** ${email}\n**Temporary Password:** ${tempPassword}\n\n[Link to Driver Portal]\n\nPlease change your password after your first login.\n\nWelcome to the team!\n\nBest,\nThe TrueServe Team`
        );

        revalidatePath("/admin/dashboard");
        revalidatePath("/driver/dashboard");
        return { success: true };
    } catch (e: any) {
        console.error("Failed to approve driver:", e);
        return { success: false, error: e.message || "Failed to approve driver." };
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
