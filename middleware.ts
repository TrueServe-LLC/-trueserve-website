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
  const subdomainPiece = pieces[0].toLowerCase()
  
  // Logic: pieces.length > 1 for localhost (e.g., driver.localhost:3000), 
  //        pieces.length > 2 for production (e.g., driver.trueserve.delivery)
  const isSub = pieces.length > (isLocal ? 1 : 2) && !['www', 'localhost'].includes(subdomainPiece)
  const subdomain = isSub ? subdomainPiece : ""

  const allowedSubdomains = ["admin", "merchant", "driver"]

  // --- 3. GLOBAL REDIRECTION (Path-based) ---
  // If user hits /driver on www, or /admin on merchant, etc.
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

  // --- 5. SUBDOMAIN REWRITE (Internal Routing) ---
  // Rewrite handled subdomains to their internal folder structure
  if (subdomain && allowedSubdomains.includes(subdomain)) {
    if (!path.startsWith(`/${subdomain}`)) {
      const rewriteUrl = new URL(`/${subdomain}${path}${url.search}`, request.url)
      const rewriteResponse = NextResponse.rewrite(rewriteUrl)
      
      // Transfer cookies/headers to the rewrite response
      response.cookies.getAll().forEach(cookie => {
        rewriteResponse.cookies.set(cookie.name, cookie.value)
      })
      response.headers.forEach((value, key) => {
        rewriteResponse.headers.set(key, value)
      })
      
      return rewriteResponse
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
