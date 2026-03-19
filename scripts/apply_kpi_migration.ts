
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

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySql() {
    const sql = fs.readFileSync('add_kpi_columns.sql', 'utf8')
    console.log('Applying SQL migration to add KPI columns...')
    
    // Using rpc if exec_sql is available, or just try to perform a query that fails if column missing
    // Since I can't run arbitrary SQL via the standard client without a custom function, 
    // I'll check if the columns exist first, and if not, I'll advise the user to run it in the dashboard 
    // OR I can use the postgres connection if available.
    
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
