import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check auth condition
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Check role-based access
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { data: { role } } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/businesses/:path*',
    '/dashboard/:path*',
    // Add other protected routes
  ],
} 