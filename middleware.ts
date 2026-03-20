import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const host = request.headers.get("host") || ""
  const path = url.pathname

  // --- 1. EXCLUSIONS ---
  const isInternal = path.startsWith('/_next') || path.startsWith('/api') || path.includes('.')
  if (isInternal) return NextResponse.next()

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Determine the cookie domain for universal sessions (including subdomains)
  const cleanHost = host.split(':')[0]
  const isLocal = cleanHost.includes("localhost")
  const isVercel = cleanHost.endsWith(".vercel.app")
  
  // Dynamic root domain detection
  const pieces = cleanHost.split('.')
  let cookieDomain = ""
  if (!isLocal && !isVercel && pieces.length >= 2) {
    cookieDomain = `.${pieces.slice(-2).join('.')}`
  }
  
  // For trueserve.delivery, pieces.length is 2. Subdomain exists if length > 2.
  // For sub.trueserve-website.vercel.app, pieces.length is 4. Subdomain exists if length > 3.
  const isSub = isVercel 
    ? pieces.length > 3 
    : pieces.length > (isLocal ? 1 : 2)
  
  const subdomainPiece = pieces[0].toLowerCase()
  const subdomain = isSub && !['www', 'localhost'].includes(subdomainPiece) ? subdomainPiece : ""

  // --- 2. SUPABASE SESSION SYNC ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => {
             const sharedOptions = { ...options, domain: cookieDomain }
             response.cookies.set(name, value, sharedOptions)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // --- 3. SUBDOMAIN ROUTING & ROLE PROTECTION ---
  const allowedSubdomains = ["admin", "merchant", "driver"]
  
  if (subdomain && allowedSubdomains.includes(subdomain)) {
    // SECURITY GATE: Only allow internal staff on admin subdomain
    if (subdomain === 'admin') {
      const isAllowedPath = path === '/login' || path.startsWith('/admin/login') || path.startsWith('/auth/callback')
      if (!user && !isAllowedPath) return NextResponse.redirect(new URL('/login', request.url))
      
      if (user && !isAllowedPath) {
        const roleResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/User?email=eq.${user.email}&select=role`,
          {
            headers: {
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
            }
          }
        )
        const roles = await roleResponse.json()
        const role = roles?.[0]?.role || 'CUSTOMER'
        if (!['ADMIN', 'OPS', 'SUPPORT', 'FINANCE'].includes(role)) {
          let rootHost = host;
          if (subdomain) {
            rootHost = host.replace(`${subdomain}.`, '');
          }
          return NextResponse.redirect(new URL('/', `${url.protocol}//${rootHost}`))
        }
      }
    }

    // Rewrite to the internal folder silently (except for shared auth callback)
    if (!path.startsWith(`/${subdomain}`) && !path.startsWith('/auth')) {
      const rewriteUrl = new URL(`/${subdomain}${path}${url.search}`, request.url)
      const rewriteResponse = NextResponse.rewrite(rewriteUrl)
      
      // Transfer cookies/headers
      response.cookies.getAll().forEach(cookie => rewriteResponse.cookies.set(cookie.name, cookie.value))
      response.headers.forEach((v, k) => rewriteResponse.headers.set(k, v))
      
      return rewriteResponse
    }
  }

  // --- 4. PATH-BASED PROTECTION (Fallback) ---
  const portals = ['/admin', '/merchant', '/driver']
  const matchedPortal = portals.find(p => path.startsWith(p))

  if (matchedPortal) {
    // If it's the admin portal and they have a manual admin_session cookie, let the page-layer auth guard handle it
    if (path.startsWith('/admin') && request.cookies.has("admin_session")) {
        // Do nothing, let it pass through to the page
    } else {
        if (!user) return NextResponse.redirect(new URL('/login', request.url))

        const roleRes = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/User?email=eq.${user.email}&select=role`,
          {
            headers: {
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
            }
          }
        )
        const roles = await roleRes.json()
        const role = roles?.[0]?.role || 'CUSTOMER'

        if (path.startsWith('/admin') && !['ADMIN', 'OPS', 'SUPPORT', 'FINANCE'].includes(role)) {
          return NextResponse.redirect(new URL('/', request.url))
        }
    }
  }

  // SYNC: Universal UserID Cookie
  if (user && !request.cookies.get('userId')) {
    response.cookies.set('userId', user.id, {
      path: '/',
      domain: cookieDomain,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
