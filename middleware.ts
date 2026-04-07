import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const url = request.nextUrl
      const host = request.headers.get("host") || ""
        const path = url.pathname
        
          // --- 1. PREVIEW BYPASS ---
          const isPreviewParam = url.searchParams.get('preview') === 'true'
            const isPreviewCookie = request.cookies.get('preview_mode')?.value === 'true'
              const isTunnel = host.includes('lhr.life') || host.includes('loca.lt')
                const isAuthPath = path === '/login' || path.startsWith('/auth')
                  const isPreview = isPreviewParam || isPreviewCookie || (isTunnel && (path.startsWith('/driver') || isAuthPath))
                  
                    if (isPreviewParam && !isPreviewCookie) {
                          const previewResponse = NextResponse.redirect(new URL(url.pathname, request.url))
                              previewResponse.cookies.set('preview_mode', 'true', { maxAge: 60 * 5, path: '/' }) // 5 minutes
                          return previewResponse
                    }
  
    const isInternal = path.startsWith('/_next') || path.startsWith('/api') || path.includes('.')
      if (isInternal) return NextResponse.next()
  
    const response = NextResponse.next({
          request: {
                  headers: request.headers,
          },
    })
    
      // --- SECURITY HEADERS (Relaxed for Embedding) ---
      const isEmbed = url.searchParams.get('embed') === 'true';
  
    if (!isEmbed) {
          response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    }
  
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=(self)');
  
    response.headers.set(
          'Content-Security-Policy',
          [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://js.stripe.com https://maps.googleapis.com https://api.launchdarkly.com",
                  "worker-src 'self' blob:",
                  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                  "font-src 'self' https://fonts.gstatic.com",
                  "img-src 'self' data: blob: https: http:",
                  "connect-src 'self' https://*.supabase.co https://api.stripe.com https://app.launchdarkly.com https://api.launchdarkly.com wss://*.supabase.co https://sentry.io",
                  "frame-src https://js.stripe.com https://hooks.stripe.com",
                  isEmbed ? "frame-ancestors *" : "frame-ancestors 'self'",
                  "upgrade-insecure-requests",
                ].join('; ')
        );
  
    return response;
}
