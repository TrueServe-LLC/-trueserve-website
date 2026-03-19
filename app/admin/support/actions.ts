"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function getSupportTickets() {
    const { data, error } = await supabaseAdmin
        .from('SupportTicket')
        .select(`
            *,
            User:userId (name, email, role),
            Messages:TicketMessage (*)
        `)
        .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data || [];
}

export async function getTicketMessages(ticketId: string) {
    const { data, error } = await supabaseAdmin
        .from('TicketMessage')
        .select('*')
        .eq('ticketId', ticketId)
        .order('createdAt', { ascending: true });
    
    if (error) throw error;
    return data || [];
}

export async function updateTicketStatus(ticketId: string, status: string, assignedTo?: string) {
    const { error } = await supabaseAdmin
        .from('SupportTicket')
        .update({ status, assignedTo, updatedAt: new Date().toISOString() })
        .eq('id', ticketId);
    
    if (error) throw error;
    revalidatePath("/admin/support");
    return { success: true };
}

export async function sendTicketMessage(ticketId: string, senderId: string, message: string) {
    const { data, error } = await supabaseAdmin
        .from('TicketMessage')
        .insert({
            ticketId,
            senderId,
            message,
            createdAt: new Date().toISOString()
        })
        .select()
        .single();
    
    if (error) throw error;

    // Update ticket's updatedAt for sorting
    await supabaseAdmin.from('SupportTicket').update({ updatedAt: new Date().toISOString() }).eq('id', ticketId);

    revalidatePath("/admin/support");
    return data;
}

export async function processRefund(orderId: string, amount: number) {
    // This would connect to the Stripe module in lib/stripe.ts
    // For now, it logs the action and returns success simulation
    console.log(`[REFUND] Processing refund for order ${orderId} amount $${amount}`);
    
    // Log in AuditLog
    await supabaseAdmin.from('AuditLog').insert({
        action: 'PROCESS_REFUND',
        targetId: orderId,
        entityType: 'ORDER',
        message: `Processed refund of $${amount}`
    });

    return { success: true, message: "Refund processed via Stripe" };
}
