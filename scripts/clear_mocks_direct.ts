import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    console.log("purging...");
    await supabaseAdmin.from('Restaurant').delete().ilike('id', '%mock%');
    await supabaseAdmin.from('Restaurant').delete().ilike('id', 'demo%');
    await supabaseAdmin.from('Driver').delete().ilike('id', 'mock%');
    await supabaseAdmin.from('Order').delete().in('userId', ['qa-mock-user', 'mock-qa-user-123']);
    await supabaseAdmin.from('Driver').delete().ilike('email', '%pilot@mock.com%');
    const { data: qausers } = await supabaseAdmin.from('User').select('id').ilike('email', '%qa%mock%');
    if (qausers?.length) {
        await supabaseAdmin.from('User').delete().in('id', qausers.map(u => u.id));
        for (const u of qausers) {
            await supabaseAdmin.auth.admin.deleteUser(u.id);
        }
    }
    const { data: demousers } = await supabaseAdmin.from('User').select('id').ilike('email', '%@pilot.mock.com');
    if (demousers?.length) {
        await supabaseAdmin.from('User').delete().in('id', demousers.map(u => u.id));
        for (const u of demousers) {
            await supabaseAdmin.auth.admin.deleteUser(u.id);
        }
    }
    console.log("done");
}
run();
