"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit";
import { v4 as uuidv4 } from "uuid";
import { isProductionEnvironment } from "@/lib/environment";

/**
 * QA TOOLBOX ACTIONS
 * These actions are specifically for the QA team to manipulate 
 * mock data during the pilot phase.
 */

export async function createMockOrder(restaurantId: string) {
    try {
        if (isProductionEnvironment()) throw new Error("QA mock orders are disabled in production.");
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
        if (isProductionEnvironment()) throw new Error("QA driver approval is disabled in production.");
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
        if (isProductionEnvironment()) throw new Error("Mock data cleanup is disabled in production.");
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
        if (isProductionEnvironment()) throw new Error("Mock driver generation is disabled in production.");
        const regions = [
            { name: "Mecklenburg, NC", email: "driver.meck@trueserve.test" },
            { name: "Surry, NC", email: "driver.surry@trueserve.test" },
            { name: "Spartanburg, SC", email: "driver.spartan@trueserve.test" }
        ];

        const results = [];

        for (const region of regions) {
            // 1. Check if user already exists
            let { data: existingUser } = await supabaseAdmin.from('User').select('id').eq('email', region.email).maybeSingle();
            let userId = existingUser?.id;

            if (!userId) {
                userId = uuidv4();
                await supabaseAdmin.from('User').insert({
                    id: userId,
                    email: region.email,
                    name: `Pilot Driver (${region.name.split(',')[0]})`,
                    role: 'DRIVER',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                
                // Also create Auth user so they can log in
                await supabaseAdmin.auth.admin.createUser({
                    email: region.email,
                    password: 'TrueServeDriver2026!',
                    email_confirm: true
                });
            }

            const driverId = uuidv4();
            await supabaseAdmin.from('Driver').upsert({
                id: driverId,
                userId: userId,
                status: 'INACTIVE',
                vehicleVerified: false,
                firstName: 'Pilot',
                lastName: `Driver (${region.name.split(',')[0]})`,
                phoneIndex: `+1555${Math.floor(1000000 + Math.random() * 9000000)}`,
                insuranceDocumentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cbd22cd6?q=80&w=200', // Mock insurance doc
                registrationDocumentUrl: 'https://images.unsplash.com/photo-1554224154-71eaa149cf8a?q=80&w=200', // Mock registration doc
                backgroundCheckStatus: 'CLEARED',
                backgroundCheckId: `BC-${Math.floor(100000 + Math.random() * 900000)}`,
                hasSignedAgreement: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }, { onConflict: 'userId' });

            results.push(region.email);
        }

        await logAuditAction({
            action: "QA_CREATE_MOCK_DRIVERS",
            targetId: "MULTIPLE",
            entityType: "Driver",
            message: `Created ${regions.length} unique documented mock drivers: ${results.join(', ')}`
        });

        revalidatePath("/admin/dashboard");
        return { success: true, count: regions.length };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function advanceMockOrder() {
    try {
        if (isProductionEnvironment()) throw new Error("Mock order advancement is disabled in production.");
        const { data: order } = await supabaseAdmin.from('Order').select('id, status').not('status', 'in', '("DELIVERED","CANCELLED","REFUNDED")').order('createdAt', { ascending: false }).limit(1).single();
        if (!order) throw new Error("No active orders found to advance.");

        const statusProgression: Record<string, string> = {
            'PENDING': 'ACCEPTED',
            'ACCEPTED': 'PREPARING',
            'PREPARING': 'READY',
            'READY': 'PICKED_UP',
            'PICKED_UP': 'DELIVERED'
        };

        const nextStatus = statusProgression[order.status] || 'DELIVERED';

        const { error } = await supabaseAdmin.from('Order').update({ status: nextStatus, updatedAt: new Date().toISOString() }).eq('id', order.id);
        if (error) throw error;

        await logAuditAction({
            action: "QA_ADVANCE_ORDER",
            targetId: order.id,
            entityType: "Order",
            message: `Order status artificially advanced from ${order.status} to ${nextStatus}`
        });

        revalidatePath("/admin/dashboard");
        return { success: true, nextStatus, orderId: order.id };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function checkMockSmsProvider() {
    try {
        if (isProductionEnvironment()) throw new Error("Mock SMS testing is disabled in production.");
        // Just return dummy data for QA since Supabase uses native SMS Twilio integration that isn't logged in DB 
        return { success: true, fakeCode: "123456", message: "SMS OTPs are currently managed exclusively by Supabase Auth (Twilio). Use one of the registered test phone numbers (+15555555555 etc) in Supabase with code 123456 to bypass real SMS gating." };
    } catch(e: any) {
        return { success: false, error: e.message };
    }
}
