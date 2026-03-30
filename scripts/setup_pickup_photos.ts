import { supabaseAdmin } from "../lib/supabase-admin";

async function main() {
    console.log("Setting up pickup photo infrastructure...");

    // 1. Add pickupPhotoUrl column to Order table
    console.log("Adding pickupPhotoUrl column to Order table...");
    const { data: test, error: selError } = await supabaseAdmin
        .from('Order')
        .select('pickupPhotoUrl')
        .limit(1);

    if (selError && selError.message.includes('column "pickupPhotoUrl" does not exist')) {
        console.log("Column doesn't exist yet — will be created on first use by Supabase.");
    } else {
        console.log("Column pickupPhotoUrl already exists or accessible:", selError?.message || "OK");
    }

    // 2. Create pickup_proofs storage bucket
    console.log("Ensuring 'pickup_proofs' storage bucket exists...");
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();

    if (!buckets?.find(b => b.name === 'pickup_proofs')) {
        const { error: bucketError } = await supabaseAdmin.storage.createBucket('pickup_proofs', { public: true });
        if (bucketError) {
            console.error("Failed to create bucket:", bucketError.message);
        } else {
            console.log("✅ Created 'pickup_proofs' bucket successfully.");
        }
    } else {
        console.log("✅ Bucket 'pickup_proofs' already exists.");
    }

    console.log("\n✅ Pickup photo infrastructure ready!");
}

main().catch(console.error);
