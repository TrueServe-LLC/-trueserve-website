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
    | 'MARKETPLACE_EMERGENCY_LOCK'
    | 'IS_ALPHA_TESTING'
    | 'AI_MENU_SCANNER_ENABLED'
    | 'GOOGLE_RATINGS_SYNC_ENABLED'
    | 'INSTANT_PAYOUTS_ENABLED'
    | 'EXPRESS_CHECKOUT_ACTIVE'
    | 'COMPLIANCE_LAYER_ENABLED';

export type ConfigEnvironment = 'development' | 'preview' | 'production';

const ENVIRONMENT_PREFIX: Record<ConfigEnvironment, string> = {
    development: "DEVELOPMENT__",
    preview: "PREVIEW__",
    production: "PRODUCTION__",
};

function resolveRuntimeEnvironment(): ConfigEnvironment {
    const vercelEnv = (process.env.VERCEL_ENV || "").toLowerCase();
    if (vercelEnv === "preview" || vercelEnv === "production" || vercelEnv === "development") {
        return vercelEnv;
    }

    if (process.env.NODE_ENV === "production") {
        return "production";
    }

    return "development";
}

export function buildScopedConfigKey(key: ConfigKey, environment: ConfigEnvironment): string {
    return `${ENVIRONMENT_PREFIX[environment]}${key}`;
}

export async function getSystemConfig(
    key: ConfigKey,
    defaultValue?: any,
    environment?: ConfigEnvironment
): Promise<any> {
    try {
        const resolvedEnvironment = environment || resolveRuntimeEnvironment();
        const scopedKey = buildScopedConfigKey(key, resolvedEnvironment);

        const { data, error } = await supabase
            .from('SystemConfig')
            .select('key, value')
            .in('key', [scopedKey, key]);

        if (error || !data || data.length === 0) return defaultValue;

        const scoped = data.find((entry: any) => entry.key === scopedKey);
        if (scoped) return scoped.value;

        const global = data.find((entry: any) => entry.key === key);
        if (global) return global.value;

        return defaultValue;
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
    // 1. LaunchDarkly Remote Flag (Highest Priority)
    const ldFlag = await getFeatureFlag('ordering-system-enabled', true);
    if (!ldFlag) return false;

    // 2. Emergency Lock (Trip-wire from Support/Jira)
    const emergencyLock = await getSystemConfig('MARKETPLACE_EMERGENCY_LOCK', false);
    if (emergencyLock === true || emergencyLock === 'true') return false;

    return true;
}

/**
 * Feature-specific Checkers (LaunchDarkly + Supabase Fallbacks)
 */
export async function isAiScannerEnabled(): Promise<boolean> {
    const ld = await getFeatureFlag('ai-menu-onboarding', true);
    const db = await getSystemConfig('AI_MENU_SCANNER_ENABLED', true);
    return ld && db;
}

export async function isGoogleRatingSyncEnabled(): Promise<boolean> {
    const ld = await getFeatureFlag('google-business-sync', false);
    const db = await getSystemConfig('GOOGLE_RATINGS_SYNC_ENABLED', false);
    return ld && db;
}

export async function isInstantPayoutEnabled(): Promise<boolean> {
    const ld = await getFeatureFlag('stripe-instant-payouts', true);
    const db = await getSystemConfig('INSTANT_PAYOUTS_ENABLED', true);
    return ld && db;
}

export async function isExpressCheckoutActive(): Promise<boolean> {
    const ld = await getFeatureFlag('express-checkout', true);
    const db = await getSystemConfig('EXPRESS_CHECKOUT_ACTIVE', true);
    return ld && db;
}

export async function isComplianceLayerEnabled(): Promise<boolean> {
    const db = await getSystemConfig('COMPLIANCE_LAYER_ENABLED', process.env.NODE_ENV !== 'production');
    return db === true || db === 'true';
}

export async function updateSystemConfig(
    key: ConfigKey,
    value: any,
    actorId?: string,
    environment?: ConfigEnvironment
) {
    const storedKey = environment ? buildScopedConfigKey(key, environment) : key;

    const upsertBase = await supabase
        .from('SystemConfig')
        .upsert(
            {
                key: storedKey,
                value,
                updatedAt: new Date().toISOString()
            },
            { onConflict: 'key' }
        );

    let error = upsertBase.error;
    if (error && error.message?.toLowerCase().includes("createdat")) {
        const withCreatedAt = await supabase
            .from('SystemConfig')
            .upsert(
                {
                    key: storedKey,
                    value,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                { onConflict: 'key' }
            );
        error = withCreatedAt.error;
    }

    if (error) throw error;

    // Log the change
    const { logAuditAction } = await import('./audit');
    await logAuditAction({
        action: "UPDATE_SYSTEM_CONFIG",
        targetId: storedKey,
        entityType: "SystemConfig",
        after: { value },
        message: `System config ${storedKey} updated.`
    });
}
