"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit";

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

    await logAuditAction({ 
        action: "UPSERT_PRICING_RULE", 
        targetId: data.id, 
        entityType: "PricingRule", 
        after: data 
    });

    revalidatePath("/admin/pricing");
    return data;
}

export async function deletePricingRule(id: string) {
    const { error } = await supabaseAdmin
        .from('PricingRule')
        .delete()
        .eq('id', id);
    
    if (error) throw error;

    await logAuditAction({ 
        action: "DELETE_PRICING_RULE", 
        targetId: id, 
        entityType: "PricingRule",
        message: "Pricing rule deleted by admin"
    });

    revalidatePath("/admin/pricing");
    return { success: true };
}

export async function toggleRuleStatus(id: string, isActive: boolean) {
    const { error } = await supabaseAdmin
        .from('PricingRule')
        .update({ isActive, updatedAt: new Date().toISOString() })
        .eq('id', id);
    
    if (error) throw error;

    await logAuditAction({ 
        action: "TOGGLE_RULE_STATUS", 
        targetId: id, 
        entityType: "PricingRule", 
        before: { isActive: !isActive }, 
        after: { isActive } 
    });

    revalidatePath("/admin/pricing");
    return { success: true };
}
