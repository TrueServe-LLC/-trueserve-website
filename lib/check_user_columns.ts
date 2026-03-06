
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log("Checking User table columns...");
    const { data: userColumns, error } = await supabase.rpc('get_table_columns', { table_name: 'User' });

    if (error) {
        console.error("Error fetching columns:", error);
        // Fallback: try selecting a nonexistent column to see the error message which might contain column names
        const { error: selectError } = await supabase.from('User').select('plan').limit(1);
        if (selectError) {
            console.log("Plan column likely missing on User table.");
        } else {
            console.log("Plan column exists on User table.");
        }
    } else {
        console.log("User Columns:", userColumns);
    }
}

run();
