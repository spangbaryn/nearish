import { AuthError } from '@/lib/errors';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) throw new AuthError(error.message)

    // If the user is logged in and tries to access the public homepage, redirect to /home
    if (req.nextUrl.pathname === '/' && session) {
      return NextResponse.redirect(new URL('/home', req.url))
    }

    // Handle auth pages layout and redirects
    if (req.nextUrl.pathname.startsWith('/auth')) {
      if (session) {
        // Check if user needs onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarded')
          .eq('id', session.user.id)
          .single()

        // If profile exists but not onboarded, redirect to onboarding
        if (!profile?.onboarded) {
          return NextResponse.redirect(new URL('/onboarding', req.url))
        }

        // Otherwise redirect to home
        return NextResponse.redirect(new URL('/home', req.url))
      }
      return NextResponse.next()
    }

    // Protected routes (except auth, onboarding, invite, callback, root, business)
    if (!req.nextUrl.pathname.startsWith('/auth') &&
        !req.nextUrl.pathname.startsWith('/onboarding') &&
        !req.nextUrl.pathname.startsWith('/invite') &&
        !req.nextUrl.pathname.startsWith('/auth/callback') &&
        req.nextUrl.pathname !== '/' &&
        req.nextUrl.pathname !== '/business') {
      if (!session) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }

      // Check if user needs onboarding (for other protected routes)
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarded')
        .eq('id', session.user.id)
        .single()

      if (!profile?.onboarded) {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }

      return NextResponse.next()
    }

    // For onboarding route, remove session check in middleware and rely on client-side check
    if (req.nextUrl.pathname.startsWith('/onboarding')) {
      const response = NextResponse.next()
      response.headers.set('x-layout', 'auth')  // Set auth layout for onboarding
      return response
    }

    return res
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
    throw error
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (assets folder)
     * - api (api routes - let them handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|assets|api).*)',
  ],
} 