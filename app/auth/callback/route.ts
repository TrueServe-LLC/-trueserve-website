import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isStaffEmail } from '@/lib/admin-config'

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
                if (isStaffEmail(data.user.email)) {
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
                else if (role === 'PM' || role === 'ADMIN' || role === 'QA_TESTER') finalNext = '/admin/dashboard';
            }

            // Success - continue to 'next' path
            let redirectUrl = isLocalEnv
                ? `${origin}${finalNext}`
                : forwardedHost
                    ? `https://${forwardedHost}${finalNext}`
                    : `${origin}${finalNext}`;
            
            // Subdomain Redirection Logic for Production
            const host = request.headers.get('host') || "";
            const cleanHost = host.split(':')[0];
            const isProdDomain = cleanHost.endsWith("trueservedelivery.com");

            if (isProdDomain) {
                const pieces = cleanHost.split('.');
                const isSub = pieces.length > 2;
                const subdomainPiece = isSub ? pieces[0] : "";
                
                let targetSubdomain = "";
                if (['ADMIN', 'PM', 'OPS', 'SUPPORT', 'FINANCE', 'QA_TESTER'].includes(role)) targetSubdomain = "admin";
                else if (role === 'MERCHANT') targetSubdomain = "merchant";
                else if (role === 'DRIVER') targetSubdomain = "driver";

                // If user has a role but is NOT on the correct subdomain, force a move
                if (targetSubdomain && subdomainPiece !== targetSubdomain) {
                    const rootHost = isSub ? pieces.slice(1).join('.') : cleanHost;
                    redirectUrl = `https://${targetSubdomain}.${rootHost}${finalNext}`;
                }
            }

            const response = NextResponse.redirect(redirectUrl)

            // Determine the cookie domain for universal sessions (including subdomains)
            const isLocal = cleanHost.includes("localhost")
            const isVercel = cleanHost.endsWith(".vercel.app")
            
            const piecesForCookie = cleanHost.split('.')
            let cookieDomain = ""
            if (!isLocal && !isVercel && piecesForCookie.length >= 2) {
              cookieDomain = `.${piecesForCookie.slice(-2).join('.')}`
            }

            // Set userId cookie for compatibility with existing dashboard logic
            response.cookies.set('userId', data.user.id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'lax',
                path: '/',
                domain: cookieDomain ? cookieDomain : undefined,
                maxAge: 60 * 60 * 24 * 7 // 1 week
            })

            return response
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
