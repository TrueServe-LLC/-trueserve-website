import * as LaunchDarkly from '@launchdarkly/node-server-sdk';

let ldClient: LaunchDarkly.LDClient | null = null;

export async function getLDClient(): Promise<LaunchDarkly.LDClient> {
    if (ldClient) return ldClient;

    const sdkKey = process.env.LAUNCHDARKLY_SDK_KEY;
    if (!sdkKey) {
        console.warn("LAUNCHDARKLY_SDK_KEY is not set. LaunchDarkly feature flags will run in offline mode.");
    }

    // Initialize client. Run in offline mode if there's no SDK key, yielding safe default values.
    ldClient = LaunchDarkly.init(sdkKey || "offline", {
        offline: !sdkKey,
    });

    try {
        await ldClient.waitForInitialization({ timeout: 5 });
    } catch (e) {
        console.warn("LaunchDarkly initialization timed out or failed. Defaulting to safe values.", e);
    }
    
    return ldClient;
}

/**
 * Validates a feature flag state.
 * Examples: 'pilot_ordering_enabled', 'stripe_connect_required', 'new_pricing_engine'
 */
export async function getFeatureFlag(flagKey: string, defaultValue: boolean = false, contextKey: string = 'system'): Promise<boolean> {
    const client = await getLDClient();
    return await client.variation(flagKey, { kind: 'user', key: contextKey }, defaultValue);
}
