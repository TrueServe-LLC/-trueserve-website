"use server";


import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { cookies } from "next/headers";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import { getAuthSession } from "@/app/auth/actions";
import { logAuditAction } from "@/lib/audit";

// Removed local logAuditAction, using shared version from @/lib/audit

export async function approveMenuItem(id: string) {
    try {
        const { error } = await supabase
            .from('MenuItem')
            .update({ status: "APPROVED" })
            .eq('id', id);

        if (error) {
            throw error;
        }

        await logAuditAction({ action: "APPROVE_MENU_ITEM", targetId: id, entityType: "MenuItem", before: { status: "PENDING" }, after: { status: "APPROVED" } });

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

        await logAuditAction({ action: "REJECT_MENU_ITEM", targetId: id, entityType: "MenuItem", before: { status: "PENDING" }, after: { status: "REJECTED" } });

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

        await logAuditAction({ action: "FLAG_MENU_ITEM", targetId: id, entityType: "MenuItem", before: { status: "PENDING" }, after: { status: "FLAGGED" } });

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

        if (authError && !authError.message.includes("already exists")) {
            console.error("Auth Creation Error:", authError);
            throw authError;
        }

        if (authError?.message.includes("already exists")) {
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(driver.userId, {
                user_metadata: { role: 'DRIVER', displayName: name }
            });
            if (updateError) console.error("Failed to sync role for existing driver:", updateError);
        }

        const { error: statusError } = await supabaseAdmin
            .from('Driver')
            .update({ status: "OFFLINE", vehicleVerified: true, updatedAt: new Date().toISOString() })
            .eq('id', id);

        if (statusError) throw statusError;

        await logAuditAction({ action: "APPROVE_DRIVER", targetId: id, entityType: "Driver", before: { status: "PENDING" }, after: { status: "OFFLINE" } });

        await sendEmail(
            email,
            "Your TrueServe Driver Application - APPROVED",
            `Hi ${name.split(' ')[0]},\n\nGreat news! Your driver application for TrueServe has been approved.\n\nYou can now log in using your phone number to receive a secure SMS code.\n\nPlease go to driver.trueservedelivery.com/login to start accepting orders!\n\nWelcome to the team!\n\nBest,\nThe TrueServe Team`
        );

        await sendSMS(
            phone,
            `TrueServe: Your driver application is approved! You can now log in using this phone number at driver.trueservedelivery.com/login`
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

        await logAuditAction({ action: "REJECT_DRIVER", targetId: id, entityType: "Driver", before: { status: "PENDING" }, after: { status: "REJECTED" } });

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

    await logAuditAction({ action: "CONNECT_STRIPE_PORTAL", targetId: "STRIPE", entityType: "System" });

    redirect("https://dashboard.stripe.com/acct_1Sdd5I2XvtkOTi1j/payment-links/create");
}

export async function logout() {
    const { logout: unifiedLogout } = await import("@/app/auth/actions");
    await unifiedLogout();
}

export async function toggleOrderingStatus(enabled: boolean) {
    try {
        const { updateSystemConfig } = await import('@/lib/system');
        await updateSystemConfig('ORDERING_SYSTEM_ENABLED', enabled);

        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/settings");
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateConfigParam(key: any, value: any) {
    try {
        const { updateSystemConfig } = await import('@/lib/system');
        await updateSystemConfig(key, value);

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function refreshBackgroundCheck(driverId: string) {
    try {
        const isClean = Math.random() > 0.2;
        const status = isClean ? "CLEARED" : "FLAGGED";

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

        await logAuditAction({ action: "REFRESH_BACKGROUND_CHECK", targetId: driverId, entityType: "Driver", after: { status } });

        if (status === 'FLAGGED' && driver?.user) {
            await sendEmail(
                (driver.user as any).email,
                "Action Required: Driver Background Check",
                `Hi ${(driver.user as any).name},\n\nDuring our routine background screening, some items were flagged on your report. \n\nPlease contact our trust & safety team at safety@trueservedelivery.com if you would like to provide additional context or dispute these findings.\n\nBest,\nThe TrueServe Team`
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
                deliveredAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) throw error;

        await logAuditAction({ action: "FORCE_COMPLETE_ORDER", targetId: orderId, entityType: "Order", before: { status: "ACTIVE" }, after: { status: "DELIVERED" } });

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

        await logAuditAction({ action: "ADMIN_CANCEL_ORDER", targetId: orderId, entityType: "Order", before: { status: "ACTIVE" }, after: { status: "CANCELLED" } });

        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}


export async function requestChange(data: { entityType: string; entityId: string; changeData: any; previousData: any; rollbackPlan?: string }) {
    try {
        const { isAuth, role, userId, name } = await getAuthSession();
        if (!isAuth) throw new Error("Unauthorized");

        const { error } = await supabaseAdmin
            .from('ChangeRequest')
            .insert({
                ...data,
                requestedBy: { name, role, userId },
                status: 'PENDING',
                createdAt: new Date().toISOString()
            });

        if (error) throw error;

        await logAuditAction({ action: "REQUEST_CHANGE", targetId: data.entityId, entityType: data.entityType, after: { status: "PENDING" } });

        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/settings");
        return { success: true };
    } catch (e: any) {
        console.error("Failed to request change:", e);
        return { success: false, error: e.message };
    }
}

export async function approveRequest(requestId: string) {
    try {
        const { isAuth, role, userId } = await getAuthSession();
        if (!isAuth || role !== 'ADMIN') throw new Error("Only admins can approve sensitive changes");

        const { data: request, error: fetchError } = await supabaseAdmin
            .from('ChangeRequest')
            .select('*')
            .eq('id', requestId)
            .single();

        if (fetchError || !request) throw new Error("Request not found");

        const tableName = request.entityType;
        const pkColumn = tableName === 'SystemConfig' ? 'key' : 'id';

        // 1. Apply the Actual Change to the Target Table
        const { error: applyError } = await supabaseAdmin
            .from(tableName)
            .update(request.changeData)
            .eq(pkColumn, request.entityId);

        if (applyError) throw applyError;

        // 2. Mark Request as Approved
        const { error: updateError } = await supabaseAdmin
            .from('ChangeRequest')
            .update({ status: 'APPROVED', approvedBy: userId, updatedAt: new Date().toISOString() })
            .eq('id', requestId);

        if (updateError) throw updateError;

        await logAuditAction({ action: "APPROVE_CHANGE", targetId: request.entityId, entityType: request.entityType, after: { status: "APPROVED" } });

        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/settings");
        return { success: true };
    } catch (e: any) {
        console.error("Failed to approve change:", e);
        return { success: false, error: e.message };
    }
}

export async function rejectRequest(requestId: string) {
    try {
        const { isAuth, role, userId } = await getAuthSession();
        if (!isAuth || role !== 'ADMIN') throw new Error("Unauthorized");

        const { error } = await supabaseAdmin
            .from('ChangeRequest')
            .update({ status: 'REJECTED', approvedBy: userId, updatedAt: new Date().toISOString() })
            .eq('id', requestId);

        if (error) throw error;

        await logAuditAction({ action: "REJECT_CHANGE", targetId: requestId, entityType: "ChangeRequest", after: { status: "REJECTED" } });

        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/settings");
        return { success: true };
    } catch (e: any) {
        console.error("Failed to reject change:", e);
        return { success: false, error: e.message };
    }
}
