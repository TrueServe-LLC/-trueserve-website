
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

async function testTables() {
    const tableNames = ['AuditLog', 'SystemSettings', 'AdminPortal', 'Onboarding', 'Incident', 'PricingRule', 'support_tickets'];
    for (const tableName of tableNames) {
        const { error } = await supabase.from(tableName).select('*').limit(1);
        if (error && error.code === 'PGRST116') {
             console.log(`Table ${tableName}: NOT FOUND (PGRST116)`);
        } else if (error) {
             console.log(`Table ${tableName}: Maybe exists? Error: ${error.code} - ${error.message}`);
        } else {
             console.log(`Table ${tableName}: EXISTS ✅`);
        }
    }
}

testTables()
