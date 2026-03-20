import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, serviceKey);

export type ConfigKey = 
    | 'MAX_DELIVERY_RADIUS_MILES'
    | 'BASE_SERVICE_FEE_PERCENT'
    | 'DRIVER_SHIFT_MAX_HOURS'
    | 'ORDERING_SYSTEM_ENABLED';

export async function getSystemConfig(key: ConfigKey, defaultValue?: any): Promise<any> {
    try {
        const { data, error } = await supabase
            .from('SystemConfig')
            .select('value')
            .eq('key', key)
            .maybeSingle();

        if (error || !data) return defaultValue;
        return data.value;
    } catch (e) {
        console.error(`Error fetching config ${key}:`, e);
        return defaultValue;
    }
}

export async function isOrderingEnabled(): Promise<boolean> {
    return await getSystemConfig('ORDERING_SYSTEM_ENABLED', true);
}

export async function updateSystemConfig(key: ConfigKey, value: any, actorId?: string) {
    const { error } = await supabase
        .from('SystemConfig')
        .update({ value, updatedAt: new Date().toISOString() })
        .eq('key', key);

    if (error) throw error;

    // Log the change
    const { logAuditAction } = await import('./audit');
    await logAuditAction({
        action: "UPDATE_SYSTEM_CONFIG",
        targetId: key,
        entityType: "SystemConfig",
        after: { value },
        message: `System config ${key} updated.`
    });
}
