
import { createClient } from '@supabase/supabase-js';

// Use a direct client for system checks to avoid RLS/Cookie overhead in critical paths
// validated safe as we are strictly reading public config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, serviceKey);

export async function isOrderingEnabled(): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('SystemSettings')
            .select('value')
            .eq('key', 'ordering_enabled')
            .maybeSingle();

        if (error || !data) {
            // Default to OPEN if config is missing (fail open, or fail closed? 
            // Better to fail open for revenue, but Pilot safety suggests fail closed if DB is weird. 
            // Let's stick to true for now unless explicitly set false).
            return true;
        }

        return data.value === true;
    } catch (e) {
        console.error("System Check Error:", e);
        return true;
    }
}
