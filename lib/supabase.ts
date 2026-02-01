import { createClient } from '@supabase/supabase-js'

// Force load env variables on server side if missing
if (typeof window === 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
        require('dotenv').config();
    } catch (e) {
        // Dotenv might not be available or needed
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Avoid throwing errors during static analysis/build where envs might be missing
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (process.env.NODE_ENV !== 'production') {
        console.warn('Supabase environment variables are missing. Some features may not work.')
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Better yet, use a getter function to avoid crashes:
export const getSupabase = () => {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase environment variables are missing.");
    }
    return createClient(supabaseUrl, supabaseAnonKey);
}