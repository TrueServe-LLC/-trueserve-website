import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isStaffEmail, resolveStaffRole } from '@/lib/admin-config'
import { ADMIN_ROLES } from '@/lib/rbac'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const portal = searchParams.get('portal')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'
    const isAdminPortalRequest = portal === 'admin' || next.startsWith('/admin')

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data?.user) {
            // SYNC: Ensure the user exists in our public User table
            const { data: profileById } = await supabase
                .from('User')
                .select('id, role')
                .eq('id', data.user.id)
                .maybeSingle();

            const { data: profileByEmail } = await supabase
                .from('User')
                .select('id, role')
                .eq('email', data.user.email)
                .maybeSingle();

            let role = 'CUSTOMER';
            const sessionUserId = profileById?.id || profileByEmail?.id || data.user.id;
            const resolvedStaffRole = resolveStaffRole(data.user.email);

            if (!profileById && !profileByEmail) {
                // Auto-assign admin conditionally
                role = resolvedStaffRole || (isStaffEmail(data.user.email) ? 'READONLY' : 'CUSTOMER');

                // First time logging in with Google - create the profile
                await supabase.from('User').insert({
                    id: sessionUserId,
                    email: data.user.email,
                    name: data.user.user_metadata.full_name || data.user.user_metadata.name || data.user.email?.split('@')[0],
                    role: role,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            } else {
                role = profileById?.role || profileByEmail?.role || role;
                // Sync the role if we have an explicit staff mapping.
                if (resolvedStaffRole && role !== resolvedStaffRole) {
                    role = resolvedStaffRole;
                    const { supabaseAdmin } = await import("@/lib/supabase-admin");
                    await supabaseAdmin
                        .from('User')
                        .update({ role: resolvedStaffRole, updatedAt: new Date().toISOString() })
                        .eq('id', profileById?.id || profileByEmail?.id || data.user.id);
                } else if (isStaffEmail(data.user.email) && !ADMIN_ROLES.includes(role as any)) {
                    role = 'READONLY';
                    const { supabaseAdmin } = await import("@/lib/supabase-admin");
                    await supabaseAdmin
                        .from('User')
                        .update({ role: 'READONLY', updatedAt: new Date().toISOString() })
                        .eq('id', profileById?.id || profileByEmail?.id || data.user.id);
                }
            }

            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            // Default redirect based on role if next is not explicitly provided or is just root
            let finalNext = next;
            if (next === '/') {
                if (role === 'MERCHANT') finalNext = '/merchant/dashboard';
                else if (role === 'DRIVER') finalNext = '/driver/dashboard';
                else if (ADMIN_ROLES.includes(role as any)) finalNext = '/admin/dashboard';
            }

            if (isAdminPortalRequest) {
                finalNext = ADMIN_ROLES.includes(role as any)
                    ? '/admin/dashboard'
                    : '/admin/login?error=access_denied';
            }

            // Success - continue to 'next' path
            let redirectUrl = isLocalEnv
                ? `${origin}${finalNext}`
                : forwardedHost
                    ? `https://${forwardedHost}${finalNext}`
                    : `${origin}${finalNext}`;
            
            // Role-based portal routing for production
            const host = request.headers.get('host') || "";
            const cleanHost = host.split(':')[0];
            const isProdHost = cleanHost.endsWith("trueserve.delivery") || cleanHost.endsWith("trueservedelivery.com");

            if (isProdHost || isAdminPortalRequest) {
                if (ADMIN_ROLES.includes(role as any) || isAdminPortalRequest) {
                    redirectUrl = `https://www.admin.trueserve.delivery${finalNext}`;
                } else if (role === 'MERCHANT') {
                    redirectUrl = `https://merchant.trueserve.delivery${finalNext}`;
                } else if (role === 'DRIVER') {
                    redirectUrl = `https://driver.trueserve.delivery${finalNext}`;
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

            const isProd = process.env.NODE_ENV === "production"

            // Set userId cookie for compatibility with existing dashboard logic
            response.cookies.set('userId', sessionUserId, {
                httpOnly: true,
                secure: isProd,
                sameSite: 'lax',
                path: '/',
                domain: cookieDomain ? cookieDomain : undefined,
                maxAge: 60 * 60 * 24 * 7 // 1 week
            })

            // If user is admin, set admin_session cookie so they can access admin portal
            if (ADMIN_ROLES.includes(role as any)) {
                response.cookies.set('admin_role', role, {
                    httpOnly: true,
                    secure: isProd,
                    sameSite: 'lax',
                    path: '/',
                    domain: cookieDomain ? cookieDomain : undefined,
                    maxAge: 60 * 60 * 24 * 7 // 1 week
                })
                response.cookies.set('admin_session', 'true', {
                    httpOnly: true,
                    secure: isProd,
                    sameSite: 'lax',
                    path: '/',
                    domain: cookieDomain ? cookieDomain : undefined,
                    maxAge: 60 * 60 * 24 * 7 // 1 week
                })
            }

            return response
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
