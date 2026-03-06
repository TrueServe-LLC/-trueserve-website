
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

if (!supabaseUrl || !supabaseServiceRoleKey) {
    if (process.env.NODE_ENV !== 'production') {
        console.warn('Supabase Service Role Key is missing. Admin features will fail.')
    }
}

// Create a client with the Service Role Key
// This client bypasses Row Level Security (RLS) entirely.
// ONLY use this in server-side contexts (API routes, Server Actions).
// NEVER expose this client to the browser.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
