import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const host = request.headers.get("host") || ""
  const path = url.pathname

  // --- 1. EXCLUSIONS ---
  // Skip internal Next.js paths, API routes, and static files
  const isInternal = path.startsWith('/_next') || path.startsWith('/api') || path.includes('.')
  if (isInternal) return NextResponse.next()

  // --- 2. SUBDOMAIN DETECTION ---
  const pieces = host.split('.')
  const isLocal = host.includes("localhost")
  const isVercelPreview = host.endsWith('.vercel.app')
  const subdomainPiece = pieces[0].toLowerCase()
  
  // Logic: Only detect subdomains on custom domains or localhost (e.g. admin.trueserve.delivery)
  // Skip subdomain logic for .vercel.app preview URLs
  const isSub = !isVercelPreview && pieces.length > (isLocal ? 1 : 2) && !['www', 'localhost'].includes(subdomainPiece)
  const subdomain = isSub ? subdomainPiece : ""

  const allowedSubdomains = ["admin", "merchant", "driver"]

  // --- 3. GLOBAL REDIRECTION (Path-based) ---
  // Only enforce subdomain redirection if we are NOT on a Vercel preview domain
  if (!isVercelPreview) {
    for (const sub of allowedSubdomains) {
      if (path.startsWith(`/${sub}`)) {
        if (subdomain !== sub) {
          // Base host: strip existing known prefixes
          const baseHost = host.replace(/^(?:www\.|admin\.|merchant\.|driver\.)/, '')
          const protocol = isLocal ? 'http' : 'https'
          
          // Clean the path to avoid /driver/dashboard -> dashboard
          const newPath = path.replace(`/${sub}`, '') || '/'
          const redirectUrl = new URL(newPath, `${protocol}://${sub}.${baseHost}`)
          redirectUrl.search = url.search
          return NextResponse.redirect(redirectUrl)
        }
      }
    }
  }

  // --- 4. SUPABASE SESSION SYNC ---
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session - required for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  // --- 5. STRICT SUBDOMAIN ISOLATION & ROLE CHECK ---
  if (subdomain && allowedSubdomains.includes(subdomain)) {
    // 1. Must be logged in to access ANY subdomain portal
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      // Remove subdomain from login URL to prevent infinite loops if login is only on www
      loginUrl.hostname = host.replace(`${subdomain}.`, '')
      return NextResponse.redirect(loginUrl)
    }

    // 2. Fetch User Role for strict portal check (using Service Role to bypass RLS)
    const adminClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    const { data: userData } = await adminClient
      .from('User')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = userData?.role || 'CUSTOMER'

    // 3. Define access rules
    const isAdminRole = ['ADMIN', 'OPS', 'SUPPORT', 'FINANCE'].includes(role)
    const isDriverRole = role === 'DRIVER'
    const isMerchantRole = role === 'MERCHANT'

    // REJECTION LOGIC
    if (subdomain === 'admin' && !isAdminRole) {
      return NextResponse.redirect(new URL('/', request.url)) // Unauthorized customers to home
    }
    if (subdomain === 'driver' && !isDriverRole) {
      return NextResponse.redirect(new URL('/driver', request.url)) // Re-route to driver info landing
    }
    if (subdomain === 'merchant' && !isMerchantRole) {
      return NextResponse.redirect(new URL('/merchant', request.url)) // Re-route to merchant info landing
    }

    // 4. If all checks pass, Rewrite to the internal folder
    if (!path.startsWith(`/${subdomain}`)) {
      const rewriteUrl = new URL(`/${subdomain}${path}${url.search}`, request.url)
      const rewriteResponse = NextResponse.rewrite(rewriteUrl)
      
      // Transfer cookies/headers
      response.cookies.getAll().forEach(cookie => rewriteResponse.cookies.set(cookie.name, cookie.value))
      response.headers.forEach((v, k) => rewriteResponse.headers.set(k, v))
      
      return rewriteResponse
    }
  }

  // SYNC: Ensure the custom userId cookie is present for the client
  const userId = request.cookies.get('userId')?.value
  if (user && !userId) {
    response.cookies.set('userId', user.id, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
    })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
