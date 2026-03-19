"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function getPricingRules() {
    const { data, error } = await supabaseAdmin
        .from('PricingRule')
        .select('*')
        .order('priority', { ascending: false });
    
    if (error) throw error;
    return data || [];
}

export async function upsertPricingRule(rule: any) {
    const { data, error } = await supabaseAdmin
        .from('PricingRule')
        .upsert({
            ...rule,
            updatedAt: new Date().toISOString()
        })
        .select()
        .single();
    
    if (error) throw error;
    revalidatePath("/admin/pricing");
    return data;
}

export async function deletePricingRule(id: string) {
    const { error } = await supabaseAdmin
        .from('PricingRule')
        .delete()
        .eq('id', id);
    
    if (error) throw error;
    revalidatePath("/admin/pricing");
    return { success: true };
}

export async function toggleRuleStatus(id: string, isActive: boolean) {
    const { error } = await supabaseAdmin
        .from('PricingRule')
        .update({ isActive, updatedAt: new Date().toISOString() })
        .eq('id', id);
    
    if (error) throw error;
    revalidatePath("/admin/pricing");
    return { success: true };
}
