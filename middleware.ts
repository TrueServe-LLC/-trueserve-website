import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const path = url.pathname

  // --- 1. EXCLUSIONS ---
  const isInternal = path.startsWith('/_next') || path.startsWith('/api') || path.includes('.')
  if (isInternal) return NextResponse.next()

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // --- 2. SUPABASE SESSION ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // --- 3. PATH-BASED ROLE PROTECTION ---
  // This is the "Safe" way to handle portals without DNS subdomains
  const portals = ['/admin', '/merchant', '/driver']
  const matchedPortal = portals.find(p => path.startsWith(p))

  if (matchedPortal) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Role check via Service Role (Bypass RLS)
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

    // Portal enforcement
    if (path.startsWith('/admin') && !['ADMIN', 'OPS', 'SUPPORT', 'FINANCE'].includes(role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (path.startsWith('/driver') && role !== 'DRIVER') {
      return NextResponse.redirect(new URL('/driver', request.url)) // Stay on driver landing
    }
    if (path.startsWith('/merchant') && role !== 'MERCHANT') {
      return NextResponse.redirect(new URL('/merchant', request.url)) // Stay on merchant landing
    }
  }

  // SYNC: Ensure the custom userId cookie is present
  if (user && !request.cookies.get('userId')) {
    response.cookies.set('userId', user.id, {
        path: '/',
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
