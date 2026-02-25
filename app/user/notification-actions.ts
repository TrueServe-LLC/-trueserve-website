"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
    const supabase = await createClient();

    const { data: notifications, error } = await supabase
        .from('Notification')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Get notifications error:", error);
        return [];
    }

    return notifications || [];
}

export async function markNotificationAsRead(notificationId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('Notification')
        .update({ isRead: true })
        .eq('id', notificationId);

    if (error) {
        console.error("Mark as read error:", error);
        return { success: false, error: error.message };
    }

    revalidatePath('/');
    return { success: true };
}

export async function markAllAsRead() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false };

    const { error } = await supabase
        .from('Notification')
        .update({ isRead: true })
        .eq('userId', user.id)
        .eq('isRead', false);

    if (error) {
        console.error("Mark all as read error:", error);
        return { success: false, error: error.message };
    }

    revalidatePath('/');
    return { success: true };
}
