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
            const { data: profile } = await supabase
                .from('User')
                .select('id, role')
                .eq('id', data.user.id)
                .maybeSingle();

            let role = 'CUSTOMER';

            if (!profile) {
                // Auto-assign admin conditionally
                if (data.user.email === process.env.ADMIN_EMAIL || data.user.email?.endsWith('@trueserve.delivery')) {
                    role = 'ADMIN';
                }

                // First time logging in with Google - create the profile
                await supabase.from('User').insert({
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.user_metadata.full_name || data.user.user_metadata.name || data.user.email?.split('@')[0],
                    role: role,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            } else {
                role = profile.role;
            }

            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            // Default redirect based on role if next is not explicitly provided or is just root
            let finalNext = next;
            if (next === '/') {
                if (role === 'MERCHANT') finalNext = '/merchant/dashboard';
                else if (role === 'DRIVER') finalNext = '/driver/dashboard';
                else if (role === 'ADMIN') finalNext = '/admin/dashboard';
            }

            // Success - continue to 'next' path
            const redirectUrl = isLocalEnv
                ? `${origin}${finalNext}`
                : forwardedHost
                    ? `https://${forwardedHost}${finalNext}`
                    : `${origin}${finalNext}`;

            const response = NextResponse.redirect(redirectUrl)

            // Set userId cookie for compatibility with existing dashboard logic
            response.cookies.set('userId', data.user.id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            })

            return response
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
