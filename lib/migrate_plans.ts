
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log("Adding plan columns...");
    const { error: err1 } = await supabase.rpc('exec_sql', { sql: 'ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "plan" TEXT DEFAULT \'Flex Options\';' });
    const { error: err2 } = await supabase.rpc('exec_sql', { sql: 'ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;' });

    // Fallback approach if exec_sql doesn't exist
    if (err1) {
        console.warn("RPC exec_sql failed, trying standard query as sanity check...");
        const { error: err3 } = await supabase.from('Restaurant').select('plan').limit(1);
        if (err3) {
            console.error("CRITICAL: Database needs migration. Please run db/add_plan_columns.sql in your Supabase SQL Editor.");
        } else {
            console.log("Plan column already exists.");
        }
    } else {
        console.log("Columns added successfully.");
    }
}

run();
