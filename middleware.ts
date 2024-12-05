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

    // If user is signed in and the current path is / redirect the user to /home
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
      // Allow the request to continue if authenticated
      return res
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
  matcher: ['/', '/home', '/api/:path*']
} 