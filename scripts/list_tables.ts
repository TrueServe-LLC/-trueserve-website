
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function listTables() {
    const { data: tables, error } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')

    if (error) {
        // Fallback for some Supabase configs
        const { data: rawTables, error: rawError } = await supabase.rpc('get_tables');
        if (rawError) {
             console.error('Error fetching tables:', rawError)
             return;
        }
        console.log('Tables:', rawTables.map((t: any) => t.tablename))
    } else {
        console.log('Tables:', tables.map((t: any) => t.tablename))
    }
}

// Since pg_tables might not be accessible via from() depending on RLS/schema, 
// let's try a different approach if it fails.
listTables()
