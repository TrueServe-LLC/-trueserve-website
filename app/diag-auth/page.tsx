
import { cookies, headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export default async function DiagAuthPage() {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    const userIdCookie = cookieStore.get('userId')?.value;
    
    let publicUser = null;
    let driverProfile = null;
    let restaurantProfile = null;

    if (user) {
        const { data: pUser } = await supabaseAdmin.from('User').select('*').eq('id', user.id).maybeSingle();
        publicUser = pUser;
        
        const { data: drv } = await supabaseAdmin.from('Driver').select('*').eq('userId', user.id).maybeSingle();
        driverProfile = drv;
        
        const { data: rest } = await supabaseAdmin.from('Restaurant').select('*').eq('ownerId', user.id).maybeSingle();
        restaurantProfile = rest;
    }

    return (
        <div className="p-10 bg-black text-white font-mono text-xs space-y-8">
            <h1 className="text-2xl font-bold text-primary">Auth Diagnostics</h1>
            
            <section>
                <h2 className="text-lg border-b border-white/20 mb-4 pb-2">Supabase Auth</h2>
                <pre>{JSON.stringify(user, null, 2)}</pre>
            </section>

            <section>
                <h2 className="text-lg border-b border-white/20 mb-4 pb-2">Cookies</h2>
                <pre>{JSON.stringify(cookieStore.getAll(), null, 2)}</pre>
            </section>

            <section>
                <h2 className="text-lg border-b border-white/20 mb-4 pb-2">Public User (DB)</h2>
                <pre>{JSON.stringify(publicUser, null, 2)}</pre>
            </section>

            <section>
                <h2 className="text-lg border-b border-white/20 mb-4 pb-2">Driver Profile</h2>
                <pre>{JSON.stringify(driverProfile, null, 2)}</pre>
            </section>

            <section>
                <h2 className="text-lg border-b border-white/20 mb-4 pb-2">Restaurant Profile</h2>
                <pre>{JSON.stringify(restaurantProfile, null, 2)}</pre>
            </section>
        </div>
    );
}
