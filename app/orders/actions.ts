"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";

export async function customerCancelOrder(orderId: string, reason: string, comment?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    try {
        const { data: order } = await supabase
            .from('Order')
            .select('status, restaurantId, restaurant:Restaurant(name)')
            .eq('id', orderId)
            .single();

        if (!order) throw new Error("Order not found");
        if (order.status !== 'PENDING' && order.status !== 'PREPARING') {
            throw new Error("Order cannot be cancelled at this stage. It is already being prepared or out for delivery.");
        }

        const { error } = await supabaseAdmin
            .from('Order')
            .update({
                status: 'CANCELLED',
                cancelReason: reason,
                cancelComment: comment,
                updatedAt: new Date().toISOString()
            })
            .eq('id', orderId);


        if (error) throw error;

        // Notify Merchant
        const restaurantName = (order.restaurant as any)?.name || "the restaurant";
        await createNotification({
            userId: (order as any).restaurantId, // Assuming we notify the restaurant owner? We need to find ownerId.
            title: "Order Cancelled by Customer",
            message: `Order ${orderId.slice(-6).toUpperCase()} was cancelled by the customer.`
        });

        revalidatePath(`/orders/${orderId}`);
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}
