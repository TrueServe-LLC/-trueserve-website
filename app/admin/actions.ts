"use server";


import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { cookies } from "next/headers";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";

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
        const phone = driver.user.phone;
        const tempPassword = `TrueServe!${Math.random().toString(36).slice(-8)}`;

        // 2. Create Auth User if not exists
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            phone,
            password: tempPassword,
            email_confirm: true,
            phone_confirm: true,
            user_metadata: {
                displayName: name,
                role: 'DRIVER'
            }
        });

        // If user already exists, just proceed to status update (maybe they signed up as customer)
        // If phone already exists, that's fine too.
        if (authError && !authError.message.includes("already exists")) {
            console.error("Auth Creation Error:", authError);
            throw authError;
        }

        // 2b. Sync role for existing users
        if (authError?.message.includes("already exists")) {
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(driver.userId, {
                user_metadata: { role: 'DRIVER', displayName: name }
            });
            if (updateError) console.error("Failed to sync role for existing driver:", updateError);
        }

        // 3. Update Driver Status
        const { error: statusError } = await supabaseAdmin
            .from('Driver')
            .update({ status: "OFFLINE", vehicleVerified: true, updatedAt: new Date().toISOString() })
            .eq('id', id);

        if (statusError) throw statusError;

        // 4. Send Approval Email/SMS
        await sendEmail(
            email,
            "Your TrueServe Driver Application - APPROVED",
            `Hi ${name.split(' ')[0]},\n\nGreat news! Your driver application for TrueServe has been approved.\n\nYou can now log in using your phone number to receive a secure SMS code.\n\nPlease go to trueserve.delivery/driver/login to start accepting orders!\n\nWelcome to the team!\n\nBest,\nThe TrueServe Team`
        );

        await sendSMS(
            phone,
            `TrueServe: Your driver application is approved! You can now log in using this phone number at trueserve.delivery/driver/login`
        );

        revalidatePath("/admin/dashboard");
        revalidatePath("/driver/dashboard");
        return { success: true };
    } catch (e: any) {
        console.error("Failed to approve driver:", e);
        return { success: false, error: e.message || "Failed to approve driver." };
    }
}

export async function rejectDriver(id: string) {
    try {
        const { data: driver, error: fetchError } = await supabaseAdmin
            .from('Driver')
            .select('user:User(email, name)')
            .eq('id', id)
            .single();

        if (fetchError || !driver) throw new Error("Driver not found");

        const { error: statusError } = await supabaseAdmin
            .from('Driver')
            .update({ status: "REJECTED", vehicleVerified: false, updatedAt: new Date().toISOString() })
            .eq('id', id);

        if (statusError) throw statusError;

        await sendEmail(
            (driver.user as any).email,
            "Driver Application Update - TrueServe",
            `Hi ${(driver.user as any).name.split(' ')[0]},\n\nWe have reviewed your application to drive with TrueServe. At this time, we are unable to move forward with your onboarding.\n\nThank you for your interest.\n\nBest,\nThe TrueServe Team`
        );

        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (e: any) {
        console.error("Failed to reject driver:", e);
        return { success: false, error: e.message || "Failed to reject driver." };
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

export async function refreshBackgroundCheck(driverId: string) {
    try {
        // Mocking an API call to a provider like Checkr
        const isClean = Math.random() > 0.2; // 80% pass rate
        const status = isClean ? "CLEARED" : "FLAGGED";

        // Fetch Driver Email
        const { data: driver } = await supabaseAdmin
            .from('Driver')
            .select('user:User(email, name)')
            .eq('id', driverId)
            .single();

        const { error } = await supabaseAdmin
            .from('Driver')
            .update({
                backgroundCheckStatus: status,
                backgroundCheckClearedAt: isClean ? new Date().toISOString() : null,
                updatedAt: new Date().toISOString()
            })
            .eq('id', driverId);

        if (error) throw error;

        // Send Email if FLAGGED
        if (status === 'FLAGGED' && driver?.user) {
            await sendEmail(
                (driver.user as any).email,
                "Action Required: Driver Background Check",
                `Hi ${(driver.user as any).name},\n\nDuring our routine background screening, some items were flagged on your report. \n\nPlease contact our trust & safety team at safety@trueserve.com if you would like to provide additional context or dispute these findings.\n\nBest,\nThe TrueServe Team`
            );
        }

        revalidatePath("/admin/dashboard");
        return { success: true, status };
    } catch (e) {
        console.error("Failed to refresh background check:", e);
        return { success: false, error: "Failed to refresh background check." };
    }
}

export async function forceCompleteOrder(orderId: string) {
    try {
        const { error } = await supabaseAdmin
            .from('Order')
            .update({
                status: 'DELIVERED',
                updatedAt: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) throw error;
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function adminCancelOrder(orderId: string) {
    try {
        const { error } = await supabaseAdmin
            .from('Order')
            .update({
                status: 'CANCELLED',
                updatedAt: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) throw error;
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

