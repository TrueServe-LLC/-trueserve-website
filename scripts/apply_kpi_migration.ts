
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

/**
 * QA TEST SCRIPT: apply_kpi_migration.ts
 * 
 * PURPOSE: 
 * Ensures the 'Order' table in Supabase has the necessary columns for tracking 
 * KPI metrics (pickedUpAt, prepTimeEnd, etc.). This script is used after 
 * backend schema updates.
 * 
 * HOW TO RUN:
 * `npx ts-node scripts/apply_kpi_migration.ts`
 * 
 * VERIFICATION:
 * 1. Confirm the script outputs "KPI columns already exist ✅".
 * 2. If missing, follow the logs to run the presented SQL in the Supabase Dashboard.
 */
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySql() {
    const sql = fs.readFileSync('add_kpi_columns.sql', 'utf8')
    console.log('Applying SQL migration to add KPI columns...')

    // Standard Supabase client doesn't support raw SQL unless you've created a helper function.
    // I'll check for columns first.
    const { data: orderSample, error } = await supabase.from('Order').select('*').limit(1);
    if (orderSample && orderSample[0]) {
        if ('pickedUpAt' in orderSample[0]) {
            console.log('KPI columns already exist ✅');
            return;
        }
    }

    console.log('Columns missing. Attempting to use rpc("exec_sql") if available...');
    const { error: rpcError } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (rpcError) {
        console.error('Failed to apply migration via RPC:', rpcError.message);
        console.log('\n--- PLEASE RUN THIS IN SUPABASE SQL EDITOR ---\n');
        console.log(sql);
        console.log('\n----------------------------------------------\n');
    } else {
        console.log('Migration applied successfully via RPC ✅');
    }
}

applySql()
