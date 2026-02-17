import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data?.user) {
            // SYNC: Ensure the user exists in our public User table
            const { data: existingUser } = await supabase
                .from('User')
                .select('id')
                .eq('id', data.user.id)
                .maybeSingle();

            if (!existingUser) {
                // First time logging in with Google - create the profile
                await supabase.from('User').insert({
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.user_metadata.full_name || data.user.user_metadata.name || data.user.email?.split('@')[0],
                    role: 'CUSTOMER',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }

            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            // Success - continue to 'next' path
            const redirectUrl = isLocalEnv
                ? `${origin}${next}`
                : forwardedHost
                    ? `https://${forwardedHost}${next}`
                    : `${origin}${next}`;

            return NextResponse.redirect(redirectUrl)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
