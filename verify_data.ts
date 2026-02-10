
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function verify() {
    console.log("Verifying Data Visibility...");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
        console.error("Missing keys");
        return;
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);

    // Check Service Role (Admin)
    const { count: adminCount, error: adminError } = await serviceClient
        .from('Restaurant')
        .select('*', { count: 'exact', head: true });

    console.log(`[Admin/ServiceRole] Restaurant Count: ${adminCount} (Error: ${adminError?.message})`);

    // Check Anon (Public)
    const { count: anonCount, error: anonError } = await anonClient
        .from('Restaurant')
        .select('*', { count: 'exact', head: true });

    console.log(`[Public/Anon] Restaurant Count: ${anonCount} (Error: ${anonError?.message})`);

    if (adminCount && adminCount > 0 && (!anonCount || anonCount === 0)) {
        console.log("DIAGNOSIS: RLS Policies are preventing public access.");
    } else if (adminCount === 0) {
        console.log("DIAGNOSIS: Database is empty.");
    } else {
        console.log("DIAGNOSIS: Data seems visible. Check application logic.");
    }
}

verify();
