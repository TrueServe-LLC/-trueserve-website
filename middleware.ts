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
  const isLocal = host.includes("localhost")
  const isVercel = host.endsWith(".vercel.app")
  const cookieDomain = isLocal || isVercel ? "" : ".trueserve.delivery"

  const pieces = host.split('.')
  const subdomainPiece = pieces[0].toLowerCase()
  const isSub = !isVercel && pieces.length > (isLocal ? 1 : 2) && !['www', 'localhost'].includes(subdomainPiece)
  const subdomain = isSub ? subdomainPiece : ""

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
    // 1. Rewrite to the internal folder silently
    if (!path.startsWith(`/${subdomain}`)) {
      const rewriteUrl = new URL(`/${subdomain}${path}${url.search}`, request.url)
      const rewriteResponse = NextResponse.rewrite(rewriteUrl)
      
      // Transfer cookies/headers
      response.cookies.getAll().forEach(cookie => rewriteResponse.cookies.set(cookie.name, cookie.value))
      response.headers.forEach((v, k) => rewriteResponse.headers.set(k, v))
      
      // Add a security check ONLY if it's the admin subdomain
      if (subdomain === 'admin') {
         if (!user) return NextResponse.redirect(new URL('/login', request.url))
         
         const roleResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/User?id=eq.${user.id}&select=role`,
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
            return NextResponse.redirect(new URL('/', request.url))
         }
      }
      
      return rewriteResponse
    }
  }

  // --- 4. PATH-BASED PROTECTION (Fallback) ---
  const portals = ['/admin', '/merchant', '/driver']
  const matchedPortal = portals.find(p => path.startsWith(p))

  if (matchedPortal) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))

    const roleRes = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/User?id=eq.${user.id}&select=role`,
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
