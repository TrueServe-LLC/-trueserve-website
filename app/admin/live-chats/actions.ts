"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function getLiveChats() {
    const { data, error } = await supabaseAdmin
        .from('SupportChat')
        .select(`
            *,
            User:userId (name, email)
        `)
        .in('status', ['HUMAN_REQUIRED', 'BOT_ACTIVE'])
        .order('updatedAt', { ascending: false });
    
    if (error) {
        console.error("Error fetching live chats:", error);
        return [];
    }
    return data || [];
}

export async function getChatTranscript(chatId: string) {
    const { data, error } = await supabaseAdmin
        .from('SupportMessage')
        .select('*')
        .eq('chatId', chatId)
        .order('createdAt', { ascending: true });
    
    if (error) {
        console.error("Error fetching chat messages:", error);
        return [];
    }
    return data || [];
}

export async function replyToUser(chatId: string, message: string) {
    const { error } = await supabaseAdmin
        .from('SupportMessage')
        .insert({
            chatId,
            sender: 'HUMAN_AGENT',
            content: message
        });
    
    if (error) throw error;
    
    await supabaseAdmin
        .from('SupportChat')
        .update({ updatedAt: new Date().toISOString() })
        .eq('id', chatId);

    revalidatePath("/admin/live-chats");
}

export async function resolveChat(chatId: string) {
    const { error } = await supabaseAdmin
        .from('SupportChat')
        .update({ status: 'RESOLVED', updatedAt: new Date().toISOString() })
        .eq('id', chatId);
    
    if (error) throw error;
    revalidatePath("/admin/live-chats");
}
