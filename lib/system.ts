import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, serviceKey);

import { getFeatureFlag } from './launchdarkly';

export type ConfigKey = 
    | 'MAX_DELIVERY_RADIUS_MILES'
    | 'BASE_SERVICE_FEE_PERCENT'
    | 'DRIVER_SHIFT_MAX_HOURS'
    | 'ORDERING_SYSTEM_ENABLED'
    | 'DRIVER_BASE_PAY'
    | 'DRIVER_MILEAGE_RATE'
    | 'DRIVER_TIME_RATE_MIN'
    | 'STRIPE_SERVICE_FEE_PERCENT'
    | 'DELIVERY_COMPLETION_RADIUS_MILES'
    | 'IS_ALPHA_TESTING';

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

/**
 * Bulk fetcher for multiple configurations to reduce DB hits in loops
 */
export async function getManyConfigs(keys: ConfigKey[]): Promise<Record<string, any>> {
    try {
        const { data, error } = await supabase
            .from('SystemConfig')
            .select('key, value')
            .in('key', keys);

        if (error || !data) return {};
        
        const configMap: Record<string, any> = {};
        data.forEach(item => {
            configMap[item.key] = item.value;
        });
        return configMap;
    } catch (e) {
        console.error("Error bulk fetching configs:", e);
        return {};
    }
}

export async function isOrderingEnabled(): Promise<boolean> {
    // Priority 1: LaunchDarkly Remote Flag
    const ldFlag = await getFeatureFlag('ordering-system-enabled', true);
    
    // Priority 2: Database Override (fallback)
    const dbFlag = await getSystemConfig('ORDERING_SYSTEM_ENABLED', true);
    
    return ldFlag && dbFlag;
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
