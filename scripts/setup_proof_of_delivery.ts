import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
    console.log("Adding proofOfDeliveryUrl column...");
    // Since we don't have direct SQL execution without RPC, we can just use REST to create a column if missing, 
    // Wait, the easier way is a direct query if possible, or just ignore DB schema and let Supabase schema-less if not possible? 
    // Supabase has strict tables. Let's use standard POST for RPC if there's a custom one, OR just write it to a .sql file for the user.
    // Actually, I can execute SQL via npx postgres connection or try to use Prisma? No Prisma here.
    
    // Instead of raw execute, let's check if the column exists by selecting it
    const { data: test, error: selError } = await supabaseAdmin.from('Order').select('proofOfDeliveryUrl').limit(1);
    
    if (selError && selError.message.includes('column "proofOfDeliveryUrl" does not exist')) {
        console.log("Column missing. Creating via raw REST or RPC might be tricky without Prisma.");
        // We will output a SQL file but also try to run it via postgres connection string.
    } else {
        console.log("Column proofOfDeliveryUrl already exists or another error:", selError?.message);
    }
    
    console.log("Ensuring 'delivery_proofs' storage bucket exists...");
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (!buckets?.find(b => b.name === 'delivery_proofs')) {
        const { error: bucketError } = await supabaseAdmin.storage.createBucket('delivery_proofs', { public: true });
        if (bucketError) {
             console.error("Failed to create bucket:", bucketError);
        } else {
             console.log("Bucket created!");
        }
    } else {
        console.log("Bucket 'delivery_proofs' already exists.");
    }
}
main();
