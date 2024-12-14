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

    // Handle auth pages layout and redirects
    if (req.nextUrl.pathname.startsWith('/auth')) {
      if (session) {
        // If user is authenticated, set main layout and redirect to home
        const response = NextResponse.redirect(new URL('/home', req.url))
        response.headers.set('x-layout', 'main')
        return response
      }
      const response = NextResponse.next()
      response.headers.set('x-layout', 'auth')
      return response
    }

    // Protected routes (everything except / and /auth/*)
    if (!req.nextUrl.pathname.startsWith('/auth') && req.nextUrl.pathname !== '/') {
      if (!session) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }
      // Set main layout for authenticated routes
      const response = NextResponse.next()
      response.headers.set('x-layout', 'main')
      return response
    }

    // Handle root route
    if (session && req.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/home', req.url))
    }

    // For API routes, ensure there's a session
    if (req.nextUrl.pathname.startsWith('/api/')) {
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      return res
    }

    if (req.nextUrl.pathname.startsWith('/admin')) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return res
  } catch (error) {
    if (error instanceof AuthError) {
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        )
      }
      console.error('Auth middleware error:', error.message)
    }
    return res
  }
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
} 