
import { cookies } from "next/headers";

export default async function TestAuthPage(props: any) {
    const searchParams = await props.searchParams;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("userId");
    const allCookies = cookieStore.getAll().map(c => c.name);

    return (
        <div style={{ padding: '2rem', background: '#080808', color: '#fff', fontFamily: 'monospace' }}>
            <h1>Auth Diagnostics</h1>
            <div style={{ background: '#111', padding: '1rem', borderRadius: '10px', border: '1px solid #333' }}>
                <p>Supabase URL: {supabaseUrl ? '✅' : '❌'}</p>
                <p>Supabase Anon Key: {supabaseAnonKey ? '✅' : '❌'}</p>
                <p>Service Role Key: {serviceRoleKey ? '✅' : '❌'}</p>
                <hr style={{ border: '0.5px solid #222' }} />
                <p><strong>UserId Cookie:</strong> {userIdCookie?.value || 'MISSING'}</p>
                <p><strong>Cookie Ops:</strong> {JSON.stringify(userIdCookie || {}, null, 2)}</p>
                <p><strong>All Cookie Names:</strong> {allCookies.join(', ')}</p>
                <hr style={{ border: '0.5px solid #222' }} />
                <p><strong>Search Params:</strong> {JSON.stringify(searchParams)}</p>
            </div>
        </div>
    );
}
