
import { supabaseAdmin } from "./supabase-admin";

export async function createNotification({
    userId,
    title,
    message,
    type = 'ORDER_UPDATE',
    orderId = null
}: {
    userId: string,
    title: string,
    message: string,
    type?: string,
    orderId?: string | null
}) {
    try {
        const { error } = await supabaseAdmin
            .from('Notification')
            .insert({
                userId,
                title,
                message,
                type,
                orderId
            });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Failed to create notification:", error);
        return { success: false, error };
    }
}
