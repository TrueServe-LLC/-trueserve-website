import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    console.log("Purging all business data for pilot...");
    
    // Delete all orders
    await supabaseAdmin.from('Order').delete().neq('id', 'placeholder');
    
    // Delete all menu items
    await supabaseAdmin.from('MenuItem').delete().neq('id', 'placeholder');
    
    // Delete all restaurants
    await supabaseAdmin.from('Restaurant').delete().neq('id', 'placeholder');
    
    // Delete all drivers
    await supabaseAdmin.from('Driver').delete().neq('id', 'placeholder');
    
    // Delete all non-admin users
    const { data: nonAdmins } = await supabaseAdmin.from('User').select('id, role').neq('role', 'ADMIN');
    if (nonAdmins?.length) {
        await supabaseAdmin.from('User').delete().in('id', nonAdmins.map(u => u.id));
        for (const u of nonAdmins) {
            const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(u.id);
            if (isUUID) {
                await supabaseAdmin.auth.admin.deleteUser(u.id);
            }
        }
    }
    
    console.log("Database cleared! Ready for live pilot.");
}
run();
