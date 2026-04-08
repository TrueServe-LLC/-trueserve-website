"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";
import { cookies } from "next/headers";

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

export async function submitOrderIssueProof(orderId: string, issueType: string, description: string, photo?: File | null) {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const cookieUserId = cookieStore.get("userId")?.value;
    const { data: { user } } = await supabase.auth.getUser();
    const activeUserId = user?.id || cookieUserId;

    if (!activeUserId) return { error: "Unauthorized" };

    try {
        const { data: order, error: orderError } = await supabaseAdmin
            .from('Order')
            .select('id, restaurantId, restaurant:Restaurant(ownerId, name)')
            .eq('id', orderId)
            .single();

        if (orderError || !order) throw new Error("Order not found");

        let proofUrl: string | null = null;

        if (photo && photo.size > 0) {
            const fileExt = photo.name.split('.').pop() || "jpg";
            const fileName = `${orderId}_${Date.now()}.${fileExt}`;
            const filePath = `customer_issues/${fileName}`;
            const buffer = Buffer.from(await photo.arrayBuffer());

            await supabaseAdmin.storage.createBucket("order_issue_proofs", { public: true }).catch(() => { });

            const { error: uploadError } = await supabaseAdmin.storage
                .from("order_issue_proofs")
                .upload(filePath, buffer, {
                    contentType: photo.type || "image/jpeg",
                    upsert: false,
                });

            if (!uploadError) {
                const { data: publicData } = supabaseAdmin.storage.from("order_issue_proofs").getPublicUrl(filePath);
                proofUrl = publicData.publicUrl;
            }
        }

        const issueMessage = [
            `Customer Issue Report`,
            `Order: #${orderId.slice(-6).toUpperCase()}`,
            `Type: ${issueType}`,
            `Details: ${description || "No additional details provided."}`,
            proofUrl ? `Proof Photo: ${proofUrl}` : "Proof Photo: Not attached",
        ].join(" | ");

        await supabaseAdmin.from("OrderChatMessage").insert({
            orderId,
            sender: "CUSTOMER",
            content: issueMessage,
        });

        const ownerId = (order.restaurant as any)?.ownerId || order.restaurantId;
        await createNotification({
            userId: ownerId,
            title: "Customer Reported an Issue",
            message: `Order ${orderId.slice(-6).toUpperCase()} has a new issue report from the customer.`,
            type: "ORDER_ALERT",
            orderId,
        });

        revalidatePath(`/orders/${orderId}`);
        revalidatePath('/merchant/dashboard');
        return { success: true, proofUrl };
    } catch (e: any) {
        console.error("submitOrderIssueProof failed:", e);
        return { error: e.message || "Failed to submit issue report." };
    }
}
