"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit";
import { v4 as uuidv4 } from "uuid";

/**
 * QA TOOLBOX ACTIONS
 * These actions are specifically for the QA team to manipulate 
 * mock data during the pilot phase.
 */

export async function createMockOrder(restaurantId: string) {
    try {
        const { data: user } = await supabaseAdmin.from('User').select('id').limit(1).single();
        if (!user) throw new Error("No users found to assign mock order.");

        const orderId = uuidv4();
        const { error } = await supabaseAdmin.from('Order').insert({
            id: orderId,
            userId: user.id,
            restaurantId: restaurantId,
            total: 25.50,
            status: 'PENDING',
            deliveryAddress: '123 QA Street, Charlotte, NC',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        if (error) throw error;

        await logAuditAction({
            action: "QA_CREATE_MOCK_ORDER",
            targetId: orderId,
            entityType: "Order",
            message: "Mock order created via QA Toolbox"
        });

        revalidatePath("/admin/dashboard");
        return { success: true, orderId };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function approveAllPendingDrivers() {
    try {
        const { data: drivers, error: fetchError } = await supabaseAdmin
            .from('Driver')
            .select('id, userId')
            .in('status', ['OFFLINE', 'INACTIVE']); // DB Enum doesn't expect PENDING for Drivers in some contexts

        if (fetchError) throw fetchError;
        if (!drivers || drivers.length === 0) return { success: true, count: 0 };

        const { error: statusError } = await supabaseAdmin
            .from('Driver')
            .update({ status: "OFFLINE", vehicleVerified: false, updatedAt: new Date().toISOString() })
            .in('id', drivers.map(d => d.id));

        if (statusError) throw statusError;

        await logAuditAction({
            action: "QA_APPROVE_ALL_DRIVERS",
            targetId: "MULTIPLE",
            entityType: "Driver",
            message: `Batch approved ${drivers.length} drivers via QA Toolbox`
        });

        revalidatePath("/admin/dashboard");
        return { success: true, count: drivers.length };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function clearAllMockData() {
    try {
        // Clear mock restaurants (where isMock is true)
        const { error: restError } = await supabaseAdmin
            .from('Restaurant')
            .delete()
            .eq('isMock', true);

        if (restError) throw restError;

        // Note: We don't delete Orders randomly to avoid breaking foreign keys, 
        // but we could delete orders linked to mock restaurants.
        
        await logAuditAction({
            action: "QA_CLEAR_MOCK_DATA",
            targetId: "SYSTEM",
            entityType: "System",
            message: "Mock restaurants cleared via QA Toolbox"
        });

        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getRecentAuditLogs() {
    try {
        const { data: logs, error } = await supabaseAdmin
            .from('AuditLog')
            .select('*')
            .order('createdAt', { ascending: false })
            .limit(20);

        if (error) throw error;
        return { success: true, logs };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function generateMockDrivers() {
    try {
        let { data: user } = await supabaseAdmin.from('User').select('id, email').eq('role', 'QA_TESTER').limit(1).single();
        if (!user) {
            // fallback to any admin
            const { data: fallbackUser } = await supabaseAdmin.from('User').select('id, email').in('role', ['ADMIN']).limit(1).single();
            if (!fallbackUser) throw new Error("A user account is required to assign mock drivers to.");
            user = fallbackUser;
        }

        const regions = ["Mecklenburg, NC", "Surry, NC", "Spartanburg, SC"];
        const driversToInsert = regions.map((region, idx) => ({
            id: uuidv4(),
            userId: user.id, // Assign to the QA tester for easy testing/cleanup
            status: 'INACTIVE', // Requires test approval
            vehicleVerified: false,
            firstName: `Mock Driver`,
            lastName: `(${region})`,
            phoneIndex: `+1555000000${idx}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }));

        const { error } = await supabaseAdmin.from('Driver').insert(driversToInsert);
        if (error) throw error;

        await logAuditAction({
            action: "QA_CREATE_MOCK_DRIVERS",
            targetId: "MULTIPLE",
            entityType: "Driver",
            message: `Created ${regions.length} mock drivers for regions: ${regions.join(', ')}`
        });

        revalidatePath("/admin/dashboard");
        return { success: true, count: regions.length };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
