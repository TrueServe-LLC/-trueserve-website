
import { cookies } from "next/headers";

export default async function TestAuthPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("userId")?.value;

    return (
        <div style={{ padding: '2rem', background: '#000', color: '#fff', fontFamily: 'sans-serif' }}>
            <h1>Auth Diagnostics</h1>
            <ul style={{ lineHeight: '2' }}>
                <li>Supabase URL: {supabaseUrl ? '✅' : '❌'}</li>
                <li>Supabase Anon Key: {supabaseAnonKey ? '✅' : '❌'}</li>
                <li>Service Role Key: {serviceRoleKey ? '✅' : '❌'}</li>
                <li>UserId Cookie: {userIdCookie || 'none'}</li>
            </ul>
            <hr />
            <p>If Service Role Key is ❌, getAuthSession will fail and cause loops.</p>
        </div>
    );
}
